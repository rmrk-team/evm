import { Contract } from 'ethers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import shouldBehaveLikeMultiAsset from '../behavior/multiasset';
import shouldControlValidMinting from '../behavior/mintingImpl';
import shouldHaveMetadata from '../behavior/metadata';
import shouldHaveRoyalties from '../behavior/royalties';
import {
  addAssetEntryEquippablesFromImpl,
  addAssetToToken,
  ADDRESS_ZERO,
  mintFromImpl,
  ONE_ETH,
} from '../utils';

// --------------- FIXTURES -----------------------

async function equipFixture() {
  const nestableFactory = await ethers.getContractFactory('RMRKNestableExternalEquipImpl');
  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipImpl');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const nestable = await nestableFactory.deploy(
    'NestableWithEquippable',
    'NWE',
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    1000, // 10%
  );
  await nestable.deployed();

  const equip = await equipFactory.deploy(nestable.address);
  await equip.deployed();

  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  await nestable.setEquippableAddress(equip.address);

  return { nestable, equip, renderUtils };
}

// --------------- END FIXTURES -----------------------

// --------------- MULTI ASSET BEHAVIOR -----------------------

describe('ExternalEquippableImpl MR behavior', async () => {
  let nestable: Contract;
  let equip: Contract;
  let renderUtils: Contract;

  beforeEach(async function () {
    ({ nestable, equip, renderUtils } = await loadFixture(equipFixture));
    this.token = equip;
    this.renderUtils = renderUtils;
  });

  // Mint needs to happen on the nestable contract, but the MR behavior happens on the equip one.
  async function mintToNestable(token: Contract, to: string): Promise<number> {
    await nestable.mint(to, 1, { value: ONE_ETH });
    return await nestable.totalSupply();
  }

  shouldBehaveLikeMultiAsset(mintToNestable, addAssetEntryEquippablesFromImpl, addAssetToToken);
});

// --------------- MULTI ASSET BEHAVIOR END ------------------------

describe('ExternalEquippableImpl Other', async function () {
  let nestable: Contract;
  let equip: Contract;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    ({ nestable, equip } = await loadFixture(equipFixture));
    this.token = nestable;
    owner = (await ethers.getSigners())[0];
  });

  it('auto accepts resource if send is token owner', async function () {
    await nestable.connect(owner).mint(owner.address, 1, { value: ONE_ETH.mul(1) });
    await equip.connect(owner).addAssetEntry(0, ADDRESS_ZERO, 'ipfs://test', []);
    const assetId = await equip.totalAssets();
    const tokenId = await nestable.totalSupply();
    await equip.connect(owner).addAssetToToken(tokenId, assetId, 0);

    expect(await equip.getPendingAssets(tokenId)).to.be.eql([]);
    expect(await equip.getActiveAssets(tokenId)).to.be.eql([assetId]);
  });

  shouldControlValidMinting();
  shouldHaveRoyalties(mintFromImpl);
  shouldHaveMetadata(mintFromImpl);
});
