import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import shouldBehaveLikeMultiAsset from '../behavior/multiasset';
import shouldBehaveLikeOwnableLock from '../behavior/ownableLock';
import shouldControlValidMinting from '../behavior/mintingImpl';
import shouldHaveMetadata from '../behavior/metadata';
import shouldHaveRoyalties from '../behavior/royalties';
import {
  addAssetEntryFromImpl,
  addAssetToToken,
  ADDRESS_ZERO,
  mintFromImplNativeToken,
  ONE_ETH,
  singleFixtureWithArgs,
} from '../utils';
import { IERC721 } from '../interfaces';
import { RMRKMultiAssetImpl, RMRKMultiAssetRenderUtils } from '../../typechain-types';

const isTokenUriEnumerated = true;

async function singleFixture(): Promise<{ token: RMRKMultiAssetImpl; renderUtils: Contract }> {
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');
  const renderUtils = <RMRKMultiAssetRenderUtils>await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  const token = <RMRKMultiAssetImpl>(
    await singleFixtureWithArgs('RMRKMultiAssetImpl', [
      'MultiAsset',
      'MA',
      'ipfs://collection-meta',
      'ipfs://tokenURI/',
      [ADDRESS_ZERO, isTokenUriEnumerated, ADDRESS_ZERO, 1000, 10000, ONE_ETH],
    ])
  );
  return { token, renderUtils };
}

describe('MultiAssetImpl Other Behavior', async () => {
  let token: RMRKMultiAssetImpl;
  let owner: SignerWithAddress;

  const isOwnableLockMock = false;

  beforeEach(async function () {
    owner = (await ethers.getSigners())[0];
  });

  describe('Deployment', async function () {
    beforeEach(async function () {
      ({ token } = await loadFixture(singleFixture));
      this.token = token;
    });

    it('can support IERC721', async function () {
      expect(await token.supportsInterface(IERC721)).to.equal(true);
    });

    shouldBehaveLikeOwnableLock(isOwnableLockMock);

    it('can mint tokens through sale logic', async function () {
      await mintFromImplNativeToken(token, owner.address);
      expect(await token.ownerOf(1)).to.equal(owner.address);
      expect(await token.totalSupply()).to.equal(1);
      expect(await token.balanceOf(owner.address)).to.equal(1);

      await expect(
        token.connect(owner).mint(owner.address, 1, { value: ONE_ETH.div(2) }),
      ).to.be.revertedWithCustomError(token, 'RMRKWrongValueSent');
      await expect(
        token.connect(owner).mint(owner.address, 1, { value: 0 }),
      ).to.be.revertedWithCustomError(token, 'RMRKWrongValueSent');
    });

    it('reduces total supply on burn', async function () {
      const tokenId = await mintFromImplNativeToken(token, owner.address);
      await this.token.connect(owner)['burn(uint256)'](tokenId);
      expect(await this.token.totalSupply()).to.equal(0);
    });

    it('reduces total supply on burn and does not reuse ID', async function () {
      const tokenId = await mintFromImplNativeToken(token, owner.address);
      await this.token.connect(owner)['burn(uint256)'](tokenId);

      const newTokenId = await mintFromImplNativeToken(this.token, owner.address);
      expect(newTokenId).to.equal(tokenId.add(1));
      expect(await this.token.totalSupply()).to.equal(1);
    });

    it('can mint multiple tokens through sale logic', async function () {
      await token.connect(owner).mint(owner.address, 10, { value: ONE_ETH.mul(10) });
      expect(await token.totalSupply()).to.equal(10);
      expect(await token.balanceOf(owner.address)).to.equal(10);
      await expect(
        token.connect(owner).mint(owner.address, 1, { value: ONE_ETH.div(2) }),
      ).to.be.revertedWithCustomError(token, 'RMRKWrongValueSent');
      await expect(
        token.connect(owner).mint(owner.address, 1, { value: 0 }),
      ).to.be.revertedWithCustomError(token, 'RMRKWrongValueSent');
    });

    it('auto accepts resource if send is token owner', async function () {
      await token.connect(owner).mint(owner.address, 1, { value: ONE_ETH.mul(1) });
      await token.connect(owner).addAssetEntry('ipfs://test');
      const assetId = await token.totalAssets();
      const tokenId = await token.totalSupply();
      await token.connect(owner).addAssetToToken(tokenId, assetId, 0);

      expect(await token.getPendingAssets(tokenId)).to.be.eql([]);
      expect(await token.getActiveAssets(tokenId)).to.be.eql([assetId]);
    });
  });
});

describe('MultiAssetImpl MR behavior', async () => {
  beforeEach(async function () {
    const { token, renderUtils } = await loadFixture(singleFixture);
    this.token = token;
    this.renderUtils = renderUtils;
  });

  shouldBehaveLikeMultiAsset(mintFromImplNativeToken, addAssetEntryFromImpl, addAssetToToken);
});

describe('MultiAssetImpl Other', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(singleFixture);
    this.token = token;
  });

  it('can only burn if owner', async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const tokenId = await mintFromImplNativeToken(this.token, owner.address);
    await expect(this.token.connect(notOwner).burn(tokenId)).to.be.revertedWithCustomError(
      this.token,
      'ERC721NotApprovedOrOwner',
    );
    await expect(this.token.connect(owner).burn(tokenId))
      .to.emit(this.token, 'Transfer')
      .withArgs(owner.address, ADDRESS_ZERO, tokenId);
  });

  shouldControlValidMinting();
  shouldHaveRoyalties(mintFromImplNativeToken);
  shouldHaveMetadata(mintFromImplNativeToken, isTokenUriEnumerated);
});
