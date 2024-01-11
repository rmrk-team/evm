import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ADDRESS_ZERO, getTokenIdFromTx, singleFixtureWithArgs } from '../utils';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  RMRKEquippablePreMint,
  RMRKMultiAssetPreMint,
  RMRKNestableMultiAssetPreMint,
  RMRKNestablePreMint,
} from '../../typechain-types';

async function multiAssetFixture(): Promise<RMRKMultiAssetPreMint> {
  return <RMRKMultiAssetPreMint>(
    (<unknown>(
      await singleFixtureWithArgs('RMRKMultiAssetPreMint', [
        'MultiAsset',
        'MA',
        'ipfs://collection-meta',
        10000,
        ADDRESS_ZERO,
        0,
      ])
    ))
  );
}

async function nestableFixture(): Promise<RMRKNestablePreMint> {
  return <RMRKNestablePreMint>(
    (<unknown>(
      await singleFixtureWithArgs('RMRKNestablePreMint', [
        'Nestable',
        'N',
        'ipfs://collection-meta',
        10000,
        ADDRESS_ZERO,
        0,
      ])
    ))
  );
}

async function nestableMultiAssetFixture(): Promise<RMRKNestableMultiAssetPreMint> {
  return <RMRKNestableMultiAssetPreMint>(
    (<unknown>(
      await singleFixtureWithArgs('RMRKNestableMultiAssetPreMint', [
        'NestableMultiAsset',
        'NMA',
        'ipfs://collection-meta',
        10000,
        ADDRESS_ZERO,
        0,
      ])
    ))
  );
}

async function equippableFixture(): Promise<RMRKEquippablePreMint> {
  return <RMRKEquippablePreMint>(
    (<unknown>(
      await singleFixtureWithArgs('RMRKEquippablePreMint', [
        'Equippable',
        'EQ',
        'ipfs://collection-meta',
        10000,
        ADDRESS_ZERO,
        0,
      ])
    ))
  );
}

describe('MultiAssetPreMint Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(multiAssetFixture);
  });

  shouldControlValidPreMinting();
});

describe('NestablePreMint Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(nestableFixture);
  });

  shouldControlValidPreMinting();
});

describe('NestableMultiAssetPreMint Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(nestableMultiAssetFixture);
  });

  shouldControlValidPreMinting();
});

describe('EquippablePreMint Minting', async () => {
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
      this.token.connect(notOwner).mint(await notOwner.getAddress(), 1, 'ipfs://tokenURI'),
    ).to.be.revertedWithCustomError(this.token, 'RMRKNotOwnerOrContributor');
  });

  it('can mint if owner', async function () {
    await expect(this.token.connect(owner).mint(addrs[0].address, 1, 'ipfs://tokenURI')).to.be.emit(
      this.token,
      'Transfer',
    );
  });

  it('cannot mint 0 units', async function () {
    await expect(
      this.token.mint(addrs[0].address, 0, 'ipfs://tokenURI'),
    ).to.be.revertedWithCustomError(this.token, 'RMRKMintZero');
  });

  it('cannot mint over max supply', async function () {
    await expect(
      this.token.connect(owner).mint(addrs[0].address, 99999, 'ipfs://tokenURI'),
    ).to.be.revertedWithCustomError(this.token, 'RMRKMintOverMax');
  });

  it('reduces total supply on burn', async function () {
    await this.token.connect(owner).mint(await owner.getAddress(), 1, 'ipfs://tokenURI');
    const tokenId = this.token.totalSupply();
    expect(await tokenId).to.equal(1);
    await this.token.connect(owner)['burn(uint256)'](tokenId);
    expect(await this.token.totalSupply()).to.equal(0);
  });

  it('reduces total supply on burn and does not reuse ID', async function () {
    let tx = await this.token.connect(owner).mint(await owner.getAddress(), 1, 'ipfs://tokenURI');
    const tokenId = await getTokenIdFromTx(tx);
    await this.token.connect(owner)['burn(uint256)'](tokenId);

    tx = await this.token.connect(owner).mint(await owner.getAddress(), 1, 'ipfs://tokenURI');
    const newTokenId = await getTokenIdFromTx(tx);

    expect(newTokenId).to.equal(tokenId + 1n);
    expect(await this.token.totalSupply()).to.equal(1);
  });

  describe('Nest minting', async () => {
    beforeEach(async function () {
      if (this.token.nestMint === undefined) {
        this.skip();
      }
      this.token.connect(owner).mint(addrs[0].address, 1, 'ipfs://tokenURI');
    });

    it('cannot nest mint if not owner', async function () {
      const notOwner = addrs[0];
      await expect(
        this.token
          .connect(notOwner)
          .nestMint(await this.token.getAddress(), 1, 1, 'ipfs://tokenURI'),
      ).to.be.revertedWithCustomError(this.token, 'RMRKNotOwnerOrContributor');
    });

    it('can nest mint if owner', async function () {
      this.token.connect(owner).mint(addrs[0].address, 1, 'ipfs://tokenURI');
      await this.token
        .connect(owner)
        .nestMint(await this.token.getAddress(), 1, 1, 'ipfs://tokenURI');
    });

    it('cannot nest mint over max supply', async function () {
      await expect(
        this.token
          .connect(owner)
          .nestMint(await this.token.getAddress(), 99999, 1, 'ipfs://tokenURI'),
      ).to.be.revertedWithCustomError(this.token, 'RMRKMintOverMax');
    });
  });
}
