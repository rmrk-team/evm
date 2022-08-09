import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { mintTokenId, nestMinttokenId, transfer, nestTransfer, addResourceToToken } from './utils';
import shouldBehaveLikeNesting from './behavior/nesting';
import shouldBehaveLikeMultiResource from './behavior/multiresource';

describe('NestingMultiResourceMock Nesting Behavior', function () {
  async function deployTokensFixture() {
    const NestingMRFactory = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
    const ownerChunky = await NestingMRFactory.deploy('Chunky', 'CHNK');
    await ownerChunky.deployed();

    const petMonkey = await NestingMRFactory.deploy('Monkey', 'MONK');
    await petMonkey.deployed();

    return { ownerChunky, petMonkey };
  }

  beforeEach(async function () {
    const { ownerChunky, petMonkey } = await loadFixture(deployTokensFixture);
    this.parentToken = ownerChunky;
    this.childToken = petMonkey;
  });

  shouldBehaveLikeNesting(mintTokenId, nestMinttokenId, transfer, nestTransfer);
});

// --------------- MULTI RESOURCE BEHAVIOR -----------------------

async function deployTokenFixture() {
  const Token = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
  const token = await Token.deploy('NestingMultiResource', 'NMR');
  await token.deployed();
  return { token };
}

let nextResourceId = 1;

async function addResourceEntry(token: Contract, data?: string): Promise<BigNumber> {
  const resourceId = BigNumber.from(nextResourceId);
  nextResourceId++;
  await token.addResourceEntry(resourceId, data !== undefined ? data : 'metaURI');
  return resourceId;
}

describe('NestingMultiResourceMock MR behavior', async () => {
  beforeEach(async function () {
    const { token } = await loadFixture(deployTokenFixture);
    this.token = token;
  });

  shouldBehaveLikeMultiResource(mintTokenId, addResourceEntry, addResourceToToken);
});

// --------------- MULTI RESOURCE BEHAVIOR END ------------------------

describe('NestingMultiResourceMock', function () {
  let addrs: SignerWithAddress[];
  let chunky: Contract;

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  async function deployTokensFixture() {
    const CHNKY = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
    chunky = await CHNKY.deploy(name, symbol);
    await chunky.deployed();
    return { chunky };
  }

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;

    const { chunky } = await loadFixture(deployTokensFixture);
    this.parentToken = chunky;
  });

  describe('Approval Cleaning', async function () {
    it('cleans token and resources approvals on transfer', async function () {
      const tokenId = 1;
      const tokenOwner = addrs[1];
      const newOwner = addrs[2];
      const approved = addrs[3];
      await chunky['mint(address,uint256)'](tokenOwner.address, tokenId);
      await chunky.connect(tokenOwner).approve(approved.address, tokenId);
      await chunky.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(approved.address);
      expect(await chunky.getApprovedForResources(tokenId)).to.eql(approved.address);

      await chunky.connect(tokenOwner).transfer(newOwner.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(ethers.constants.AddressZero);
      expect(await chunky.getApprovedForResources(tokenId)).to.eql(ethers.constants.AddressZero);
    });

    it('cleans token and resources approvals on burn', async function () {
      const tokenId = 1;
      const tokenOwner = addrs[1];
      const approved = addrs[3];
      await chunky['mint(address,uint256)'](tokenOwner.address, tokenId);
      await chunky.connect(tokenOwner).approve(approved.address, tokenId);
      await chunky.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(approved.address);
      expect(await chunky.getApprovedForResources(tokenId)).to.eql(approved.address);

      await chunky.connect(tokenOwner).burn(tokenId);

      await expect(chunky.getApproved(tokenId)).to.be.revertedWithCustomError(
        chunky,
        'ERC721InvalidTokenId',
      );
      await expect(chunky.getApprovedForResources(tokenId)).to.be.revertedWithCustomError(
        chunky,
        'ERC721InvalidTokenId',
      );
    });
  });
});
