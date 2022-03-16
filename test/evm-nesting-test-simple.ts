import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { RMRKResourceCore } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

//TODO: Transfer - transfer now does double duty as removeChild

describe('init', async () => {
  let resourceStorage: RMRKResourceCore;

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

  const resArr = [
    {
      tokenId: 1,
      id: ethers.utils.hexZeroPad('0x1', 8),
      src: '',
      thumb: 'ipfs://ipfs/QmR3rK1P4n24PPqvfjGYNXWixPJpyBKTV6rYzAS2TYHLpT',
      metadataURI: '',
    },
    {
      tokenId: 1,
      id: ethers.utils.hexZeroPad('0x2', 8),
      src: 'ipfs://ipfs/QmQBhz44R6K6DeKJCCycgAn9RxPo6tn8Tg7vsEX3wewupP/99.png',
      thumb: 'ipfs://ipfs/QmZFWSK9cyfSTgdDVWJucn1eNLtmkBaFEqM8CmfNrhkaZU/99_thumb.png',
      metadataURI: '',
    },
  ];

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

    //Mint 20 ownerChunkys. These tests will simulating minting petMonkeys to ownerChunkys.
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
    it('Non-nest mint', async function () {
      await petMonkey.connect(owner).doMint(owner.address, 1);
      expect(await petMonkey.ownerOf(1)).to.equal(owner.address);
      expect(await petMonkey.rmrkOwnerOf(1)).to.eql([
        owner.address,
        ethers.BigNumber.from(0),
        false,
      ]);
    });

    it('Nest mint non-contract', async function () {
      await expect(
        petMonkey.connect(owner).doMintNest(owner.address, 1, 0, mintNestData),
      ).to.be.revertedWith('Is not contract');
    });

    it('Nest mint contract, non-existent token', async function () {
      await expect(
        petMonkey.connect(owner).doMintNest(ownerChunky.address, 1, 0, mintNestData),
      ).to.be.revertedWith('RMRKCore: owner query for nonexistent token');
    });

    it('Nest mint contract, owner and not owner check pending', async function () {
      let destId, children, pendingChildren;
      //owner of 11 is addrs[1]
      destId = 11;
      //Mint petMonkey token 1 into ownerChunky token 11
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, destId, mintNestData);
      expect(await ownerChunky.ownerOf(11)).to.equal(addrs[1].address);
      expect(await petMonkey.ownerOf(1)).to.equal(addrs[1].address);
      //check rmrkOwnerOf entries
      expect(await ownerChunky.rmrkOwnerOf(11)).to.eql([
        addrs[1].address,
        ethers.BigNumber.from(0),
        false,
      ]);
      expect(await petMonkey.rmrkOwnerOf(1)).to.eql([
        ownerChunky.address,
        ethers.BigNumber.from(destId),
        true,
      ]);

      children = await ownerChunky.childrenOf(destId);
      expect(children).to.eql([]);
      pendingChildren = await ownerChunky.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(1), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);

      destId = 10;
      //Mint petMonkey token 2 into ownerChunky token 1
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 2, destId, mintNestData);
      //Owner of the new petMoney will resolve to the owner of the assigned ownerChunky, even though the petMonkey is not an active child
      expect(await petMonkey.ownerOf(2)).to.equal(addrs[0].address);
      pendingChildren = await ownerChunky.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(2), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);
      children = await ownerChunky.childrenOf(destId);
      expect(children).to.eql([]);
    });

    it('Nest mint contract, child management', async function () {
      let destId, children, pendingChildren;

      destId = 10;
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, destId, mintNestData);
      expect(await petMonkey.ownerOf(1)).to.equal(addrs[0].address);

      pendingChildren = await ownerChunky.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(1), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);

      children = await ownerChunky.childrenOf(destId);
      expect(children).to.eql([]);

      destId = 10;
      //A different user mints token 2 into addrs[0]'s token 10
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 2, destId, mintNestData);
      expect(await petMonkey.ownerOf(2)).to.equal(addrs[0].address);

      pendingChildren = await ownerChunky.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(1), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
        [ethers.BigNumber.from(2), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);

      // addrs[1] attempts to force addrs[0] to accept the child
      await expect(ownerChunky.connect(addrs[1]).acceptChildFromPending(0, 10)).to.be.revertedWith(
        'RMRKCore: Bad owner',
      );
      // addrs[0] accepts the child at index 0 into the child array
      await ownerChunky.connect(addrs[0]).acceptChildFromPending(0, 10);

      pendingChildren = await ownerChunky.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(2), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);
      //
      children = await ownerChunky.childrenOf(destId);
      expect(children).to.eql([
        [ethers.BigNumber.from(1), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);
    });

    it('Delete one pending child', async function () {
      let destId, children, pendingChildren;

      destId = 11;
      //Mint token 1 into tokenId 11 @ ownerChunky
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, destId, mintNestData);

      pendingChildren = await ownerChunky.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(1), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);

      //user addrs[1] attempts to delete addrs[0]'s pending children
      await expect(ownerChunky.connect(addrs[0]).deleteChildFromPending(0, 11)).to.be.revertedWith(
        'RMRKCore: Bad owner',
      );
      await ownerChunky.connect(addrs[1]).deleteChildFromPending(0, 11);
      pendingChildren = await ownerChunky.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql([]);
    });

    it('Delete all pending children', async function () {
      let destId, children, pendingChildren;

      destId = 11;
      //Mint token 1 into tokenId 11 @ ownerChunky
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, destId, mintNestData);

      pendingChildren = await ownerChunky.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(1), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);

      //user addrs[1] attempts to delete addrs[0]'s pending children
      await expect(ownerChunky.connect(addrs[0]).deleteAllPending(11)).to.be.revertedWith(
        'RMRKCore: Bad owner',
      );
      await ownerChunky.connect(addrs[1]).deleteAllPending(11);
      pendingChildren = await ownerChunky.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql([]);
    });

    it('Mint child into child', async function () {
      let destId, children1, children2;

      destId = 10;
      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, destId, mintNestData);
      // confirm petMonkey
      await ownerChunky.connect(addrs[0]).acceptChildFromPending(0, 10);
      // mint petMonkey token 21 into petMonkey token 1 - yo dawg, etc
      await ownerChunky.connect(addrs[0]).doMintNest(petMonkey.address, 21, 1, mintNestData);

      const childrenOfChunky10 = await ownerChunky.childrenOf(10);
      const pendingChildrenOfMonkey1 = await petMonkey.pendingChildrenOf(1);

      expect(childrenOfChunky10).to.eql([
        [ethers.BigNumber.from(1), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);
      expect(pendingChildrenOfMonkey1).to.eql([
        [ethers.BigNumber.from(21), ownerChunky.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);
    });
  });
  describe('Burning', async function () {
    it('Burn NFT', async function () {
      let children1, children2;

      await petMonkey.connect(addrs[1]).doMint(addrs[1].address, 1);
      await expect(petMonkey.connect(addrs[0]).burn(1)).to.be.revertedWith(
        'RMRKCore: transfer caller is not owner nor approved',
      );
      await petMonkey.connect(addrs[1]).burn(1);
      await expect(petMonkey.ownerOf(1)).to.be.revertedWith(
        'RMRKCore: owner query for nonexistent token',
      );
    });

    it('Burn nested NFT', async function () {
      let destId, children1, children2;

      destId = 10;
      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey.connect(addrs[1]).doMintNest(ownerChunky.address, 1, destId, mintNestData);
      await ownerChunky.connect(addrs[0]).acceptChildFromPending(0, destId);
      await expect(petMonkey.connect(addrs[1]).burn(1)).to.be.revertedWith(
        'RMRKCore: transfer caller is not owner nor approved',
      );
      await petMonkey.connect(addrs[0]).burn(1);

      await expect(petMonkey.ownerOf(1)).to.be.revertedWith(
        'RMRKCore: owner query for nonexistent token',
      );
      expect(await petMonkey.rmrkOwnerOf(1)).to.eql([
        ethers.utils.hexZeroPad('0x0', 20),
        ethers.BigNumber.from(0),
        false,
      ]);
    });

    it('Recursively burn nested NFT', async function () {
      let destId, children1, children2;

      destId = 10;
      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, destId, mintNestData);
      await ownerChunky.connect(addrs[0]).acceptChildFromPending(0, destId);
      // mint ownerChunky token 21 into petMonkey token 1
      // ownership chain is now addrs[0] > ownerChunky[1] > petMonkey[1] > ownerChunky[21]
      await ownerChunky.connect(addrs[0]).doMintNest(petMonkey.address, 21, 1, mintNestData);
      await petMonkey.connect(addrs[0]).acceptChildFromPending(0, 1);

      children1 = await ownerChunky.childrenOf(10);
      children2 = await petMonkey.childrenOf(1);

      expect(children1).to.eql([
        [ethers.BigNumber.from(1), petMonkey.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);

      expect(children2).to.eql([
        [ethers.BigNumber.from(21), ownerChunky.address, 0, ethers.utils.hexZeroPad('0x0', 8)],
      ]);

      expect(await ownerChunky.rmrkOwnerOf(21)).to.eql([
        petMonkey.address,
        ethers.BigNumber.from(1),
        true,
      ]);

      await petMonkey.connect(addrs[0]).burn(1);
      await expect(petMonkey.ownerOf(1)).to.be.revertedWith(
        'RMRKCore: owner query for nonexistent token',
      );
      await expect(petMonkey.rmrkOwnerOf(1)).to.be.empty;
      await expect(ownerChunky.ownerOf(21)).to.be.revertedWith(
        'RMRKCore: owner query for nonexistent token',
      );
      await expect(ownerChunky.rmrkOwnerOf(21)).to.be.empty;
    });
  });
});
