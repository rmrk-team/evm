import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { transfer, nestTransfer, addResourceToToken } from '../utils';
import shouldBehaveLikeNesting from '../behavior/nesting';
import shouldBehaveLikeMultiResource from '../behavior/multiresource';

const ONE_ETH = ethers.utils.parseEther('1.0');

async function mint(token: Contract, to: string): Promise<number> {
  await token.mint(to, 1, { value: ONE_ETH });
  return await token.totalSupply();
}

async function nestMint(token: Contract, to: string, destinationId: number): Promise<number> {
  await token.mintNesting(to, 1, destinationId, { value: ONE_ETH });
  return await token.totalSupply();
}

describe('NestingMultiResourceImpl Nesting Behavior', function () {
  async function deployTokensFixture() {
    const NestingMRFactory = await ethers.getContractFactory('RMRKNestingMultiResourceImpl');
    const ownerChunky = await NestingMRFactory.deploy('Chunky', 'CHNK', 10000, ONE_ETH);
    await ownerChunky.deployed();

    const petMonkey = await NestingMRFactory.deploy('Monkey', 'MONK', 10000, ONE_ETH);
    await petMonkey.deployed();

    return { ownerChunky, petMonkey };
  }

  beforeEach(async function () {
    const { ownerChunky, petMonkey } = await loadFixture(deployTokensFixture);
    this.parentToken = ownerChunky;
    this.childToken = petMonkey;
  });

  shouldBehaveLikeNesting(mint, nestMint, transfer, nestTransfer);
});

// --------------- MULTI RESOURCE BEHAVIOR -----------------------

async function deployTokenFixture() {
  const Token = await ethers.getContractFactory('RMRKNestingMultiResourceImpl');
  const token = await Token.deploy('NestingMultiResource', 'NMR', 10000, ONE_ETH);
  await token.deployed();
  return { token };
}

async function addResourceEntry(token: Contract, data?: string): Promise<BigNumber> {
  await token.addResourceEntry(data !== undefined ? data : 'metaURI');
  return await token.totalResources();
}

describe('NestingMultiResourceImpl MR behavior', async () => {
  beforeEach(async function () {
    const { token } = await loadFixture(deployTokenFixture);
    this.token = token;
  });

  shouldBehaveLikeMultiResource(mint, addResourceEntry, addResourceToToken);
});

// --------------- MULTI RESOURCE BEHAVIOR END ------------------------

describe('NestingMultiResourceImpl', function () {
  let addrs: SignerWithAddress[];
  let chunky: Contract;

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  async function deployTokensFixture() {
    const CHNKY = await ethers.getContractFactory('RMRKNestingMultiResourceImpl');
    chunky = await CHNKY.deploy(name, symbol, 10000, ONE_ETH);
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
      const tokenOwner = addrs[1];
      const newOwner = addrs[2];
      const approved = addrs[3];
      const tokenId = await mint(chunky, tokenOwner.address);
      await chunky.connect(tokenOwner).approve(approved.address, tokenId);
      await chunky.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(approved.address);
      expect(await chunky.getApprovedForResources(tokenId)).to.eql(approved.address);

      await chunky.connect(tokenOwner).transfer(newOwner.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(ethers.constants.AddressZero);
      expect(await chunky.getApprovedForResources(tokenId)).to.eql(ethers.constants.AddressZero);
    });

    it('cleans token and resources approvals on burn', async function () {
      const tokenOwner = addrs[1];
      const approved = addrs[3];
      const tokenId = await mint(chunky, tokenOwner.address);
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
