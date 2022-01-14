const { expect } = require("chai");
const { ethers } = require("hardhat");
const { expectRevert } = require('@openzeppelin/test-helpers');

describe("init", async function () {

  let acct0, acct1, acct2, acct3, acct4;
  let sendVal, pending;
  let i, j;

  const name = "RmrkTest";
  const symbol = "RMRKTST";
  const nestFlag = "NEST";
  const resourceName = "TestResource";

  beforeEach(async function () {
    [owner, ...addrs] = await ethers.getSigners();

    const RMRK = await ethers.getContractFactory("RMRKCoreMock");
    rmrkNft = await RMRK.deploy(name, symbol, resourceName);
    await rmrkNft.deployed();

    const RMRK2 = await ethers.getContractFactory("RMRKCoreMock");
    rmrkNft2 = await RMRK2.deploy(name, symbol, resourceName);
    await rmrkNft2.deployed();

    let i = 1;
    while (i<=10) {
      await rmrkNft2.doMint(addrs[0].address, i);
      i++;
    }
    i = 11;
    while (i<=20) {
      await rmrkNft2.doMint(addrs[1].address, i);
      i++;
    }

  });

  describe("Init", async function() {

    it("Name", async function() {
      expect(await rmrkNft.name()).to.equal(name);
    });

    it("Symbol", async function() {
      expect(await rmrkNft.symbol()).to.equal(symbol);
    });

    it("Contract2 Owner Test", async function() {
      expect(await rmrkNft2.ownerOf(10)).to.equal(addrs[0].address);
      expect(await rmrkNft2.ownerOf(20)).to.equal(addrs[1].address);
    });


  });

  describe("Minting", async function() {

    it("Non-nest mint", async function() {
      await rmrkNft.connect(owner).doMint(owner.address, 1);
      expect(await rmrkNft.ownerOf(1)).to.equal(owner.address);
    });

    it("Nest mint non-contract", async function() {
      await expect(rmrkNft.connect(owner).doMintNest(owner.address, 1, 0, nestFlag)).to.be.revertedWith("Is not contract");
    });

    it("Nest mint contract, non-existent token", async function() {
      await expect(rmrkNft.connect(owner).doMintNest(rmrkNft2.address, 1, 0, nestFlag)).to.be.revertedWith("RMRKCore: owner query for nonexistent token");
    });

    it("Nest mint contract, owner and not owner check pending", async function() {
      let destId, children, pendingChildren;

      destId = 11;
      //Mint token 1 into tokenId 11 @ rmrkNft2
      await rmrkNft.connect(addrs[0]).doMintNest(rmrkNft2.address, 1, destId, nestFlag);

      //Because of owner / parent mismatch, ensure that this is added to pending and not main.
      expect(await rmrkNft.ownerOf(1)).to.equal(addrs[1].address);
      children = await rmrkNft2.childrenOf(destId);
      expect(children).to.eql([]);
      pendingChildren = await rmrkNft2.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql(
        [
          [
              ethers.BigNumber.from(1),
              rmrkNft.address,
              0,
              ethers.utils.hexZeroPad("0x0", 8),
          ]
        ]
      );

      destId = 10;
      //Mint token 2 into tokenId 1 @ rmrkNft2
      await rmrkNft.connect(addrs[0]).doMintNest(rmrkNft2.address, 2, destId, nestFlag);
      //Because of owner parent match, ensure that this is added to main and not pending.
      expect(await rmrkNft.ownerOf(2)).to.equal(addrs[0].address);
      children = await rmrkNft2.childrenOf(destId);
      expect(children).to.eql(
        [
          [
            ethers.BigNumber.from(2),
            rmrkNft.address,
            0,
            ethers.utils.hexZeroPad("0x0", 8),
          ]
        ]
      );
      pendingChildren = await rmrkNft2.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql([]);
    });

    it("Nest mint contract, child management", async function() {
      let destId, children, pendingChildren;

      destId = 10;
      await rmrkNft.connect(addrs[0]).doMintNest(rmrkNft2.address, 1, destId, nestFlag);
      expect(await rmrkNft.ownerOf(1)).to.equal(addrs[0].address);

      children = await rmrkNft2.childrenOf(destId);
      expect(children).to.eql(
        [
          [
              ethers.BigNumber.from(1),
              rmrkNft.address,
              0,
              ethers.utils.hexZeroPad("0x0", 8),
          ]
        ]
      );

      pendingChildren = await rmrkNft2.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql([]);

      //add second child to child array of tokenId10 on rmrkNft2

      destId = 10;
      await rmrkNft.connect(addrs[0]).doMintNest(rmrkNft2.address, 2, destId, nestFlag);
      expect(await rmrkNft.ownerOf(2)).to.equal(addrs[0].address);

      children = await rmrkNft2.childrenOf(destId);
      expect(children).to.eql(
        [
          [
              ethers.BigNumber.from(1),
              rmrkNft.address,
              0,
              ethers.utils.hexZeroPad("0x0", 8),
          ],
          [
              ethers.BigNumber.from(2),
              rmrkNft.address,
              0,
              ethers.utils.hexZeroPad("0x0", 8),
          ]
        ]
      );

      pendingChildren = await rmrkNft2.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql([]);

      destId = 10;
      //A different user mints token 3 into addrs[0]'s token 10
      await rmrkNft.connect(addrs[1]).doMintNest(rmrkNft2.address, 3, destId, nestFlag);
      //Because of owner parent match, ensure that this is added to main and not pending.
      expect(await rmrkNft.ownerOf(3)).to.equal(addrs[0].address);

      children = await rmrkNft2.childrenOf(destId);
      expect(children).to.eql(
        [
          [
              ethers.BigNumber.from(1),
              rmrkNft.address,
              0,
              ethers.utils.hexZeroPad("0x0", 8),
          ],
          [
              ethers.BigNumber.from(2),
              rmrkNft.address,
              0,
              ethers.utils.hexZeroPad("0x0", 8),
          ]
        ]
      );

      pendingChildren = await rmrkNft2.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql(
        [
          [
              ethers.BigNumber.from(3),
              rmrkNft.address,
              0,
              ethers.utils.hexZeroPad("0x0", 8),
          ]
        ]
      );
      // addrs[1] attempts to force addrs[0] to accept the child
      await expect(rmrkNft2.connect(addrs[1]).acceptChildFromPending(0, 10)).to.be.revertedWith(
        "RMRKcore: Bad owner"
      );
      // addrs[0] accepts the child
      await rmrkNft2.connect(addrs[0]).acceptChildFromPending(0, 10);

      children = await rmrkNft2.childrenOf(destId);
      expect(children).to.eql(
        [
          [
              ethers.BigNumber.from(1),
              rmrkNft.address,
              0,
              ethers.utils.hexZeroPad("0x0", 8),
          ],
          [
              ethers.BigNumber.from(2),
              rmrkNft.address,
              0,
              ethers.utils.hexZeroPad("0x0", 8),
          ],
          [
              ethers.BigNumber.from(3),
              rmrkNft.address,
              0,
              ethers.utils.hexZeroPad("0x0", 8),
          ]
        ]
      );

      pendingChildren = await rmrkNft2.pendingChildrenOf(destId);
      //pendingChildren will retain the initialized entry in the array, but will contain an empty.
      expect(pendingChildren).to.eql(
        [
          [
              ethers.BigNumber.from(0),
              ethers.utils.hexZeroPad("0x0", 20),
              0,
              ethers.utils.hexZeroPad("0x0", 8),
          ]
        ]
      );

    });

    it("Delete pending children", async function() {
      let destId, children, pendingChildren;

      destId = 11;
      //Mint token 1 into tokenId 11 @ rmrkNft2
      await rmrkNft.connect(addrs[0]).doMintNest(rmrkNft2.address, 1, destId, nestFlag);

      pendingChildren = await rmrkNft2.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql(
        [
          [
              ethers.BigNumber.from(1),
              rmrkNft.address,
              0,
              ethers.utils.hexZeroPad("0x0", 8),
          ]
        ]
      );

      //user addrs[1] attempts to delete addrs[0]'s pending children
      await expect(rmrkNft2.connect(addrs[0]).deletePending(11)).to.be.revertedWith(
        "RMRKCore: Bad owner"
      );
      await rmrkNft2.connect(addrs[1]).deletePending(11);
      pendingChildren = await rmrkNft2.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql([]);

    });

    it("Unparent child", async function() {
      let destId, children, pendingChildren;

      destId = 10;
      await rmrkNft.connect(addrs[0]).doMintNest(rmrkNft2.address, 1, destId, nestFlag);
      await rmrkNft.connect(addrs[0]).doMintNest(rmrkNft2.address, 2, destId, nestFlag);

      pendingChildren = await rmrkNft2.pendingChildrenOf(destId);
      expect(pendingChildren).to.eql([]);

      children = await rmrkNft2.childrenOf(destId);
      expect(children).to.eql(
        [
          [
              ethers.BigNumber.from(1),
              rmrkNft.address,
              0,
              ethers.utils.hexZeroPad("0x0", 8),
          ],
          [
              ethers.BigNumber.from(2),
              rmrkNft.address,
              0,
              ethers.utils.hexZeroPad("0x0", 8),
          ]
        ]
      );


    });
  });
});
