import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { RMRKNestingMock } from '../typechain';

// TODO: Transfer - transfer now does double duty as removeChild

describe('Nesting', async () => {
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let ownerChunky: RMRKNestingMock;
  let petMonkey: RMRKNestingMock;

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  const name2 = 'petMonkey';
  const symbol2 = 'MONKE';

  const mintNestData = ethers.utils.hexZeroPad('0xabcd', 8);
  const emptyData = ethers.utils.hexZeroPad('0x', 0);
  const partId = ethers.utils.hexZeroPad('0x0', 8);

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const CHNKY = await ethers.getContractFactory('RMRKNestingMock');
    ownerChunky = await CHNKY.deploy(name, symbol);
    await ownerChunky.deployed();

    const MONKY = await ethers.getContractFactory('RMRKNestingMock');
    petMonkey = await MONKY.deploy(name2, symbol2);
    await petMonkey.deployed();

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
    });
  });

  describe('Minting', async function () {
    it('can mint with no destination', async function () {
      await petMonkey['mint(address,uint256)'](owner.address, 1);
      expect(await petMonkey.ownerOf(1)).to.equal(owner.address);
      expect(await petMonkey.rmrkOwnerOf(1)).to.eql([
        owner.address,
        ethers.BigNumber.from(0),
        false,
      ]);
    });

    it('cannot mint already minted token', async function () {
      await petMonkey['mint(address,uint256)'](owner.address, 1);
      await expect(petMonkey['mint(address,uint256)'](owner.address, 1)).to.be.revertedWith(
        'RMRKCoreTokenAlreadyMinted()',
      );
    });

    it('cannot mint to zero address', async function () {
      await expect(
        petMonkey['mint(address,uint256)']('0x0000000000000000000000000000000000000000', 1),
      ).to.be.revertedWith('RMRKCoreMintToTheZeroAddress()');
    });

    it('cannot nest mint to a non-contract destination', async function () {
      await expect(
        petMonkey['mint(address,uint256,uint256,bytes)'](owner.address, 1, 0, mintNestData),
      ).to.be.revertedWith('RMRKCoreIsNotContract()');
    });

    it.skip('cannot nest mint to non rmrk core implementer', async function () {
      // FIXME: implement
    });

    it('cannot nest mint to a non-existent token', async function () {
      await expect(
        petMonkey['mint(address,uint256,uint256,bytes)'](ownerChunky.address, 1, 0, mintNestData),
      ).to.be.revertedWith('RMRKCoreOwnerQueryForNonexistentToken()');
    });

    it('cannot nest mint already minted token', async function () {
      const childId = 1;
      const parentId = 11; // owner is addrs[1]

      // Mint petMonkey 1 into ownerChunky 11
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](
          ownerChunky.address,
          childId,
          parentId,
          mintNestData,
        );

      await expect(
        petMonkey
          .connect(addrs[0])
          ['mint(address,uint256,uint256,bytes)'](
            ownerChunky.address,
            childId,
            parentId,
            mintNestData,
          ),
      ).to.be.revertedWith('RMRKCoreTokenAlreadyMinted()');
    });

    it('cannot nest mint already minted token to a different parent', async function () {
      // This test may seem dumb, but a bad implementation could open this hole.
      const childId = 1;
      const parentId = 12; // owner is addrs[1]

      // Mint petMonkey 1 into ownerChunky 11
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](
          ownerChunky.address,
          childId,
          parentId,
          mintNestData,
        );

      await expect(
        petMonkey
          .connect(addrs[0])
          ['mint(address,uint256,uint256,bytes)'](
            ownerChunky.address,
            childId,
            parentId,
            mintNestData,
          ),
      ).to.be.revertedWith('RMRKCoreTokenAlreadyMinted()');
    });

    it('cannot nest mint to zero address', async function () {
      await expect(
        petMonkey['mint(address,uint256,uint256,bytes)'](
          '0x0000000000000000000000000000000000000000',
          1,
          10,
          mintNestData,
        ),
      ).to.be.revertedWith('RMRKCoreMintToTheZeroAddress()');
    });

    it('can mint to contract and owners are ok', async function () {
      const childId = 1;
      const parentId = 11; // owner is addrs[1]

      // Mint petMonkey 1 into ownerChunky 11
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](
          ownerChunky.address,
          childId,
          parentId,
          mintNestData,
        );

      // owner is the same adress
      expect(await ownerChunky.ownerOf(parentId)).to.equal(addrs[1].address);
      expect(await petMonkey.ownerOf(childId)).to.equal(addrs[1].address);
    });

    it('can mint to contract and RMRK owners are ok', async function () {
      const childId = 1;
      const parentId = 11;

      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](
          ownerChunky.address,
          childId,
          parentId,
          mintNestData,
        );

      // RMRK owner is an address for the parent
      expect(await ownerChunky.rmrkOwnerOf(parentId)).to.eql([
        addrs[1].address,
        ethers.BigNumber.from(0),
        false,
      ]);
      // RMRK owner is a contract for the child
      expect(await petMonkey.rmrkOwnerOf(childId)).to.eql([
        ownerChunky.address,
        ethers.BigNumber.from(parentId),
        true,
      ]);
    });

    it("can mint to contract and parent's children are ok", async function () {
      const childId = 1;
      const parentId = 11;

      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](
          ownerChunky.address,
          childId,
          parentId,
          mintNestData,
        );

      const children = await ownerChunky.childrenOf(parentId);
      expect(children).to.eql([]);

      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(childId), petMonkey.address, 0, partId],
      ]);
    });

    it('can mint multiple children', async function () {
      const childId1 = 1;
      const childId2 = 2;
      const parentId = 10;

      // Owner address mints a child
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](
          ownerChunky.address,
          childId1,
          parentId,
          mintNestData,
        );
      expect(await petMonkey.ownerOf(childId1)).to.equal(addrs[0].address);

      // Another address mints a second child
      await petMonkey
        .connect(addrs[1])
        ['mint(address,uint256,uint256,bytes)'](
          ownerChunky.address,
          childId2,
          parentId,
          mintNestData,
        );
      expect(await petMonkey.ownerOf(childId2)).to.equal(addrs[0].address);

      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(childId1), petMonkey.address, 0, partId],
        [ethers.BigNumber.from(childId2), petMonkey.address, 0, partId],
      ]);
    });

    it('can mint child into child', async function () {
      const parentId = 10;
      const childId = 1;
      const granchildId = 21;

      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](
          ownerChunky.address,
          childId,
          parentId,
          mintNestData,
        );
      // mint petMonkey token 21 into petMonkey token 1
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](
          petMonkey.address,
          granchildId,
          childId,
          mintNestData,
        );

      const pendingChildrenOfChunky10 = await ownerChunky.pendingChildrenOf(parentId);
      const pendingChildrenOfMonkey1 = await petMonkey.pendingChildrenOf(childId);

      expect(pendingChildrenOfChunky10).to.eql([
        [ethers.BigNumber.from(childId), petMonkey.address, 0, partId],
      ]);
      expect(pendingChildrenOfMonkey1).to.eql([
        [ethers.BigNumber.from(granchildId), petMonkey.address, 0, partId],
      ]);

      // RMRK owner of pet 21 is pet 1
      expect(await petMonkey.rmrkOwnerOf(granchildId)).to.eql([
        petMonkey.address,
        ethers.BigNumber.from(childId),
        true,
      ]);

      // root owner of pet 21 should be owner address of chunky 10
      expect(await petMonkey.ownerOf(granchildId)).to.eql(addrs[0].address);
    });

    it('cannot add too many pending resources', async () => {
      const tokenId = 1;

      // First 127 should be fine.
      for (let i = 1; i <= 128; i++) {
        await petMonkey
          .connect(addrs[0])
          ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, i, tokenId, mintNestData);
      }

      await expect(
        petMonkey
          .connect(addrs[0])
          ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, 129, tokenId, mintNestData),
      ).to.be.revertedWith('RMRKCoreMaxPendingChildrenReached()');
    });
  });

  describe('Accept child', async function () {
    it('can accept child', async function () {
      const childId = 1;
      const parentId = 11;

      // Another address can mint
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](
          ownerChunky.address,
          childId,
          parentId,
          mintNestData,
        );

      // owner accepts the child at index 0 into the child array
      await ownerChunky.connect(addrs[1]).acceptChild(parentId, 0);

      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);

      const children = await ownerChunky.childrenOf(parentId);
      expect(children).to.eql([[ethers.BigNumber.from(childId), petMonkey.address, 0, partId]]);
    });

    it('cannot accept not owned child', async function () {
      const childId = 1;
      const parentId = 11;

      // Another address can mint
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](
          ownerChunky.address,
          childId,
          parentId,
          mintNestData,
        );

      // Another address cannot accept
      await expect(ownerChunky.connect(addrs[0]).acceptChild(parentId, 0)).to.be.revertedWith(
        'RMRKCoreNotApprovedOrOwner()',
      );
    });

    it('can accept child from approved address (not owner)', async function () {
      const childId = 1;
      const parentId = 11;
      const approvedAddress = addrs[2];

      await ownerChunky.connect(addrs[1]).approve(approvedAddress.address, parentId);

      // Another address can mint
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](
          ownerChunky.address,
          childId,
          parentId,
          mintNestData,
        );

      await ownerChunky.connect(approvedAddress).acceptChild(parentId, 0);

      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);

      const children = await ownerChunky.childrenOf(parentId);
      expect(children).to.eql([[ethers.BigNumber.from(childId), petMonkey.address, 0, partId]]);
    });
  });

  describe('Reject child', async function () {
    it('can reject one pending child', async function () {
      const parentId = 11;
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, 1, parentId, mintNestData);

      await ownerChunky.connect(addrs[1]).rejectChild(parentId, 0);
      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);
    });

    it('cannot reject not owned pending child', async function () {
      const parentId = 11;
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, 1, parentId, mintNestData);

      // addrs[1] attempts to reject addrs[0]'s pending children
      await expect(ownerChunky.connect(addrs[0]).rejectChild(parentId, 0)).to.be.revertedWith(
        'RMRKCoreNotApprovedOrOwner()',
      );
    });

    it('can reject child from approved address (not owner)', async function () {
      const parentId = 11;
      const approvedAddress = addrs[2];

      await ownerChunky.connect(addrs[1]).approve(approvedAddress.address, parentId);
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, 1, parentId, mintNestData);

      await ownerChunky.connect(approvedAddress).rejectChild(parentId, 0);
      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);
    });

    it('can reject all pending children', async function () {
      const parentId = 11;
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, 1, parentId, mintNestData);
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, 2, parentId, mintNestData);

      let pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(1), petMonkey.address, 0, partId],
        [ethers.BigNumber.from(2), petMonkey.address, 0, partId],
      ]);

      await ownerChunky.connect(addrs[1]).rejectAllChildren(parentId);
      pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);
    });

    it('cannot reject all pending children for not owned pending child', async function () {
      const parentId = 11;
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, 1, parentId, mintNestData);
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, 2, parentId, mintNestData);

      // addrs[1] attempts to reject addrs[0]'s pending children
      await expect(ownerChunky.connect(addrs[0]).rejectAllChildren(parentId)).to.be.revertedWith(
        'RMRKCoreNotApprovedOrOwner()',
      );
    });

    it('can reject all pending children from approved address (not owner)', async function () {
      const parentId = 11;
      const approvedAddress = addrs[2];

      await ownerChunky.connect(addrs[1]).approve(approvedAddress.address, parentId);
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, 1, parentId, mintNestData);
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, 2, parentId, mintNestData);

      await ownerChunky.connect(approvedAddress).rejectAllChildren(parentId);
      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);
    });

    it('cannot reject children for non existing index', async () => {
      const parentId = 11;
      await expect(ownerChunky.connect(addrs[1]).rejectChild(parentId, 0)).to.be.revertedWith(
        'RMRKCorePendingChildIndexOutOfRange()',
      );
    });
  });

  describe('Remove child', async function () {
    it('can remove one child', async function () {
      const parentId = 11;
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, 1, parentId, mintNestData);
      await ownerChunky.connect(addrs[1]).acceptChild(parentId, 0);

      await ownerChunky.connect(addrs[1]).removeChild(parentId, 0);
      const children = await ownerChunky.childrenOf(parentId);
      expect(children).to.eql([]);
    });

    it('cannot remove not owned child', async function () {
      const parentId = 11;
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, 1, parentId, mintNestData);
      await ownerChunky.connect(addrs[1]).acceptChild(parentId, 0);

      // addrs[1] attempts to remove addrs[0]'s children
      await expect(ownerChunky.connect(addrs[0]).removeChild(parentId, 0)).to.be.revertedWith(
        'RMRKCoreNotApprovedOrOwner()',
      );
    });

    it('can remove child from approved address (not owner)', async function () {
      const parentId = 11;
      const approvedAddress = addrs[2];

      await ownerChunky.connect(addrs[1]).approve(approvedAddress.address, parentId);
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, 1, parentId, mintNestData);
      await ownerChunky.connect(addrs[1]).acceptChild(parentId, 0);

      await ownerChunky.connect(approvedAddress).removeChild(parentId, 0);
      const children = await ownerChunky.childrenOf(parentId);
      expect(children).to.eql([]);
    });

    it('cannot remove children for non existing index', async () => {
      const parentId = 11;
      await expect(ownerChunky.connect(addrs[1]).removeChild(parentId, 0)).to.be.revertedWith(
        'RMRKCoreChildIndexOutOfRange()',
      );
    });
  });

  describe('Burning', async function () {
    it('can burn token', async function () {
      const tokenId = 1;

      await petMonkey.connect(addrs[1])['mint(address,uint256)'](addrs[1].address, tokenId);
      await petMonkey.connect(addrs[1]).burn(tokenId);
      await expect(petMonkey.ownerOf(tokenId)).to.be.revertedWith(
        'RMRKCoreOwnerQueryForNonexistentToken()',
      );
    });

    it('cannot burn not owned token', async function () {
      const tokenId = 1;
      await petMonkey.connect(addrs[1])['mint(address,uint256)'](addrs[1].address, tokenId);
      await expect(petMonkey.connect(addrs[0]).burn(tokenId)).to.be.revertedWith(
        'RMRKCoreTransferCallerNotOwnerOrApproved()',
      );
    });

    it('can burn token from approved address (not owner)', async function () {
      const tokenId = 1;
      const approvedAddress = addrs[2];

      await petMonkey.connect(addrs[1])['mint(address,uint256)'](addrs[1].address, tokenId);
      await petMonkey.connect(addrs[1]).approve(approvedAddress.address, tokenId);

      await petMonkey.connect(approvedAddress).burn(tokenId);
      await expect(petMonkey.ownerOf(tokenId)).to.be.revertedWith(
        'RMRKCoreOwnerQueryForNonexistentToken()',
      );
    });

    it('can burn nested token', async function () {
      const childId = 1;
      const parentId = 10;
      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey
        .connect(addrs[1])
        ['mint(address,uint256,uint256,bytes)'](
          ownerChunky.address,
          childId,
          parentId,
          mintNestData,
        );
      await ownerChunky.connect(addrs[0]).acceptChild(parentId, 0);
      await petMonkey.connect(addrs[0]).burn(childId);

      // no owner for token
      await expect(petMonkey.ownerOf(childId)).to.be.revertedWith(
        'RMRKCoreOwnerQueryForNonexistentToken()',
      );
      await expect(petMonkey.rmrkOwnerOf(childId)).to.be.revertedWith(
        'RMRKCoreOwnerQueryForNonexistentToken()',
      );
    });

    it('cannot burn not owned nested token', async function () {
      const childId = 1;
      const parentId = 10;
      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey
        .connect(addrs[1])
        ['mint(address,uint256,uint256,bytes)'](
          ownerChunky.address,
          childId,
          parentId,
          mintNestData,
        );
      await ownerChunky.connect(addrs[0]).acceptChild(parentId, 0);

      await expect(petMonkey.connect(addrs[1]).burn(childId)).to.be.revertedWith(
        'RMRKCoreTransferCallerNotOwnerOrApproved()',
      );
    });

    it('can recursively burn nested token', async function () {
      const childId = 1;
      const parentId = 10;
      const granchildId = 21;

      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](
          ownerChunky.address,
          childId,
          parentId,
          mintNestData,
        );
      await ownerChunky.connect(addrs[0]).acceptChild(parentId, 0);
      // mint ownerChunky token 21 into petMonkey token 1
      await ownerChunky
        .connect(addrs[0])
        ['mint(address,uint256,uint256,bytes)'](
          petMonkey.address,
          granchildId,
          childId,
          mintNestData,
        );
      await petMonkey.connect(addrs[0]).acceptChild(childId, 0);

      // ownership chain is now addrs[0] > ownerChunky[10] > petMonkey[1] > ownerChunky[21]
      const children1 = await ownerChunky.childrenOf(parentId);
      const children2 = await petMonkey.childrenOf(childId);

      expect(children1).to.eql([[ethers.BigNumber.from(childId), petMonkey.address, 0, partId]]);

      expect(children2).to.eql([
        [ethers.BigNumber.from(granchildId), ownerChunky.address, 0, partId],
      ]);

      expect(await ownerChunky.rmrkOwnerOf(granchildId)).to.eql([
        petMonkey.address,
        ethers.BigNumber.from(childId),
        true,
      ]);

      await petMonkey.connect(addrs[0]).burn(childId);

      await expect(petMonkey.ownerOf(childId)).to.be.revertedWith(
        'RMRKCoreOwnerQueryForNonexistentToken()',
      );
      await expect(petMonkey.rmrkOwnerOf(childId)).to.be.revertedWith(
        'RMRKCoreOwnerQueryForNonexistentToken()',
      );

      await expect(ownerChunky.ownerOf(granchildId)).to.be.revertedWith(
        'RMRKCoreOwnerQueryForNonexistentToken()',
      );
      await expect(ownerChunky.rmrkOwnerOf(granchildId)).to.be.revertedWith(
        'RMRKCoreOwnerQueryForNonexistentToken()',
      );
    });
  });

  describe('Unnesting', async function () {
    it('can unnest child and new owner is root owner', async function () {
      const { childId, parentId, firstOwner } = await mintTofirstOwner(true);
      await expect(ownerChunky.connect(firstOwner).unnestChild(parentId, 0))
        .to.emit(ownerChunky, 'ChildUnnested')
        .withArgs(parentId, childId);

      // New owner of child
      expect(await petMonkey.ownerOf(childId)).to.eql(firstOwner.address);
      expect(await petMonkey.rmrkOwnerOf(childId)).to.eql([
        firstOwner.address,
        ethers.BigNumber.from(0),
        false,
      ]);
    });

    it('can unnest child with grandchild and childen are ok', async function () {
      const parentId = 10;
      const childId = 1;
      const grandchildId = 21;
      const owner = addrs[0];

      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey['mint(address,uint256,uint256,bytes)'](
        ownerChunky.address,
        childId,
        parentId,
        mintNestData,
      );
      await ownerChunky.connect(addrs[0]).acceptChild(parentId, 0);
      // mint petMonkey token 21 into petMonkey token 1
      await petMonkey['mint(address,uint256,uint256,bytes)'](
        petMonkey.address,
        grandchildId,
        childId,
        mintNestData,
      );
      await petMonkey.connect(addrs[0]).acceptChild(childId, 0);

      // Unnest child from parent.
      await ownerChunky.connect(addrs[0]).unnestChild(parentId, 0);

      // New owner of child
      expect(await petMonkey.ownerOf(childId)).to.eql(owner.address);
      expect(await petMonkey.rmrkOwnerOf(childId)).to.eql([
        owner.address,
        ethers.BigNumber.from(0),
        false,
      ]);

      // Grandchild is still owned by petMonkey childId
      expect(await petMonkey.ownerOf(grandchildId)).to.eql(owner.address);
      expect(await petMonkey.rmrkOwnerOf(grandchildId)).to.eql([
        petMonkey.address,
        ethers.BigNumber.from(childId),
        true,
      ]);
    });

    it('cannot unnest from not owned child', async function () {
      const { parentId } = await mintTofirstOwner(true);
      await expect(ownerChunky.connect(addrs[3]).unnestChild(parentId, 0)).to.be.revertedWith(
        'RMRKCoreNotApprovedOrOwner()',
      );
    });

    it('cannot unnest not existing child', async function () {
      const { parentId, firstOwner } = await mintTofirstOwner(true);
      await expect(ownerChunky.connect(firstOwner).unnestChild(parentId, 1)).to.be.revertedWith(
        'RMRKCoreChildIndexOutOfRange()',
      );
    });

    it('cannot unnest token directly even if root owner', async function () {
      const { childId, parentId, firstOwner } = await mintTofirstOwner(true);
      await expect(petMonkey.connect(firstOwner).unnestToken(childId, parentId)).to.be.revertedWith(
        'RMRKCoreUnnestFromWrongOwner()',
      );
    });

    it('cannot unnest token not owned by an NFT', async function () {
      const { parentId, firstOwner } = await mintTofirstOwner(true);
      await expect(ownerChunky.connect(firstOwner).unnestToken(parentId, 0)).to.be.revertedWith(
        'RMRKCoreUnnestForNonNftParent()',
      );
    });
  });

  describe('Transfer', async function () {
    it('can transfer token', async function () {
      const tokenId = 1;
      const newOwner = addrs[2];

      await petMonkey.connect(addrs[1])['mint(address,uint256)'](addrs[1].address, tokenId);
      await petMonkey.connect(addrs[1]).transfer(newOwner.address, tokenId);
      expect(await petMonkey.ownerOf(tokenId)).to.eql(newOwner.address);
    });

    it('cannot transfer not owned token', async function () {
      const tokenId = 1;
      const newOwner = addrs[2];

      await petMonkey.connect(addrs[1])['mint(address,uint256)'](addrs[1].address, tokenId);
      await expect(
        petMonkey.connect(addrs[0]).transfer(newOwner.address, tokenId),
      ).to.be.revertedWith('RMRKCoreNotApprovedOrOwner()');
    });

    it('can transfer token from approved address (not owner)', async function () {
      const tokenId = 1;
      const firstOwner = addrs[1];
      const approved = addrs[2];
      const newOwner = addrs[3];

      await petMonkey.connect(firstOwner)['mint(address,uint256)'](firstOwner.address, tokenId);
      await petMonkey.connect(firstOwner).approve(approved.address, tokenId);

      await petMonkey
        .connect(approved)
        ['transferFrom(address,address,uint256,uint256,bytes)'](
          firstOwner.address,
          newOwner.address,
          tokenId,
          0,
          emptyData,
        );
      expect(await petMonkey.ownerOf(tokenId)).to.eql(newOwner.address);
    });

    it('can transfer not nested token to address and owners are ok', async function () {
      const newOwner = addrs[2];
      const { childId, parentId, firstOwner } = await mintTofirstOwner();
      await ownerChunky
        .connect(firstOwner)
        ['transferFrom(address,address,uint256,uint256,bytes)'](
          firstOwner.address,
          newOwner.address,
          parentId,
          0,
          emptyData,
        );

      // New owner of parent
      expect(await ownerChunky.ownerOf(parentId)).to.eql(newOwner.address);
      expect(await ownerChunky.rmrkOwnerOf(parentId)).to.eql([
        newOwner.address,
        ethers.BigNumber.from(0),
        false,
      ]);

      // New owner of child
      expect(await petMonkey.ownerOf(childId)).to.eql(newOwner.address);
      expect(await petMonkey.rmrkOwnerOf(childId)).to.eql([
        ownerChunky.address,
        ethers.BigNumber.from(parentId),
        true,
      ]);
    });

    it('can transfer not nested token to address and children are ok', async function () {
      const newOwner = addrs[2];
      const { childId, parentId, firstOwner } = await mintTofirstOwner();
      await ownerChunky
        .connect(firstOwner)
        ['transferFrom(address,address,uint256,uint256,bytes)'](
          firstOwner.address,
          newOwner.address,
          parentId,
          0,
          emptyData,
        );

      // Parent still has its children
      const children = await ownerChunky.pendingChildrenOf(parentId);
      expect(children).to.eql([[ethers.BigNumber.from(childId), petMonkey.address, 0, partId]]);
    });

    it('cannot transfer nested child', async function () {
      const newParentId = 12; // owner is firstOwner
      const { childId, firstOwner } = await mintTofirstOwner(true);

      await expect(
        petMonkey
          .connect(firstOwner)
          ['transferFrom(address,address,uint256,uint256,bytes)'](
            firstOwner.address,
            ownerChunky.address,
            childId,
            newParentId,
            emptyData,
          ),
      ).to.be.revertedWith('RMRKCoreMustUnnestFirst()');
    });

    it('can transfer parent token to token with same owner, family tree is ok', async function () {
      const newGrandparentId = 12; // owner is firstOwner

      // Ownership: firstOwner > parent > child
      const { childId, parentId, firstOwner } = await mintTofirstOwner(true);

      await ownerChunky
        .connect(firstOwner)
        ['transferFrom(address,address,uint256,uint256,bytes)'](
          firstOwner.address,
          ownerChunky.address,
          parentId,
          newGrandparentId,
          emptyData,
        );

      // Parent is still owner of child
      let expected = [ethers.BigNumber.from(childId), petMonkey.address, 0, partId];
      checkAcceptedAndPendingChildren(ownerChunky, parentId, [expected], []);
      // Ownership: firstOwner > newGrandparent > parent > child
      expected = [ethers.BigNumber.from(parentId), ownerChunky.address, 0, partId];
      checkAcceptedAndPendingChildren(ownerChunky, newGrandparentId, [], [expected]);
    });
  });

  async function mintTofirstOwner(
    accept = false,
  ): Promise<{ childId: number; parentId: number; firstOwner: any }> {
    const childId = 1;
    const parentId = 11;
    const firstOwner = addrs[1];

    await petMonkey
      .connect(firstOwner)
      ['mint(address,uint256,uint256,bytes)'](ownerChunky.address, childId, parentId, mintNestData);
    if (accept) {
      await ownerChunky.connect(firstOwner).acceptChild(parentId, 0);
    }

    return { childId, parentId, firstOwner };
  }

  async function checkAcceptedAndPendingChildren(
    contract: RMRKNestingMock,
    tokenId: number,
    expectedAccepted: any[],
    expectedPending: any[],
  ) {
    const accepted = await contract.childrenOf(tokenId);
    expect(accepted).to.eql(expectedAccepted);

    const pending = await contract.pendingChildrenOf(tokenId);
    expect(pending).to.eql(expectedPending);
  }
});
