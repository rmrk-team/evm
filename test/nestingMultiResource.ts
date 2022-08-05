import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import shouldBehaveLikeNesting from './behavior/nesting';
import {
  shouldHandleAcceptsForResources,
  shouldHandleApprovalsForResources,
  shouldHandleOverwritesForResources,
  shouldHandleRejectsForResources,
  shouldHandleSetPriorities,
  shouldSupportInterfacesForResources,
} from './behavior/multiresource';

describe('Nesting', function () {
  let ownerChunky: Contract;
  let petMonkey: Contract;

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  const name2 = 'petMonkey';
  const symbol2 = 'MONKE';

  async function deployTokensFixture() {
    const CHNKY = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
    ownerChunky = await CHNKY.deploy(name, symbol);
    await ownerChunky.deployed();

    const MONKY = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
    petMonkey = await MONKY.deploy(name2, symbol2);
    await petMonkey.deployed();

    return { ownerChunky, petMonkey };
  }

  beforeEach(async function () {
    const { ownerChunky, petMonkey } = await loadFixture(deployTokensFixture);
    this.parentToken = ownerChunky;
    this.childToken = petMonkey;
  });

  shouldBehaveLikeNesting(name, symbol, name2, symbol2);
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

async function addResourceToToken(
  token: Contract,
  tokenId: number,
  resId: BigNumber,
  overwrites: BigNumber | number,
): Promise<void> {
  await token.addResourceToToken(tokenId, resId, overwrites);
}

describe('NestingMultiResourceMock MR behavior with minted token', async () => {
  const tokenId = 1;

  beforeEach(async function () {
    const tokenOwner = (await ethers.getSigners())[1];
    const { token } = await loadFixture(deployTokenFixture);
    await token['mint(address,uint256)'](tokenOwner.address, tokenId);
    this.token = token;
  });

  shouldSupportInterfacesForResources();
  shouldHandleApprovalsForResources(tokenId);
  shouldHandleOverwritesForResources(tokenId, addResourceEntry, addResourceToToken);
});

describe('NestingMultiResourceMock MR behavior with minted token and pending resources', async () => {
  const tokenId = 1;
  const resId1 = BigNumber.from(1);
  const resData1 = 'data1';
  const resId2 = BigNumber.from(2);
  const resData2 = 'data2';

  beforeEach(async function () {
    const tokenOwner = (await ethers.getSigners())[1];
    const { token } = await loadFixture(deployTokenFixture);

    // Mint and add 2 resources to token
    await token['mint(address,uint256)'](tokenOwner.address, tokenId);
    await token.addResourceEntry(resId1, resData1);
    await token.addResourceEntry(resId2, resData2);
    await token.addResourceToToken(tokenId, resId1, 0);
    await token.addResourceToToken(tokenId, resId2, 0);

    this.token = token;
  });

  shouldHandleAcceptsForResources(tokenId, resId1, resData1, resId2, resData2);
  shouldHandleRejectsForResources(tokenId, resId1, resData1, resId2, resData2);
  shouldHandleSetPriorities(tokenId);
});

// --------------- MULTI RESOURCE BEHAVIOR END ------------------------

describe('Nesting MR', function () {
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
