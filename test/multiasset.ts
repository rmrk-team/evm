import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import {
  addAssetEntryFromMock,
  addAssetToToken,
  bn,
  mintFromMock,
  singleFixtureWithArgs,
} from './utils';
import { IERC721 } from './interfaces';
import { RMRKMultiAssetMock, RMRKMultiAssetRenderUtils } from '../typechain-types';
import shouldBehaveLikeMultiAsset from './behavior/multiasset';
import shouldBehaveLikeERC721 from './behavior/erc721';

async function singleFixture(): Promise<{
  token: RMRKMultiAssetMock;
  renderUtils: RMRKMultiAssetRenderUtils;
}> {
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');
  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.waitForDeployment();

  const token = <RMRKMultiAssetMock>(
    (<unknown>await singleFixtureWithArgs('RMRKMultiAssetMock', []))
  );
  return { token, renderUtils };
}

describe('MultiAssetMock Other Behavior', async function () {
  let token: RMRKMultiAssetMock;
  let renderUtils: RMRKMultiAssetRenderUtils;
  let tokenOwner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  before(async function () {
    ({ token, renderUtils } = await loadFixture(singleFixture));
    [tokenOwner, ...addrs] = await ethers.getSigners();
  });

  describe('Init', async function () {
    it('can support IERC721', async function () {
      expect(await token.supportsInterface(IERC721)).to.equal(true);
    });

    it('can support IERC721', async function () {
      expect(await token.supportsInterface(IERC721)).to.equal(true);
    });
  });

  describe('Minting', async function () {
    it('cannot mint id 0', async function () {
      await expect(token.mint(addrs[0].address, 0)).to.be.revertedWithCustomError(
        token,
        'RMRKIdZeroForbidden',
      );
    });
  });

  describe('Asset storage', async function () {
    const metaURIDefault = 'ipfs//something';

    it('can add asset', async function () {
      const id = bn(2222);

      await expect(token.addAssetEntry(id, metaURIDefault)).to.emit(token, 'AssetSet').withArgs(id);
    });

    it('cannot get metadata for non existing asset or non existing token', async function () {
      const tokenId = await mintFromMock(token, await tokenOwner.getAddress());
      const resId = await addAssetEntryFromMock(token, 'metadata');
      await token.addAssetToToken(tokenId, resId, 0);
      await expect(token.getAssetMetadata(tokenId, resId + 1n)).to.be.revertedWithCustomError(
        token,
        'RMRKTokenDoesNotHaveAsset',
      );
      await expect(token.getAssetMetadata(tokenId + 1n, resId)).to.be.revertedWithCustomError(
        token,
        'RMRKTokenDoesNotHaveAsset',
      );
    });

    it('cannot add existing asset', async function () {
      const id = bn(12345);

      await token.addAssetEntry(id, metaURIDefault);
      await expect(token.addAssetEntry(id, 'newMetaUri')).to.be.revertedWithCustomError(
        token,
        'RMRKAssetAlreadyExists',
      );
    });

    it('cannot add asset with id 0', async function () {
      const id = 0;

      await expect(token.addAssetEntry(id, metaURIDefault)).to.be.revertedWithCustomError(
        token,
        'RMRKIdZeroForbidden',
      );
    });

    it('cannot add same asset twice', async function () {
      const id = bn(1111);

      await expect(token.addAssetEntry(id, metaURIDefault)).to.emit(token, 'AssetSet').withArgs(id);

      await expect(token.addAssetEntry(id, metaURIDefault)).to.be.revertedWithCustomError(
        token,
        'RMRKAssetAlreadyExists',
      );
    });
  });

  describe('Adding assets to tokens', async function () {
    it('can add asset to token', async function () {
      const resId = await addAssetEntryFromMock(token, 'data1');
      const resId2 = await addAssetEntryFromMock(token, 'data2');
      const tokenId = await mintFromMock(token, await tokenOwner.getAddress());

      await expect(token.addAssetToToken(tokenId, resId, 0)).to.emit(token, 'AssetAddedToTokens');
      await expect(token.addAssetToToken(tokenId, resId2, 0)).to.emit(token, 'AssetAddedToTokens');

      expect(await renderUtils.getPendingAssets(await token.getAddress(), tokenId)).to.eql([
        [resId, 0n, 0n, 'data1'],
        [resId2, bn(1), 0n, 'data2'],
      ]);
    });

    it('cannot add non existing asset to token', async function () {
      const resId = bn(9999);
      const tokenId = await mintFromMock(token, await tokenOwner.getAddress());

      await expect(token.addAssetToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        token,
        'RMRKNoAssetMatchingId',
      );
    });

    it('can add asset to non existing token and it is pending when minted', async function () {
      const resId = await addAssetEntryFromMock(token);
      const lastTokenId = await mintFromMock(token, await tokenOwner.getAddress());
      const nextTokenId = lastTokenId + 1n; // not existing yet

      await token.addAssetToToken(nextTokenId, resId, 0);
      await mintFromMock(token, await tokenOwner.getAddress());
      expect(await token.getPendingAssets(nextTokenId)).to.eql([resId]);
    });

    it('cannot add asset twice to the same token', async function () {
      const resId = await addAssetEntryFromMock(token);
      const tokenId = await mintFromMock(token, await tokenOwner.getAddress());

      await token.addAssetToToken(tokenId, resId, 0);
      await expect(token.addAssetToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        token,
        'RMRKAssetAlreadyExists',
      );
    });

    it('cannot add too many assets to the same token', async function () {
      const tokenId = await mintFromMock(token, await tokenOwner.getAddress());

      for (let i = 1; i <= 128; i++) {
        const resId = await addAssetEntryFromMock(token);
        await token.addAssetToToken(tokenId, resId, 0);
      }

      // Now it's full, next should fail
      const resId = await addAssetEntryFromMock(token);
      await expect(token.addAssetToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        token,
        'RMRKMaxPendingAssetsReached',
      );
    });

    it('can add same asset to 2 different tokens', async function () {
      const resId = await addAssetEntryFromMock(token);
      const tokenId1 = await mintFromMock(token, await tokenOwner.getAddress());
      const tokenId2 = await mintFromMock(token, await tokenOwner.getAddress());

      await token.addAssetToToken(tokenId1, resId, 0);
      await token.addAssetToToken(tokenId2, resId, 0);

      expect(await token.getPendingAssets(tokenId1)).to.be.eql([resId]);
      expect(await token.getPendingAssets(tokenId2)).to.be.eql([resId]);
    });

    it('can emit asset added to tokens event with thousands of token ids', async function () {
      // Create array with 1000 consecutive numbers
      const tokenIds = Array.from(Array(3000).keys()).map((i) => i + 1);
      const resId = await addAssetEntryFromMock(token);
      await expect(token.addAssetToTokensEventTest(tokenIds, resId, 0)).to.emit(
        token,
        'AssetAddedToTokens',
      );
    });
  });

  describe('Approvals cleaning', async () => {
    it('cleans token and assets approvals on transfer', async function () {
      const tokenOwner = addrs[1];
      const newOwner = addrs[2];
      const approved = addrs[3];
      const tokenId = await mintFromMock(token, await tokenOwner.getAddress());
      await token.connect(tokenOwner).approve(await approved.getAddress(), tokenId);
      await token.connect(tokenOwner).approveForAssets(await approved.getAddress(), tokenId);

      expect(await token.getApproved(tokenId)).to.eql(await approved.getAddress());
      expect(await token.getApprovedForAssets(tokenId)).to.eql(await approved.getAddress());

      await token
        .connect(tokenOwner)
        .transferFrom(await tokenOwner.getAddress(), await newOwner.getAddress(), tokenId);

      expect(await token.getApproved(tokenId)).to.eql(ethers.ZeroAddress);
      expect(await token.getApprovedForAssets(tokenId)).to.eql(ethers.ZeroAddress);
    });

    it('cleans token and assets approvals on burn', async function () {
      const tokenOwner = addrs[1];
      const approved = addrs[3];
      const tokenId = await mintFromMock(token, await tokenOwner.getAddress());
      await token.connect(tokenOwner).approve(await approved.getAddress(), tokenId);
      await token.connect(tokenOwner).approveForAssets(await approved.getAddress(), tokenId);

      expect(await token.getApproved(tokenId)).to.eql(await approved.getAddress());
      expect(await token.getApprovedForAssets(tokenId)).to.eql(await approved.getAddress());

      await token.connect(tokenOwner).burn(tokenId);

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

describe('MultiAssetMock MA behavior', async () => {
  beforeEach(async function () {
    const { token, renderUtils } = await loadFixture(singleFixture);
    this.token = token;
    this.renderUtils = renderUtils;
  });

  shouldBehaveLikeMultiAsset(mintFromMock, addAssetEntryFromMock, addAssetToToken);
});

describe('RMRKMultiAssetMock ERC721 behavior', function () {
  beforeEach(async function () {
    const { token } = await loadFixture(singleFixture);
    this.token = token;
    this.receiverFactory = await ethers.getContractFactory('ERC721ReceiverMock');
  });

  shouldBehaveLikeERC721('RmrkTest', 'RMRKTST');
});
