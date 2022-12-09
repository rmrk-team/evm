import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  ADDRESS_ZERO,
  mintFromImplErc20Pay,
  nestMintFromImplErc20Pay,
  ONE_ETH,
  singleFixtureWithArgs,
} from '../utils';
import { Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ERC20Mock } from '../../typechain-types';

async function multiAssetFixture(): Promise<Contract> {
  return await singleFixtureWithArgs('RMRKMultiAssetImplPreMint', [
    'MultiAsset',
    'MR',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, false, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

async function nestableFixture(): Promise<Contract> {
  return await singleFixtureWithArgs('RMRKNestableImplPreMint', [
    'MultiAsset',
    'MR',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, false, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

async function nestableMultiAssetFixture(): Promise<Contract> {
  return await singleFixtureWithArgs('RMRKNestableMultiAssetImplPreMint', [
    'MultiAsset',
    'MR',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, false, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

async function equippableFixture(): Promise<Contract> {
  return await singleFixtureWithArgs('RMRKEquippableImplPreMint', [
    'MultiAsset',
    'MR',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, false, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

describe('MultiAssetImplPreMint Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(multiAssetFixture);
  });

  shouldControlValidPreMinting();
});

describe('NestableImplPreMint Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(nestableFixture);
  });

  shouldControlValidPreMinting();
});

describe('NestableMultiAssetImplPreMint Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(nestableMultiAssetFixture);
  });

  shouldControlValidPreMinting();
});

describe('EquippableImplPreMint Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(equippableFixture);
  });

  shouldControlValidPreMinting();
});

async function shouldControlValidPreMinting(): Promise<void> {
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    [owner, ...addrs] = await ethers.getSigners();
  });

  it('cannot mint if not owner', async function () {
    const notOwner = addrs[0];
    await expect(
      this.token.connect(notOwner).mint(notOwner.address, 1),
    ).to.be.revertedWithCustomError(this.token, 'RMRKNotOwner');
  });

  it('can mint if owner', async function () {
    await expect(this.token.connect(owner).mint(addrs[0].address, 1)).to.be.emit(
      this.token,
      'Transfer',
    );
  });

  it('cannot mint over max supply', async function () {
    await expect(
      this.token.connect(owner).mint(addrs[0].address, 99999),
    ).to.be.revertedWithCustomError(this.token, 'RMRKMintOverMax');
  });

  it('cannot mint if locked', async function () {
    await this.token.connect(owner).setLock();
    await expect(
      this.token.connect(owner).mint(addrs[0].address, 99999),
    ).to.be.revertedWithCustomError(this.token, 'RMRKLocked');
  });

  describe('Nest minting', async () => {
    beforeEach(async function () {
      if (this.token.nestMint === undefined) {
        this.skip();
      }
      this.token.connect(owner).mint(addrs[0].address, 1);
    });

    it('cannot nest mint if not owner', async function () {
      const notOwner = addrs[0];
      await expect(
        this.token.connect(notOwner).nestMint(this.token.address, 1, 1),
      ).to.be.revertedWithCustomError(this.token, 'RMRKNotOwner');
    });

    it('can nest mint if owner', async function () {
      this.token.connect(owner).mint(addrs[0].address, 1);
      await this.token.connect(owner).nestMint(this.token.address, 1, 1);
    });

    it('cannot nest mint over max supply', async function () {
      await expect(
        this.token.connect(owner).nestMint(this.token.address, 99999, 1),
      ).to.be.revertedWithCustomError(this.token, 'RMRKMintOverMax');
    });

    it('cannot mint if locked', async function () {
      await this.token.connect(owner).setLock();
      await expect(
        this.token.connect(owner).nestMint(this.token.address, 99999, 1),
      ).to.be.revertedWithCustomError(this.token, 'RMRKLocked');
    });
  });
}
