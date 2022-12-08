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
import { ERC20Mock, RMRKMultiAssetImplErc20Pay } from '../../typechain-types';

const isTokenUriEnumerated = false;
const lazyMintingEnabled = true;

async function multiAssetFixture(): Promise<Contract> {
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = <ERC20Mock>await erc20Factory.deploy();
  await erc20.deployed();

  return await singleFixtureWithArgs('RMRKMultiAssetImplErc20Pay', [
    'MultiAsset',
    'MR',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [erc20.address, isTokenUriEnumerated, lazyMintingEnabled, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

async function nestableFixture(): Promise<Contract> {
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = <ERC20Mock>await erc20Factory.deploy();
  await erc20.deployed();

  return await singleFixtureWithArgs('RMRKNestableImplErc20Pay', [
    'MultiAsset',
    'MR',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [erc20.address, isTokenUriEnumerated, lazyMintingEnabled, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

async function nestableMultiAssetFixture(): Promise<Contract> {
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = <ERC20Mock>await erc20Factory.deploy();
  await erc20.deployed();

  return await singleFixtureWithArgs('RMRKNestableMultiAssetImplErc20Pay', [
    'MultiAsset',
    'MR',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [erc20.address, isTokenUriEnumerated, lazyMintingEnabled, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

async function equippableFixture(): Promise<Contract> {
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = await erc20Factory.deploy();
  await erc20.deployed();

  return await singleFixtureWithArgs('RMRKEquippableImplErc20Pay', [
    'MultiAsset',
    'MR',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [erc20.address, isTokenUriEnumerated, lazyMintingEnabled, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

async function lazyMintingDisabledFixture(): Promise<{
  token: RMRKMultiAssetImplErc20Pay;
  erc20: ERC20Mock;
}> {
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = <ERC20Mock>await erc20Factory.deploy();
  await erc20.deployed();

  const lazyMintingEnabled = false; // Shadows module lazyMintingEnabled
  const token = <RMRKMultiAssetImplErc20Pay>(
    await singleFixtureWithArgs('RMRKMultiAssetImplErc20Pay', [
      'MultiAsset',
      'MR',
      'ipfs://collection-meta',
      'ipfs://tokenURI',
      [erc20.address, isTokenUriEnumerated, lazyMintingEnabled, ADDRESS_ZERO, 0, 10000, ONE_ETH],
    ])
  );
  return { token, erc20 };
}

describe('MultiAssetImplErc20Pay Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(multiAssetFixture);
  });

  shouldControlValidMintingErc20Pay();
});

describe('NestableImplErc20Pay Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(nestableFixture);
  });

  shouldControlValidMintingErc20Pay();
});

describe('NestableMultiAssetImplErc20Pay Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(nestableMultiAssetFixture);
  });

  shouldControlValidMintingErc20Pay();
});

describe('EquippableImplErc20Pay Minting', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(equippableFixture);
  });

  shouldControlValidMintingErc20Pay();
});

describe('Lazy Minting Disabled', async () => {
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let erc20: ERC20Mock;
  let token: RMRKMultiAssetImplErc20Pay;

  beforeEach(async function () {
    [owner, ...addrs] = await ethers.getSigners();
    ({ token, erc20 } = await loadFixture(lazyMintingDisabledFixture));
  });

  it('can get lazy minting enabled value', async function () {
    expect(await token.lazyMintingEnabled()).to.equal(false);
  });

  it('cannot mint if not owner', async function () {
    const notOwner = addrs[0];
    await erc20.mint(notOwner.address, ONE_ETH);
    await erc20.approve(token.address, ONE_ETH);
    await expect(token.connect(notOwner).mint(notOwner.address, 1)).to.be.revertedWithCustomError(
      token,
      'RMRKMintOnlyAllowedByOwner',
    );
  });

  it('can mint if owner', async function () {
    await erc20.mint(owner.address, ONE_ETH);
    await erc20.approve(token.address, ONE_ETH);
    await expect(token.connect(owner).mint(owner.address, 1))
      .to.emit(token, 'Transfer')
      .withArgs(ADDRESS_ZERO, owner.address, 1);
  });
});

async function shouldControlValidMintingErc20Pay(): Promise<void> {
  let addrs: SignerWithAddress[];
  let erc20: ERC20Mock;

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;
    const erc20Address = this.token.erc20TokenAddress();
    const erc20Factory = await ethers.getContractFactory('ERC20Mock');
    erc20 = <ERC20Mock>erc20Factory.attach(erc20Address);
  });

  it('cannot mint under price', async function () {
    const HALF_ETH = ethers.utils.parseEther('0.05');

    await erc20.mint(addrs[0].address, ONE_ETH);
    await erc20.approve(this.token.address, HALF_ETH);
    await expect(this.token.mint(addrs[0].address, 1)).to.be.revertedWithCustomError(
      this.token,
      'RMRKNotEnoughAllowance',
    );
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
    await mintFromImplErc20Pay(this.token, addrs[0].address);
    expect(await this.token.ownerOf(1)).to.equal(addrs[0].address);
    expect(await this.token.totalSupply()).to.equal(1);
    expect(await this.token.balanceOf(addrs[0].address)).to.equal(1);
  });

  it('can mint multiple tokens through sale logic', async function () {
    await erc20.mint(addrs[0].address, ONE_ETH.mul(10));
    await erc20.connect(addrs[0]).approve(this.token.address, ONE_ETH.mul(10));

    await this.token.connect(addrs[0]).mint(addrs[0].address, 10);
    expect(await this.token.totalSupply()).to.equal(10);
    expect(await this.token.balanceOf(addrs[0].address)).to.equal(10);

    await expect(
      this.token.connect(addrs[0]).mint(addrs[0].address, 1),
    ).to.be.revertedWithCustomError(this.token, 'RMRKNotEnoughAllowance');
  });

  it('can nest mint tokens through sale logic', async function () {
    if (this.token.nestMint === undefined) {
      this.skip();
    }
    const parentId = await mintFromImplErc20Pay(this.token, addrs[0].address);
    const childId = await nestMintFromImplErc20Pay(this.token, this.token.address, parentId);
    expect(await this.token.ownerOf(childId)).to.equal(addrs[0].address);
    expect(await this.token.totalSupply()).to.equal(2);
  });
}
