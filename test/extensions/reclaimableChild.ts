import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ADDRESS_ZERO, bn, mintFromMock, nestMintFromMock } from '../utils';
import { IERC165, IOtherInterface, IRMRKNesting, IRMRKReclaimableChild } from '../interfaces';

// --------------- FIXTURES -----------------------

async function reclaimableChildNestingFixture() {
  const factory = await ethers.getContractFactory('RMRKNestingClaimableChildMock');
  const child = await factory.deploy('Chunky', 'CHNK');
  const parent = await factory.deploy('Chunky', 'CHNK');
  await parent.deployed();
  await child.deployed();

  return { parent, child };
}

describe('RMRKNestingClaimableChildMock', async function () {
  beforeEach(async function () {
    const { parent, child } = await loadFixture(reclaimableChildNestingFixture);
    this.parent = parent;
    this.child = child;
  });

  shouldBehaveLikeReclaimableChild();
});

async function shouldBehaveLikeReclaimableChild() {
  let addrs: SignerWithAddress[];
  let tokenOwner: SignerWithAddress;
  let parentId: number;
  let childId: number;

  beforeEach(async function () {
    addrs = await ethers.getSigners();
    tokenOwner = addrs[1];

    parentId = await mintFromMock(this.parent, tokenOwner.address);
    childId = await nestMintFromMock(this.child, this.parent.address, parentId);
  });

  it('can support IERC165', async function () {
    expect(await this.parent.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IRMRKReclaimableChild', async function () {
    expect(await this.parent.supportsInterface(IRMRKReclaimableChild)).to.equal(true);
  });

  it('can support IRMRKNesting', async function () {
    expect(await this.parent.supportsInterface(IRMRKNesting)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await this.parent.supportsInterface(IOtherInterface)).to.equal(false);
  });

  describe('With active child', async function () {
    beforeEach(async function () {
      await this.parent.connect(tokenOwner).acceptChild(parentId, 0, this.child.address, childId);
    });

    it('can reclaim unnested child if unnested to address zero', async function () {
      await this.parent
        .connect(tokenOwner)
        .unnestChild(parentId, ADDRESS_ZERO, 0, this.child.address, childId, false);

      await this.parent.connect(tokenOwner).reclaimChild(parentId, this.child.address, childId);
      expect(await this.child.ownerOf(childId)).to.eql(tokenOwner.address);
      expect(await this.child.rmrkOwnerOf(childId)).to.eql([tokenOwner.address, bn(0), false]);
    });

    it('cannot reclaim active child', async function () {
      await expect(
        this.parent.connect(tokenOwner).reclaimChild(parentId, this.child.address, childId),
      ).to.be.revertedWithCustomError(this.parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim unnested child if unnested to a non zero address', async function () {
      await this.parent
        .connect(tokenOwner)
        .unnestChild(parentId, addrs[2].address, 0, this.child.address, childId, false);

      await expect(
        this.parent.connect(tokenOwner).reclaimChild(parentId, this.child.address, childId),
      ).to.be.revertedWithCustomError(this.parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim unnested child from different parent token', async function () {
      await this.parent
        .connect(tokenOwner)
        .unnestChild(parentId, ADDRESS_ZERO, 0, this.child.address, childId, false);
      const otherParentId = await mintFromMock(this.parent, tokenOwner.address);

      await expect(
        this.parent.connect(tokenOwner).reclaimChild(otherParentId, this.child.address, childId),
      ).to.be.revertedWithCustomError(this.parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim unnested child from a non owned parent token', async function () {
      const notParent = addrs[2];
      await this.parent
        .connect(tokenOwner)
        .unnestChild(parentId, ADDRESS_ZERO, 0, this.child.address, childId, false);

      await expect(
        this.parent.connect(notParent).reclaimChild(parentId, this.child.address, childId),
      ).to.be.revertedWithCustomError(this.parent, 'ERC721NotApprovedOrOwner');
    });
  });

  describe('With pending child', async function () {
    it('can reclaim unnested child if unnested to address zero', async function () {
      await this.parent
        .connect(tokenOwner)
        .unnestChild(parentId, ADDRESS_ZERO, 0, this.child.address, childId, true);

      await this.parent.connect(tokenOwner).reclaimChild(parentId, this.child.address, childId);
      expect(await this.child.ownerOf(childId)).to.eql(tokenOwner.address);
      expect(await this.child.rmrkOwnerOf(childId)).to.eql([tokenOwner.address, bn(0), false]);
    });

    it('cannot reclaim pending child', async function () {
      await expect(
        this.parent.connect(tokenOwner).reclaimChild(parentId, this.child.address, childId),
      ).to.be.revertedWithCustomError(this.parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim unnested child if unnested to a non zero address', async function () {
      await this.parent
        .connect(tokenOwner)
        .unnestChild(parentId, addrs[2].address, 0, this.child.address, childId, true);

      await expect(
        this.parent.connect(tokenOwner).reclaimChild(parentId, this.child.address, childId),
      ).to.be.revertedWithCustomError(this.parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim unnested child from different parent token', async function () {
      await this.parent
        .connect(tokenOwner)
        .unnestChild(parentId, ADDRESS_ZERO, 0, this.child.address, childId, true);
      const otherParentId = await mintFromMock(this.parent, tokenOwner.address);

      await expect(
        this.parent.connect(tokenOwner).reclaimChild(otherParentId, this.child.address, childId),
      ).to.be.revertedWithCustomError(this.parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim unnested child from a non owned parent token', async function () {
      const notParent = addrs[2];
      await this.parent
        .connect(tokenOwner)
        .unnestChild(parentId, ADDRESS_ZERO, 0, this.child.address, childId, true);

      await expect(
        this.parent.connect(notParent).reclaimChild(parentId, this.child.address, childId),
      ).to.be.revertedWithCustomError(this.parent, 'ERC721NotApprovedOrOwner');
    });
  });
}
