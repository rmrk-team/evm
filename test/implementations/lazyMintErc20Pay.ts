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
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = <ERC20Mock>await erc20Factory.deploy();
  await erc20.deployed();

  return await singleFixtureWithArgs('RMRKMultiAssetImplErc20Pay', [
    'MultiAsset',
    'MA',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [erc20.address, false, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

async function nestableFixture(): Promise<Contract> {
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = <ERC20Mock>await erc20Factory.deploy();
  await erc20.deployed();

  return await singleFixtureWithArgs('RMRKNestableImplErc20Pay', [
    'MultiAsset',
    'MA',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [erc20.address, false, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

async function nestableMultiAssetFixture(): Promise<Contract> {
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = <ERC20Mock>await erc20Factory.deploy();
  await erc20.deployed();

  return await singleFixtureWithArgs('RMRKNestableMultiAssetImplErc20Pay', [
    'MultiAsset',
    'MA',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [erc20.address, false, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
}

async function equippableFixture(): Promise<Contract> {
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = await erc20Factory.deploy();
  await erc20.deployed();

  return await singleFixtureWithArgs('RMRKEquippableImplErc20Pay', [
    'MultiAsset',
    'MA',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [erc20.address, false, ADDRESS_ZERO, 0, 10000, ONE_ETH],
  ]);
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
    await expect(this.token.mint(addrs[0].address, 1)).to.be.revertedWith(
      'ERC20: insufficient allowance',
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

  it('cannot mint if locked', async function () {
    await this.token.setLock();
    await expect(this.token.mint(addrs[0].address, 99999)).to.be.revertedWithCustomError(
      this.token,
      'RMRKLocked',
    );
  });

  it('can mint tokens through sale logic', async function () {
    await mintFromImplErc20Pay(this.token, addrs[0].address);
    expect(await this.token.ownerOf(1)).to.equal(addrs[0].address);
    expect(await this.token.totalSupply()).to.equal(1);
    expect(await this.token.balanceOf(addrs[0].address)).to.equal(1);
  });

  it('reduces total supply on burn', async function () {
    const tokenId = await mintFromImplErc20Pay(this.token, addrs[0].address);
    await this.token.connect(addrs[0])['burn(uint256)'](tokenId);
    expect(await this.token.totalSupply()).to.equal(0);
  });

  it('reduces total supply on burn and does not reuse Id', async function () {
    const tokenId = await mintFromImplErc20Pay(this.token, addrs[0].address);
    await this.token.connect(addrs[0])['burn(uint256)'](tokenId);

    const newTokenId = await mintFromImplErc20Pay(this.token, addrs[0].address);
    expect(newTokenId).to.equal(tokenId.add(1));
    expect(await this.token.totalSupply()).to.equal(1);
  });

  it('can mint multiple tokens through sale logic', async function () {
    await erc20.mint(addrs[0].address, ONE_ETH.mul(10));
    await erc20.connect(addrs[0]).approve(this.token.address, ONE_ETH.mul(10));

    await this.token.connect(addrs[0]).mint(addrs[0].address, 10);
    expect(await this.token.totalSupply()).to.equal(10);
    expect(await this.token.balanceOf(addrs[0].address)).to.equal(10);

    await expect(this.token.connect(addrs[0]).mint(addrs[0].address, 1)).to.be.revertedWith(
      'ERC20: insufficient allowance',
    );
  });

  describe('Nest minting', async () => {
    let parentId: number;

    beforeEach(async function () {
      if (this.token.nestMint === undefined) {
        this.skip();
      }
      parentId = await mintFromImplErc20Pay(this.token, addrs[0].address);
    });

    it('can nest mint tokens through sale logic', async function () {
      const childId = await nestMintFromImplErc20Pay(this.token, this.token.address, parentId);
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
