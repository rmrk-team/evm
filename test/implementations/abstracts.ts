import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ADDRESS_ZERO, ONE_ETH, singleFixtureWithArgs } from '../utils';
import { BigNumber, Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

// We'll use premint implementations to test the core functionality on abstracts,
// except for external equip which is only available as lazy mint with native token

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

describe('MultiAssetImpl Abstract', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(multiAssetFixture);
  });

  shouldControlValidAssetsManagement();
});

describe('NestableImpl Abstract', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(nestableFixture);
  });
});

describe('NestableMultiAssetImpl Abstract', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(nestableMultiAssetFixture);
  });

  shouldControlValidAssetsManagement();
});

describe('EquippableImpl Abstract', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(equippableFixture);
  });

  shouldControlValidAssetsManagement();
  shouldControlValidEquippablesManagement();
});

async function shouldControlValidAssetsManagement(): Promise<void> {
  let owner: SignerWithAddress;
  let notOwner: SignerWithAddress;
  let contributor: SignerWithAddress;
  let tokenOwner: SignerWithAddress;

  beforeEach(async function () {
    [owner, notOwner, contributor, tokenOwner] = await ethers.getSigners();
    await this.token.connect(owner).mint(tokenOwner.address, 1);
    await this.token.connect(owner).addContributor(contributor.address);
  });

  it('cannot add asset if not owner or contributor', async function () {
    await expect(
      this.token.connect(notOwner).addAssetEntry('ipfs://someMeta'),
    ).to.be.revertedWithCustomError(this.token, 'RMRKNotOwnerOrContributor');
  });

  it('can add asset if owner', async function () {
    await this.token.connect(owner).addAssetEntry('ipfs://someMeta');
    expect(await this.token.ownerOf(1)).to.eql(tokenOwner.address);
  });

  it('can add asset if contributor', async function () {
    await this.token.connect(contributor).addAssetEntry('ipfs://someMeta');
    expect(await this.token.ownerOf(1)).to.eql(tokenOwner.address);
  });

  describe('With existing asset', async () => {
    beforeEach(async function () {
      await this.token.connect(owner).addAssetEntry('ipfs://someMeta');
    });

    it('cannot add asset to token if not owner or contributor', async function () {
      await expect(
        this.token.connect(notOwner).addAssetToToken(1, 1, 0),
      ).to.be.revertedWithCustomError(this.token, 'RMRKNotOwnerOrContributor');
    });

    it('can add asset to token if owner', async function () {
      await this.token.connect(owner).addAssetToToken(1, 1, 0);
      expect(await this.token.getPendingAssets(1)).to.eql([BigNumber.from(1)]);
    });

    it('can add asset to token if contributor', async function () {
      await this.token.connect(contributor).addAssetToToken(1, 1, 0);
      expect(await this.token.getPendingAssets(1)).to.eql([BigNumber.from(1)]);
    });
  });
}

async function shouldControlValidEquippablesManagement(): Promise<void> {
  let owner: SignerWithAddress;
  let notOwner: SignerWithAddress;
  let contributor: SignerWithAddress;
  let tokenOwner: SignerWithAddress;
  let catalog: SignerWithAddress;
  let parent: SignerWithAddress;

  beforeEach(async function () {
    [owner, notOwner, contributor, tokenOwner, catalog, parent] = await ethers.getSigners();
    await this.token.connect(owner).mint(tokenOwner.address, 1);
    await this.token.connect(owner).addContributor(contributor.address);
  });

  it('cannot add asset if not owner or contributor', async function () {
    await expect(
      this.token
        .connect(notOwner)
        .addEquippableAssetEntry(0, catalog.address, 'ipfs://someMeta', []),
    ).to.be.revertedWithCustomError(this.token, 'RMRKNotOwnerOrContributor');
  });

  it('can add asset if owner', async function () {
    await this.token
      .connect(owner)
      .addEquippableAssetEntry(0, catalog.address, 'ipfs://someMeta', []);
    expect(await this.token.ownerOf(1)).to.eql(tokenOwner.address);
  });

  it('can add asset if contributor', async function () {
    await this.token
      .connect(contributor)
      .addEquippableAssetEntry(0, catalog.address, 'ipfs://someMeta', []);
    expect(await this.token.ownerOf(1)).to.eql(tokenOwner.address);
  });

  it('cannot set valid parent for equipable group if not owner or contributor', async function () {
    await expect(
      this.token.connect(notOwner).setValidParentForEquippableGroup(1, parent.address, 1),
    ).to.be.revertedWithCustomError(this.token, 'RMRKNotOwnerOrContributor');
  });

  it('can set valid parent for equipable group if owner', async function () {
    await this.token.connect(owner).setValidParentForEquippableGroup(1, parent.address, 1);
    expect(await this.token.ownerOf(1)).to.eql(tokenOwner.address);
  });

  it('can set valid parent for equipable group if contributor', async function () {
    await this.token.connect(contributor).setValidParentForEquippableGroup(1, parent.address, 1);
    expect(await this.token.ownerOf(1)).to.eql(tokenOwner.address);
  });
}
