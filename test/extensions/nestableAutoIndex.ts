import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { bn } from '../utils';
import { IERC165, IERC6059, IRMRKNestableAutoIndex, IOtherInterface } from '../interfaces';
import { RMRKNestableAutoIndexMock } from '../../typechain-types';

// --------------- FIXTURES -----------------------

async function nestableAutoIndexFixture() {
  const factory = await ethers.getContractFactory('RMRKNestableAutoIndexMock');
  const token = await factory.deploy();
  await token.deployed();

  return token;
}

describe('RMRKNestableAutoIndexMock', async function () {
  let token: RMRKNestableAutoIndexMock;
  let owner: SignerWithAddress;
  const parentId = bn(1);
  const childId1 = bn(11);
  const childId2 = bn(12);
  const childId3 = bn(13);

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    token = await loadFixture(nestableAutoIndexFixture);
  });

  it('can support IERC165', async function () {
    expect(await token.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IERC6059', async function () {
    expect(await token.supportsInterface(IERC6059)).to.equal(true);
  });

  it('can support IRMRKNestableAutoIndex', async function () {
    expect(await token.supportsInterface(IRMRKNestableAutoIndex)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await token.supportsInterface(IOtherInterface)).to.equal(false);
  });

  describe('With minted tokens', async function () {
    beforeEach(async function () {
      await token.mint(owner.address, parentId);
      await token.nestMint(token.address, childId1, parentId);
      await token.nestMint(token.address, childId2, parentId);
      await token.nestMint(token.address, childId3, parentId);
    });

    it('can accept child in first position and result is ok', async function () {
      await token['acceptChild(uint256,address,uint256)'](parentId, token.address, childId1);
      expect(await token.pendingChildrenOf(parentId)).to.eql([
        [childId3, token.address],
        [childId2, token.address],
      ]);
      expect(await token.childrenOf(parentId)).to.eql([[childId1, token.address]]);
    });

    it('can accept child in middle position and result is ok', async function () {
      await token['acceptChild(uint256,address,uint256)'](parentId, token.address, childId2);
      expect(await token.pendingChildrenOf(parentId)).to.eql([
        [childId1, token.address],
        [childId3, token.address],
      ]);
      expect(await token.childrenOf(parentId)).to.eql([[childId2, token.address]]);
    });

    it('can accept child in last position and result is ok', async function () {
      await token['acceptChild(uint256,address,uint256)'](parentId, token.address, childId3);
      expect(await token.pendingChildrenOf(parentId)).to.eql([
        [childId1, token.address],
        [childId2, token.address],
      ]);
      expect(await token.childrenOf(parentId)).to.eql([[childId3, token.address]]);
    });

    it('cannot accept not existing pending child', async function () {
      const otherChildId = bn(4);
      await expect(
        token['acceptChild(uint256,address,uint256)'](parentId, token.address, otherChildId),
      ).to.be.revertedWithCustomError(token, 'RMRKUnexpectedChildId');
    });

    describe('With pending tokens tokens', async function () {
      it('can transfer pending child in first position and result is ok', async function () {
        await token['transferChild(uint256,address,uint256,address,uint256,bool,bytes)'](
          parentId,
          owner.address,
          0,
          token.address,
          childId1,
          true,
          '0x',
        );
        expect(await token.pendingChildrenOf(parentId)).to.eql([
          [childId3, token.address],
          [childId2, token.address],
        ]);
      });

      it('can transfer pending child in middle position and result is ok', async function () {
        await token['transferChild(uint256,address,uint256,address,uint256,bool,bytes)'](
          parentId,
          owner.address,
          0,
          token.address,
          childId2,
          true,
          '0x',
        );
        expect(await token.pendingChildrenOf(parentId)).to.eql([
          [childId1, token.address],
          [childId3, token.address],
        ]);
      });

      it('can transfer pending child in last position and result is ok', async function () {
        await token['transferChild(uint256,address,uint256,address,uint256,bool,bytes)'](
          parentId,
          owner.address,
          0,
          token.address,
          childId3,
          true,
          '0x',
        );
        expect(await token.pendingChildrenOf(parentId)).to.eql([
          [childId1, token.address],
          [childId2, token.address],
        ]);
      });

      it('can transfer all pending children result is ok', async function () {
        await token['transferChild(uint256,address,uint256,address,uint256,bool,bytes)'](
          parentId,
          owner.address,
          0,
          token.address,
          childId1,
          true,
          '0x',
        );
        await token['transferChild(uint256,address,uint256,address,uint256,bool,bytes)'](
          parentId,
          owner.address,
          0,
          token.address,
          childId2,
          true,
          '0x',
        );
        await token['transferChild(uint256,address,uint256,address,uint256,bool,bytes)'](
          parentId,
          owner.address,
          0,
          token.address,
          childId3,
          true,
          '0x',
        );
        expect(await token.pendingChildrenOf(parentId)).to.eql([]);
        expect(await token.childrenOf(parentId)).to.eql([]);
      });

      it('cannot transfer not existing pending child', async function () {
        const otherChildId = bn(4);
        await expect(
          token['transferChild(uint256,address,uint256,address,uint256,bool,bytes)'](
            parentId,
            owner.address,
            0,
            token.address,
            otherChildId,
            true,
            '0x',
          ),
        ).to.be.revertedWithCustomError(token, 'RMRKUnexpectedChildId');
      });
    });

    describe('With accepted tokens', async function () {
      beforeEach(async function () {
        await token['acceptChild(uint256,address,uint256)'](parentId, token.address, childId1);
        await token['acceptChild(uint256,address,uint256)'](parentId, token.address, childId2);
        await token['acceptChild(uint256,address,uint256)'](parentId, token.address, childId3);
      });

      it('can transfer active child in first position and result is ok', async function () {
        await token['transferChild(uint256,address,uint256,address,uint256,bool,bytes)'](
          parentId,
          owner.address,
          0,
          token.address,
          childId1,
          false,
          '0x',
        );
        expect(await token.childrenOf(parentId)).to.eql([
          [childId3, token.address],
          [childId2, token.address],
        ]);
      });

      it('can transfer active child in middle position and result is ok', async function () {
        await token['transferChild(uint256,address,uint256,address,uint256,bool,bytes)'](
          parentId,
          owner.address,
          0,
          token.address,
          childId2,
          false,
          '0x',
        );
        expect(await token.childrenOf(parentId)).to.eql([
          [childId1, token.address],
          [childId3, token.address],
        ]);
      });

      it('can transfer active child in last position and result is ok', async function () {
        await token['transferChild(uint256,address,uint256,address,uint256,bool,bytes)'](
          parentId,
          owner.address,
          0,
          token.address,
          childId3,
          false,
          '0x',
        );
        expect(await token.childrenOf(parentId)).to.eql([
          [childId1, token.address],
          [childId2, token.address],
        ]);
      });

      it('can transfer all active children result is ok', async function () {
        await token['transferChild(uint256,address,uint256,address,uint256,bool,bytes)'](
          parentId,
          owner.address,
          0,
          token.address,
          childId1,
          false,
          '0x',
        );
        await token['transferChild(uint256,address,uint256,address,uint256,bool,bytes)'](
          parentId,
          owner.address,
          0,
          token.address,
          childId2,
          false,
          '0x',
        );
        await token['transferChild(uint256,address,uint256,address,uint256,bool,bytes)'](
          parentId,
          owner.address,
          0,
          token.address,
          childId3,
          false,
          '0x',
        );
        expect(await token.pendingChildrenOf(parentId)).to.eql([]);
        expect(await token.childrenOf(parentId)).to.eql([]);
      });

      it('cannot transfer not existing active child', async function () {
        const otherChildId = bn(4);
        await expect(
          token['transferChild(uint256,address,uint256,address,uint256,bool,bytes)'](
            parentId,
            owner.address,
            0,
            token.address,
            otherChildId,
            false,
            '0x',
          ),
        ).to.be.revertedWithCustomError(token, 'RMRKUnexpectedChildId');
      });
    });
  });
});
