import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import shouldBehaveLikeMultiAsset from '../behavior/multiasset';
import shouldBehaveLikeNestable from '../behavior/nestable';
import shouldControlValidMinting from '../behavior/mintingImpl';
import shouldHaveMetadata from '../behavior/metadata';
import shouldHaveRoyalties from '../behavior/royalties';
import {
  addAssetEntryFromImpl,
  addAssetToToken,
  ADDRESS_ZERO,
  mintFromImpl,
  nestMintFromImpl,
  nestTransfer,
  ONE_ETH,
  parentChildFixtureWithArgs,
  singleFixtureWithArgs,
  transfer,
} from '../utils';
import { RMRKMultiAssetRenderUtils, RMRKNestableMultiAssetImpl } from "../../typechain-types";

async function singleFixture(): Promise<{ token: RMRKNestableMultiAssetImpl; renderUtils: Contract }> {
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');
  const renderUtils = <RMRKMultiAssetRenderUtils> await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  const token = <RMRKNestableMultiAssetImpl> await singleFixtureWithArgs('RMRKNestableMultiAssetImpl', [
    'NestableMultiAsset',
    'NMR',
    10000,
    ONE_ETH,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    1000, // 10%
  ]);
  return { token, renderUtils };
}

async function parentChildFixture(): Promise<{ parent: Contract; child: Contract }> {
  return parentChildFixtureWithArgs(
    'RMRKNestableMultiAssetImpl',
    [
      'Chunky',
      'CHNK',
      10000,
      ONE_ETH,
      'ipfs://collection-meta',
      'ipfs://tokenURI',
      ADDRESS_ZERO,
      0,
    ],
    [
      'Monkey',
      'MONK',
      10000,
      ONE_ETH,
      'ipfs://collection-meta',
      'ipfs://tokenURI',
      ADDRESS_ZERO,
      0,
    ],
  );
}

describe('NestableMultiAssetImpl Nestable Behavior', function () {
  beforeEach(async function () {
    const { parent, child } = await loadFixture(parentChildFixture);
    this.parentToken = parent;
    this.childToken = child;
  });

  shouldBehaveLikeNestable(mintFromImpl, nestMintFromImpl, transfer, nestTransfer);
});

describe('NestableMultiAssetImpl MR behavior', async () => {
  beforeEach(async function () {
    const { token, renderUtils } = await loadFixture(singleFixture);
    this.token = token;
    this.renderUtils = renderUtils;
  });

  shouldBehaveLikeMultiAsset(mintFromImpl, addAssetEntryFromImpl, addAssetToToken);
});

describe('NestableMultiAssetImpl Other Behavior', function () {
  let addrs: SignerWithAddress[];
  let token: RMRKNestableMultiAssetImpl;

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;

    ({ token } = await loadFixture(singleFixture));
    this.parentToken = token;
  });

  describe('Approval Cleaning', async function () {
    it('cleans token and assets approvals on transfer', async function () {
      const tokenOwner = addrs[1];
      const newOwner = addrs[2];
      const approved = addrs[3];
      const tokenId = await mintFromImpl(token, tokenOwner.address);
      await token.connect(tokenOwner).approve(approved.address, tokenId);
      await token.connect(tokenOwner).approveForAssets(approved.address, tokenId);

      expect(await token.getApproved(tokenId)).to.eql(approved.address);
      expect(await token.getApprovedForAssets(tokenId)).to.eql(approved.address);

      await token.connect(tokenOwner).transferFrom(tokenOwner.address, newOwner.address, tokenId);

      expect(await token.getApproved(tokenId)).to.eql(ethers.constants.AddressZero);
      expect(await token.getApprovedForAssets(tokenId)).to.eql(ethers.constants.AddressZero);
    });

    it('cleans token and assets approvals on burn', async function () {
      const tokenOwner = addrs[1];
      const approved = addrs[3];
      const tokenId = await mintFromImpl(token, tokenOwner.address);
      await token.connect(tokenOwner).approve(approved.address, tokenId);
      await token.connect(tokenOwner).approveForAssets(approved.address, tokenId);

      expect(await token.getApproved(tokenId)).to.eql(approved.address);
      expect(await token.getApprovedForAssets(tokenId)).to.eql(approved.address);

      await token.connect(tokenOwner)['burn(uint256)'](tokenId);

      await expect(token.getApproved(tokenId)).to.be.revertedWithCustomError(
        token,
        'ERC721InvalidTokenId',
      );
      await expect(token.getApprovedForAssets(tokenId)).to.be.revertedWithCustomError(
        token,
        'ERC721InvalidTokenId',
      );
    });
  });
});

describe('NestableMultiAssetImpl Other', async function () {
  let nesting: RMRKNestableMultiAssetImpl;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    ({ token: nesting } = await loadFixture(singleFixture));
    this.token = nesting;
    owner = (await ethers.getSigners())[0];
  });

  it('auto accepts resource if send is token owner', async function () {
    await nesting.connect(owner).mint(owner.address, 1, { value: ONE_ETH.mul(1) });
    await nesting.connect(owner).addAssetEntry('ipfs://test');
    const assetId = await nesting.totalAssets();
    const tokenId = await nesting.totalSupply();
    await nesting.connect(owner).addAssetToToken(tokenId, assetId, 0);

    expect(await nesting.getPendingAssets(tokenId)).to.be.eql([]);
    expect(await nesting.getActiveAssets(tokenId)).to.be.eql([assetId]);
  });

  shouldControlValidMinting();
  shouldHaveRoyalties(mintFromImpl);
  shouldHaveMetadata(mintFromImpl);
});
