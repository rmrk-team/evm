import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  addAssetEntryFromMock,
  addAssetToToken,
  bn,
  mintFromMock,
  singleFixtureWithArgs,
} from './utils';
import { IERC721, IERC721Metadata } from './interfaces';
import shouldBehaveLikeMultiAsset from './behavior/multiasset';
import shouldBehaveLikeERC721 from './behavior/erc721';

const name = 'RmrkTest';
const symbol = 'RMRKTST';

async function singleFixture(): Promise<{ token: Contract; renderUtils: Contract }> {
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');
  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  const token = await singleFixtureWithArgs('RMRKMultiAssetMock', [name, symbol]);
  return { token, renderUtils };
}

describe('MultiAssetMock Other Behavior', async function () {
  let token: Contract;
  let renderUtils: Contract;
  let tokenOwner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  before(async function () {
    ({ token, renderUtils } = await loadFixture(singleFixture));
    [tokenOwner, ...addrs] = await ethers.getSigners();
  });

  describe('Init', async function () {
    it('can get name and symbol', async function () {
      expect(await token.name()).to.equal(name);
      expect(await token.symbol()).to.equal(symbol);
    });

    it('can support IERC721', async function () {
      expect(await token.supportsInterface(IERC721)).to.equal(true);
    });

    it('can support IERC721', async function () {
      expect(await token.supportsInterface(IERC721)).to.equal(true);
    });

    it('can support IERC721Metadata', async function () {
      expect(await token.supportsInterface(IERC721Metadata)).to.equal(true);
    });
  });

  describe('Minting', async function () {
    it('cannot mint id 0', async function () {
      await expect(
        token['mint(address,uint256)'](addrs[0].address, 0),
      ).to.be.revertedWithCustomError(token, 'RMRKIdZeroForbidden');
    });
  });

  describe('Asset storage', async function () {
    const metaURIDefault = 'ipfs//something';

    it('can add asset', async function () {
      const id = bn(2222);

      await expect(token.addAssetEntry(id, metaURIDefault)).to.emit(token, 'AssetSet').withArgs(id);
    });

    it('cannot get metadata for non existing asset or non existing token', async function () {
      const tokenId = await mintFromMock(token, tokenOwner.address);
      const resId = await addAssetEntryFromMock(token, 'metadata');
      await token.addAssetToToken(tokenId, resId, 0);
      await expect(token.getAssetMetadata(tokenId, resId.add(bn(1)))).to.be.revertedWithCustomError(
        token,
        'RMRKTokenDoesNotHaveAsset',
      );
      await expect(token.getAssetMetadata(tokenId + 1, resId)).to.be.revertedWithCustomError(
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
      const tokenId = await mintFromMock(token, tokenOwner.address);

      await expect(token.addAssetToToken(tokenId, resId, 0)).to.emit(token, 'AssetAddedToToken');
      await expect(token.addAssetToToken(tokenId, resId2, 0)).to.emit(token, 'AssetAddedToToken');

      expect(await renderUtils.getPendingAssets(token.address, tokenId)).to.eql([
        [resId, bn(0), bn(0), 'data1'],
        [resId2, bn(1), bn(0), 'data2'],
      ]);
    });

    it('cannot add non existing asset to token', async function () {
      const resId = bn(9999);
      const tokenId = await mintFromMock(token, tokenOwner.address);

      await expect(token.addAssetToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        token,
        'RMRKNoAssetMatchingId',
      );
    });

    it('can add asset to non existing token and it is pending when minted', async function () {
      const resId = await addAssetEntryFromMock(token);
      const lastTokenId = await mintFromMock(token, tokenOwner.address);
      const nextTokenId = lastTokenId + 1; // not existing yet

      await token.addAssetToToken(nextTokenId, resId, 0);
      await mintFromMock(token, tokenOwner.address);
      expect(await token.getPendingAssets(nextTokenId)).to.eql([resId]);
    });

    it('cannot add asset twice to the same token', async function () {
      const resId = await addAssetEntryFromMock(token);
      const tokenId = await mintFromMock(token, tokenOwner.address);

      await token.addAssetToToken(tokenId, resId, 0);
      await expect(token.addAssetToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        token,
        'RMRKAssetAlreadyExists',
      );
    });

    it('cannot add too many assets to the same token', async function () {
      const tokenId = await mintFromMock(token, tokenOwner.address);

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
      const tokenId1 = await mintFromMock(token, tokenOwner.address);
      const tokenId2 = await mintFromMock(token, tokenOwner.address);

      await token.addAssetToToken(tokenId1, resId, 0);
      await token.addAssetToToken(tokenId2, resId, 0);

      expect(await token.getPendingAssets(tokenId1)).to.be.eql([resId]);
      expect(await token.getPendingAssets(tokenId2)).to.be.eql([resId]);
    });
  });

  describe('Approvals cleaning', async () => {
    it('cleans token and assets approvals on transfer', async function () {
      const tokenOwner = addrs[1];
      const newOwner = addrs[2];
      const approved = addrs[3];
      const tokenId = await mintFromMock(token, tokenOwner.address);
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
      const tokenId = await mintFromMock(token, tokenOwner.address);
      await token.connect(tokenOwner).approve(approved.address, tokenId);
      await token.connect(tokenOwner).approveForAssets(approved.address, tokenId);

      expect(await token.getApproved(tokenId)).to.eql(approved.address);
      expect(await token.getApprovedForAssets(tokenId)).to.eql(approved.address);

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

describe('MultiAssetMock MR behavior', async () => {
  beforeEach(async function () {
    const { token, renderUtils } = await loadFixture(singleFixture);
    this.token = token;
    this.renderUtils = renderUtils;
  });

  shouldBehaveLikeMultiAsset(mintFromMock, addAssetEntryFromMock, addAssetToToken);
});

describe('NestableMock ERC721 behavior', function () {
  beforeEach(async function () {
    const { token } = await loadFixture(singleFixture);
    this.token = token;
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
  });

  shouldBehaveLikeERC721(name, symbol);
});
