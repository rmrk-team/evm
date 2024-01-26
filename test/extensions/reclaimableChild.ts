import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ADDRESS_ZERO, bn, mintFromMock, nestMintFromMock } from '../utils';
import { IERC165, IOtherInterface, IERC7401, IRMRKReclaimableChild } from '../interfaces';
import { RMRKNestableClaimableChildMock } from '../../typechain-types';

// --------------- FIXTURES -----------------------

async function reclaimableChildNestableFixture() {
  const factory = await ethers.getContractFactory('RMRKNestableClaimableChildMock');
  const child = <RMRKNestableClaimableChildMock>await factory.deploy();
  const parent = <RMRKNestableClaimableChildMock>await factory.deploy();
  await parent.waitForDeployment();
  await child.waitForDeployment();

  return { parent, child };
}

describe('RMRKNestableClaimableChildMock', async function () {
  beforeEach(async function () {
    const { parent, child } = await loadFixture(reclaimableChildNestableFixture);
    this.parent = parent;
    this.child = child;
  });

  shouldBehaveLikeReclaimableChild();
});

async function shouldBehaveLikeReclaimableChild() {
  let addrs: SignerWithAddress[];
  let tokenOwner: SignerWithAddress;
  let parentId: bigint;
  let childId: bigint;

  beforeEach(async function () {
    addrs = await ethers.getSigners();
    tokenOwner = addrs[1];

    parentId = await mintFromMock(this.parent, tokenOwner.address);
    childId = await nestMintFromMock(this.child, await this.parent.getAddress(), parentId);
  });

  it('can support IERC165', async function () {
    expect(await this.parent.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IRMRKReclaimableChild', async function () {
    expect(await this.parent.supportsInterface(IRMRKReclaimableChild)).to.equal(true);
  });

  it('can support IERC7401', async function () {
    expect(await this.parent.supportsInterface(IERC7401)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await this.parent.supportsInterface(IOtherInterface)).to.equal(false);
  });

  describe('With active child', async function () {
    beforeEach(async function () {
      await this.parent
        .connect(tokenOwner)
        .acceptChild(parentId, 0, await this.child.getAddress(), childId);
    });

    it('can reclaim transferred child if transferred to address zero', async function () {
      await this.parent
        .connect(tokenOwner)
        .transferChild(
          parentId,
          ADDRESS_ZERO,
          0,
          0,
          await this.child.getAddress(),
          childId,
          false,
          '0x',
        );

      await this.parent
        .connect(tokenOwner)
        .reclaimChild(parentId, await this.child.getAddress(), childId);
      expect(await this.child.ownerOf(childId)).to.eql(tokenOwner.address);
      expect(await this.child.directOwnerOf(childId)).to.eql([tokenOwner.address, 0n, false]);
    });

    it('cannot reclaim active child', async function () {
      await expect(
        this.parent
          .connect(tokenOwner)
          .reclaimChild(parentId, await this.child.getAddress(), childId),
      ).to.be.revertedWithCustomError(this.parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim transferred child if transferred to a non zero address', async function () {
      await this.parent
        .connect(tokenOwner)
        .transferChild(
          parentId,
          addrs[2].address,
          0,
          0,
          await this.child.getAddress(),
          childId,
          false,
          '0x',
        );

      await expect(
        this.parent
          .connect(tokenOwner)
          .reclaimChild(parentId, await this.child.getAddress(), childId),
      ).to.be.revertedWithCustomError(this.parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim transferred child from different parent token', async function () {
      await this.parent
        .connect(tokenOwner)
        .transferChild(
          parentId,
          ADDRESS_ZERO,
          0,
          0,
          await this.child.getAddress(),
          childId,
          false,
          '0x',
        );
      const otherParentId = await mintFromMock(this.parent, tokenOwner.address);

      await expect(
        this.parent
          .connect(tokenOwner)
          .reclaimChild(otherParentId, await this.child.getAddress(), childId),
      ).to.be.revertedWithCustomError(this.parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim transferred child from a non owned parent token', async function () {
      const notParent = addrs[2];
      await this.parent
        .connect(tokenOwner)
        .transferChild(
          parentId,
          ADDRESS_ZERO,
          0,
          0,
          await this.child.getAddress(),
          childId,
          false,
          '0x',
        );

      await expect(
        this.parent
          .connect(notParent)
          .reclaimChild(parentId, await this.child.getAddress(), childId),
      ).to.be.revertedWithCustomError(this.parent, 'ERC721NotApprovedOrOwner');
    });
  });

  describe('With pending child', async function () {
    it('can reclaim transferred child if transferred to address zero', async function () {
      await this.parent
        .connect(tokenOwner)
        .transferChild(
          parentId,
          ADDRESS_ZERO,
          0,
          0,
          await this.child.getAddress(),
          childId,
          true,
          '0x',
        );

      await this.parent
        .connect(tokenOwner)
        .reclaimChild(parentId, await this.child.getAddress(), childId);
      expect(await this.child.ownerOf(childId)).to.eql(tokenOwner.address);
      expect(await this.child.directOwnerOf(childId)).to.eql([tokenOwner.address, 0n, false]);
    });

    it('cannot reclaim pending child', async function () {
      await expect(
        this.parent
          .connect(tokenOwner)
          .reclaimChild(parentId, await this.child.getAddress(), childId),
      ).to.be.revertedWithCustomError(this.parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim transferred child if transferred to a non zero address', async function () {
      await this.parent
        .connect(tokenOwner)
        .transferChild(
          parentId,
          addrs[2].address,
          0,
          0,
          await this.child.getAddress(),
          childId,
          true,
          '0x',
        );

      await expect(
        this.parent
          .connect(tokenOwner)
          .reclaimChild(parentId, await this.child.getAddress(), childId),
      ).to.be.revertedWithCustomError(this.parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim transferred child from different parent token', async function () {
      await this.parent
        .connect(tokenOwner)
        .transferChild(
          parentId,
          ADDRESS_ZERO,
          0,
          0,
          await this.child.getAddress(),
          childId,
          true,
          '0x',
        );
      const otherParentId = await mintFromMock(this.parent, tokenOwner.address);

      await expect(
        this.parent
          .connect(tokenOwner)
          .reclaimChild(otherParentId, await this.child.getAddress(), childId),
      ).to.be.revertedWithCustomError(this.parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim transferred child from a non owned parent token', async function () {
      const notParent = addrs[2];
      await this.parent
        .connect(tokenOwner)
        .transferChild(
          parentId,
          ADDRESS_ZERO,
          0,
          0,
          await this.child.getAddress(),
          childId,
          true,
          '0x',
        );

      await expect(
        this.parent
          .connect(notParent)
          .reclaimChild(parentId, await this.child.getAddress(), childId),
      ).to.be.revertedWithCustomError(this.parent, 'ERC721NotApprovedOrOwner');
    });
  });
}
