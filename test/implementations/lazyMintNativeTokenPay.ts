import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import {
  ADDRESS_ZERO,
  mintFromImplNativeToken,
  nestMintFromImplNativeToken,
  ONE_ETH,
  singleFixtureWithArgs,
} from '../utils';

async function multiAssetFixture(): Promise<Contract> {
  return await singleFixtureWithArgs('RMRKMultiAssetImpl', [
    'MultiAsset',
    'MA',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, false, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

async function nestableFixture(): Promise<Contract> {
  return await singleFixtureWithArgs('RMRKNestableImpl', [
    'MultiAsset',
    'MA',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, false, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

async function nestableMultiAssetFixture(): Promise<Contract> {
  return await singleFixtureWithArgs('RMRKNestableMultiAssetImpl', [
    'MultiAsset',
    'MA',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, false, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

async function nestableExternalEquipFixture(): Promise<Contract> {
  const nestable = await singleFixtureWithArgs('RMRKNestableExternalEquipImpl', [
    ADDRESS_ZERO,
    'MultiAsset',
    'MA',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, false, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);

  const equippable = await singleFixtureWithArgs('RMRKExternalEquipImpl', [nestable.address]);
  await nestable.setEquippableAddress(equippable.address);

  return nestable;
}

async function equippableFixture(): Promise<Contract> {
  return await singleFixtureWithArgs('RMRKEquippableImpl', [
    'MultiAsset',
    'MA',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, false, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

describe('MultiAssetImplNativeTokenPay Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(multiAssetFixture);
  });

  shouldControlValidMintingNativeTokenPay();
});

describe('NestableImplNativeTokenPay Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(nestableFixture);
  });

  shouldControlValidMintingNativeTokenPay();
});

describe('NestableMultiAssetImplNativeTokenPay Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(nestableMultiAssetFixture);
  });

  shouldControlValidMintingNativeTokenPay();
});

describe('RMRKNestableExternalEquipImpl Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(nestableExternalEquipFixture);
  });

  shouldControlValidMintingNativeTokenPay();
});

describe('EquippableImplNativeTokenPay Minting', async () => {
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

  it('cannot mint if locked', async function () {
    await this.token.setLock();
    await expect(this.token.mint(addrs[0].address, 99999)).to.be.revertedWithCustomError(
      this.token,
      'RMRKLocked',
    );
  });

  it('can mint tokens through sale logic', async function () {
    await mintFromImplNativeToken(this.token, addrs[0].address);
    expect(await this.token.ownerOf(1)).to.equal(addrs[0].address);
    expect(await this.token.totalSupply()).to.equal(1);
    expect(await this.token.balanceOf(addrs[0].address)).to.equal(1);
  });

  it('reduces total supply on burn', async function () {
    const tokenId = await mintFromImplNativeToken(this.token, addrs[0].address);
    expect(await this.token.totalSupply()).to.equal(1);
    await this.token.connect(addrs[0])['burn(uint256)'](tokenId);
    expect(await this.token.totalSupply()).to.equal(0);
  });

  it('reduces total supply on burn and does not reuse ID', async function () {
    const tokenId = await mintFromImplNativeToken(this.token, addrs[0].address);
    await this.token.connect(addrs[0])['burn(uint256)'](tokenId);

    const newTokenId = await mintFromImplNativeToken(this.token, addrs[0].address);
    expect(newTokenId).to.equal(tokenId.add(1));
    expect(await this.token.totalSupply()).to.equal(1);
  });

  it('can mint multiple tokens through sale logic', async function () {
    await this.token.connect(addrs[0]).mint(addrs[0].address, 10, { value: ONE_ETH.mul(10) });
    expect(await this.token.totalSupply()).to.equal(10);
    expect(await this.token.balanceOf(addrs[0].address)).to.equal(10);
  });

  describe('Nest minting', async () => {
    let parentId: number;

    beforeEach(async function () {
      if (this.token.nestMint === undefined) {
        this.skip();
      }
      parentId = await mintFromImplNativeToken(this.token, addrs[0].address);
    });

    it('can nest mint tokens through sale logic', async function () {
      const childId = await nestMintFromImplNativeToken(this.token, this.token.address, parentId);
      expect(await this.token.ownerOf(childId)).to.equal(addrs[0].address);
      expect(await this.token.totalSupply()).to.equal(2);
    });

    it('cannot nest mint over max supply', async function () {
      await expect(this.token.nestMint(this.token.address, 99999, 1)).to.be.revertedWithCustomError(
        this.token,
        'RMRKMintOverMax',
      );
    });

    it('cannot nest mint if locked', async function () {
      await this.token.setLock();
      await expect(this.token.nestMint(this.token.address, 99999, 1)).to.be.revertedWithCustomError(
        this.token,
        'RMRKLocked',
      );
    });
  });
}
