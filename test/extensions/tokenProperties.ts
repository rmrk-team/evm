import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  IERC165, IRMRKTokenProperties
} from "../interfaces";
import { RMRKTokenProperties } from "../../typechain-types";
import { bn } from "../utils";

// --------------- FIXTURES -----------------------

async function tokenPropertiesFixture() {
  const factory = await ethers.getContractFactory("RMRKTokenProperties");
  const tokenProperties = await factory.deploy();
  await tokenProperties.deployed();

  return { tokenProperties };
}

// --------------- TESTS -----------------------

describe.only("RMRKTokenProperties", async function() {
  let tokenProperties: RMRKTokenProperties;

  beforeEach(async function() {
    ({ tokenProperties } = await loadFixture(tokenPropertiesFixture));

    this.tokenProperties = tokenProperties;
  });

  shouldBehaveLikeTokenPropertiesInterface();
  shouldBehaveLikeTokenProperties();

  describe("RMRKTokenProperties", async function() {
    let owner: SignerWithAddress;
    const tokenId = 1;

    beforeEach(async function() {
      ({ tokenProperties } = await loadFixture(tokenPropertiesFixture));

      const signers = await ethers.getSigners();
      owner = signers[1];
    });

    it("can add and return token properties", async function() {
      await tokenProperties.setStringProperty(tokenId, "description", "test description");
      await tokenProperties.setBoolProperty(tokenId, "rare", true);
      await tokenProperties.setAddressProperty(tokenId, "owner", owner.address);
      await tokenProperties.setUintProperty(tokenId, "health", bn(100));
      await tokenProperties.setBytesProperty(tokenId, "data", "0x1234");

      expect(await tokenProperties.getStringTokenProperty(tokenId, "description")).to.eql("test description");
      expect(await tokenProperties.getBoolTokenProperty(tokenId, "rare")).to.eql(true);
      expect(await tokenProperties.getAddressTokenProperty(tokenId, "owner")).to.eql(owner.address);
      expect(await tokenProperties.getUintTokenProperty(tokenId, "health")).to.eql(bn(100));
      expect(await tokenProperties.getBytesTokenProperty(tokenId, "data")).to.eql("0x1234");
    });

  });
})
;

async function shouldBehaveLikeTokenPropertiesInterface() {
  it("can support IERC165", async function() {
    expect(await this.tokenProperties.supportsInterface(IERC165)).to.equal(true);
  });

  it("can support IRMRKTokenProperties", async function() {
    expect(await this.tokenProperties.supportsInterface(IRMRKTokenProperties)).to.equal(true);
  });
}

async function shouldBehaveLikeTokenProperties() {
  let owner: SignerWithAddress;

  beforeEach(async function() {
    const signers = await ethers.getSigners();
    owner = signers[0];
  });

  it("can add and return token properties ", async function() {
    await this.tokenProperties.setStringProperty(1, "description", "test description");
    await this.tokenProperties.setBoolProperty(1, "rare", true);
    await this.tokenProperties.setAddressProperty(1, "owner", owner.address);
    await this.tokenProperties.setUintProperty(1, "health", bn(100));
    await this.tokenProperties.setBytesProperty(1, "data", "0x1234");

    expect(await this.tokenProperties.getStringTokenProperty(1, "description")).to.eql("test description");
    expect(await this.tokenProperties.getBoolTokenProperty(1, "rare")).to.eql(true);
    expect(await this.tokenProperties.getAddressTokenProperty(1, "owner")).to.eql(owner.address);
    expect(await this.tokenProperties.getUintTokenProperty(1, "health")).to.eql(bn(100));
    expect(await this.tokenProperties.getBytesTokenProperty(1, "data")).to.eql("0x1234");
  });

}

