import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { RMRKResourceCore } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

//TODO: Transfer - transfer now does double duty as removeChild

describe('Nesting', async () => {
  let owner: SignerWithAddress;
  let addrs: any[];
  let ownerChunky: Contract;
  let petMonkey: Contract;

  const name = 'ownerChunky';
  const symbol = 'CHNKY';
  const resourceName = 'ChunkyResource';

  const name2 = 'petMonkey';
  const symbol2 = 'MONKE';
  const resourceName2 = 'MonkeyResource';

  const mintNestData = ethers.utils.hexZeroPad('0xabcd', 8);

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const CHNKY = await ethers.getContractFactory('RMRKCoreMock');
    ownerChunky = await CHNKY.deploy(name, symbol, resourceName);
    await ownerChunky.deployed();

    const MONKY = await ethers.getContractFactory('RMRKCoreMock');
    petMonkey = await MONKY.deploy(name2, symbol2, resourceName2);
    await petMonkey.deployed();

    //Mint 20 ownerChunkys. These tests will simulate minting of petMonkeys to ownerChunkys.
    let i = 1;
    while (i <= 10) {
      await ownerChunky.doMint(addrs[0].address, i);
      i++;
    }
    i = 11;
    while (i <= 20) {
      await ownerChunky.doMint(addrs[1].address, i);
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
      await petMonkey.connect(owner).doMint(owner.address, 1);
      expect(await petMonkey.ownerOf(1)).to.equal(owner.address);
      expect(await petMonkey.rmrkOwnerOf(1)).to.eql([
        owner.address,
        ethers.BigNumber.from(0),
        false,
      ]);
    });

    it('cannot mint already minted token', async function () {
      await petMonkey.connect(owner).doMint(owner.address, 1);
      await expect(
        petMonkey.connect(owner).doMint(owner.address, 1)
      ).to.be.revertedWith('RMRKCore: token already minted');
    });

    it('cannot mint to zero address', async function () {
      await expect(
        petMonkey.connect(owner).doMint('0x0000000000000000000000000000000000000000', 1)
      ).to.be.revertedWith('RMRKCore: mint to the zero address');
    });

    it('cannot nest mint to a non-contract destination', async function () {
      await expect(
        petMonkey.connect(owner).doMintNest(owner.address, 1, 0, mintNestData),
      ).to.be.revertedWith('Is not contract');
    });

    it.skip('cannot nest mint to non rmrk core implementer', async function () {
      // FIXME: implement
    });

    it('cannot nest mint to a non-existent token', async function () {
      await expect(
        petMonkey.connect(owner).doMintNest(ownerChunky.address, 1, 0, mintNestData),
      ).to.be.revertedWith('RMRKCore: owner query for nonexistent token');
    });

    it('cannot nest mint already minted token', async function () {
      const childId = 1;
      const parentId = 11; // owner is addrs[1]

      //Mint petMonkey 1 into ownerChunky 11
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      await expect(
        petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData)
      ).to.be.revertedWith('RMRKCore: token already minted');
    });

    it('cannot nest mint already minted token to a different parent', async function () {
      // This test may seem dumb, but a bad implementation could open this hole.
      const childId = 1;
      const parentId = 12; // owner is addrs[1]

      //Mint petMonkey 1 into ownerChunky 11
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      await expect(
        petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData)
      ).to.be.revertedWith('RMRKCore: token already minted');
    });

    it('cannot nest mint to zero address', async function () {
      await expect(
        petMonkey.connect(owner).doMintNest('0x0000000000000000000000000000000000000000', 1, 10, mintNestData)
      ).to.be.revertedWith('RMRKCore: mint to the zero address');
    });

    it('can mint to contract and owners are ok', async function () {
      const childId = 1;
      const parentId = 11; // owner is addrs[1]

      //Mint petMonkey 1 into ownerChunky 11
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      // owner is the same adress
      expect(await ownerChunky.ownerOf(parentId)).to.equal(addrs[1].address);
      expect(await petMonkey.ownerOf(childId)).to.equal(addrs[1].address);
    });

    it('can mint to contract and RMRK owners are ok', async function () {      
      const childId = 1;
      const parentId = 11;

      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

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

      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      const children = await ownerChunky.childrenOf(parentId);
      expect(children).to.eql([]);

      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(childId), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);

    });

    it('can mint multiple children', async function () {
      const childId_1 = 1;
      const childId_2 = 2;
      const parentId = 10;

      // Owner address mints a child
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId_1, parentId, mintNestData);
      expect(await petMonkey.ownerOf(childId_1)).to.equal(addrs[0].address);

      // Another address mints a second child
      await petMonkey.connect(addrs[1]).doMintNest(ownerChunky.address, childId_2, parentId, mintNestData);
      expect(await petMonkey.ownerOf(childId_2)).to.equal(addrs[0].address);

      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(childId_1), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
        [ethers.BigNumber.from(childId_2), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);
    });

    it('can mint child into child', async function () {
      const parentId = 10;
      const childId = 1;
      const granchildId = 21;

      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);
      // mint petMonkey token 21 into petMonkey token 1
      await petMonkey.connect(addrs[0]).doMintNest(petMonkey.address, granchildId, childId, mintNestData);

      const pendingChildrenOfChunky10 = await ownerChunky.pendingChildrenOf(parentId);
      const pendingChildrenOfMonkey1 = await petMonkey.pendingChildrenOf(childId);

      expect(pendingChildrenOfChunky10).to.eql([
        [ethers.BigNumber.from(childId), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);
      expect(pendingChildrenOfMonkey1).to.eql([
        [ethers.BigNumber.from(granchildId), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
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
        await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, i, tokenId, mintNestData);
      }

      await expect(
        petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 129, tokenId, mintNestData)
        ).to.be.revertedWith('RMRKCore: Max pending children reached');
    });

  });

  describe('Accept child', async function () {

    it('can accept child', async function () {
      const childId = 1;
      const parentId = 11;

      // Another address can mint
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      // owner accepts the child at index 0 into the child array
      await ownerChunky.connect(addrs[1]).acceptChildFromPending(0, parentId);

      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);

      const children = await ownerChunky.childrenOf(parentId);
      expect(children).to.eql([
        [ethers.BigNumber.from(childId), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);
    });

    it('cannot accept not owned child', async function () {
      const childId = 1;
      const parentId = 11;

      // Another address can mint
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      // Another address cannot accept
      await expect(
        ownerChunky
        .connect(addrs[0])
        .acceptChildFromPending(0, parentId)
      ).to.be.revertedWith('RMRKCore: Not approved or owner');
    });

    it('can accept child from approved address (not owner)', async function () {
      const childId = 1;
      const parentId = 11;
      const approvedAddress = addrs[2];

      await ownerChunky.connect(addrs[1]).approve(approvedAddress.address, parentId);

      // Another address can mint
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      await ownerChunky.connect(approvedAddress).acceptChildFromPending(0, parentId);

      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);

      const children = await ownerChunky.childrenOf(parentId);
      expect(children).to.eql([
        [ethers.BigNumber.from(childId), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);
    });

  });

  describe('Reject child', async function () {
    it('can reject one pending child', async function () {
      const parentId = 11;
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);

      await ownerChunky.connect(addrs[1]).rejectChild(0, parentId);
      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);
    });

    it('cannot reject not owned pending child', async function () {
      const parentId = 11;
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);

      // addrs[1] attempts to reject addrs[0]'s pending children
      await expect(
        ownerChunky.connect(addrs[0]).rejectChild(0, parentId)
      ).to.be.revertedWith('RMRKCore: Not approved or owner');
    });

    it('can reject child from approved address (not owner)', async function () {
      const parentId = 11;
      const approvedAddress = addrs[2];

      await ownerChunky.connect(addrs[1]).approve(approvedAddress.address, parentId);
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);

      await ownerChunky.connect(approvedAddress).rejectChild(0, parentId);
      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);
    });

    it('can reject all pending children', async function () {
      const parentId = 11;
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 2, parentId, mintNestData);

      let pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(1), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
        [ethers.BigNumber.from(2), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);

      await ownerChunky.connect(addrs[1]).rejectAllChildren(parentId);
      pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);
    });

    it('cannot reject all pending children for not owned pending child', async function () {
      const parentId = 11;
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 2, parentId, mintNestData);

      // addrs[1] attempts to reject addrs[0]'s pending children
      await expect(ownerChunky.connect(addrs[0]).rejectAllChildren(parentId)).to.be.revertedWith(
        'RMRKCore: Not approved or owner',
      );
    });

    it('can reject all pending children from approved address (not owner)', async function () {
      const parentId = 11;
      const approvedAddress = addrs[2];

      await ownerChunky.connect(addrs[1]).approve(approvedAddress.address, parentId);
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 2, parentId, mintNestData);

      await ownerChunky.connect(approvedAddress).rejectAllChildren(parentId);
      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);
    });

    it('cannot reject children for non existing index', async () => {
      const parentId = 11;
      await expect(
        ownerChunky.connect(addrs[1]).rejectChild(0, parentId),
      ).to.be.revertedWith('RMRKcore: Pending child index out of range');
    });
  });

  describe('Burning', async function () {
    it('can burn token', async function () {
      const tokenId = 1;

      await petMonkey.connect(addrs[1]).doMint(addrs[1].address, tokenId);
      await petMonkey.connect(addrs[1]).burn(tokenId);
      await expect(petMonkey.ownerOf(tokenId)).to.be.revertedWith(
        'RMRKCore: owner query for nonexistent token',
      );
    });

    it('cannot burn not owned token', async function () {
      const tokenId = 1;
      await petMonkey.connect(addrs[1]).doMint(addrs[1].address, tokenId);
      await expect(petMonkey.connect(addrs[0]).burn(tokenId)).to.be.revertedWith(
        'RMRKCore: transfer caller is not owner nor approved',
      );
    });

    it('can burn token from approved address (not owner)', async function () {
      const tokenId = 1;
      const approvedAddress = addrs[2];

      await petMonkey.connect(addrs[1]).doMint(addrs[1].address, tokenId);
      await petMonkey.connect(addrs[1]).approve(approvedAddress.address, tokenId);

      await petMonkey.connect(approvedAddress).burn(tokenId);
      await expect(petMonkey.ownerOf(tokenId)).to.be.revertedWith(
        'RMRKCore: owner query for nonexistent token',
      );
    });

    it('can burn nested token', async function () {
      const childId = 1;
      const parentId = 10;
      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey.connect(addrs[1]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);
      await ownerChunky.connect(addrs[0]).acceptChildFromPending(0, parentId);
      await petMonkey.connect(addrs[0]).burn(childId);

      // no owner for token
      await expect(petMonkey.ownerOf(childId)).to.be.revertedWith(
        'RMRKCore: owner query for nonexistent token',
      );
      await expect(petMonkey.rmrkOwnerOf(childId)).to.be.revertedWith(
        'RMRKCore: owner query for nonexistent token',
      );
    });

    it('cannot burn not owned nested token', async function () {
      const childId = 1;
      const parentId = 10;
      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey.connect(addrs[1]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);
      await ownerChunky.connect(addrs[0]).acceptChildFromPending(0, parentId);

      await expect(petMonkey.connect(addrs[1]).burn(childId)).to.be.revertedWith(
        'RMRKCore: transfer caller is not owner nor approved',
      );
    });

    it('can recursively burn nested token', async function () {
      const childId = 1;
      const parentId = 10;
      const granchildId = 21;

      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);
      await ownerChunky.connect(addrs[0]).acceptChildFromPending(0, parentId);
      // mint ownerChunky token 21 into petMonkey token 1
      await ownerChunky.connect(addrs[0]).doMintNest(petMonkey.address, granchildId, childId, mintNestData);
      await petMonkey.connect(addrs[0]).acceptChildFromPending(0, childId);

      // ownership chain is now addrs[0] > ownerChunky[10] > petMonkey[1] > ownerChunky[21]
      const children1 = await ownerChunky.childrenOf(parentId);
      const children2 = await petMonkey.childrenOf(childId);

      expect(children1).to.eql([
        [ethers.BigNumber.from(childId), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);

      expect(children2).to.eql([
        [ethers.BigNumber.from(granchildId), ownerChunky.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);

      expect(await ownerChunky.rmrkOwnerOf(granchildId)).to.eql([
        petMonkey.address,
        ethers.BigNumber.from(childId),
        true,
      ]);

      await petMonkey.connect(addrs[0]).burn(childId);

      await expect(petMonkey.ownerOf(childId)).
        to.be.revertedWith('RMRKCore: owner query for nonexistent token');
      await expect(petMonkey.rmrkOwnerOf(childId)).
        to.be.revertedWith('RMRKCore: owner query for nonexistent token');

      await expect(ownerChunky.ownerOf(granchildId))
        .to.be.revertedWith('RMRKCore: owner query for nonexistent token');
      await expect(ownerChunky.rmrkOwnerOf(granchildId))
        .to.be.revertedWith('RMRKCore: owner query for nonexistent token');
    });
  });
});
