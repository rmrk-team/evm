import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  addAssetToToken,
  mintFromMock,
  nestMintFromMock,
  addAssetEntryEquippablesFromMock,
} from './utils';
import { setupContextForParts } from './setup/equippableParts';
import { setupContextForSlots } from './setup/equippableSlots';
import shouldBehaveLikeEquippableAssets from './behavior/equippableAssets';
import shouldBehaveLikeEquippableWithParts from './behavior/equippableParts';
import shouldBehaveLikeEquippableWithSlots from './behavior/equippableSlots';
import shouldBehaveLikeMultiAsset from './behavior/multiasset';
import {
  RMRKCatalogImpl,
  RMRKEquippableMock,
  RMRKEquipRenderUtils,
  RMRKMultiAssetRenderUtils,
} from '../typechain-types';
// --------------- FIXTURES -----------------------

async function partsFixture() {
  const catalogSymbol = 'NCB';
  const catalogType = 'mixed';

  const catalogFactory = await ethers.getContractFactory('RMRKCatalogImpl');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // Catalog
  const catalog = <RMRKCatalogImpl>await catalogFactory.deploy(catalogSymbol, catalogType);
  await catalog.deployed();

  // Neon token
  const neon = <RMRKEquippableMock>await equipFactory.deploy();
  await neon.deployed();

  // Weapon
  const mask = <RMRKEquippableMock>await equipFactory.deploy();
  await mask.deployed();

  // View
  const view = <RMRKEquipRenderUtils>await viewFactory.deploy();
  await view.deployed();

  await setupContextForParts(catalog, neon, mask, mintFromMock, nestMintFromMock);
  return { catalog, neon, mask, view };
}

async function slotsFixture() {
  const catalogSymbol = 'SSB';
  const catalogType = 'mixed';

  const catalogFactory = await ethers.getContractFactory('RMRKCatalogImpl');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // View
  const view = <RMRKEquipRenderUtils>await viewFactory.deploy();
  await view.deployed();

  // catalog
  const catalog = <RMRKCatalogImpl>await catalogFactory.deploy(catalogSymbol, catalogType);
  await catalog.deployed();
  const catalogForWeapon = <RMRKCatalogImpl>await catalogFactory.deploy(catalogSymbol, catalogType);
  await catalogForWeapon.deployed();

  // Soldier token
  const soldier = <RMRKEquippableMock>await equipFactory.deploy();
  await soldier.deployed();

  // Weapon
  const weapon = <RMRKEquippableMock>await equipFactory.deploy();
  await weapon.deployed();

  // Weapon Gem
  const weaponGem = <RMRKEquippableMock>await equipFactory.deploy();
  await weaponGem.deployed();

  // Background
  const background = <RMRKEquippableMock>await equipFactory.deploy();
  await background.deployed();

  await setupContextForSlots(
    catalog,
    catalogForWeapon,
    soldier,
    weapon,
    weaponGem,
    background,
    mintFromMock,
    nestMintFromMock,
  );

  return { catalog, soldier, weapon, weaponGem, background, view };
}

async function equippableFixture() {
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const equip = <RMRKEquippableMock>await equipFactory.deploy();
  await equip.deployed();

  const renderUtils = <RMRKMultiAssetRenderUtils>await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  return { equip, renderUtils };
}

// --------------- END FIXTURES -----------------------

// --------------- EQUIPPABLE BEHAVIOR -----------------------

describe('MinifiedEquippableMock with Parts', async () => {
  beforeEach(async function () {
    const { catalog, neon, mask, view } = await loadFixture(partsFixture);

    this.catalog = catalog;
    this.neon = neon;
    this.mask = mask;
    this.view = view;
  });

  shouldBehaveLikeEquippableWithParts();
});

describe('MinifiedEquippableMock with Slots', async () => {
  beforeEach(async function () {
    const { catalog, soldier, weapon, weaponGem, background, view } = await loadFixture(
      slotsFixture,
    );

    this.catalog = catalog;
    this.soldier = soldier;
    this.weapon = weapon;
    this.weaponGem = weaponGem;
    this.background = background;
    this.view = view;
  });

  shouldBehaveLikeEquippableWithSlots(nestMintFromMock);
});

describe('MinifiedEquippableMock Assets', async () => {
  beforeEach(async function () {
    const { equip, renderUtils } = await loadFixture(equippableFixture);
    this.nestable = equip;
    this.equip = equip;
    this.renderUtils = renderUtils;
  });

  shouldBehaveLikeEquippableAssets(mintFromMock);
});

// --------------- END EQUIPPABLE BEHAVIOR -----------------------

// --------------- MULTI ASSET BEHAVIOR -----------------------

describe('MinifiedEquippableMock MA behavior', async () => {
  let nextTokenId = 1;
  let equip: RMRKEquippableMock;
  let renderUtils: RMRKMultiAssetRenderUtils;

  beforeEach(async function () {
    ({ equip, renderUtils } = await loadFixture(equippableFixture));
    this.token = equip;
    this.renderUtils = renderUtils;
  });

  async function mintToNestable(token: Contract, to: string): Promise<BigNumber> {
    const tokenId = nextTokenId;
    nextTokenId++;
    await equip.mint(to, tokenId);
    return BigNumber.from(tokenId);
  }

  shouldBehaveLikeMultiAsset(mintToNestable, addAssetEntryEquippablesFromMock, addAssetToToken);
});

// --------------- MULTI ASSET BEHAVIOR END ------------------------
