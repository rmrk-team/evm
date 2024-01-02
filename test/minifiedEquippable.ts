// Note: This is just a copy of the equippable test suit with the additional tests
// for ERC721 and nestable behavior, but using MinifiedEquippable instead.

import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  addAssetEntryEquippablesFromMock,
  addAssetToToken,
  mintFromMock,
  nestMintFromMock,
  nestTransfer,
  parentChildFixtureWithArgs,
  transfer,
} from './utils';
import { setupContextForParts } from './setup/equippableParts';
import { setupContextForSlots } from './setup/equippableSlots';
import shouldBehaveLikeEquippableAssets from './behavior/equippableAssets';
import shouldBehaveLikeEquippableWithParts from './behavior/equippableParts';
import shouldBehaveLikeEquippableWithSlots from './behavior/equippableSlots';
import shouldBehaveLikeNestable from './behavior/nestable';
import shouldBehaveLikeMultiAsset from './behavior/multiasset';
import shouldBehaveLikeERC721 from './behavior/erc721';
import {
  RMRKCatalogImpl,
  RMRKMinifiedEquippableMock,
  RMRKEquipRenderUtils,
  RMRKMultiAssetRenderUtils,
} from '../typechain-types';
// --------------- FIXTURES -----------------------

async function partsFixture() {
  const catalogSymbol = 'NCC';
  const catalogType = 'mixed';

  const neonName = 'NeonCrisis';
  const neonSymbol = 'NC';

  const maskName = 'NeonMask';
  const maskSymbol = 'NM';

  const catalogFactory = await ethers.getContractFactory('RMRKCatalogImpl');
  const equipFactory = await ethers.getContractFactory('RMRKMinifiedEquippableMock');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // Catalog
  const catalog = <RMRKCatalogImpl>await catalogFactory.deploy(catalogSymbol, catalogType);
  await catalog.deployed();

  // Neon token
  const neon = <RMRKMinifiedEquippableMock>await equipFactory.deploy();
  await neon.deployed();

  // Weapon
  const mask = <RMRKMinifiedEquippableMock>await equipFactory.deploy();
  await mask.deployed();

  // View
  const view = <RMRKEquipRenderUtils>await viewFactory.deploy();
  await view.deployed();

  await setupContextForParts(catalog, neon, mask, mintFromMock, nestMintFromMock);
  return { catalog, neon, mask, view };
}

async function slotsFixture() {
  const catalogSymbol = 'SSC';
  const catalogType = 'mixed';

  const catalogFactory = await ethers.getContractFactory('RMRKCatalogImpl');
  const equipFactory = await ethers.getContractFactory('RMRKMinifiedEquippableMock');
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
  const soldier = <RMRKMinifiedEquippableMock>await equipFactory.deploy();
  await soldier.deployed();

  // Weapon
  const weapon = <RMRKMinifiedEquippableMock>await equipFactory.deploy();
  await weapon.deployed();

  // Weapon Gem
  const weaponGem = <RMRKMinifiedEquippableMock>await equipFactory.deploy();
  await weaponGem.deployed();

  // Background
  const background = <RMRKMinifiedEquippableMock>await equipFactory.deploy();
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
  const equipFactory = await ethers.getContractFactory('RMRKMinifiedEquippableMock');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const equip = <RMRKMinifiedEquippableMock>await equipFactory.deploy();
  await equip.deployed();

  const renderUtils = <RMRKMultiAssetRenderUtils>await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  return { equip, renderUtils };
}

async function parentChildFixture(): Promise<{ parent: Contract; child: Contract }> {
  return parentChildFixtureWithArgs('RMRKMinifiedEquippableMock', [], []);
}

// --------------- END FIXTURES -----------------------

describe('MinifiedEquippableMock with Fixed Parts', async () => {
  beforeEach(async function () {
    const { catalog, neon, mask, view } = await loadFixture(partsFixture);

    this.catalog = catalog;
    this.neon = neon;
    this.mask = mask;
    this.view = view;
  });

  shouldBehaveLikeEquippableWithParts();
});

describe('MinifiedEquippableMock with Slot Parts', async () => {
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

describe('MinifiedEquippableMock Equippable Assets behavior', async () => {
  beforeEach(async function () {
    const { equip, renderUtils } = await loadFixture(equippableFixture);
    this.nestable = equip;
    this.equip = equip;
    this.renderUtils = renderUtils;
  });

  shouldBehaveLikeEquippableAssets(mintFromMock);
});

// --------------- MULTI ASSET BEHAVIOR -----------------------

describe('MinifiedEquippableMock MA behavior', async () => {
  let nextTokenId = 1;
  let equip: RMRKMinifiedEquippableMock;
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

describe('MinifiedEquippableMock ERC721 behavior', function () {
  beforeEach(async function () {
    const { equip } = await loadFixture(equippableFixture);
    this.token = equip;
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
  });

  shouldBehaveLikeERC721('Chunky', 'CHNK');
});

describe('MinifiedEquippableMock Nestable Behavior', function () {
  beforeEach(async function () {
    const { parent, child } = await loadFixture(parentChildFixture);
    this.parentToken = parent;
    this.childToken = child;
  });

  shouldBehaveLikeNestable(mintFromMock, nestMintFromMock, transfer, nestTransfer);
});
