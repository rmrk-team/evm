import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';

async function shouldBehaveLikeNesting(
  name: string,
  symbol: string,
  name2: string,
  symbol2: string,
) {
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let ownerChunky: Contract;
  let petMonkey: Contract;

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    ownerChunky = this.parentToken;
    petMonkey = this.childToken;

    // Mint 20 ownerChunkys. These tests will simulate minting of petMonkeys to ownerChunkys.
    let i = 1;
    while (i <= 10) {
      await ownerChunky['mint(address,uint256)'](addrs[0].address, i);
      i++;
    }
    i = 11;
    while (i <= 20) {
      await ownerChunky['mint(address,uint256)'](addrs[1].address, i);
      i++;
    }
  });

  describe('Init', async function () {
    it('Name', async function () {
      expect(await ownerChunky.name()).to.equal(name);
      expect(await petMonkey.name()).to.equal(name2);
    });

    it('Symbol', async function () {
      expect(await ownerChunky.symbol()).to.equal(symbol);
      expect(await petMonkey.symbol()).to.equal(symbol2);
    });

    it('ownerChunky Ownership Test', async function () {
      expect(await ownerChunky.ownerOf(10)).to.equal(addrs[0].address);
      expect(await ownerChunky.ownerOf(20)).to.equal(addrs[1].address);
      expect(await ownerChunky.balanceOf(addrs[0].address)).to.equal(10);
      expect(await ownerChunky.balanceOf(addrs[1].address)).to.equal(10);

      await expect(ownerChunky.ownerOf(100)).to.be.revertedWithCustomError(
        ownerChunky,
        'ERC721InvalidTokenId',
      );
    });
  });

  describe('Interface support', async function () {
    it('can support IERC165', async function () {
      expect(await ownerChunky.supportsInterface('0x01ffc9a7')).to.equal(true);
    });

    it('can support IERC721', async function () {
      expect(await ownerChunky.supportsInterface('0x80ac58cd')).to.equal(true);
    });

    it('can support INesting', async function () {
      expect(await ownerChunky.supportsInterface('0xed432250')).to.equal(true);
    });

    it('cannot support other interfaceId', async function () {
      expect(await ownerChunky.supportsInterface('0xffffffff')).to.equal(false);
    });
  });

  describe('Minting', async function () {
    it('can mint with no destination', async function () {
      await petMonkey['mint(address,uint256)'](owner.address, 1);
      expect(await petMonkey.ownerOf(1)).to.equal(owner.address);
      expect(await petMonkey.rmrkOwnerOf(1)).to.eql([owner.address, BigNumber.from(0), false]);
    });

    it('cannot mint already minted token', async function () {
      await petMonkey['mint(address,uint256)'](owner.address, 1);
      await expect(
        petMonkey['mint(address,uint256)'](owner.address, 1),
      ).to.be.revertedWithCustomError(petMonkey, 'ERC721TokenAlreadyMinted');
    });

    it('cannot mint to zero address', async function () {
      await expect(
        petMonkey['mint(address,uint256)']('0x0000000000000000000000000000000000000000', 1),
      ).to.be.revertedWithCustomError(petMonkey, 'ERC721MintToTheZeroAddress');
    });

    it('cannot nest mint to a non-contract destination', async function () {
      await expect(
        petMonkey['mint(address,uint256,uint256)'](owner.address, 1, 0),
      ).to.be.revertedWithCustomError(petMonkey, 'RMRKIsNotContract');
    });

    it.skip('cannot nest mint to non rmrk core implementer', async function () {
      // FIXME Steven: implement
    });

    it('cannot nest mint to a non-existent token', async function () {
      await expect(
        petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, 1, 0),
      ).to.be.revertedWithCustomError(petMonkey, 'ERC721InvalidTokenId');
    });

    it('cannot nest mint already minted token', async function () {
      const childId = 1;
      const parentId = 11; // owner is addrs[1]

      // Mint petMonkey 1 into ownerChunky 11
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId);

      await expect(
        petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId),
      ).to.be.revertedWithCustomError(petMonkey, 'ERC721TokenAlreadyMinted');
    });

    it('cannot nest mint already minted token to a different parent', async function () {
      // This test may seem dumb, but a bad implementation could open this hole.
      const childId = 1;
      const parentId = 12; // owner is addrs[1]

      // Mint petMonkey 1 into ownerChunky 11
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId);

      await expect(
        petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId),
      ).to.be.revertedWithCustomError(petMonkey, 'ERC721TokenAlreadyMinted');
    });

    it('cannot nest mint to zero address', async function () {
      await expect(
        petMonkey['mint(address,uint256,uint256)'](
          '0x0000000000000000000000000000000000000000',
          1,
          10,
        ),
      ).to.be.revertedWithCustomError(petMonkey, 'ERC721MintToTheZeroAddress');
    });

    it('can mint to contract and owners are ok', async function () {
      const childId = 1;
      const parentId = 11; // owner is addrs[1]

      // Mint petMonkey 1 into ownerChunky 11
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId);

      // owner is the same adress
      expect(await ownerChunky.ownerOf(parentId)).to.equal(addrs[1].address);
      expect(await petMonkey.ownerOf(childId)).to.equal(addrs[1].address);
    });

    it('can mint to contract and RMRK owners are ok', async function () {
      const childId = 1;
      const parentId = 11;

      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId);

      // RMRK owner is an address for the parent
      expect(await ownerChunky.rmrkOwnerOf(parentId)).to.eql([
        addrs[1].address,
        BigNumber.from(0),
        false,
      ]);
      // RMRK owner is a contract for the child
      expect(await petMonkey.rmrkOwnerOf(childId)).to.eql([
        ownerChunky.address,
        BigNumber.from(parentId),
        true,
      ]);
    });

    it("can mint to contract and parent's children are ok", async function () {
      const childId = 1;
      const parentId = 11;

      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId);

      const children = await ownerChunky.childrenOf(parentId);
      expect(children).to.eql([]);

      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([[BigNumber.from(childId), petMonkey.address]]);
      expect(await ownerChunky.pendingChildOf(parentId, 0)).to.eql([
        BigNumber.from(childId),
        petMonkey.address,
      ]);
    });

    it('can mint multiple children', async function () {
      const childId1 = 1;
      const childId2 = 2;
      const parentId = 10;

      // Owner address mints a child
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId1, parentId);
      expect(await petMonkey.ownerOf(childId1)).to.equal(addrs[0].address);

      // Mint a second child
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId2, parentId);
      expect(await petMonkey.ownerOf(childId2)).to.equal(addrs[0].address);

      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([
        [BigNumber.from(childId1), petMonkey.address],
        [BigNumber.from(childId2), petMonkey.address],
      ]);
    });

    it('can mint child into child', async function () {
      const parentId = 10;
      const childId = 1;
      const granchildId = 21;

      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId);
      // mint petMonkey token 21 into petMonkey token 1
      await petMonkey['mint(address,uint256,uint256)'](petMonkey.address, granchildId, childId);

      const pendingChildrenOfChunky10 = await ownerChunky.pendingChildrenOf(parentId);
      const pendingChildrenOfMonkey1 = await petMonkey.pendingChildrenOf(childId);

      expect(pendingChildrenOfChunky10).to.eql([[BigNumber.from(childId), petMonkey.address]]);
      expect(pendingChildrenOfMonkey1).to.eql([[BigNumber.from(granchildId), petMonkey.address]]);

      // RMRK owner of pet 21 is pet 1
      expect(await petMonkey.rmrkOwnerOf(granchildId)).to.eql([
        petMonkey.address,
        BigNumber.from(childId),
        true,
      ]);

      // root owner of pet 21 should be owner address of chunky 10
      expect(await petMonkey.ownerOf(granchildId)).to.eql(addrs[0].address);
    });

    it('cannot add too many pending resources', async () => {
      const tokenId = 1;

      // First 127 should be fine.
      for (let i = 1; i <= 128; i++) {
        await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, i, tokenId);
      }

      await expect(
        petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, 129, tokenId),
      ).to.be.revertedWithCustomError(petMonkey, 'RMRKMaxPendingChildrenReached');
    });
  });

  describe('Adding child', async function () {
    it('cannot add child to existing NFT with different owner', async function () {
      const parentId = 11;
      const childId = 1;
      await petMonkey['mint(address,uint256)'](addrs[0].address, childId);
      await expect(
        ownerChunky.addChild(parentId, childId, petMonkey.address),
      ).to.be.revertedWithCustomError(ownerChunky, 'RMRKParentChildMismatch');
    });
  });

  describe('Accept child', async function () {
    it('can accept child', async function () {
      const accepter = addrs[1]; // owner of parent token
      const parentId = 11;
      await checkAcceptChildFromAddress(accepter, parentId);
    });

    it('can accept child if approved', async function () {
      const tokenOwner = addrs[1];
      const approved = addrs[2];
      const parentId = 11;
      await ownerChunky.connect(tokenOwner).approve(approved.address, parentId);
      await checkAcceptChildFromAddress(approved, parentId);
    });

    it('can accept child if approved for all', async function () {
      const tokenOwner = addrs[1];
      const approved = addrs[2];
      const parentId = 11;
      await ownerChunky.connect(tokenOwner).setApprovalForAll(approved.address, true);
      await checkAcceptChildFromAddress(approved, parentId);
    });

    it('cannot accept not owned child', async function () {
      const childId = 1;
      const parentId = 11;

      // Another address can mint
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId);

      // Another address cannot accept
      await expect(
        ownerChunky.connect(addrs[0]).acceptChild(parentId, 0),
      ).to.be.revertedWithCustomError(ownerChunky, 'ERC721NotApprovedOrOwner');
    });

    it('cannot accept children for non existing index', async () => {
      const parentId = 11;
      await expect(
        ownerChunky.connect(addrs[1]).acceptChild(parentId, 0),
      ).to.be.revertedWithCustomError(ownerChunky, 'RMRKPendingChildIndexOutOfRange');
    });
  });

  describe('Reject child', async function () {
    it('can reject one pending child', async function () {
      const rejecter = addrs[1]; // owner of parent token
      const parentId = 11;
      await checkRejectChildFromAddress(rejecter, parentId);
    });

    it('can reject child if approved', async function () {
      const tokenOwner = addrs[1];
      const rejecter = addrs[2];
      const parentId = 11;
      await ownerChunky.connect(tokenOwner).approve(rejecter.address, parentId);
      await checkRejectChildFromAddress(rejecter, parentId);
    });

    it('can reject child if approved for all', async function () {
      const tokenOwner = addrs[1];
      const rejecter = addrs[2];
      const parentId = 11;
      await ownerChunky.connect(tokenOwner).setApprovalForAll(rejecter.address, true);
      await checkRejectChildFromAddress(rejecter, parentId);
    });

    it('cannot reject not owned pending child', async function () {
      const parentId = 11;
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, 1, parentId);

      // addrs[1] attempts to reject addrs[0]'s pending children
      await expect(
        ownerChunky.connect(addrs[0]).rejectChild(parentId, 0),
      ).to.be.revertedWithCustomError(ownerChunky, 'ERC721NotApprovedOrOwner');
    });

    it('can reject all pending children', async function () {
      const rejecter = addrs[1]; // owner of parent token
      const parentId = 11;
      await checkRejectAllPendingChildrenFromAddress(rejecter, parentId);
    });

    it('can reject all pending children if approved', async function () {
      const tokenOwner = addrs[1];
      const rejecter = addrs[2];
      const parentId = 11;
      await ownerChunky.connect(tokenOwner).approve(rejecter.address, parentId);
      await checkRejectAllPendingChildrenFromAddress(rejecter, parentId);
    });

    it('can reject all pending children if approved for all', async function () {
      const tokenOwner = addrs[1];
      const rejecter = addrs[2];
      const parentId = 11;
      await ownerChunky.connect(tokenOwner).setApprovalForAll(rejecter.address, true);
      await checkRejectAllPendingChildrenFromAddress(rejecter, parentId);
    });

    it('cannot reject all pending children for not owned pending child', async function () {
      const parentId = 11;
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, 1, parentId);
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, 2, parentId);

      // addrs[1] attempts to reject addrs[0]'s pending children
      await expect(
        ownerChunky.connect(addrs[0]).rejectAllChildren(parentId),
      ).to.be.revertedWithCustomError(ownerChunky, 'ERC721NotApprovedOrOwner');
    });

    it('can reject all pending children from approved address (not owner)', async function () {
      const parentId = 11;
      const approvedAddress = addrs[2];

      await ownerChunky.connect(addrs[1]).approve(approvedAddress.address, parentId);
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, 1, parentId);
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, 2, parentId);

      await ownerChunky.connect(approvedAddress).rejectAllChildren(parentId);
      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);
    });

    it('cannot reject children for non existing index', async () => {
      const parentId = 11;
      await expect(
        ownerChunky.connect(addrs[1]).rejectChild(parentId, 0),
      ).to.be.revertedWithCustomError(ownerChunky, 'RMRKPendingChildIndexOutOfRange');
    });
  });

  describe('Remove child', async function () {
    it('can remove one child', async function () {
      const remover = addrs[1]; // owner of parent token
      const parentId = 11;
      await checkRemoveChildFromAddress(remover, parentId);
    });

    it('can remove one child if approved', async function () {
      const tokenOwner = addrs[1];
      const remover = addrs[2];
      const parentId = 11;
      await ownerChunky.connect(tokenOwner).approve(remover.address, parentId);
      await checkRemoveChildFromAddress(remover, parentId);
    });

    it('can remove one child if approved for all', async function () {
      const tokenOwner = addrs[1];
      const remover = addrs[2];
      const parentId = 11;
      await ownerChunky.connect(tokenOwner).setApprovalForAll(remover.address, true);
      await checkRemoveChildFromAddress(remover, parentId);
    });

    it('cannot remove not owned child', async function () {
      const parentId = 11;
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, 1, parentId);
      await ownerChunky.connect(addrs[1]).acceptChild(parentId, 0);

      // addrs[1] attempts to remove addrs[0]'s children
      await expect(
        ownerChunky.connect(addrs[0]).removeChild(parentId, 0),
      ).to.be.revertedWithCustomError(ownerChunky, 'ERC721NotApprovedOrOwner');
    });

    it('cannot remove children for non existing index', async () => {
      const parentId = 11;
      await expect(
        ownerChunky.connect(addrs[1]).removeChild(parentId, 0),
      ).to.be.revertedWithCustomError(ownerChunky, 'RMRKChildIndexOutOfRange');
    });
  });

  describe('Burning', async function () {
    it('can burn token', async function () {
      const tokenId = 1;

      await petMonkey['mint(address,uint256)'](addrs[1].address, tokenId);
      await petMonkey.connect(addrs[1]).burn(tokenId);
      await expect(petMonkey.ownerOf(tokenId)).to.be.revertedWithCustomError(
        petMonkey,
        'ERC721InvalidTokenId',
      );
    });

    it('cannot burn not owned token', async function () {
      const tokenId = 1;
      await petMonkey['mint(address,uint256)'](addrs[1].address, tokenId);
      await expect(petMonkey.connect(addrs[0]).burn(tokenId)).to.be.revertedWithCustomError(
        petMonkey,
        'ERC721NotApprovedOrOwner',
      );
    });

    it('cannot burn from parent if not parent', async function () {
      const childId = 1;
      const parentId = 10;
      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId);
      await expect(petMonkey.burnFromParent(childId)).to.be.revertedWithCustomError(
        petMonkey,
        'RMRKCallerIsNotOwnerContract',
      );
    });

    it('can burn token from approved address (not owner)', async function () {
      const tokenId = 1;
      const approvedAddress = addrs[2];

      await petMonkey['mint(address,uint256)'](addrs[1].address, tokenId);
      await petMonkey.connect(addrs[1]).approve(approvedAddress.address, tokenId);

      await petMonkey.connect(approvedAddress).burn(tokenId);
      await expect(petMonkey.ownerOf(tokenId)).to.be.revertedWithCustomError(
        petMonkey,
        'ERC721InvalidTokenId',
      );
    });

    it('can burn nested token', async function () {
      const childId = 1;
      const parentId = 10;
      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId);
      await ownerChunky.connect(addrs[0]).acceptChild(parentId, 0);
      await petMonkey.connect(addrs[0]).burn(childId);

      // no owner for token
      await expect(petMonkey.ownerOf(childId)).to.be.revertedWithCustomError(
        petMonkey,
        'ERC721InvalidTokenId',
      );
      await expect(petMonkey.rmrkOwnerOf(childId)).to.be.revertedWithCustomError(
        petMonkey,
        'ERC721InvalidTokenId',
      );
    });

    it('cannot burn not owned nested token', async function () {
      const childId = 1;
      const parentId = 10;
      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId);
      await ownerChunky.connect(addrs[0]).acceptChild(parentId, 0);

      await expect(petMonkey.connect(addrs[1]).burn(childId)).to.be.revertedWithCustomError(
        petMonkey,
        'ERC721NotApprovedOrOwner',
      );
    });

    it('can recursively burn nested token', async function () {
      const childId = 1;
      const parentId = 10;
      const granchildId = 21;

      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId);
      await ownerChunky.connect(addrs[0]).acceptChild(parentId, 0);
      // mint ownerChunky token 21 into petMonkey token 1
      await ownerChunky['mint(address,uint256,uint256)'](petMonkey.address, granchildId, childId);
      await petMonkey.connect(addrs[0]).acceptChild(childId, 0);

      // ownership chain is now addrs[0] > ownerChunky[10] > petMonkey[1] > ownerChunky[21]
      const children1 = await ownerChunky.childrenOf(parentId);
      const children2 = await petMonkey.childrenOf(childId);

      expect(children1).to.eql([[BigNumber.from(childId), petMonkey.address]]);

      expect(children2).to.eql([[BigNumber.from(granchildId), ownerChunky.address]]);

      expect(await ownerChunky.rmrkOwnerOf(granchildId)).to.eql([
        petMonkey.address,
        BigNumber.from(childId),
        true,
      ]);

      await petMonkey.connect(addrs[0]).burn(childId);

      await expect(petMonkey.ownerOf(childId)).to.be.revertedWithCustomError(
        petMonkey,
        'ERC721InvalidTokenId',
      );
      await expect(petMonkey.rmrkOwnerOf(childId)).to.be.revertedWithCustomError(
        petMonkey,
        'ERC721InvalidTokenId',
      );

      await expect(ownerChunky.ownerOf(granchildId)).to.be.revertedWithCustomError(
        ownerChunky,
        'ERC721InvalidTokenId',
      );
      await expect(ownerChunky.rmrkOwnerOf(granchildId)).to.be.revertedWithCustomError(
        ownerChunky,
        'ERC721InvalidTokenId',
      );
    });
  });

  describe('Unnesting', async function () {
    it('can unnest child and new owner is root owner', async function () {
      const { childId, parentId, firstOwner } = await mintTofirstOwner(true);
      await checkUnnestFromAddress(childId, parentId, firstOwner, firstOwner);
    });

    it('can unnest child if approved', async function () {
      const { childId, parentId, firstOwner } = await mintTofirstOwner(true);
      const unnester = addrs[2];
      // Since unnest is child scoped, approval must be on the child contract to child id
      await petMonkey.connect(firstOwner).approve(unnester.address, childId);
      await checkUnnestFromAddress(childId, parentId, firstOwner, unnester);
    });

    it('can unnest child if approved for all', async function () {
      const { childId, parentId, firstOwner } = await mintTofirstOwner(true);
      const unnester = addrs[2];
      // Since unnest is child scoped, approval must be on the child contract to child id
      await petMonkey.connect(firstOwner).setApprovalForAll(unnester.address, true);
      await checkUnnestFromAddress(childId, parentId, firstOwner, unnester);
    });

    it('cannot unnest from parent directly', async function () {
      const { parentId, firstOwner } = await mintTofirstOwner(true);
      await expect(
        ownerChunky.connect(firstOwner).unnestChild(parentId, 0),
      ).to.be.revertedWithCustomError(ownerChunky, 'RMRKUnnestFromWrongChild');
    });

    it('can unnest child with grandchild and childen are ok', async function () {
      const parentId = 10;
      const childId = 1;
      const grandchildId = 21;
      const owner = addrs[0];

      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId);
      await ownerChunky.connect(addrs[0]).acceptChild(parentId, 0);
      // mint petMonkey token 21 into petMonkey token 1
      await petMonkey['mint(address,uint256,uint256)'](petMonkey.address, grandchildId, childId);
      await petMonkey.connect(addrs[0]).acceptChild(childId, 0);

      // Unnest child from parent.
      await petMonkey.connect(addrs[0]).unnestSelf(childId, 0);

      // New owner of child
      expect(await petMonkey.ownerOf(childId)).to.eql(owner.address);
      expect(await petMonkey.rmrkOwnerOf(childId)).to.eql([
        owner.address,
        BigNumber.from(0),
        false,
      ]);

      // Grandchild is still owned by petMonkey childId
      expect(await petMonkey.ownerOf(grandchildId)).to.eql(owner.address);
      expect(await petMonkey.rmrkOwnerOf(grandchildId)).to.eql([
        petMonkey.address,
        BigNumber.from(childId),
        true,
      ]);
    });

    it('cannot unnest if not child root owner', async function () {
      await expect(petMonkey.connect(addrs[2]).unnestSelf(1, 0)).to.be.revertedWithCustomError(
        petMonkey,
        'ERC721InvalidTokenId',
      );
    });

    it('cannot unnest not existing child', async function () {
      const { childId, firstOwner } = await mintTofirstOwner(true);
      await expect(
        petMonkey.connect(firstOwner).unnestSelf(childId + 1, 0),
      ).to.be.revertedWithCustomError(petMonkey, 'ERC721InvalidTokenId');
    });

    it('cannot unnest token not owned by an NFT', async function () {
      const childId = 1;

      await petMonkey['mint(address,uint256)'](addrs[1].address, childId);
      await expect(
        petMonkey.connect(addrs[1]).unnestSelf(childId, 0),
      ).to.be.revertedWithCustomError(petMonkey, 'RMRKUnnestForNonNftParent');
    });
  });

  describe('Transfer', async function () {
    it('can transfer token', async function () {
      const tokenId = 1;
      const newOwner = addrs[2];

      await petMonkey['mint(address,uint256)'](addrs[1].address, tokenId);
      await petMonkey.connect(addrs[1]).transfer(newOwner.address, tokenId);
      expect(await petMonkey.ownerOf(tokenId)).to.eql(newOwner.address);
    });

    it('cannot transfer not owned token', async function () {
      const tokenId = 1;
      const newOwner = addrs[2];

      await petMonkey['mint(address,uint256)'](addrs[1].address, tokenId);
      await expect(
        petMonkey.connect(addrs[0]).transfer(newOwner.address, tokenId),
      ).to.be.revertedWithCustomError(petMonkey, 'ERC721NotApprovedOrOwner');
    });

    it('cannot transfer to address zero', async function () {
      const tokenId = 1;
      await expect(
        ownerChunky.connect(addrs[0]).transfer(ethers.constants.AddressZero, tokenId),
      ).to.be.revertedWithCustomError(ownerChunky, 'ERC721TransferToTheZeroAddress');
    });

    it('can transfer token from approved address (not owner)', async function () {
      const tokenId = 1;
      const firstOwner = addrs[1];
      const approved = addrs[2];
      const newOwner = addrs[3];

      await petMonkey['mint(address,uint256)'](firstOwner.address, tokenId);
      await petMonkey.connect(firstOwner).approve(approved.address, tokenId);

      await petMonkey
        .connect(approved)
        ['transferFrom(address,address,uint256)'](firstOwner.address, newOwner.address, tokenId);
      expect(await petMonkey.ownerOf(tokenId)).to.eql(newOwner.address);
    });

    it('can transfer not nested token to address and owners are ok', async function () {
      const newOwner = addrs[2];
      const { childId, parentId, firstOwner } = await mintTofirstOwner();
      await ownerChunky
        .connect(firstOwner)
        ['transferFrom(address,address,uint256)'](firstOwner.address, newOwner.address, parentId);

      // New owner of parent
      expect(await ownerChunky.ownerOf(parentId)).to.eql(newOwner.address);
      expect(await ownerChunky.rmrkOwnerOf(parentId)).to.eql([
        newOwner.address,
        BigNumber.from(0),
        false,
      ]);

      // New owner of child
      expect(await petMonkey.ownerOf(childId)).to.eql(newOwner.address);
      expect(await petMonkey.rmrkOwnerOf(childId)).to.eql([
        ownerChunky.address,
        BigNumber.from(parentId),
        true,
      ]);
    });

    it('can transfer not nested token to address and children are ok', async function () {
      const newOwner = addrs[2];
      const { childId, parentId, firstOwner } = await mintTofirstOwner();
      await ownerChunky
        .connect(firstOwner)
        ['transferFrom(address,address,uint256)'](firstOwner.address, newOwner.address, parentId);

      // Parent still has its children
      const children = await ownerChunky.pendingChildrenOf(parentId);
      expect(children).to.eql([[BigNumber.from(childId), petMonkey.address]]);
    });

    it('cannot transfer nested child', async function () {
      const newParentId = 12; // owner is firstOwner
      const { childId, firstOwner } = await mintTofirstOwner(true);

      await expect(
        petMonkey
          .connect(firstOwner)
          ['transferFrom(address,address,uint256,uint256)'](
            firstOwner.address,
            ownerChunky.address,
            childId,
            newParentId,
          ),
      ).to.be.revertedWithCustomError(petMonkey, 'RMRKMustUnnestFirst');
    });

    it('can transfer parent token to token with same owner, family tree is ok', async function () {
      const newGrandparentId = 12; // owner is firstOwner

      // Ownership: firstOwner > parent > child
      const { childId, parentId, firstOwner } = await mintTofirstOwner(true);

      await ownerChunky
        .connect(firstOwner)
        ['transferFrom(address,address,uint256,uint256)'](
          firstOwner.address,
          ownerChunky.address,
          parentId,
          newGrandparentId,
        );

      // Parent is still owner of child
      let expected = [BigNumber.from(childId), petMonkey.address];
      checkAcceptedAndPendingChildren(ownerChunky, parentId, [expected], []);
      // Ownership: firstOwner > newGrandparent > parent > child
      expected = [BigNumber.from(parentId), ownerChunky.address];
      checkAcceptedAndPendingChildren(ownerChunky, newGrandparentId, [], [expected]);
    });

    it('can safe transfer parent token to token with same owner, family tree is ok', async function () {
      const newGrandparentId = 12; // owner is firstOwner

      // Ownership: firstOwner > parent > child
      const { childId, parentId, firstOwner } = await mintTofirstOwner(true);

      await ownerChunky
        .connect(firstOwner)
        ['transferFrom(address,address,uint256,uint256)'](
          firstOwner.address,
          ownerChunky.address,
          parentId,
          newGrandparentId,
        );

      // Parent is still owner of child
      let expected = [BigNumber.from(childId), petMonkey.address];
      checkAcceptedAndPendingChildren(ownerChunky, parentId, [expected], []);
      // Ownership: firstOwner > newGrandparent > parent > child
      expected = [BigNumber.from(parentId), ownerChunky.address];
      checkAcceptedAndPendingChildren(ownerChunky, newGrandparentId, [], [expected]);
    });
  });

  async function mintTofirstOwner(
    accept = false,
  ): Promise<{ childId: number; parentId: number; firstOwner: any }> {
    const childId = 1;
    const parentId = 11; // First owner owns this
    const firstOwner = addrs[1];

    await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId);
    if (accept) {
      await ownerChunky.connect(firstOwner).acceptChild(parentId, 0);
    }

    return { childId, parentId, firstOwner };
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

  async function checkAcceptChildFromAddress(
    accepter: SignerWithAddress,
    parentId: number,
  ): Promise<void> {
    const childId = 1;

    await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, childId, parentId);

    // owner accepts the child at index 0 into the child array
    await ownerChunky.connect(accepter).acceptChild(parentId, 0);

    const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
    expect(pendingChildren).to.eql([]);

    const children = await ownerChunky.childrenOf(parentId);
    expect(children).to.eql([[BigNumber.from(childId), petMonkey.address]]);
    expect(await ownerChunky.childOf(parentId, 0)).to.eql([
      BigNumber.from(childId),
      petMonkey.address,
    ]);
  }

  async function checkRejectChildFromAddress(
    rejecter: SignerWithAddress,
    parentId: number,
  ): Promise<void> {
    await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, 1, parentId);
    await ownerChunky.connect(rejecter).rejectChild(parentId, 0);
    const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
    expect(pendingChildren).to.eql([]);
  }

  async function checkRejectAllPendingChildrenFromAddress(
    rejecter: SignerWithAddress,
    parentId: number,
  ): Promise<void> {
    await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, 1, parentId);
    await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, 2, parentId);

    let pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
    expect(pendingChildren).to.eql([
      [BigNumber.from(1), petMonkey.address],
      [BigNumber.from(2), petMonkey.address],
    ]);

    await ownerChunky.connect(rejecter).rejectAllChildren(parentId);
    pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
    expect(pendingChildren).to.eql([]);
  }

  async function checkRemoveChildFromAddress(
    remover: SignerWithAddress,
    parentId: number,
  ): Promise<void> {
    await petMonkey['mint(address,uint256,uint256)'](ownerChunky.address, 1, parentId);
    await ownerChunky.connect(addrs[1]).acceptChild(parentId, 0);

    await ownerChunky.connect(remover).removeChild(parentId, 0);
    const children = await ownerChunky.childrenOf(parentId);
    expect(children).to.eql([]);
  }

  async function checkUnnestFromAddress(
    childId: number,
    parentId: number,
    firstOwner: SignerWithAddress,
    unnester: SignerWithAddress,
  ): Promise<void> {
    await expect(petMonkey.connect(unnester).unnestSelf(childId, 0))
      .to.emit(ownerChunky, 'ChildUnnested')
      .withArgs(parentId, 0);

    // New owner of child
    expect(await petMonkey.ownerOf(childId)).to.eql(firstOwner.address);
    expect(await petMonkey.rmrkOwnerOf(childId)).to.eql([
      firstOwner.address,
      BigNumber.from(0),
      false,
    ]);
  }
}

export default shouldBehaveLikeNesting;
