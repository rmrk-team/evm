import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  shouldBehaveLikeMultiResource,
  shouldSupportInterfaces,
  shouldHandleApprovalsForResources,
  shouldHandleAcceptsForResources,
  shouldHandleRejectsForResources,
} from './behavior/multiresource';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

const name = 'RmrkTest';
const symbol = 'RMRKTST';

async function deployRmrkMultiResourceMockFixture() {
  const Token = await ethers.getContractFactory('RMRKMultiResourceMock');
  const token = await Token.deploy(name, symbol);
  await token.deployed();
  return { token };
}

async function mint(token: Contract, to: string, tokenId: number) {
  await token['mint(address,uint256)'](to, tokenId);
}

describe('MultiResource behavior', async () => {
  beforeEach(async function () {
    const { token } = await loadFixture(deployRmrkMultiResourceMockFixture);
    this.token = token;
  });

  shouldSupportInterfaces();
  shouldBehaveLikeMultiResource(mint);
});

describe('Multiresource with minted token', async () => {
  const tokenId = 1;

  beforeEach(async function () {
    const tokenOwner = (await ethers.getSigners())[1];
    const { token } = await loadFixture(deployRmrkMultiResourceMockFixture);
    await token['mint(address,uint256)'](tokenOwner.address, tokenId);
    this.token = token;
  });

  shouldHandleApprovalsForResources(tokenId);
});

describe('Multiresource with minted token and pending resources', async () => {
  const tokenId = 1;
  const resId1 = ethers.BigNumber.from(1);
  const resData1 = 'data1';
  const resId2 = ethers.BigNumber.from(2);
  const resData2 = 'data2';

  beforeEach(async function () {
    const tokenOwner = (await ethers.getSigners())[1];
    const { token } = await loadFixture(deployRmrkMultiResourceMockFixture);

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
});

describe('Init', async function () {
  let token: Contract;

  before(async function () {
    ({ token } = await loadFixture(deployRmrkMultiResourceMockFixture));
  });

  it('Name', async function () {
    expect(await token.name()).to.equal(name);
  });

  it('Symbol', async function () {
    expect(await token.symbol()).to.equal(symbol);
  });
});

// FIXME: this is broken
describe.skip('MultiResource approvals cleaning', async () => {
  let addrs: SignerWithAddress[];
  let token: Contract;

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;
    ({ token } = await loadFixture(deployRmrkMultiResourceMockFixture));
  });

  it('cleans token and resources approvals on transfer', async function () {
    const tokenId = 1;
    const tokenOwner = addrs[1];
    const newOwner = addrs[2];
    const approved = addrs[3];
    await token['mint(address,uint256)'](tokenOwner.address, tokenId);
    await token.connect(tokenOwner).approve(approved.address, tokenId);
    await token.connect(tokenOwner).approveForResources(approved.address, tokenId);

    expect(await token.getApproved(tokenId)).to.eql(approved.address);
    expect(await token.getApprovedForResources(tokenId)).to.eql(approved.address);

    await token.connect(tokenOwner).transfer(newOwner.address, tokenId);

    expect(await token.getApproved(tokenId)).to.eql(ethers.constants.AddressZero);
    expect(await token.getApprovedForResources(tokenId)).to.eql(ethers.constants.AddressZero);
  });

  it('cleans token and resources approvals on burn', async function () {
    const tokenId = 1;
    const tokenOwner = addrs[1];
    const approved = addrs[3];
    await token['mint(address,uint256)'](tokenOwner.address, tokenId);
    await token.connect(tokenOwner).approve(approved.address, tokenId);
    await token.connect(tokenOwner).approveForResources(approved.address, tokenId);

    expect(await token.getApproved(tokenId)).to.eql(approved.address);
    expect(await token.getApprovedForResources(tokenId)).to.eql(approved.address);

    await token.connect(tokenOwner).burn(tokenId);

    await expect(token.getApproved(tokenId)).to.be.revertedWithCustomError(
      token,
      'ERC721InvalidTokenId',
    );
    await expect(token.getApprovedForResources(tokenId)).to.be.revertedWithCustomError(
      token,
      'ERC721InvalidTokenId',
    );
  });
});
