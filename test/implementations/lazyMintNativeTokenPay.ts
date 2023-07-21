import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';
import {
  ADDRESS_ZERO,
  mintFromNativeToken,
  nestMintFromNativeToken,
  ONE_ETH,
  singleFixtureWithArgs,
} from '../utils';

async function multiAssetFixture(): Promise<Contract> {
  return await singleFixtureWithArgs('RMRKMultiAssetLazyMintNative', [
    'MultiAsset',
    'MA',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, 1000, 10000, ONE_ETH],
  ]);
}

async function nestableFixture(): Promise<Contract> {
  return await singleFixtureWithArgs('RMRKNestableLazyMintNative', [
    'Nestable',
    'N',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, 1000, 10000, ONE_ETH],
  ]);
}

async function nestableMultiAssetFixture(): Promise<Contract> {
  return await singleFixtureWithArgs('RMRKNestableMultiAssetLazyMintNative', [
    'MultiAsset',
    'NMA',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, 1000, 10000, ONE_ETH],
  ]);
}

async function equippableFixture(): Promise<Contract> {
  return await singleFixtureWithArgs('RMRKEquippableLazyMintNative', [
    'Equippable',
    'EQ',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, 1000, 10000, ONE_ETH],
  ]);
}

describe('MultiAssetNativeTokenPay Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(multiAssetFixture);
  });

  shouldControlValidMintingNativeTokenPay();
});

describe('NestableNativeTokenPay Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(nestableFixture);
  });

  shouldControlValidMintingNativeTokenPay();
});

describe('NestableMultiAssetNativeTokenPay Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(nestableMultiAssetFixture);
  });

  shouldControlValidMintingNativeTokenPay();
});

describe('EquippableNativeTokenPay Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(equippableFixture);
  });

  shouldControlValidMintingNativeTokenPay();
});

async function shouldControlValidMintingNativeTokenPay(): Promise<void> {
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    [, ...addrs] = await ethers.getSigners();
  });

  it('cannot mint under price', async function () {
    const HALF_ETH = ethers.utils.parseEther('0.05');
    await expect(
      this.token.mint(addrs[0].address, 1, { value: HALF_ETH }),
    ).to.be.revertedWithCustomError(this.token, 'RMRKWrongValueSent');
  });

  it('cannot mint 0 units', async function () {
    await expect(this.token.mint(addrs[0].address, 0)).to.be.revertedWithCustomError(
      this.token,
      'RMRKMintZero',
    );
  });

  it('cannot mint over max supply', async function () {
    await expect(this.token.mint(addrs[0].address, 99999)).to.be.revertedWithCustomError(
      this.token,
      'RMRKMintOverMax',
    );
  });

  it('can mint tokens through sale logic', async function () {
    await mintFromNativeToken(this.token, addrs[0].address);
    expect(await this.token.ownerOf(1)).to.equal(addrs[0].address);
    expect(await this.token.totalSupply()).to.equal(1);
    expect(await this.token.balanceOf(addrs[0].address)).to.equal(1);
  });

  it('reduces total supply on burn', async function () {
    const tokenId = await mintFromNativeToken(this.token, addrs[0].address);
    expect(await this.token.totalSupply()).to.equal(1);
    await this.token.connect(addrs[0])['burn(uint256)'](tokenId);
    expect(await this.token.totalSupply()).to.equal(0);
  });

  it('reduces total supply on burn and does not reuse ID', async function () {
    const tokenId = await mintFromNativeToken(this.token, addrs[0].address);
    await this.token.connect(addrs[0])['burn(uint256)'](tokenId);

    const newTokenId = await mintFromNativeToken(this.token, addrs[0].address);
    expect(newTokenId).to.equal(tokenId.add(1));
    expect(await this.token.totalSupply()).to.equal(1);
  });

  it('can mint multiple tokens through sale logic', async function () {
    await this.token.connect(addrs[0]).mint(addrs[0].address, 10, { value: ONE_ETH.mul(10) });
    expect(await this.token.totalSupply()).to.equal(10);
    expect(await this.token.balanceOf(addrs[0].address)).to.equal(10);
  });

  describe('Nest minting', async () => {
    let parentId: BigNumber;

    beforeEach(async function () {
      if (this.token.nestMint === undefined) {
        this.skip();
      }
      parentId = await mintFromNativeToken(this.token, addrs[0].address);
    });

    it('can nest mint tokens through sale logic', async function () {
      const childId = await nestMintFromNativeToken(this.token, this.token.address, parentId);
      expect(await this.token.ownerOf(childId)).to.equal(addrs[0].address);
      expect(await this.token.totalSupply()).to.equal(2);
    });

    it('cannot nest mint over max supply', async function () {
      await expect(this.token.nestMint(this.token.address, 99999, 1)).to.be.revertedWithCustomError(
        this.token,
        'RMRKMintOverMax',
      );
    });
  });
}
