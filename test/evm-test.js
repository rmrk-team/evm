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

  beforeEach(async function () {
    [owner, ...addrs] = await ethers.getSigners();

    const RMRK = await ethers.getContractFactory("RMRKCore");
    rmrkNft = await RMRK.deploy(name, symbol);
    await rmrkNft.deployed();

    const RMRK2 = await ethers.getContractFactory("RMRKCore");
    rmrkNft2 = await RMRK2.deploy(name, symbol);
    await rmrkNft2.deployed();

    let i = 1;
    while (i<=10) {
      await rmrkNft2.mint(addrs[0].address, i, 0, 0);
      i++;
    }
    i = 11;
    while (i<=20) {
      await rmrkNft2.mint(addrs[1].address, i, 0, 0);
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
      await rmrkNft.connect(owner).mint(owner.address, 1, 0, 0);
      expect(await rmrkNft.ownerOf(1)).to.equal(owner.address);
    });

    it("Nest mint non-contract", async function() {
      await expect(rmrkNft.connect(owner).mint(owner.address, 1, 0, nestFlag)).to.be.revertedWith("Is not contract");
    });

    it("Nest mint contract, non-existent token", async function() {
      await expect(rmrkNft.connect(owner).mint(rmrkNft2.address, 1, 0, nestFlag)).to.be.revertedWith("ERC721: owner query for nonexistent token");
    });

    it("Nest mint contract, owner and not owner check pending", async function() {
      let destId, children;
      destId = 11;
      await rmrkNft.connect(addrs[0]).mint(rmrkNft2.address, 1, destId, nestFlag);
      //expect(await rmrkNft.ownerOf(1)).to.equal(addrs[0].address);
      children = await rmrkNft2.childrenOf(destId);
      expect(children[0]['pending']).to.equal(true);

      destId = 10;
      await rmrkNft.connect(addrs[0]).mint(rmrkNft2.address, 2, destId, nestFlag);
      //expect(await rmrkNft.ownerOf(1)).to.equal(addrs[0].address);
      children = await rmrkNft2.childrenOf(destId);
      expect(children[0]['pending']).to.equal(false);

      destId = 11;
      await rmrkNft.connect(addrs[1]).mint(rmrkNft2.address, 3, destId, nestFlag);
      //expect(await rmrkNft.ownerOf(1)).to.equal(addrs[0].address);
      children = await rmrkNft2.childrenOf(destId);
      expect(children[1]['pending']).to.equal(false);

    });

  });
});
