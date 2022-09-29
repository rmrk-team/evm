import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';
import { bn } from '../utils';

const zeroAddress = ethers.constants.AddressZero;

async function shouldBehaveLikeNesting(
  mint: (token: Contract, to: string) => Promise<number>,
  nestMint: (token: Contract, to: string, parentId: number) => Promise<number>,
  transfer: (
    token: Contract,
    caller: SignerWithAddress,
    to: string,
    tokenId: number,
  ) => Promise<void>,
  nestTransfer: (
    token: Contract,
    caller: SignerWithAddress,
    to: string,
    tokenId: number,
    parentId: number,
    asGuest: boolean,
  ) => Promise<void>,
) {
  let addrs: SignerWithAddress[];
  let tokenOwner: SignerWithAddress;
  let parent: Contract;
  let child: Contract;

  beforeEach(async function () {
    const [, signerTokenOwner, ...signersAddr] = await ethers.getSigners();
    tokenOwner = signerTokenOwner;
    addrs = signersAddr;

    parent = this.parentToken;
    child = this.childToken;
  });

  describe('Minting', async function () {
    it('can mint with no destination', async function () {
      const tokenId = await mint(child, tokenOwner.address);
      expect(await child.ownerOf(tokenId)).to.equal(tokenOwner.address);
      expect(await child.rmrkOwnerOf(tokenId)).to.eql([tokenOwner.address, bn(0), false]);
    });

    it('has right owners', async function () {
      const otherOwner = addrs[2];
      const tokenId = await mint(parent, tokenOwner.address);
      const tokenId2 = await mint(parent, otherOwner.address);
      const tokenId3 = await mint(parent, otherOwner.address);

      expect(await parent.ownerOf(tokenId)).to.equal(tokenOwner.address);
      expect(await parent.ownerOf(tokenId2)).to.equal(otherOwner.address);
      expect(await parent.ownerOf(tokenId3)).to.equal(otherOwner.address);

      expect(await parent.balanceOf(tokenOwner.address)).to.equal(1);
      expect(await parent.balanceOf(otherOwner.address)).to.equal(2);

      await expect(parent.ownerOf(9999)).to.be.revertedWithCustomError(
        parent,
        'ERC721InvalidTokenId',
      );
    });

    it('cannot mint to zero address', async function () {
      await expect(mint(child, zeroAddress)).to.be.revertedWithCustomError(
        child,
        'ERC721MintToTheZeroAddress',
      );
    });

    it('cannot nest mint to a non-contract destination', async function () {
      await expect(nestMint(child, tokenOwner.address, 0)).to.be.revertedWithCustomError(
        child,
        'RMRKIsNotContract',
      );
    });

    it('cannot nest mint to non rmrk nesting receiver', async function () {
      const ERC721 = await ethers.getContractFactory('ERC721Mock');
      const nonReceiver = await ERC721.deploy('Non receiver', 'NR');
      await nonReceiver.deployed();

      const parentId = await mint(parent, addrs[1].address);

      await expect(nestMint(child, nonReceiver.address, parentId)).to.be.revertedWithCustomError(
        child,
        'RMRKMintToNonRMRKImplementer',
      );
    });

    it('cannot nest mint to a non-existent token', async function () {
      await expect(nestMint(child, parent.address, 1)).to.be.revertedWithCustomError(
        child,
        'ERC721InvalidTokenId',
      );
    });

    it('cannot nest mint to zero address', async function () {
      const parentId = await mint(parent, tokenOwner.address);
      await expect(nestMint(child, zeroAddress, parentId)).to.be.revertedWithCustomError(
        child,
        'RMRKIsNotContract',
      );
    });

    it('can mint to contract and owners are ok', async function () {
      const parentId = await mint(parent, tokenOwner.address);
      const childId = await nestMint(child, parent.address, parentId);

      // owner is the same adress
      expect(await parent.ownerOf(parentId)).to.equal(tokenOwner.address);
      expect(await child.ownerOf(childId)).to.equal(tokenOwner.address);

      expect(await parent.balanceOf(tokenOwner.address)).to.equal(1);
      expect(await child.balanceOf(parent.address)).to.equal(1);
    });

    it('can mint to contract and RMRK owners are ok', async function () {
      const parentId = await mint(parent, tokenOwner.address);
      const childId = await nestMint(child, parent.address, parentId);

      // RMRK owner is an address for the parent
      expect(await parent.rmrkOwnerOf(parentId)).to.eql([tokenOwner.address, bn(0), false]);
      // RMRK owner is a contract for the child
      expect(await child.rmrkOwnerOf(childId)).to.eql([parent.address, bn(parentId), true]);
    });

    it("can mint to contract and parent's children are ok", async function () {
      const parentId = await mint(parent, tokenOwner.address);
      const childId = await nestMint(child, parent.address, parentId);

      expect(await parent.childrenOf(parentId)).to.eql([]);

      expect(await parent.pendingChildrenOf(parentId)).to.eql([[bn(childId), child.address]]);
      expect(await parent.pendingChildOf(parentId, 0)).to.eql([bn(childId), child.address]);
    });

    it('cannot get child out of index', async function () {
      const parentId = await mint(parent, tokenOwner.address);
      await expect(parent.childOf(parentId, 0)).to.be.revertedWithCustomError(
        parent,
        'RMRKChildIndexOutOfRange',
      );
    });

    it('cannot get pending child out of index', async function () {
      const parentId = await mint(parent, tokenOwner.address);
      await expect(parent.pendingChildOf(parentId, 0)).to.be.revertedWithCustomError(
        parent,
        'RMRKPendingChildIndexOutOfRange',
      );
    });

    it('can mint multiple children', async function () {
      const parentId = await mint(parent, tokenOwner.address);
      const childId1 = await nestMint(child, parent.address, parentId);
      const childId2 = await nestMint(child, parent.address, parentId);

      expect(await child.ownerOf(childId1)).to.equal(tokenOwner.address);
      expect(await child.ownerOf(childId2)).to.equal(tokenOwner.address);

      expect(await child.balanceOf(parent.address)).to.equal(2);

      const pendingChildren = await parent.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([
        [bn(childId1), child.address],
        [bn(childId2), child.address],
      ]);
    });

    it('can mint child into child', async function () {
      const parentId = await mint(parent, tokenOwner.address);
      const childId = await nestMint(child, parent.address, parentId);
      const granchildId = await nestMint(child, child.address, childId);

      // Check balances -- yes, technically the counted balance indicates `child` owns an instance of itself
      // and this is a little counterintuitive, but the root owner is the EOA.
      expect(await child.balanceOf(parent.address)).to.equal(1);
      expect(await child.balanceOf(child.address)).to.equal(1);

      expect(await parent.pendingChildrenOf(parentId)).to.eql([[bn(childId), child.address]]);
      expect(await child.pendingChildrenOf(childId)).to.eql([[bn(granchildId), child.address]]);

      expect(await child.rmrkOwnerOf(granchildId)).to.eql([child.address, bn(childId), true]);

      expect(await child.ownerOf(granchildId)).to.eql(tokenOwner.address);
    });

    it('cannot have too many pending children', async () => {
      const parentId = await mint(parent, tokenOwner.address);

      // First 127 should be fine.
      for (let i = 0; i <= 127; i++) {
        await nestMint(child, parent.address, parentId);
      }

      await expect(nestMint(child, parent.address, parentId)).to.be.revertedWithCustomError(
        child,
        'RMRKMaxPendingChildrenReached',
      );
    });
  });

  describe('Interface support', async function () {
    it('can support IERC165', async function () {
      expect(await parent.supportsInterface('0x01ffc9a7')).to.equal(true);
    });

    it('can support IERC721', async function () {
      expect(await parent.supportsInterface('0x80ac58cd')).to.equal(true);
    });

    it('can support INesting', async function () {
      expect(await parent.supportsInterface('0xc61f8b39')).to.equal(true);
    });

    it('cannot support other interfaceId', async function () {
      expect(await parent.supportsInterface('0xffffffff')).to.equal(false);
    });
  });

  describe('Adding child', async function () {
    it('cannot add child from user address', async function () {
      const tokenOwner1 = addrs[0];
      const tokenOwner2 = addrs[1];
      const parentId = await mint(parent, tokenOwner1.address);
      const childId = await mint(child, tokenOwner2.address);
      await expect(parent.addChild(parentId, childId, zeroAddress)).to.be.revertedWithCustomError(
        parent,
        'RMRKIsNotContract',
      );
    });
  });

  describe('Accept child', async function () {
    let parentId: number;
    let childId: number;

    beforeEach(async function () {
      parentId = await mint(parent, tokenOwner.address);
      childId = await nestMint(child, parent.address, parentId);
    });

    it('can accept child', async function () {
      await expect(parent.connect(tokenOwner).acceptChild(parentId, 0))
        .to.emit(parent, 'ChildAccepted')
        .withArgs(parentId, child.address, childId, 0);
      await checkChildWasAccepted();
    });

    it('can accept child if approved', async function () {
      const approved = addrs[1];
      await parent.connect(tokenOwner).approve(approved.address, parentId);
      await parent.connect(approved).acceptChild(parentId, 0);
      await checkChildWasAccepted();
    });

    it('can accept child if approved for all', async function () {
      const operator = addrs[2];
      await parent.connect(tokenOwner).setApprovalForAll(operator.address, true);
      await parent.connect(operator).acceptChild(parentId, 0);
      await checkChildWasAccepted();
    });

    it('cannot accept not owned child', async function () {
      const nowOwner = addrs[3];
      await expect(parent.connect(nowOwner).acceptChild(parentId, 0)).to.be.revertedWithCustomError(
        parent,
        'ERC721NotApprovedOrOwner',
      );
    });

    it('cannot accept children for non existing index', async () => {
      await expect(
        parent.connect(tokenOwner).acceptChild(parentId, 1),
      ).to.be.revertedWithCustomError(parent, 'RMRKPendingChildIndexOutOfRange');
    });

    async function checkChildWasAccepted() {
      expect(await parent.pendingChildrenOf(parentId)).to.eql([]);
      expect(await parent.childrenOf(parentId)).to.eql([[bn(childId), child.address]]);
    }
  });

  describe('Reject child', async function () {
    let parentId: number;
    let childId: number;

    beforeEach(async function () {
      parentId = await mint(parent, tokenOwner.address);
      childId = await nestMint(child, parent.address, parentId);
    });

    it('can reject one pending child with abandon', async function () {
      const childOwnerData = await child.rmrkOwnerOf(childId);

      await expect(parent.connect(tokenOwner).rejectChild(parentId, 0, zeroAddress))
        .to.emit(parent, 'ChildRejected')
        .withArgs(parentId, child.address, childId, 0);
      await checkNoChildrenNorPending(parentId);

      // It is still on the child
      expect(await child.balanceOf(parent.address)).to.equal(1);
      // Child ownership data is not updated
      expect(await child.ownerOf(childId)).to.equal(tokenOwner.address);
      expect(await child.rmrkOwnerOf(childId)).to.eql(childOwnerData);
    });

    it('can reject one pending child, set child owner to new address', async function () {
      await expect(parent.connect(tokenOwner).rejectChild(parentId, 0, addrs[2].address))
        .to.emit(parent, 'ChildRejected')
        .withArgs(parentId, child.address, childId, 0);
      await checkNoChildrenNorPending(parentId);

      expect(await child.ownerOf(childId)).to.equal(addrs[2].address);
    });

    it('can reject child if approved', async function () {
      const rejecter = addrs[1];
      await parent.connect(tokenOwner).approve(rejecter.address, parentId);
      await parent.connect(rejecter).rejectChild(parentId, 0, zeroAddress);
      await checkNoChildrenNorPending(parentId);
    });

    it('can reject child if approved for all', async function () {
      const operator = addrs[2];
      await parent.connect(tokenOwner).setApprovalForAll(operator.address, true);
      await parent.connect(operator).rejectChild(parentId, 0, zeroAddress);
      await checkNoChildrenNorPending(parentId);
    });

    it('cannot reject not owned pending child', async function () {
      const notOwner = addrs[3];

      await expect(
        parent.connect(notOwner).rejectChild(parentId, 0, zeroAddress),
      ).to.be.revertedWithCustomError(parent, 'ERC721NotApprovedOrOwner');
    });

    it('can reject all pending children', async function () {
      // Mint a couple of more children
      await nestMint(child, parent.address, parentId);
      await nestMint(child, parent.address, parentId);

      await expect(parent.connect(tokenOwner).rejectAllChildren(parentId))
        .to.emit(parent, 'AllChildrenRejected')
        .withArgs(parentId);
      await checkNoChildrenNorPending(parentId);

      // They are still on the child
      expect(await child.balanceOf(parent.address)).to.equal(3);
    });

    it('can reject all pending children if approved', async function () {
      // Mint a couple of more children
      await nestMint(child, parent.address, parentId);
      await nestMint(child, parent.address, parentId);

      const rejecter = addrs[1];
      await parent.connect(tokenOwner).approve(rejecter.address, parentId);
      await parent.connect(rejecter).rejectAllChildren(parentId);
      await checkNoChildrenNorPending(parentId);
    });

    it('can reject all pending children if approved for all', async function () {
      // Mint a couple of more children
      await nestMint(child, parent.address, parentId);
      await nestMint(child, parent.address, parentId);

      const operator = addrs[2];
      await parent.connect(tokenOwner).setApprovalForAll(operator.address, true);
      await parent.connect(operator).rejectAllChildren(parentId);
      await checkNoChildrenNorPending(parentId);
    });

    it('cannot reject all pending children for not owned pending child', async function () {
      const notOwner = addrs[3];

      await expect(
        parent.connect(notOwner).rejectAllChildren(parentId),
      ).to.be.revertedWithCustomError(parent, 'ERC721NotApprovedOrOwner');
    });

    it('cannot reject children for non existing index', async () => {
      await expect(
        parent.connect(tokenOwner).rejectChild(parentId, 2, zeroAddress),
      ).to.be.revertedWithCustomError(parent, 'RMRKPendingChildIndexOutOfRange');
    });
  });

  describe('Burning', async function () {
    let parentId: number;

    beforeEach(async function () {
      parentId = await mint(parent, tokenOwner.address);
    });

    it('can burn token', async function () {
      expect(await parent.balanceOf(tokenOwner.address)).to.equal(1);
      await parent.connect(tokenOwner).burn(parentId);
      await checkBurntParent();
    });

    it('cannot burn not owned token', async function () {
      const notOwner = addrs[3];
      await expect(parent.connect(notOwner).burnChild(parentId, 0)).to.be.revertedWithCustomError(
        parent,
        'RMRKNotApprovedOrDirectOwner',
      );
    });

    it('cannot burn child out of index', async function () {
      const badIndex = 2;
      await expect(
        parent.connect(tokenOwner).burnChild(parentId, badIndex),
      ).to.be.revertedWithCustomError(parent, 'RMRKChildIndexOutOfRange');
    });

    it('can burn token if approved', async function () {
      const approved = addrs[1];
      await parent.connect(tokenOwner).approve(approved.address, parentId);
      await parent.connect(approved).burn(parentId);
      await checkBurntParent();
    });

    it('can burn token if approved for all', async function () {
      const operator = addrs[2];
      await parent.connect(tokenOwner).setApprovalForAll(operator.address, true);
      await parent.connect(operator).burn(parentId);
      await checkBurntParent();
    });

    it('can burn nested token', async function () {
      const childId = nestMint(child, parent.address, parentId);
      await parent.connect(tokenOwner).acceptChild(parentId, 0);
      await parent.connect(tokenOwner).burnChild(parentId, 0);

      // Removed from the parent
      expect(await parent.childrenOf(parentId)).to.eql([]);

      // No owner for token
      await expect(child.ownerOf(childId)).to.be.revertedWithCustomError(
        child,
        'ERC721InvalidTokenId',
      );
      await expect(child.rmrkOwnerOf(childId)).to.be.revertedWithCustomError(
        child,
        'ERC721InvalidTokenId',
      );
    });

    it('cannot burn not owned nested token', async function () {
      const notOwner = addrs[3];
      await nestMint(child, parent.address, parentId);
      await parent.connect(tokenOwner).acceptChild(parentId, 0);

      await expect(parent.connect(notOwner).burnChild(parentId, 0)).to.be.revertedWithCustomError(
        child,
        'RMRKNotApprovedOrDirectOwner',
      );
    });

    it('can recursively burn nested token', async function () {
      const childId = await nestMint(child, parent.address, parentId);
      const granchildId = await nestMint(child, child.address, childId);
      await parent.connect(tokenOwner).acceptChild(parentId, 0);
      await child.connect(tokenOwner).acceptChild(childId, 0);

      expect(await parent.balanceOf(tokenOwner.address)).to.equal(1);
      expect(await child.balanceOf(parent.address)).to.equal(1);
      expect(await child.balanceOf(child.address)).to.equal(1);

      expect(await parent.childrenOf(parentId)).to.eql([[bn(childId), child.address]]);
      expect(await child.childrenOf(childId)).to.eql([[bn(granchildId), child.address]]);
      expect(await child.rmrkOwnerOf(granchildId)).to.eql([child.address, bn(childId), true]);

      await parent.connect(tokenOwner).burnChild(parentId, 0);

      // Child and grandchild were burnt, parent is still there
      expect(await parent.balanceOf(tokenOwner.address)).to.equal(1);
      expect(await child.balanceOf(parent.address)).to.equal(0);
      expect(await child.balanceOf(child.address)).to.equal(0);

      await expect(child.ownerOf(childId)).to.be.revertedWithCustomError(
        child,
        'ERC721InvalidTokenId',
      );
      await expect(child.rmrkOwnerOf(childId)).to.be.revertedWithCustomError(
        child,
        'ERC721InvalidTokenId',
      );

      await expect(parent.ownerOf(granchildId)).to.be.revertedWithCustomError(
        parent,
        'ERC721InvalidTokenId',
      );
      await expect(parent.rmrkOwnerOf(granchildId)).to.be.revertedWithCustomError(
        parent,
        'ERC721InvalidTokenId',
      );
    });

    async function checkBurntParent() {
      expect(await parent.balanceOf(addrs[1].address)).to.equal(0);
      await expect(parent.ownerOf(parentId)).to.be.revertedWithCustomError(
        parent,
        'ERC721InvalidTokenId',
      );
    }
  });

  describe('Unnesting Active', async function () {
    let parentId: number;
    let childId: number;

    beforeEach(async function () {
      parentId = await mint(parent, tokenOwner.address);
      childId = await nestMint(child, parent.address, parentId);
      await parent.connect(tokenOwner).acceptChild(parentId, 0);
    });

    it('can unnest child with to as root owner', async function () {
      await expect(parent.connect(tokenOwner).unnestChild(parentId, 0, tokenOwner.address, false))
        .to.emit(parent, 'ChildUnnested')
        .withArgs(parentId, child.address, childId, 0);

      await checkChildMovedToRootOwner();
    });

    it('can unnest child to another address', async function () {
      const toOwnerAddress = addrs[2].address;
      await expect(parent.connect(tokenOwner).unnestChild(parentId, 0, toOwnerAddress, false))
        .to.emit(parent, 'ChildUnnested')
        .withArgs(parentId, child.address, childId, 0);

      await checkChildMovedToRootOwner(toOwnerAddress);
    });

    it('cannot unnest child out of index', async function () {
      const toOwnerAddress = addrs[2].address;
      const badIndex = 2;
      await expect(
        parent.connect(tokenOwner).unnestChild(parentId, badIndex, toOwnerAddress, false),
      ).to.be.revertedWithCustomError(parent, 'RMRKChildIndexOutOfRange');
    });

    it('can reclaim unnested child if unnested to address zero', async function () {
      await parent.connect(tokenOwner).unnestChild(parentId, 0, zeroAddress, false);

      await parent.connect(tokenOwner).reclaimChild(parentId, child.address, childId);
      expect(await child.ownerOf(childId)).to.eql(tokenOwner.address);
      expect(await child.rmrkOwnerOf(childId)).to.eql([tokenOwner.address, bn(0), false]);
    });

    it('cannot reclaim unnested child if unnested to a non zero address', async function () {
      await parent.connect(tokenOwner).unnestChild(parentId, 0, addrs[2].address, false);

      await expect(
        parent.connect(tokenOwner).reclaimChild(parentId, child.address, childId),
      ).to.be.revertedWithCustomError(parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim unnested child from different parent token', async function () {
      await parent.connect(tokenOwner).unnestChild(parentId, 0, zeroAddress, false);
      const otherParentId = await mint(parent, tokenOwner.address);

      await expect(
        parent.connect(tokenOwner).reclaimChild(otherParentId, child.address, childId),
      ).to.be.revertedWithCustomError(parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim unnested child from a non owned parent token', async function () {
      const notParent = addrs[2];
      await parent.connect(tokenOwner).unnestChild(parentId, 0, zeroAddress, false);

      await expect(
        parent.connect(notParent).reclaimChild(parentId, child.address, childId),
      ).to.be.revertedWithCustomError(parent, 'ERC721NotApprovedOrOwner');
    });

    it('can unnest child if approved', async function () {
      const unnester = addrs[1];
      const toOwner = tokenOwner.address;
      // Since unnest is child scoped, approval must be on the child contract to child id
      await parent.connect(tokenOwner).approve(unnester.address, parentId);

      await parent.connect(unnester).unnestChild(parentId, 0, toOwner, false);
      await checkChildMovedToRootOwner();
    });

    it('can unnest child if approved for all', async function () {
      const operator = addrs[2];
      const toOwner = tokenOwner.address;
      // Since unnest is child scoped, approval must be on the child contract to child id
      await parent.connect(tokenOwner).setApprovalForAll(operator.address, true);

      await parent.connect(operator).unnestChild(parentId, 0, toOwner, false);
      await checkChildMovedToRootOwner();
    });

    it('can unnest child with grandchild and children are ok', async function () {
      const toOwner = tokenOwner.address;
      const grandchildId = await nestMint(child, child.address, childId);

      // Unnest child from parent.
      await parent.connect(tokenOwner).unnestChild(parentId, 0, toOwner, false);

      // New owner of child
      expect(await child.ownerOf(childId)).to.eql(tokenOwner.address);
      expect(await child.rmrkOwnerOf(childId)).to.eql([tokenOwner.address, bn(0), false]);

      // Grandchild is still owned by child
      expect(await child.ownerOf(grandchildId)).to.eql(tokenOwner.address);
      expect(await child.rmrkOwnerOf(grandchildId)).to.eql([child.address, bn(childId), true]);
    });

    it('cannot unnest if not child root owner', async function () {
      const toOwner = tokenOwner.address;
      const notOwner = addrs[3];
      await expect(
        parent.connect(notOwner).unnestChild(parentId, 0, toOwner, false),
      ).to.be.revertedWithCustomError(child, 'ERC721NotApprovedOrOwner');
    });

    it('cannot unnest not existing child', async function () {
      const badChildId = 99;
      const toOwner = tokenOwner.address;
      await expect(
        parent.connect(tokenOwner).unnestChild(badChildId, 0, toOwner, false),
      ).to.be.revertedWithCustomError(child, 'ERC721InvalidTokenId');
    });

    async function checkChildMovedToRootOwner(rootOwnerAddress?: string) {
      if (rootOwnerAddress === undefined) {
        rootOwnerAddress = tokenOwner.address;
      }
      expect(await child.ownerOf(childId)).to.eql(rootOwnerAddress);
      expect(await child.rmrkOwnerOf(childId)).to.eql([rootOwnerAddress, bn(0), false]);

      // Unnesting updates balances downstream
      expect(await child.balanceOf(rootOwnerAddress)).to.equal(1);
      expect(await parent.balanceOf(tokenOwner.address)).to.equal(1);
    }
  });

  describe('Unnesting Pending', async function () {
    let parentId: number;
    let childId: number;

    beforeEach(async function () {
      parentId = await mint(parent, tokenOwner.address);
      childId = await nestMint(child, parent.address, parentId);
    });

    it('can unnest child with to as root owner', async function () {
      await expect(parent.connect(tokenOwner).unnestChild(parentId, 0, tokenOwner.address, true))
        .to.emit(parent, 'ChildRejected')
        .withArgs(parentId, child.address, childId, 0);

      await checkChildMovedToRootOwner();
    });

    it('can unnest child to another address', async function () {
      const toOwnerAddress = addrs[2].address;
      await expect(parent.connect(tokenOwner).unnestChild(parentId, 0, toOwnerAddress, true))
        .to.emit(parent, 'ChildRejected')
        .withArgs(parentId, child.address, childId, 0);

      await checkChildMovedToRootOwner(toOwnerAddress);
    });

    it('cannot unnest child out of index', async function () {
      const toOwnerAddress = addrs[2].address;
      const badIndex = 2;
      await expect(
        parent.connect(tokenOwner).unnestChild(parentId, badIndex, toOwnerAddress, true),
      ).to.be.revertedWithCustomError(parent, 'RMRKPendingChildIndexOutOfRange');
    });

    it('can reclaim unnested child if unnested to address zero', async function () {
      await parent.connect(tokenOwner).unnestChild(parentId, 0, zeroAddress, true);

      await parent.connect(tokenOwner).reclaimChild(parentId, child.address, childId);
      expect(await child.ownerOf(childId)).to.eql(tokenOwner.address);
      expect(await child.rmrkOwnerOf(childId)).to.eql([tokenOwner.address, bn(0), false]);
    });

    it('cannot reclaim unnested child if unnested to a non zero address', async function () {
      await parent.connect(tokenOwner).unnestChild(parentId, 0, addrs[2].address, true);

      await expect(
        parent.connect(tokenOwner).reclaimChild(parentId, child.address, childId),
      ).to.be.revertedWithCustomError(parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim unnested child from different parent token', async function () {
      await parent.connect(tokenOwner).unnestChild(parentId, 0, zeroAddress, true);
      const otherParentId = await mint(parent, tokenOwner.address);

      await expect(
        parent.connect(tokenOwner).reclaimChild(otherParentId, child.address, childId),
      ).to.be.revertedWithCustomError(parent, 'RMRKInvalidChildReclaim');
    });

    it('cannot reclaim unnested child from a non owned parent token', async function () {
      const notParent = addrs[2];
      await parent.connect(tokenOwner).unnestChild(parentId, 0, zeroAddress, true);

      await expect(
        parent.connect(notParent).reclaimChild(parentId, child.address, childId),
      ).to.be.revertedWithCustomError(parent, 'ERC721NotApprovedOrOwner');
    });

    it('can unnest child if approved', async function () {
      const unnester = addrs[1];
      const toOwner = tokenOwner.address;
      // Since unnest is child scoped, approval must be on the child contract to child id
      await parent.connect(tokenOwner).approve(unnester.address, parentId);

      await parent.connect(unnester).unnestChild(parentId, 0, toOwner, true);
      await checkChildMovedToRootOwner();
    });

    it('can unnest child if approved for all', async function () {
      const operator = addrs[2];
      const toOwner = tokenOwner.address;
      // Since unnest is child scoped, approval must be on the child contract to child id
      await parent.connect(tokenOwner).setApprovalForAll(operator.address, true);

      await parent.connect(operator).unnestChild(parentId, 0, toOwner, true);
      await checkChildMovedToRootOwner();
    });

    it('can unnest child with grandchild and children are ok', async function () {
      const toOwner = tokenOwner.address;
      const grandchildId = await nestMint(child, child.address, childId);

      // Unnest child from parent.
      await parent.connect(tokenOwner).unnestChild(parentId, 0, toOwner, true);

      // New owner of child
      expect(await child.ownerOf(childId)).to.eql(tokenOwner.address);
      expect(await child.rmrkOwnerOf(childId)).to.eql([tokenOwner.address, bn(0), false]);

      // Grandchild is still owned by child
      expect(await child.ownerOf(grandchildId)).to.eql(tokenOwner.address);
      expect(await child.rmrkOwnerOf(grandchildId)).to.eql([child.address, bn(childId), true]);
    });

    it('cannot unnest if not child root owner', async function () {
      const toOwner = tokenOwner.address;
      const notOwner = addrs[3];
      await expect(
        parent.connect(notOwner).unnestChild(parentId, 0, toOwner, true),
      ).to.be.revertedWithCustomError(child, 'ERC721NotApprovedOrOwner');
    });

    it('cannot unnest not existing child', async function () {
      const badChildId = 99;
      const toOwner = tokenOwner.address;
      await expect(
        parent.connect(tokenOwner).unnestChild(badChildId, 0, toOwner, true),
      ).to.be.revertedWithCustomError(child, 'ERC721InvalidTokenId');
    });

    async function checkChildMovedToRootOwner(rootOwnerAddress?: string) {
      if (rootOwnerAddress === undefined) {
        rootOwnerAddress = tokenOwner.address;
      }
      expect(await child.ownerOf(childId)).to.eql(rootOwnerAddress);
      expect(await child.rmrkOwnerOf(childId)).to.eql([rootOwnerAddress, bn(0), false]);

      // Unnesting updates balances downstream
      expect(await child.balanceOf(rootOwnerAddress)).to.equal(1);
      expect(await parent.balanceOf(tokenOwner.address)).to.equal(1);
    }
  });

  describe('Guest nesting', async function () {
    let parentId: number;
    let childId: number;
    let guestOwner: SignerWithAddress;
    let otherOwner: SignerWithAddress;

    beforeEach(async function () {
      guestOwner = addrs[0];
      otherOwner = addrs[1];
      parentId = await mint(parent, tokenOwner.address);
      childId = await mint(child, guestOwner.address);
      await nestTransfer(child, guestOwner, parent.address, childId, parentId, true);
    });

    describe('As guest owner', async function () {
      it('can guest nest', async function () {
        expect(await parent.guestOwnerOf(child.address, childId)).to.eql(guestOwner.address);
      });

      it('can unnest pending child to self', async function () {
        await parent.connect(guestOwner).unnestChild(parentId, 0, guestOwner.address, true);

        expect(await child.rmrkOwnerOf(childId)).to.eql([guestOwner.address, bn(0), false]);
        expect(await parent.guestOwnerOf(child.address, childId)).to.eql(zeroAddress);
        expect(await parent.pendingChildrenOf(parentId)).to.eql([]);
      });

      it('can unnest pending child to other address', async function () {
        await parent.connect(guestOwner).unnestChild(parentId, 0, otherOwner.address, true);

        expect(await child.rmrkOwnerOf(childId)).to.eql([otherOwner.address, bn(0), false]);
        expect(await parent.guestOwnerOf(child.address, childId)).to.eql(zeroAddress);
        expect(await parent.pendingChildrenOf(parentId)).to.eql([]);
      });

      it('can unnest active child to self', async function () {
        await parent.connect(tokenOwner).acceptChild(parentId, 0);
        await parent.connect(guestOwner).unnestChild(parentId, 0, guestOwner.address, false);

        expect(await child.rmrkOwnerOf(childId)).to.eql([guestOwner.address, bn(0), false]);
        expect(await parent.guestOwnerOf(child.address, childId)).to.eql(zeroAddress);
        expect(await parent.pendingChildrenOf(parentId)).to.eql([]);
      });

      it.skip('can unnest active child to other address', async function () {
        await parent.connect(tokenOwner).acceptChild(parentId, 0);
        await parent.connect(guestOwner).unnestChild(parentId, 0, otherOwner.address, false);

        expect(await child.rmrkOwnerOf(childId)).to.eql([otherOwner.address, bn(0), false]);
        expect(await parent.guestOwnerOf(child.address, childId)).to.eql(zeroAddress);
        expect(await parent.pendingChildrenOf(parentId)).to.eql([]);
      });

      it('can claim pending guest child if parent is burnt', async function () {
        await parent.connect(tokenOwner).burn(parentId);
        await checkClaimGuestChild();
      });

      it('can claim pending guest child if rejected', async function () {
        await parent.connect(tokenOwner).rejectChild(parentId, 0, zeroAddress);
        await checkClaimGuestChild();
      });

      it('can claim pending guest child if rejected all', async function () {
        await parent.connect(tokenOwner).rejectAllChildren(parentId);
        await checkClaimGuestChild();
      });

      it('can claim guest child if abandoned from pending', async function () {
        await parent.connect(tokenOwner).unnestChild(parentId, 0, zeroAddress, true);
        await checkClaimGuestChild();
      });

      it('can claim guest child if abandoned from active', async function () {
        await parent.connect(tokenOwner).acceptChild(parentId, 0);
        await parent.connect(tokenOwner).unnestChild(parentId, 0, zeroAddress, false);
        await checkClaimGuestChild();
      });

      async function checkClaimGuestChild() {
        // It's still the guest owner:
        expect(await parent.guestOwnerOf(child.address, childId)).to.eql(guestOwner.address);
        await parent.connect(guestOwner).reclaimChild(parentId, child.address, childId);

        // It's no longer the guest owner:
        expect(await parent.guestOwnerOf(child.address, childId)).to.eql(zeroAddress);
        expect(await child.rmrkOwnerOf(childId)).to.eql([guestOwner.address, bn(0), false]);
      }
    });

    describe('As receiver of guest token', async function () {
      it('can reject nested guest to zero', async function () {
        await parent.connect(tokenOwner).rejectChild(parentId, 0, zeroAddress);
        expect(await parent.guestOwnerOf(child.address, childId)).to.eql(guestOwner.address);
      });

      it('can reject nested guest to guest owner', async function () {
        await parent.connect(tokenOwner).rejectChild(parentId, 0, guestOwner.address);

        expect(await parent.guestOwnerOf(child.address, childId)).to.eql(zeroAddress);
        expect(await child.rmrkOwnerOf(childId)).to.eql([guestOwner.address, bn(0), false]);
      });

      it('cannot reject nested guest to address different to 0 or guest owner', async function () {
        await expect(
          parent.connect(tokenOwner).rejectChild(parentId, 0, otherOwner.address),
        ).to.be.revertedWithCustomError(parent, 'RMRKCanOnlyUnnestToGuestOwnerOrZeroAddress');
      });

      it('can abandon pending nested guest', async function () {
        await parent.connect(tokenOwner).unnestChild(parentId, 0, zeroAddress, true);

        expect(await parent.pendingChildrenOf(parentId)).to.eql([]);
        expect(await parent.guestOwnerOf(child.address, childId)).to.eql(guestOwner.address);
      });

      it('can abandon active nested guest', async function () {
        await parent.connect(tokenOwner).acceptChild(parentId, 0);
        await parent.connect(tokenOwner).unnestChild(parentId, 0, zeroAddress, false);

        expect(await parent.childrenOf(parentId)).to.eql([]);
        expect(await parent.guestOwnerOf(child.address, childId)).to.eql(guestOwner.address);
      });

      it('can unnest pending nested guest to guest owner', async function () {
        await parent.connect(tokenOwner).unnestChild(parentId, 0, guestOwner.address, true);

        expect(await parent.pendingChildrenOf(parentId)).to.eql([]);
        expect(await parent.guestOwnerOf(child.address, childId)).to.eql(zeroAddress);
        expect(await child.rmrkOwnerOf(childId)).to.eql([guestOwner.address, bn(0), false]);
      });

      it('can unnest active nested guest to guest owner', async function () {
        await parent.connect(tokenOwner).acceptChild(parentId, 0);
        await parent.connect(tokenOwner).unnestChild(parentId, 0, guestOwner.address, false);

        expect(await parent.childrenOf(parentId)).to.eql([]);
        expect(await parent.guestOwnerOf(child.address, childId)).to.eql(zeroAddress);
        expect(await child.rmrkOwnerOf(childId)).to.eql([guestOwner.address, bn(0), false]);
      });

      it('cannot unnest pending nested guest to a different address', async function () {
        await expect(
          parent.connect(tokenOwner).unnestChild(parentId, 0, otherOwner.address, true),
        ).to.be.revertedWithCustomError(parent, 'RMRKCanOnlyUnnestToGuestOwnerOrZeroAddress');
      });

      it('cannot unnest active nested guest to a different address', async function () {
        await parent.connect(tokenOwner).acceptChild(parentId, 0);
        await expect(
          parent.connect(tokenOwner).unnestChild(parentId, 0, otherOwner.address, false),
        ).to.be.revertedWithCustomError(parent, 'RMRKCanOnlyUnnestToGuestOwnerOrZeroAddress');
      });

      it('cannot burn guest child', async function () {
        await parent.connect(tokenOwner).acceptChild(parentId, 0);
        await expect(
          parent.connect(tokenOwner).burnChild(parentId, 0),
        ).to.be.revertedWithCustomError(parent, 'RMRKCannotBurnGuestNestedNFT');
      });

      it('cannot burn parent with active guest child', async function () {
        await parent.connect(tokenOwner).acceptChild(parentId, 0);
        await expect(parent.connect(tokenOwner).burn(parentId)).to.be.revertedWithCustomError(
          parent,
          'RMRKCannotBurnGuestNestedNFT',
        );
      });
    });
  });

  describe('Transfer', async function () {
    it('can transfer token', async function () {
      const firstOwner = addrs[1];
      const newOwner = addrs[2];
      const tokenId = await mint(parent, firstOwner.address);
      await transfer(parent, firstOwner, newOwner.address, tokenId);

      // Balances and ownership are updated
      expect(await parent.ownerOf(tokenId)).to.eql(newOwner.address);
      expect(await parent.balanceOf(firstOwner.address)).to.equal(0);
      expect(await parent.balanceOf(newOwner.address)).to.equal(1);
    });

    it('cannot transfer not owned token', async function () {
      const firstOwner = addrs[1];
      const newOwner = addrs[2];
      const tokenId = await mint(parent, firstOwner.address);
      await expect(
        transfer(parent, newOwner, newOwner.address, tokenId),
      ).to.be.revertedWithCustomError(child, 'RMRKNotApprovedOrDirectOwner');
    });

    it('cannot transfer to address zero', async function () {
      const firstOwner = addrs[1];
      const tokenId = await mint(parent, firstOwner.address);
      await expect(
        transfer(parent, firstOwner, zeroAddress, tokenId),
      ).to.be.revertedWithCustomError(child, 'ERC721TransferToTheZeroAddress');
    });

    it('can transfer token from approved address (not owner)', async function () {
      const firstOwner = addrs[1];
      const approved = addrs[2];
      const newOwner = addrs[3];
      const tokenId = await mint(parent, firstOwner.address);

      await parent.connect(firstOwner).approve(approved.address, tokenId);
      await transfer(parent, firstOwner, newOwner.address, tokenId);

      expect(await parent.ownerOf(tokenId)).to.eql(newOwner.address);
    });

    it('can transfer not nested token with child to address and owners/children are ok', async function () {
      const firstOwner = addrs[1];
      const newOwner = addrs[2];
      const parentId = await mint(parent, firstOwner.address);
      const childId = await nestMint(child, parent.address, parentId);

      await transfer(parent, firstOwner, newOwner.address, parentId);

      // Balances and ownership are updated
      expect(await parent.balanceOf(firstOwner.address)).to.equal(0);
      expect(await parent.balanceOf(newOwner.address)).to.equal(1);

      expect(await parent.ownerOf(parentId)).to.eql(newOwner.address);
      expect(await parent.rmrkOwnerOf(parentId)).to.eql([newOwner.address, bn(0), false]);

      // New owner of child
      expect(await child.ownerOf(childId)).to.eql(newOwner.address);
      expect(await child.rmrkOwnerOf(childId)).to.eql([parent.address, bn(parentId), true]);

      // Parent still has its children
      expect(await parent.pendingChildrenOf(parentId)).to.eql([[bn(childId), child.address]]);
    });

    it('cannot directly transfer nested child', async function () {
      const firstOwner = addrs[1];
      const newOwner = addrs[2];
      const parentId = await mint(parent, firstOwner.address);
      const childId = await nestMint(child, parent.address, parentId);

      await expect(
        transfer(child, firstOwner, newOwner.address, childId),
      ).to.be.revertedWithCustomError(child, 'RMRKNotApprovedOrDirectOwner');
    });

    it('can transfer parent token to token with same owner, family tree is ok', async function () {
      const firstOwner = addrs[1];
      const grandParentId = await mint(parent, firstOwner.address);
      const parentId = await mint(parent, firstOwner.address);
      const childId = await nestMint(child, parent.address, parentId);

      // Check balances
      expect(await parent.balanceOf(firstOwner.address)).to.equal(2);
      expect(await child.balanceOf(parent.address)).to.equal(1);

      // Transfers token parentId to (parent.address, token grandParentId)
      await nestTransfer(parent, firstOwner, parent.address, parentId, grandParentId, false);

      // Balances unchanged since root owner is the same
      expect(await parent.balanceOf(firstOwner.address)).to.equal(1);
      expect(await child.balanceOf(parent.address)).to.equal(1);
      expect(await parent.balanceOf(parent.address)).to.equal(1);

      // Parent is still owner of child
      let expected = [bn(childId), child.address];
      checkAcceptedAndPendingChildren(parent, parentId, [expected], []);
      // Ownership: firstOwner > newGrandparent > parent > child
      expected = [bn(parentId), parent.address];
      checkAcceptedAndPendingChildren(parent, grandParentId, [], [expected]);
    });

    it('can transfer parent token to token with different owner, family tree is ok', async function () {
      const firstOwner = addrs[1];
      const otherOwner = addrs[2];
      const grandParentId = await mint(parent, otherOwner.address);
      const parentId = await mint(parent, firstOwner.address);
      const childId = await nestMint(child, parent.address, parentId);

      // Check balances
      expect(await parent.balanceOf(otherOwner.address)).to.equal(1);
      expect(await parent.balanceOf(firstOwner.address)).to.equal(1);
      expect(await child.balanceOf(parent.address)).to.equal(1);

      // firstOwner calls parent to transfer parent token parent
      await nestTransfer(parent, firstOwner, parent.address, parentId, grandParentId, false);

      // Balances update
      expect(await parent.balanceOf(firstOwner.address)).to.equal(0);
      expect(await parent.balanceOf(parent.address)).to.equal(1);
      expect(await parent.balanceOf(otherOwner.address)).to.equal(1);
      expect(await child.balanceOf(parent.address)).to.equal(1);

      // Parent is still owner of child
      let expected = [bn(childId), child.address];
      checkAcceptedAndPendingChildren(parent, parentId, [expected], []);
      // Ownership: firstOwner > newGrandparent > parent > child
      expected = [bn(parentId), parent.address];
      checkAcceptedAndPendingChildren(parent, grandParentId, [], [expected]);
    });
  });

  describe('Nest Transfer', async function () {
    let firstOwner: SignerWithAddress;
    let parentId: number;
    let childId: number;

    beforeEach(async function () {
      firstOwner = addrs[1];
      parentId = await mint(parent, firstOwner.address);
      childId = await mint(child, firstOwner.address);
    });

    it('cannot nest tranfer from non immediate owner (owner of parent)', async function () {
      const otherParentId = await mint(parent, firstOwner.address);
      // We send it to the parent first
      await nestTransfer(child, firstOwner, parent.address, childId, parentId, false);
      // We can no longer nest transfer it, even if we are the root owner:
      await expect(
        nestTransfer(child, firstOwner, parent.address, childId, otherParentId, false),
      ).to.be.revertedWithCustomError(child, 'RMRKNotApprovedOrDirectOwner');
    });

    it('cannot nest tranfer to same NFT', async function () {
      // We can no longer nest transfer it, even if we are the root owner:
      await expect(
        nestTransfer(child, firstOwner, child.address, childId, childId, false),
      ).to.be.revertedWithCustomError(child, 'RMRKNestingTransferToSelf');
    });

    it('cannot nest tranfer a descendant same NFT', async function () {
      // We can no longer nest transfer it, even if we are the root owner:
      await nestTransfer(child, firstOwner, parent.address, childId, parentId, false);
      const grandChildId = await nestMint(child, child.address, childId);
      // Ownership is now parent->child->granChild
      // Cannot send parent to grandChild
      await expect(
        nestTransfer(parent, firstOwner, child.address, parentId, grandChildId, false),
      ).to.be.revertedWithCustomError(child, 'RMRKNestingTransferToDescendant');
      // Cannot send parent to child
      await expect(
        nestTransfer(parent, firstOwner, child.address, parentId, childId, false),
      ).to.be.revertedWithCustomError(child, 'RMRKNestingTransferToDescendant');
    });

    it('cannot nest tranfer if ancestors tree is too deep', async function () {
      let lastId = childId;
      for (let i = 0; i < 100; i++) {
        const newChildId = await nestMint(child, child.address, lastId);
        lastId = newChildId;
      }
      // Ownership is now parent->child->child->child->child...->lastChild
      // Cannot send parent to lastChild
      await expect(
        nestTransfer(parent, firstOwner, child.address, parentId, lastId, false),
      ).to.be.revertedWithCustomError(child, 'RMRKNestingTooDeep');
    });

    it('cannot nest tranfer if not owner', async function () {
      const notOwner = addrs[3];
      await expect(
        nestTransfer(child, notOwner, parent.address, childId, parentId, false),
      ).to.be.revertedWithCustomError(child, 'RMRKNotApprovedOrDirectOwner');
    });

    it('cannot nest tranfer to address 0', async function () {
      await expect(
        nestTransfer(child, firstOwner, zeroAddress, childId, parentId, false),
      ).to.be.revertedWithCustomError(child, 'ERC721TransferToTheZeroAddress');
    });

    it('cannot nest tranfer to a non contract', async function () {
      const newOwner = addrs[2];
      await expect(
        nestTransfer(child, firstOwner, newOwner.address, childId, parentId, false),
      ).to.be.revertedWithCustomError(child, 'RMRKIsNotContract');
    });

    it('cannot nest tranfer to contract if it does implement IRMRKNesting', async function () {
      const ERC721 = await ethers.getContractFactory('ERC721Mock');
      const nonNesting = await ERC721.deploy('Non receiver', 'NR');
      await nonNesting.deployed();
      await expect(
        nestTransfer(child, firstOwner, nonNesting.address, childId, parentId, false),
      ).to.be.revertedWithCustomError(child, 'RMRKNestingTransferToNonRMRKNestingImplementer');
    });

    it('can nest tranfer to IRMRKNesting contract', async function () {
      await nestTransfer(child, firstOwner, parent.address, childId, parentId, false);
      expect(await child.ownerOf(childId)).to.eql(firstOwner.address);
      expect(await child.rmrkOwnerOf(childId)).to.eql([parent.address, bn(parentId), true]);
    });

    it('cannot nest tranfer to non existing parent token', async function () {
      const notExistingParentId = 9999;
      await expect(
        nestTransfer(child, firstOwner, parent.address, childId, notExistingParentId, false),
      ).to.be.revertedWithCustomError(parent, 'ERC721InvalidTokenId');
    });
  });

  async function checkNoChildrenNorPending(parentId: number): Promise<void> {
    expect(await parent.pendingChildrenOf(parentId)).to.eql([]);
    expect(await parent.childrenOf(parentId)).to.eql([]);
  }

  async function checkAcceptedAndPendingChildren(
    contract: Contract,
    tokenId: number,
    expectedAccepted: any[],
    expectedPending: any[],
  ) {
    const accepted = await contract.childrenOf(tokenId);
    expect(accepted).to.eql(expectedAccepted);

    const pending = await contract.pendingChildrenOf(tokenId);
    expect(pending).to.eql(expectedPending);
  }
}

export default shouldBehaveLikeNesting;
