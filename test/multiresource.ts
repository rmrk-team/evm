import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  shouldBehaveLikeMultiResource,
  shouldSupportInterfaces,
  shouldHandleApprovalsForResources,
  shouldHandleAcceptsForResources,
  shouldHandleRejectsForResources,
  shouldHandleSetPriorities,
} from './behavior/multiresource';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

const name = 'RmrkTest';
const symbol = 'RMRKTST';
let nextTokenId = 1;
let nextResourceId = 1;

async function deployRmrkMultiResourceMockFixture() {
  const Token = await ethers.getContractFactory('RMRKMultiResourceMock');
  const token = await Token.deploy(name, symbol);
  await token.deployed();
  return { token };
}

async function mint(token: Contract, to: string): Promise<number> {
  const tokenId = nextTokenId;
  nextTokenId++;
  await token['mint(address,uint256)'](to, tokenId);
  return tokenId;
}

async function addResourceEntry(token: Contract, data?: string): Promise<BigNumber> {
  const resourceId = BigNumber.from(nextResourceId);
  nextResourceId++;
  await token.addResourceEntry(resourceId, data !== undefined ? data : 'metaURI');
  return resourceId;
}

describe('MultiResource behavior', async () => {
  beforeEach(async function () {
    const { token } = await loadFixture(deployRmrkMultiResourceMockFixture);
    this.token = token;
  });

  shouldSupportInterfaces();
  shouldBehaveLikeMultiResource(mint, addResourceEntry);
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
  const resId1 = BigNumber.from(1);
  const resData1 = 'data1';
  const resId2 = BigNumber.from(2);
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
  shouldHandleSetPriorities(tokenId);
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

describe('Resource storage', async function () {
  let token: Contract;
  const metaURIDefault = 'metaURI';

  beforeEach(async function () {
    ({ token } = await loadFixture(deployRmrkMultiResourceMockFixture));
  });

  it('can add resource', async function () {
    const id = BigNumber.from(1);

    await expect(token.addResourceEntry(id, metaURIDefault))
      .to.emit(token, 'ResourceSet')
      .withArgs(id);
  });

  it('cannot get non existing resource', async function () {
    const id = BigNumber.from(1);
    await expect(token.getResource(id)).to.be.revertedWithCustomError(
      token,
      'RMRKNoResourceMatchingId',
    );
  });

  it('cannot add existing resource', async function () {
    const id = BigNumber.from(1);

    await token.addResourceEntry(id, metaURIDefault);
    await expect(token.addResourceEntry(id, 'newMetaUri')).to.be.revertedWithCustomError(
      token,
      'RMRKResourceAlreadyExists',
    );
  });

  it('cannot add resource with id 0', async function () {
    const id = 0;

    await expect(token.addResourceEntry(id, metaURIDefault)).to.be.revertedWithCustomError(
      token,
      'RMRKWriteToZero',
    );
  });

  it('cannot add same resource twice', async function () {
    const id = BigNumber.from(1);

    await expect(token.addResourceEntry(id, metaURIDefault))
      .to.emit(token, 'ResourceSet')
      .withArgs(id);

    await expect(token.addResourceEntry(id, metaURIDefault)).to.be.revertedWithCustomError(
      token,
      'RMRKResourceAlreadyExists',
    );
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
