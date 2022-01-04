const { expect } = require("chai");
const { ethers } = require("hardhat");
const { expectRevert } = require('@openzeppelin/test-helpers');

describe("init", async function () {

  let acct0, acct1, acct2, acct3, acct4;
  let sendVal, pending;
  let i, j;
  let bytes8 = 0xaaaaaaaa;

  const name = "RmrkTest";
  const symbol = "RMRKTST";
  const nestFlag = "NEST";

  /*
  Mints 10 NFTs of NFT to to addrs[0] and addrs[1] on init.
  */

  let baseParts = {
    "baseAddress": ethers.utils.hexZeroPad("0x1111", 20),
    "partIds": [
      ethers.utils.hexZeroPad("0x1111", 8),
      ethers.utils.hexZeroPad("0x2222", 8),
      ethers.utils.hexZeroPad("0x3333", 8),
      ethers.utils.hexZeroPad("0x4444", 8),
    ]
  }

  let resArr = [
    {
      tokenId: 1,
      id: ethers.utils.hexZeroPad("0x1", 8),
      slot: 0,
      baseAddress: ethers.utils.hexZeroPad("0x1111", 20),
      basePartIds: [
        ethers.utils.hexZeroPad("0x1111", 8),
        ethers.utils.hexZeroPad("0x2222", 8),
        ethers.utils.hexZeroPad("0x3333", 8),
        ethers.utils.hexZeroPad("0x4444", 8),
      ],
      src: "",
      thumb: 'ipfs://ipfs/QmR3rK1P4n24PPqvfjGYNXWixPJpyBKTV6rYzAS2TYHLpT',
      metadataURI: ""
    },
    {
      tokenId: 1,
      id: ethers.utils.hexZeroPad("0x2", 8),
      slot: 0,
      baseAddress: ethers.utils.hexZeroPad("0x0", 20),
      basePartIds: [],
      src: 'ipfs://ipfs/QmQBhz44R6K6DeKJCCycgAn9RxPo6tn8Tg7vsEX3wewupP/99.png',
      thumb: 'ipfs://ipfs/QmZFWSK9cyfSTgdDVWJucn1eNLtmkBaFEqM8CmfNrhkaZU/99_thumb.png',
      metadataURI: ""
    }
  ]

  beforeEach(async function () {
    [owner, ...addrs] = await ethers.getSigners();

    const RMRK = await ethers.getContractFactory("RMRKResource");
    rmrkNft = await RMRK.deploy(name, symbol);
    await rmrkNft.deployed();

    let i = 1;
    while (i<=10) {
      await rmrkNft.mint(addrs[0].address, i, 0, 0);
      i++;
    }
    i = 11;
    while (i<=20) {
      await rmrkNft.mint(addrs[1].address, i, 0, 0);
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
      expect(await rmrkNft.ownerOf(10)).to.equal(addrs[0].address);
      expect(await rmrkNft.ownerOf(20)).to.equal(addrs[1].address);
    });
  });

  describe("Add resource", async function() {
    it("Adds resource", async function() {

      let targetResultArr =
      [
      true,
      true,
      resArr[0]['slot'],
      resArr[0]['baseAddress'],
      resArr[0]['basePartIds'],
      resArr[0]['src'],
      resArr[0]['thumb'],
      resArr[0]['metadataURI']
      ]

      //add resource
      await rmrkNft.connect(owner).addResource(
        resArr[0]['tokenId'],
        resArr[0]['id'],
        resArr[0]['slot'],
        resArr[0]['baseAddress'],
        resArr[0]['basePartIds'],
        resArr[0]['src'],
        resArr[0]['thumb'],
        resArr[0]['metadataURI'],
      );

      expect(await rmrkNft.getRenderableResource(1)).to.eql(targetResultArr);
      expect(await rmrkNft.getPriorities(1)).to.eql([resArr[0]['id']]);

      await expect(
        rmrkNft.connect(owner).addResource(
          resArr[0]['tokenId'],
          resArr[0]['id'],
          resArr[0]['slot'],
          resArr[0]['baseAddress'],
          resArr[0]['basePartIds'],
          resArr[0]['src'],
          resArr[0]['thumb'],
          resArr[0]['metadataURI'],
        )).to.be.revertedWith(
          "RMRK: resource already exists"
        );

    });

    it("Add multiple resources and reorder priorities", async function() {

      let targetResArrs =
      [
        [
          true,
          true,
          resArr[0]['slot'],
          resArr[0]['baseAddress'],
          resArr[0]['basePartIds'],
          resArr[0]['src'],
          resArr[0]['thumb'],
          resArr[0]['metadataURI']
        ],
        [
          true,
          true,
          resArr[1]['slot'],
          resArr[1]['baseAddress'],
          resArr[1]['basePartIds'],
          resArr[1]['src'],
          resArr[1]['thumb'],
          resArr[1]['metadataURI']
        ],
      ];


      await rmrkNft.connect(owner).addResource(
        resArr[0]['tokenId'],
        resArr[0]['id'],
        resArr[0]['slot'],
        resArr[0]['baseAddress'],
        resArr[0]['basePartIds'],
        resArr[0]['src'],
        resArr[0]['thumb'],
        resArr[0]['metadataURI'],
      );
      await rmrkNft.connect(owner).addResource(
        resArr[1]['tokenId'],
        resArr[1]['id'],
        resArr[1]['slot'],
        resArr[1]['baseAddress'],
        resArr[1]['basePartIds'],
        resArr[1]['src'],
        resArr[1]['thumb'],
        resArr[1]['metadataURI'],
      );

      //Check existing priority order
      expect(await rmrkNft.getPriorities(1)).to.eql([resArr[0]['id'], resArr[1]['id']]);
      expect(await rmrkNft.getRenderableResource(1)).to.eql(targetResArrs[0]);

      //Reorder priorities and return correct renderable resource
      await rmrkNft.connect(addrs[0]).setPriority(1, [resArr[1]['id'], resArr[0]['id']]);
      expect(await rmrkNft.getRenderableResource(1)).to.eql(targetResArrs[1]);

      await expect(
        rmrkNft.connect(addrs[1]).setPriority(1, [resArr[1]['id'], resArr[0]['id']])
      ).to.be.revertedWith(
        "RMRK: Attempting to set priority in non-owned NFT"
      );

      await expect(
        rmrkNft.connect(addrs[0]).setPriority(1, [resArr[1]['id']])
      ).to.be.revertedWith(
        "RMRK: Bad priority list length"
      );

      await expect(
        rmrkNft.connect(addrs[0]).setPriority(1, [ethers.utils.hexZeroPad("0xaaaaa", 8), ethers.utils.hexZeroPad("0xbbbb", 8)])
      ).to.be.revertedWith(
        "RMRK: Trying to reprioritize a non-existant resource"
      );

    });

    it("Accept resource", async function() {

      await rmrkNft.connect(owner).addResource(
        resArr[0]['tokenId'],
        resArr[0]['id'],
        resArr[0]['slot'],
        resArr[0]['baseAddress'],
        resArr[0]['basePartIds'],
        resArr[0]['src'],
        resArr[0]['thumb'],
        resArr[0]['metadataURI'],
      );

      await rmrkNft.connect(addrs[0]).acceptResource(1, resArr[0]['id']);
      let acceptRes = await rmrkNft.getRenderableResource(1);
      expect(acceptRes['pending']).to.equals(false);

      await expect(
        rmrkNft.connect(addrs[1]).acceptResource(1, resArr[0]['id'])
      ).to.be.revertedWith(
        "RMRK: Attempting to accept a resource in non-owned NFT"
      );

      await expect(
        rmrkNft.connect(addrs[0]).acceptResource(10, resArr[0]['id'])
      ).to.be.revertedWith(
        "RMRK: resource does not exist"
      );

      await expect(
        rmrkNft.connect(addrs[0]).acceptResource(1, resArr[1]['id'])
      ).to.be.revertedWith(
        "RMRK: resource does not exist"
      );

      await expect(
        rmrkNft.connect(addrs[0]).acceptResource(1, resArr[0]['id'])
      ).to.be.revertedWith(
        "RMRK: resource is already accepted"
      );

    });
  });


});
