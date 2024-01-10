import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { Contract } from 'ethers';
import { bn, ADDRESS_ZERO } from '../utils';
import { IERC165, IERC721, IERC7401, IOtherInterface } from '../interfaces';

async function shouldBehaveLikeNestable(
  mint: (token: Contract, to: string) => Promise<bigint>,
  nestMint: (token: Contract, to: string, parentId: bigint) => Promise<bigint>,
  transfer: (
    token: Contract,
    caller: SignerWithAddress,
    to: string,
    tokenId: bigint,
  ) => Promise<void>,
  nestTransfer: (
    token: Contract,
    caller: SignerWithAddress,
    to: string,
    tokenId: bigint,
    parentId: bigint,
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
      const tokenId = await mint(child, await tokenOwner.getAddress());
      expect(await child.ownerOf(tokenId)).to.equal(await tokenOwner.getAddress());
      expect(await child.directOwnerOf(tokenId)).to.eql([await tokenOwner.getAddress(), 0n, false]);
    });

    it('has right owners', async function () {
      const otherOwner = addrs[2];
      const tokenId = await mint(parent, await tokenOwner.getAddress());
      const tokenId2 = await mint(parent, await otherOwner.getAddress());
      const tokenId3 = await mint(parent, await otherOwner.getAddress());

      expect(await parent.ownerOf(tokenId)).to.equal(await tokenOwner.getAddress());
      expect(await parent.ownerOf(tokenId2)).to.equal(await otherOwner.getAddress());
      expect(await parent.ownerOf(tokenId3)).to.equal(await otherOwner.getAddress());

      expect(await parent.balanceOf(await tokenOwner.getAddress())).to.equal(1);
      expect(await parent.balanceOf(await otherOwner.getAddress())).to.equal(2);

      await expect(parent.ownerOf(9999)).to.be.revertedWithCustomError(
        parent,
        'ERC721InvalidTokenId',
      );
    });

    it('cannot mint to zero address', async function () {
      await expect(mint(child, ADDRESS_ZERO)).to.be.revertedWithCustomError(
        child,
        'ERC721MintToTheZeroAddress',
      );
    });

    it('cannot nest mint to a non-contract destination', async function () {
      await expect(
        nestMint(child, await tokenOwner.getAddress(), 0n),
      ).to.be.revertedWithCustomError(child, 'RMRKIsNotContract');
    });

    it('cannot nest mint to non rmrk nestable receiver', async function () {
      const ERC721 = await ethers.getContractFactory('ERC721Mock');
      const nonReceiver = await ERC721.deploy('Non receiver', 'NR');
      await nonReceiver.waitForDeployment();

      const parentId = await mint(parent, addrs[1].address);

      await expect(
        nestMint(child, await nonReceiver.getAddress(), parentId),
      ).to.be.revertedWithCustomError(child, 'RMRKNestableTransferToNonRMRKNestableImplementer');
    });

    it('cannot nest mint to a non-existent token', async function () {
      await expect(nestMint(child, await parent.getAddress(), bn(1))).to.be.revertedWithCustomError(
        child,
        'ERC721InvalidTokenId',
      );
    });

    it('cannot nest mint to zero address', async function () {
      const parentId = await mint(parent, await tokenOwner.getAddress());
      await expect(nestMint(child, ADDRESS_ZERO, parentId)).to.be.revertedWithCustomError(
        child,
        'RMRKIsNotContract',
      );
    });

    it('can mint to contract and owners are ok', async function () {
      const parentId = await mint(parent, await tokenOwner.getAddress());
      const childId = await nestMint(child, await parent.getAddress(), parentId);

      // owner is the same adress
      expect(await parent.ownerOf(parentId)).to.equal(await tokenOwner.getAddress());
      expect(await child.ownerOf(childId)).to.equal(await tokenOwner.getAddress());

      expect(await parent.balanceOf(await tokenOwner.getAddress())).to.equal(1);
      expect(await child.balanceOf(await parent.getAddress())).to.equal(1);
    });

    it('can mint to contract and RMRK owners are ok', async function () {
      const parentId = await mint(parent, await tokenOwner.getAddress());
      const childId = await nestMint(child, await parent.getAddress(), parentId);

      // RMRK owner is an address for the parent
      expect(await parent.directOwnerOf(parentId)).to.eql([
        await tokenOwner.getAddress(),
        0n,
        false,
      ]);
      // RMRK owner is a contract for the child
      expect(await child.directOwnerOf(childId)).to.eql([
        await parent.getAddress(),
        parentId,
        true,
      ]);
    });

    it("can mint to contract and parent's children are ok", async function () {
      const parentId = await mint(parent, await tokenOwner.getAddress());
      const childId = await nestMint(child, await parent.getAddress(), parentId);

      const children = await parent.childrenOf(parentId);
      expect(children).to.eql([]);

      const pendingChildren = await parent.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([[childId, await child.getAddress()]]);
      expect(await parent.pendingChildOf(parentId, 0)).to.eql([childId, await child.getAddress()]);
    });

    it('cannot get child out of index', async function () {
      const parentId = await mint(parent, await tokenOwner.getAddress());
      await expect(parent.childOf(parentId, 0)).to.be.revertedWithCustomError(
        parent,
        'RMRKChildIndexOutOfRange',
      );
    });

    it('cannot get pending child out of index', async function () {
      const parentId = await mint(parent, await tokenOwner.getAddress());
      await expect(parent.pendingChildOf(parentId, 0)).to.be.revertedWithCustomError(
        parent,
        'RMRKPendingChildIndexOutOfRange',
      );
    });

    it('can mint multiple children', async function () {
      const parentId = await mint(parent, await tokenOwner.getAddress());
      const childId1 = await nestMint(child, await parent.getAddress(), parentId);
      const childId2 = await nestMint(child, await parent.getAddress(), parentId);

      expect(await child.ownerOf(childId1)).to.equal(await tokenOwner.getAddress());
      expect(await child.ownerOf(childId2)).to.equal(await tokenOwner.getAddress());

      expect(await child.balanceOf(await parent.getAddress())).to.equal(2);

      const pendingChildren = await parent.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([
        [childId1, await child.getAddress()],
        [childId2, await child.getAddress()],
      ]);
    });

    it('can mint child into child', async function () {
      const parentId = await mint(parent, await tokenOwner.getAddress());
      const childId = await nestMint(child, await parent.getAddress(), parentId);
      const granchildId = await nestMint(child, await child.getAddress(), childId);

      // Check balances -- yes, technically the counted balance indicates `child` owns an instance of itself
      // and this is a little counterintuitive, but the root owner is the EOA.
      expect(await child.balanceOf(await parent.getAddress())).to.equal(1);
      expect(await child.balanceOf(await child.getAddress())).to.equal(1);

      const pendingChildrenOfChunky10 = await parent.pendingChildrenOf(parentId);
      const pendingChildrenOfMonkey1 = await child.pendingChildrenOf(childId);

      expect(pendingChildrenOfChunky10).to.eql([[childId, await child.getAddress()]]);
      expect(pendingChildrenOfMonkey1).to.eql([[granchildId, await child.getAddress()]]);

      expect(await child.directOwnerOf(granchildId)).to.eql([
        await child.getAddress(),
        childId,
        true,
      ]);

      expect(await child.ownerOf(granchildId)).to.eql(await tokenOwner.getAddress());
    });

    it('cannot have too many pending children', async () => {
      const parentId = await mint(parent, await tokenOwner.getAddress());

      // First 127 should be fine.
      for (let i = 0; i <= 127; i++) {
        await nestMint(child, await parent.getAddress(), parentId);
      }

      await expect(
        nestMint(child, await parent.getAddress(), parentId),
      ).to.be.revertedWithCustomError(child, 'RMRKMaxPendingChildrenReached');
    });
  });

  describe('Interface support', async function () {
    it('can support IERC165', async function () {
      expect(await parent.supportsInterface(IERC165)).to.equal(true);
    });

    it('can support IERC721', async function () {
      expect(await parent.supportsInterface(IERC721)).to.equal(true);
    });

    it('can support INestable', async function () {
      expect(await parent.supportsInterface(IERC7401)).to.equal(true);
    });

    it('cannot support other interfaceId', async function () {
      expect(await parent.supportsInterface(IOtherInterface)).to.equal(false);
    });
  });

  describe('Adding child', async function () {
    it('cannot add child from user address', async function () {
      const tokenOwner1 = addrs[0];
      const tokenOwner2 = addrs[1];
      const parentId = await mint(parent, await tokenOwner1.getAddress());
      const childId = await mint(child, await tokenOwner2.getAddress());
      await expect(parent.addChild(parentId, childId, '0x')).to.be.revertedWithCustomError(
        parent,
        'RMRKIsNotContract',
      );
    });
  });

  describe('Accept child', async function () {
    let parentId: bigint;
    let childId: bigint;

    beforeEach(async function () {
      parentId = await mint(parent, await tokenOwner.getAddress());
      childId = await nestMint(child, await parent.getAddress(), parentId);
    });

    it('can accept child', async function () {
      await expect(
        parent.connect(tokenOwner).acceptChild(parentId, 0, await child.getAddress(), childId),
      )
        .to.emit(parent, 'ChildAccepted')
        .withArgs(parentId, 0, await child.getAddress(), childId);
      await checkChildWasAccepted();
    });

    it('can accept child if approved', async function () {
      const approved = addrs[1];
      await parent.connect(tokenOwner).approve(await approved.getAddress(), parentId);
      await parent.connect(approved).acceptChild(parentId, 0, await child.getAddress(), childId);
      await checkChildWasAccepted();
    });

    it('can accept child if approved for all', async function () {
      const operator = addrs[2];
      await parent.connect(tokenOwner).setApprovalForAll(await operator.getAddress(), true);
      await parent.connect(operator).acceptChild(parentId, 0, await child.getAddress(), childId);
      await checkChildWasAccepted();
    });

    it('cannot accept not owned child', async function () {
      const notOwner = addrs[3];
      await expect(
        parent.connect(notOwner).acceptChild(parentId, 0, await child.getAddress(), childId),
      ).to.be.revertedWithCustomError(parent, 'ERC721NotApprovedOrOwner');
    });

    it('cannot accept child if address or id do not match', async function () {
      const otherAddress = addrs[1].address;
      const otherChildId = 9999;
      await expect(
        parent.connect(tokenOwner).acceptChild(parentId, 0, await child.getAddress(), otherChildId),
      ).to.be.revertedWithCustomError(parent, 'RMRKUnexpectedChildId');
      await expect(
        parent.connect(tokenOwner).acceptChild(parentId, 0, otherAddress, childId),
      ).to.be.revertedWithCustomError(parent, 'RMRKUnexpectedChildId');
    });

    it('cannot accept children for non existing index', async () => {
      await expect(
        parent.connect(tokenOwner).acceptChild(parentId, 1, await child.getAddress(), childId),
      ).to.be.revertedWithCustomError(parent, 'RMRKPendingChildIndexOutOfRange');
    });

    async function checkChildWasAccepted() {
      expect(await parent.pendingChildrenOf(parentId)).to.eql([]);
      expect(await parent.childrenOf(parentId)).to.eql([[childId, await child.getAddress()]]);
    }
  });

  describe('Reject child', async function () {
    let parentId: bigint;

    beforeEach(async function () {
      parentId = await mint(parent, await tokenOwner.getAddress());
      await nestMint(child, await parent.getAddress(), parentId);
    });

    it('can reject all pending children', async function () {
      // Mint a couple of more children
      await nestMint(child, await parent.getAddress(), parentId);
      await nestMint(child, await parent.getAddress(), parentId);

      await expect(parent.connect(tokenOwner).rejectAllChildren(parentId, 3))
        .to.emit(parent, 'AllChildrenRejected')
        .withArgs(parentId);
      await checkNoChildrenNorPending(parentId);

      // They are still on the child
      expect(await child.balanceOf(await parent.getAddress())).to.equal(3);
    });

    it('cannot reject all pending children if there are more than expected', async function () {
      // Mint a couple of more children
      await nestMint(child, await parent.getAddress(), parentId);
      await nestMint(child, await parent.getAddress(), parentId);

      await expect(
        parent.connect(tokenOwner).rejectAllChildren(parentId, 1),
      ).to.be.revertedWithCustomError(parent, 'RMRKUnexpectedNumberOfChildren');
    });

    it('can reject all pending children if approved', async function () {
      // Mint a couple of more children
      await nestMint(child, await parent.getAddress(), parentId);
      await nestMint(child, await parent.getAddress(), parentId);

      const rejecter = addrs[1];
      await parent.connect(tokenOwner).approve(await rejecter.getAddress(), parentId);
      await parent.connect(rejecter).rejectAllChildren(parentId, 3);
      await checkNoChildrenNorPending(parentId);
    });

    it('can reject all pending children if approved for all', async function () {
      // Mint a couple of more children
      await nestMint(child, await parent.getAddress(), parentId);
      await nestMint(child, await parent.getAddress(), parentId);

      const operator = addrs[2];
      await parent.connect(tokenOwner).setApprovalForAll(await operator.getAddress(), true);
      await parent.connect(operator).rejectAllChildren(parentId, 3);
      await checkNoChildrenNorPending(parentId);
    });

    it('cannot reject all pending children for not owned pending child', async function () {
      const notOwner = addrs[3];

      await expect(
        parent.connect(notOwner).rejectAllChildren(parentId, 2),
      ).to.be.revertedWithCustomError(parent, 'ERC721NotApprovedOrOwner');
    });
  });

  describe('Burning', async function () {
    let parentId: bigint;

    beforeEach(async function () {
      parentId = await mint(parent, await tokenOwner.getAddress());
    });

    it('can burn token', async function () {
      expect(await parent.balanceOf(await tokenOwner.getAddress())).to.equal(1);
      await parent.connect(tokenOwner)['burn(uint256)'](parentId);
      await checkBurntParent();
    });

    it('can burn token if approved', async function () {
      const approved = addrs[1];
      await parent.connect(tokenOwner).approve(await approved.getAddress(), parentId);
      await parent.connect(approved)['burn(uint256)'](parentId);
      await checkBurntParent();
    });

    it('can burn token if approved for all', async function () {
      const operator = addrs[2];
      await parent.connect(tokenOwner).setApprovalForAll(await operator.getAddress(), true);
      await parent.connect(operator)['burn(uint256)'](parentId);
      await checkBurntParent();
    });

    it('can recursively burn nested token', async function () {
      const childId = await nestMint(child, await parent.getAddress(), parentId);
      const granchildId = await nestMint(child, await child.getAddress(), childId);
      await parent.connect(tokenOwner).acceptChild(parentId, 0, await child.getAddress(), childId);
      await child
        .connect(tokenOwner)
        .acceptChild(childId, 0, await child.getAddress(), granchildId);

      expect(await parent.balanceOf(await tokenOwner.getAddress())).to.equal(1);
      expect(await child.balanceOf(await parent.getAddress())).to.equal(1);
      expect(await child.balanceOf(await child.getAddress())).to.equal(1);

      expect(await parent.childrenOf(parentId)).to.eql([[childId, await child.getAddress()]]);
      expect(await child.childrenOf(childId)).to.eql([[granchildId, await child.getAddress()]]);
      expect(await child.directOwnerOf(granchildId)).to.eql([
        await child.getAddress(),
        childId,
        true,
      ]);

      // Sets recursive burns to 2
      await parent.connect(tokenOwner)['burn(uint256,uint256)'](parentId, 2);

      expect(await parent.balanceOf(await tokenOwner.getAddress())).to.equal(0);
      expect(await child.balanceOf(await parent.getAddress())).to.equal(0);
      expect(await child.balanceOf(await child.getAddress())).to.equal(0);

      await expect(parent.ownerOf(parentId)).to.be.revertedWithCustomError(
        parent,
        'ERC721InvalidTokenId',
      );
      await expect(parent.directOwnerOf(parentId)).to.be.revertedWithCustomError(
        parent,
        'ERC721InvalidTokenId',
      );

      await expect(child.ownerOf(childId)).to.be.revertedWithCustomError(
        child,
        'ERC721InvalidTokenId',
      );
      await expect(child.directOwnerOf(childId)).to.be.revertedWithCustomError(
        child,
        'ERC721InvalidTokenId',
      );

      await expect(parent.ownerOf(granchildId)).to.be.revertedWithCustomError(
        parent,
        'ERC721InvalidTokenId',
      );
      await expect(parent.directOwnerOf(granchildId)).to.be.revertedWithCustomError(
        parent,
        'ERC721InvalidTokenId',
      );
    });

    it('can recursively burn nested token with the right number of recursive burns', async function () {
      // Parent
      // -> Child1
      //      -> GrandChild1
      //      -> GrandChild2
      //        -> GreatGrandChild1
      // -> Child2
      // Total tree 5 (4 recursive burns)
      const childId = await nestMint(child, await parent.getAddress(), parentId);
      const childId2 = await nestMint(child, await parent.getAddress(), parentId);
      const grandChild1 = await nestMint(child, await child.getAddress(), childId);
      const grandChild2 = await nestMint(child, await child.getAddress(), childId);
      const greatGrandChild1 = await nestMint(child, await child.getAddress(), grandChild2);
      await parent.connect(tokenOwner).acceptChild(parentId, 0, await child.getAddress(), childId);
      await parent.connect(tokenOwner).acceptChild(parentId, 0, await child.getAddress(), childId2);
      await child
        .connect(tokenOwner)
        .acceptChild(childId, 0, await child.getAddress(), grandChild1);
      await child
        .connect(tokenOwner)
        .acceptChild(childId, 0, await child.getAddress(), grandChild2);
      await child
        .connect(tokenOwner)
        .acceptChild(grandChild2, 0, await child.getAddress(), greatGrandChild1);

      // 0 is not enough
      await expect(parent.connect(tokenOwner)['burn(uint256,uint256)'](parentId, 0))
        .to.be.revertedWithCustomError(parent, 'RMRKMaxRecursiveBurnsReached')
        .withArgs(await child.getAddress(), childId);
      // 1 is not enough
      await expect(parent.connect(tokenOwner)['burn(uint256,uint256)'](parentId, 1))
        .to.be.revertedWithCustomError(parent, 'RMRKMaxRecursiveBurnsReached')
        .withArgs(await child.getAddress(), grandChild1);
      // 2 is not enough
      await expect(parent.connect(tokenOwner)['burn(uint256,uint256)'](parentId, 2))
        .to.be.revertedWithCustomError(parent, 'RMRKMaxRecursiveBurnsReached')
        .withArgs(await child.getAddress(), grandChild2);
      // 3 is not enough
      await expect(parent.connect(tokenOwner)['burn(uint256,uint256)'](parentId, 3))
        .to.be.revertedWithCustomError(parent, 'RMRKMaxRecursiveBurnsReached')
        .withArgs(await child.getAddress(), greatGrandChild1);
      // 4 is not enough
      await expect(parent.connect(tokenOwner)['burn(uint256,uint256)'](parentId, 4))
        .to.be.revertedWithCustomError(parent, 'RMRKMaxRecursiveBurnsReached')
        .withArgs(await child.getAddress(), childId2);
      // 5 is just enough
      await parent.connect(tokenOwner)['burn(uint256,uint256)'](parentId, 5);
    });

    async function checkBurntParent() {
      expect(await parent.balanceOf(addrs[1].address)).to.equal(0);
      await expect(parent.ownerOf(parentId)).to.be.revertedWithCustomError(
        parent,
        'ERC721InvalidTokenId',
      );
    }
  });

  describe('Transferring Active Children', async function () {
    let parentId: bigint;
    let childId: bigint;

    beforeEach(async function () {
      parentId = await mint(parent, await tokenOwner.getAddress());
      childId = await nestMint(child, await parent.getAddress(), parentId);
      await parent.connect(tokenOwner).acceptChild(parentId, 0, await child.getAddress(), childId);
    });

    it('can transfer child with to as root owner', async function () {
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(
            parentId,
            await tokenOwner.getAddress(),
            0,
            0,
            await child.getAddress(),
            childId,
            false,
            '0x',
          ),
      )
        .to.emit(parent, 'ChildTransferred')
        .withArgs(parentId, 0, await child.getAddress(), childId, false, false);

      await checkChildMovedToRootOwner();
    });

    it('can transfer child to another address', async function () {
      const toOwnerAddress = addrs[2].address;
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(
            parentId,
            toOwnerAddress,
            0,
            0,
            await child.getAddress(),
            childId,
            false,
            '0x',
          ),
      )
        .to.emit(parent, 'ChildTransferred')
        .withArgs(parentId, 0, await child.getAddress(), childId, false, false);

      await checkChildMovedToRootOwner(toOwnerAddress);
    });

    it('can transfer child to address zero (remove child)', async function () {
      const newOwnerAddress = addrs[2].address;
      const newParentId = await mint(parent, newOwnerAddress);
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(
            parentId,
            ADDRESS_ZERO,
            0,
            0,
            await child.getAddress(),
            childId,
            false,
            '0x',
          ),
      )
        .to.emit(parent, 'ChildTransferred')
        .withArgs(parentId, 0, await child.getAddress(), childId, false, true);
      expect(await parent.childrenOf(parentId)).to.eql([]);
    });

    it('can transfer child to another NFT', async function () {
      const newOwnerAddress = addrs[2].address;
      const newParentId = await mint(parent, newOwnerAddress);
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(
            parentId,
            await parent.getAddress(),
            newParentId,
            0,
            await child.getAddress(),
            childId,
            false,
            '0x',
          ),
      )
        .to.emit(parent, 'ChildTransferred')
        .withArgs(parentId, 0, await child.getAddress(), childId, false, false);

      expect(await child.ownerOf(childId)).to.eql(newOwnerAddress);
      expect(await child.directOwnerOf(childId)).to.eql([
        await parent.getAddress(),
        newParentId,
        true,
      ]);
      expect(await parent.pendingChildrenOf(newParentId)).to.eql([
        [childId, await child.getAddress()],
      ]);
    });

    it('cannot transfer child out of index', async function () {
      const toOwnerAddress = addrs[2].address;
      const badIndex = 2;
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(
            parentId,
            toOwnerAddress,
            0,
            badIndex,
            await child.getAddress(),
            childId,
            false,
            '0x',
          ),
      ).to.be.revertedWithCustomError(parent, 'RMRKChildIndexOutOfRange');
    });

    it('cannot transfer child if address or id do not match', async function () {
      const otherAddress = addrs[1].address;
      const otherChildId = 9999;
      const toOwnerAddress = addrs[2].address;
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(parentId, toOwnerAddress, 0, 0, otherAddress, childId, false, '0x'),
      ).to.be.revertedWithCustomError(parent, 'RMRKUnexpectedChildId');
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(
            parentId,
            toOwnerAddress,
            0,
            0,
            await child.getAddress(),
            otherChildId,
            false,
            '0x',
          ),
      ).to.be.revertedWithCustomError(parent, 'RMRKUnexpectedChildId');
    });

    it('can transfer child if approved', async function () {
      const transferer = addrs[1];
      const toOwner = await tokenOwner.getAddress();
      await parent.connect(tokenOwner).approve(await transferer.getAddress(), parentId);

      await parent
        .connect(transferer)
        .transferChild(parentId, toOwner, 0, 0, await child.getAddress(), childId, false, '0x');
      await checkChildMovedToRootOwner();
    });

    it('can transfer child if approved for all', async function () {
      const operator = addrs[2];
      const toOwner = await tokenOwner.getAddress();
      await parent.connect(tokenOwner).setApprovalForAll(await operator.getAddress(), true);

      await parent
        .connect(operator)
        .transferChild(parentId, toOwner, 0, 0, await child.getAddress(), childId, false, '0x');
      await checkChildMovedToRootOwner();
    });

    it('can transfer child with grandchild and children are ok', async function () {
      const toOwner = await tokenOwner.getAddress();
      const grandchildId = await nestMint(child, await child.getAddress(), childId);

      // Transfer child from parent.
      await parent
        .connect(tokenOwner)
        .transferChild(parentId, toOwner, 0, 0, await child.getAddress(), childId, false, '0x');

      // New owner of child
      expect(await child.ownerOf(childId)).to.eql(await tokenOwner.getAddress());
      expect(await child.directOwnerOf(childId)).to.eql([await tokenOwner.getAddress(), 0n, false]);

      // Grandchild is still owned by child
      expect(await child.ownerOf(grandchildId)).to.eql(await tokenOwner.getAddress());
      expect(await child.directOwnerOf(grandchildId)).to.eql([
        await child.getAddress(),
        childId,
        true,
      ]);
    });

    it('cannot transfer child if not child root owner', async function () {
      const toOwner = await tokenOwner.getAddress();
      const notOwner = addrs[3];
      await expect(
        parent
          .connect(notOwner)
          .transferChild(parentId, toOwner, 0, 0, await child.getAddress(), childId, false, '0x'),
      ).to.be.revertedWithCustomError(child, 'ERC721NotApprovedOrOwner');
    });

    it('cannot transfer child from not existing parent', async function () {
      const badTokenId = 999;
      const toOwner = await tokenOwner.getAddress();
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(badTokenId, toOwner, 0, 0, await child.getAddress(), childId, false, '0x'),
      ).to.be.revertedWithCustomError(child, 'ERC721InvalidTokenId');
    });

    async function checkChildMovedToRootOwner(rootOwnerAddress?: string) {
      if (rootOwnerAddress === undefined) {
        rootOwnerAddress = await tokenOwner.getAddress();
      }
      expect(await child.ownerOf(childId)).to.eql(rootOwnerAddress);
      expect(await child.directOwnerOf(childId)).to.eql([rootOwnerAddress, 0n, false]);

      // Transferring updates balances downstream
      expect(await child.balanceOf(rootOwnerAddress)).to.equal(1);
      expect(await parent.balanceOf(await tokenOwner.getAddress())).to.equal(1);
    }
  });

  describe('Transferring Pending Children', async function () {
    let parentId: bigint;
    let childId: bigint;

    beforeEach(async function () {
      parentId = await mint(parent, await tokenOwner.getAddress());
      childId = await nestMint(child, await parent.getAddress(), parentId);
    });

    it('can transfer child with to as root owner', async function () {
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(
            parentId,
            await tokenOwner.getAddress(),
            0,
            0,
            await child.getAddress(),
            childId,
            true,
            '0x',
          ),
      )
        .to.emit(parent, 'ChildTransferred')
        .withArgs(parentId, 0, await child.getAddress(), childId, true, false);

      await checkChildMovedToRootOwner();
    });

    it('can transfer child to another address', async function () {
      const toOwnerAddress = addrs[2].address;
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(
            parentId,
            toOwnerAddress,
            0,
            0,
            await child.getAddress(),
            childId,
            true,
            '0x',
          ),
      )
        .to.emit(parent, 'ChildTransferred')
        .withArgs(parentId, 0, await child.getAddress(), childId, true, false);

      await checkChildMovedToRootOwner(toOwnerAddress);
    });

    it('can transfer child to address zero (reject child)', async function () {
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(
            parentId,
            ADDRESS_ZERO,
            0,
            0,
            await child.getAddress(),
            childId,
            true,
            '0x',
          ),
      )
        .to.emit(parent, 'ChildTransferred')
        .withArgs(parentId, 0, await child.getAddress(), childId, true, true);
      expect(await parent.pendingChildrenOf(parentId)).to.eql([]);
    });

    it('can transfer child to another NFT', async function () {
      const newOwnerAddress = addrs[2].address;
      const newParentId = await mint(parent, newOwnerAddress);
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(
            parentId,
            await parent.getAddress(),
            newParentId,
            0,
            await child.getAddress(),
            childId,
            true,
            '0x',
          ),
      )
        .to.emit(parent, 'ChildTransferred')
        .withArgs(parentId, 0, await child.getAddress(), childId, true, false);

      expect(await child.ownerOf(childId)).to.eql(newOwnerAddress);
      expect(await child.directOwnerOf(childId)).to.eql([
        await parent.getAddress(),
        newParentId,
        true,
      ]);
      expect(await parent.pendingChildrenOf(newParentId)).to.eql([
        [childId, await child.getAddress()],
      ]);
    });

    it('cannot transfer child out of index', async function () {
      const toOwnerAddress = addrs[2].address;
      const badIndex = 2;
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(
            parentId,
            toOwnerAddress,
            0,
            badIndex,
            await child.getAddress(),
            childId,
            true,
            '0x',
          ),
      ).to.be.revertedWithCustomError(parent, 'RMRKPendingChildIndexOutOfRange');
    });

    it('cannot transfer child if address or id do not match', async function () {
      const otherAddress = addrs[1].address;
      const otherChildId = 9999;
      const toOwnerAddress = addrs[2].address;
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(parentId, toOwnerAddress, 0, 0, otherAddress, childId, true, '0x'),
      ).to.be.revertedWithCustomError(parent, 'RMRKUnexpectedChildId');
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(
            parentId,
            toOwnerAddress,
            0,
            0,
            await child.getAddress(),
            otherChildId,
            true,
            '0x',
          ),
      ).to.be.revertedWithCustomError(parent, 'RMRKUnexpectedChildId');
    });

    it('can transfer child if approved', async function () {
      const transferer = addrs[1];
      const toOwner = await tokenOwner.getAddress();
      await parent.connect(tokenOwner).approve(await transferer.getAddress(), parentId);

      await parent
        .connect(transferer)
        .transferChild(parentId, toOwner, 0, 0, await child.getAddress(), childId, true, '0x');
      await checkChildMovedToRootOwner();
    });

    it('can transfer child if approved for all', async function () {
      const operator = addrs[2];
      const toOwner = await tokenOwner.getAddress();
      await parent.connect(tokenOwner).setApprovalForAll(await operator.getAddress(), true);

      await parent
        .connect(operator)
        .transferChild(parentId, toOwner, 0, 0, await child.getAddress(), childId, true, '0x');
      await checkChildMovedToRootOwner();
    });

    it('can transfer child with grandchild and children are ok', async function () {
      const toOwner = await tokenOwner.getAddress();
      const grandchildId = await nestMint(child, await child.getAddress(), childId);

      // Transfer child from parent.
      await parent
        .connect(tokenOwner)
        .transferChild(parentId, toOwner, 0, 0, await child.getAddress(), childId, true, '0x');

      // New owner of child
      expect(await child.ownerOf(childId)).to.eql(await tokenOwner.getAddress());
      expect(await child.directOwnerOf(childId)).to.eql([await tokenOwner.getAddress(), 0n, false]);

      // Grandchild is still owned by child
      expect(await child.ownerOf(grandchildId)).to.eql(await tokenOwner.getAddress());
      expect(await child.directOwnerOf(grandchildId)).to.eql([
        await child.getAddress(),
        childId,
        true,
      ]);
    });

    it('cannot transfer child if not child root owner', async function () {
      const toOwner = await tokenOwner.getAddress();
      const notOwner = addrs[3];
      await expect(
        parent
          .connect(notOwner)
          .transferChild(parentId, toOwner, 0, 0, await child.getAddress(), childId, true, '0x'),
      ).to.be.revertedWithCustomError(child, 'ERC721NotApprovedOrOwner');
    });

    it('cannot transfer child from not existing parent', async function () {
      const badTokenId = 999;
      const toOwner = await tokenOwner.getAddress();
      await expect(
        parent
          .connect(tokenOwner)
          .transferChild(badTokenId, toOwner, 0, 0, await child.getAddress(), childId, true, '0x'),
      ).to.be.revertedWithCustomError(child, 'ERC721InvalidTokenId');
    });

    async function checkChildMovedToRootOwner(rootOwnerAddress?: string) {
      if (rootOwnerAddress === undefined) {
        rootOwnerAddress = await tokenOwner.getAddress();
      }
      expect(await child.ownerOf(childId)).to.eql(rootOwnerAddress);
      expect(await child.directOwnerOf(childId)).to.eql([rootOwnerAddress, 0n, false]);

      // transferring updates balances downstream
      expect(await child.balanceOf(rootOwnerAddress)).to.equal(1);
      expect(await parent.balanceOf(await tokenOwner.getAddress())).to.equal(1);
    }
  });

  describe('Transfer', async function () {
    it('can transfer token', async function () {
      const firstOwner = addrs[1];
      const newOwner = addrs[2];
      const tokenId = await mint(parent, await firstOwner.getAddress());
      await transfer(parent, firstOwner, await newOwner.getAddress(), tokenId);

      // Balances and ownership are updated
      expect(await parent.ownerOf(tokenId)).to.eql(await newOwner.getAddress());
      expect(await parent.balanceOf(await firstOwner.getAddress())).to.equal(0);
      expect(await parent.balanceOf(await newOwner.getAddress())).to.equal(1);
    });

    it('cannot transfer not owned token', async function () {
      const firstOwner = addrs[1];
      const newOwner = addrs[2];
      const tokenId = await mint(parent, await firstOwner.getAddress());
      await expect(
        transfer(parent, newOwner, await newOwner.getAddress(), tokenId),
      ).to.be.revertedWithCustomError(child, 'RMRKNotApprovedOrDirectOwner');
    });

    it('cannot transfer to address zero', async function () {
      const firstOwner = addrs[1];
      const tokenId = await mint(parent, await firstOwner.getAddress());
      await expect(
        transfer(parent, firstOwner, ADDRESS_ZERO, tokenId),
      ).to.be.revertedWithCustomError(child, 'ERC721TransferToTheZeroAddress');
    });

    it('can transfer token from approved address (not owner)', async function () {
      const firstOwner = addrs[1];
      const approved = addrs[2];
      const newOwner = addrs[3];
      const tokenId = await mint(parent, await firstOwner.getAddress());

      await parent.connect(firstOwner).approve(await approved.getAddress(), tokenId);
      await transfer(parent, firstOwner, await newOwner.getAddress(), tokenId);

      expect(await parent.ownerOf(tokenId)).to.eql(await newOwner.getAddress());
    });

    it('can transfer not nested token with child to address and owners/children are ok', async function () {
      const firstOwner = addrs[1];
      const newOwner = addrs[2];
      const parentId = await mint(parent, await firstOwner.getAddress());
      const childId = await nestMint(child, await parent.getAddress(), parentId);

      await transfer(parent, firstOwner, await newOwner.getAddress(), parentId);

      // Balances and ownership are updated
      expect(await parent.balanceOf(await firstOwner.getAddress())).to.equal(0);
      expect(await parent.balanceOf(await newOwner.getAddress())).to.equal(1);

      expect(await parent.ownerOf(parentId)).to.eql(await newOwner.getAddress());
      expect(await parent.directOwnerOf(parentId)).to.eql([await newOwner.getAddress(), 0n, false]);

      // New owner of child
      expect(await child.ownerOf(childId)).to.eql(await newOwner.getAddress());
      expect(await child.directOwnerOf(childId)).to.eql([
        await parent.getAddress(),
        parentId,
        true,
      ]);

      // Parent still has its children
      expect(await parent.pendingChildrenOf(parentId)).to.eql([
        [childId, await child.getAddress()],
      ]);
    });

    it('cannot directly transfer nested child', async function () {
      const firstOwner = addrs[1];
      const newOwner = addrs[2];
      const parentId = await mint(parent, await firstOwner.getAddress());
      const childId = await nestMint(child, await parent.getAddress(), parentId);

      await expect(
        transfer(child, firstOwner, await newOwner.getAddress(), childId),
      ).to.be.revertedWithCustomError(child, 'RMRKNotApprovedOrDirectOwner');
    });

    it('can transfer parent token to token with same owner, family tree is ok', async function () {
      const firstOwner = addrs[1];
      const grandParentId = await mint(parent, await firstOwner.getAddress());
      const parentId = await mint(parent, await firstOwner.getAddress());
      const childId = await nestMint(child, await parent.getAddress(), parentId);

      // Check balances
      expect(await parent.balanceOf(await firstOwner.getAddress())).to.equal(2);
      expect(await child.balanceOf(await parent.getAddress())).to.equal(1);

      // Transfers token parentId to (await parent.getAddress(), token grandParentId)
      await nestTransfer(parent, firstOwner, await parent.getAddress(), parentId, grandParentId);

      // Balances unchanged since root owner is the same
      expect(await parent.balanceOf(await firstOwner.getAddress())).to.equal(1);
      expect(await child.balanceOf(await parent.getAddress())).to.equal(1);
      expect(await parent.balanceOf(await parent.getAddress())).to.equal(1);

      // Parent is still owner of child
      let expected = [childId, await child.getAddress()];
      checkAcceptedAndPendingChildren(parent, parentId, [expected], []);
      // Ownership: firstOwner > newGrandparent > parent > child
      expected = [parentId, await parent.getAddress()];
      checkAcceptedAndPendingChildren(parent, grandParentId, [], [expected]);
    });

    it('can transfer parent token to token with different owner, family tree is ok', async function () {
      const firstOwner = addrs[1];
      const otherOwner = addrs[2];
      const grandParentId = await mint(parent, await otherOwner.getAddress());
      const parentId = await mint(parent, await firstOwner.getAddress());
      const childId = await nestMint(child, await parent.getAddress(), parentId);

      // Check balances
      expect(await parent.balanceOf(await otherOwner.getAddress())).to.equal(1);
      expect(await parent.balanceOf(await firstOwner.getAddress())).to.equal(1);
      expect(await child.balanceOf(await parent.getAddress())).to.equal(1);

      // firstOwner calls parent to transfer parent token parent
      await nestTransfer(parent, firstOwner, await parent.getAddress(), parentId, grandParentId);

      // Balances update
      expect(await parent.balanceOf(await firstOwner.getAddress())).to.equal(0);
      expect(await parent.balanceOf(await parent.getAddress())).to.equal(1);
      expect(await parent.balanceOf(await otherOwner.getAddress())).to.equal(1);
      expect(await child.balanceOf(await parent.getAddress())).to.equal(1);

      // Parent is still owner of child
      let expected = [childId, await child.getAddress()];
      checkAcceptedAndPendingChildren(parent, parentId, [expected], []);
      // Ownership: firstOwner > newGrandparent > parent > child
      expected = [parentId, await parent.getAddress()];
      checkAcceptedAndPendingChildren(parent, grandParentId, [], [expected]);
    });
  });

  describe('Nest Transfer', async function () {
    let firstOwner: SignerWithAddress;
    let parentId: bigint;
    let childId: bigint;

    beforeEach(async function () {
      firstOwner = addrs[1];
      parentId = await mint(parent, await firstOwner.getAddress());
      childId = await mint(child, await firstOwner.getAddress());
    });

    it('cannot nest tranfer from non immediate owner (owner of parent)', async function () {
      const otherParentId = await mint(parent, await firstOwner.getAddress());
      // We send it to the parent first
      await nestTransfer(child, firstOwner, await parent.getAddress(), childId, parentId);
      // We can no longer nest transfer it, even if we are the root owner:
      await expect(
        nestTransfer(child, firstOwner, await parent.getAddress(), childId, otherParentId),
      ).to.be.revertedWithCustomError(child, 'RMRKNotApprovedOrDirectOwner');
    });

    it('cannot nest tranfer to same NFT', async function () {
      // We can no longer nest transfer it, even if we are the root owner:
      await expect(
        nestTransfer(child, firstOwner, await child.getAddress(), childId, childId),
      ).to.be.revertedWithCustomError(child, 'RMRKNestableTransferToSelf');
    });

    it('cannot nest tranfer a descendant same NFT', async function () {
      // We can no longer nest transfer it, even if we are the root owner:
      await nestTransfer(child, firstOwner, await parent.getAddress(), childId, parentId);
      const grandChildId = await nestMint(child, await child.getAddress(), childId);
      // Ownership is now parent->child->granChild
      // Cannot send parent to grandChild
      await expect(
        nestTransfer(parent, firstOwner, await child.getAddress(), parentId, grandChildId),
      ).to.be.revertedWithCustomError(child, 'RMRKNestableTransferToDescendant');
      // Cannot send parent to child
      await expect(
        nestTransfer(parent, firstOwner, await child.getAddress(), parentId, childId),
      ).to.be.revertedWithCustomError(child, 'RMRKNestableTransferToDescendant');
    });

    it('cannot nest tranfer if ancestors tree is too deep', async function () {
      let lastId = childId;
      for (let i = 0; i < 100; i++) {
        const newChildId = await nestMint(child, await child.getAddress(), lastId);
        lastId = newChildId;
      }
      // Ownership is now parent->child->child->child->child...->lastChild
      // Cannot send parent to lastChild
      await expect(
        nestTransfer(parent, firstOwner, await child.getAddress(), parentId, lastId),
      ).to.be.revertedWithCustomError(child, 'RMRKNestableTooDeep');
    });

    it('cannot nest tranfer if not owner', async function () {
      const notOwner = addrs[3];
      await expect(
        nestTransfer(child, notOwner, await parent.getAddress(), childId, parentId),
      ).to.be.revertedWithCustomError(child, 'RMRKNotApprovedOrDirectOwner');
    });

    it('cannot nest tranfer to address 0', async function () {
      await expect(
        nestTransfer(child, firstOwner, ADDRESS_ZERO, childId, parentId),
      ).to.be.revertedWithCustomError(child, 'RMRKIsNotContract');
    });

    it('cannot nest tranfer to a non contract', async function () {
      const newOwner = addrs[2];
      await expect(
        nestTransfer(child, firstOwner, await newOwner.getAddress(), childId, parentId),
      ).to.be.revertedWithCustomError(child, 'RMRKIsNotContract');
    });

    it('cannot nest tranfer to contract if it does implement IERC7401', async function () {
      const ERC721 = await ethers.getContractFactory('ERC721Mock');
      const nonNestable = await ERC721.deploy('Non receiver', 'NR');
      await nonNestable.waitForDeployment();
      await expect(
        nestTransfer(child, firstOwner, await nonNestable.getAddress(), childId, parentId),
      ).to.be.revertedWithCustomError(child, 'RMRKNestableTransferToNonRMRKNestableImplementer');
    });

    it('can nest tranfer to IERC7401 contract', async function () {
      await nestTransfer(child, firstOwner, await parent.getAddress(), childId, parentId);
      expect(await child.ownerOf(childId)).to.eql(await firstOwner.getAddress());
      expect(await child.directOwnerOf(childId)).to.eql([
        await parent.getAddress(),
        parentId,
        true,
      ]);
    });

    it('cannot nest tranfer to non existing parent token', async function () {
      const notExistingParentId = bn(9999);
      await expect(
        nestTransfer(child, firstOwner, await parent.getAddress(), childId, notExistingParentId),
      ).to.be.revertedWithCustomError(parent, 'ERC721InvalidTokenId');
    });
  });

  async function checkNoChildrenNorPending(parentId: bigint): Promise<void> {
    expect(await parent.pendingChildrenOf(parentId)).to.eql([]);
    expect(await parent.childrenOf(parentId)).to.eql([]);
  }

  async function checkAcceptedAndPendingChildren(
    contract: Contract,
    tokenId: bigint,
    expectedAccepted: any[],
    expectedPending: any[],
  ) {
    const accepted = await contract.childrenOf(tokenId);
    expect(accepted).to.eql(expectedAccepted);

    const pending = await contract.pendingChildrenOf(tokenId);
    expect(pending).to.eql(expectedPending);
  }
}

export default shouldBehaveLikeNestable;
