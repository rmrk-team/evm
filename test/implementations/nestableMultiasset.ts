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
  mintFromImplNativeToken,
  nestMintFromImplNativeToken,
  nestTransfer,
  ONE_ETH,
  parentChildFixtureWithArgs,
  singleFixtureWithArgs,
  transfer,
} from '../utils';
import { RMRKMultiAssetRenderUtils, RMRKNestableMultiAssetImpl } from '../../typechain-types';
import { IERC6059, IERC721, IRMRKImplementation } from '../interfaces';

const isTokenUriEnumerated = false;

async function singleFixture(): Promise<{
  token: RMRKNestableMultiAssetImpl;
  renderUtils: Contract;
}> {
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');
  const renderUtils = <RMRKMultiAssetRenderUtils>await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  const token = <RMRKNestableMultiAssetImpl>(
    await singleFixtureWithArgs('RMRKNestableMultiAssetImpl', [
      'NestableMultiAsset',
      'NMR',
      'ipfs://collection-meta',
      'ipfs://tokenURI',
      [ADDRESS_ZERO, isTokenUriEnumerated, ADDRESS_ZERO, 1000, 10000, ONE_ETH],
    ])
  );
  return { token, renderUtils };
}

async function parentChildFixture(): Promise<{ parent: Contract; child: Contract }> {
  return parentChildFixtureWithArgs(
    'RMRKNestableMultiAssetImpl',
    [
      'Chunky',
      'CHNK',
      'ipfs://collection-meta',
      'ipfs://tokenURI',
      [ADDRESS_ZERO, false, ADDRESS_ZERO, 1000, 10000, ONE_ETH],
    ],
    [
      'Monkey',
      'MONK',
      'ipfs://collection-meta',
      'ipfs://tokenURI',
      [ADDRESS_ZERO, false, ADDRESS_ZERO, 1000, 10000, ONE_ETH],
    ],
  );
}

describe('NestableMultiAssetImpl Nestable Behavior', function () {
  beforeEach(async function () {
    const { parent, child } = await loadFixture(parentChildFixture);
    this.parentToken = parent;
    this.childToken = child;
  });

  shouldBehaveLikeNestable(
    mintFromImplNativeToken,
    nestMintFromImplNativeToken,
    transfer,
    nestTransfer,
  );
});

describe('NestableMultiAssetImpl MR behavior', async () => {
  beforeEach(async function () {
    const { token, renderUtils } = await loadFixture(singleFixture);
    this.token = token;
    this.renderUtils = renderUtils;
  });

  shouldBehaveLikeMultiAsset(mintFromImplNativeToken, addAssetEntryFromImpl, addAssetToToken);
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

  it('can support expected interfaces', async function () {
    expect(await token.supportsInterface(IERC721)).to.equal(true);
    expect(await token.supportsInterface(IERC6059)).to.equal(true);
    expect(await token.supportsInterface(IRMRKImplementation)).to.equal(true);
  });

  describe('Approval Cleaning', async function () {
    it('cleans token and assets approvals on transfer', async function () {
      const tokenOwner = addrs[1];
      const newOwner = addrs[2];
      const approved = addrs[3];
      const tokenId = await mintFromImplNativeToken(token, tokenOwner.address);
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
      const tokenId = await mintFromImplNativeToken(token, tokenOwner.address);
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

  shouldControlValidMinting();
  shouldHaveRoyalties(mintFromImplNativeToken);
  shouldHaveMetadata(mintFromImplNativeToken, isTokenUriEnumerated);
});
