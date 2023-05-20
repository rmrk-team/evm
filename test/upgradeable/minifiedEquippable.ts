// Note: This is just a copy of the equippable test suit with the additional tests
// for ERC721 and nestable behavior, but using MinifiedEquippable instead.

import { Contract } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  addAssetEntryEquippablesFromMock,
  addAssetToToken,
  mintFromMock,
  nestMintFromMock,
  nestTransfer,
  parentChildFixtureWithArgs,
  transfer,
} from '../utils';
import { setupContextForParts } from './setup/equippablePartsUpgradeable';
import { setupContextForSlots } from './setup/equippableSlots';
import shouldBehaveLikeEquippableAssets from './behavior/equippableAssets';
import shouldBehaveLikeEquippableWithParts from './behavior/equippableParts';
import shouldBehaveLikeEquippableWithSlots from './behavior/equippableSlots';
import shouldBehaveLikeNestable from './behavior/nestable';
import shouldBehaveLikeMultiAsset from './behavior/multiasset';
import shouldBehaveLikeERC721 from './behavior/erc721';
import {
  RMRKCatalogMockUpgradeable,
  RMRKMinifiedEquippableMockUpgradeable,
  RMRKEquipRenderUtils,
  RMRKMultiAssetRenderUtils,
} from '../../typechain-types';
// --------------- FIXTURES -----------------------

async function partsFixture() {
  const catalogSymbol = 'NCC';
  const catalogType = 'mixed';

  const neonName = 'NeonCrisis';
  const neonSymbol = 'NC';

  const maskName = 'NeonMask';
  const maskSymbol = 'NM';

  const catalogFactory = await ethers.getContractFactory('RMRKCatalogMockUpgradeable');
  const equipFactory = await ethers.getContractFactory('RMRKMinifiedEquippableMockUpgradeable');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // Catalog
  const catalog = <RMRKCatalogMockUpgradeable>await upgrades.deployProxy(catalogFactory, [catalogSymbol, catalogType]);
  await catalog.deployed();

  // Neon token
  const neon = <RMRKMinifiedEquippableMockUpgradeable>await upgrades.deployProxy(equipFactory, [neonName, neonSymbol]);
  await neon.deployed();

  // Weapon
  const mask = <RMRKMinifiedEquippableMockUpgradeable>await upgrades.deployProxy(equipFactory, [maskName, maskSymbol]);
  await mask.deployed();

  // View
  const view = <RMRKEquipRenderUtils>await viewFactory.deploy();
  await view.deployed();

  await setupContextForParts(catalog, neon, neon, mask, mask, mintFromMock, nestMintFromMock);
  return { catalog, neon, mask, view };
}

async function slotsFixture() {
  const catalogSymbol = 'SSC';
  const catalogType = 'mixed';

  const soldierName = 'SnakeSoldier';
  const soldierSymbol = 'SS';

  const weaponName = 'SnakeWeapon';
  const weaponSymbol = 'SW';

  const weaponGemName = 'SnakeWeaponGem';
  const weaponGemSymbol = 'SWG';

  const backgroundName = 'SnakeBackground';
  const backgroundSymbol = 'SB';

  const catalogFactory = await ethers.getContractFactory('RMRKCatalogMockUpgradeable');
  const equipFactory = await ethers.getContractFactory('RMRKMinifiedEquippableMockUpgradeable');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // View
  const view = <RMRKEquipRenderUtils>await viewFactory.deploy();
  await view.deployed();

  // catalog
  const catalog = <RMRKCatalogMockUpgradeable>await upgrades.deployProxy(catalogFactory, [catalogSymbol, catalogType]);
  await catalog.deployed();

  // Soldier token
  const soldier = <RMRKMinifiedEquippableMockUpgradeable>await upgrades.deployProxy(equipFactory, [soldierName, soldierSymbol]);
  await soldier.deployed();

  // Weapon
  const weapon = <RMRKMinifiedEquippableMockUpgradeable>await upgrades.deployProxy(equipFactory, [weaponName, weaponSymbol]);
  await weapon.deployed();

  // Weapon Gem
  const weaponGem = <RMRKMinifiedEquippableMockUpgradeable>(
    await upgrades.deployProxy(equipFactory, [weaponGemName, weaponGemSymbol])
  );
  await weaponGem.deployed();

  // Background
  const background = <RMRKMinifiedEquippableMockUpgradeable>(
    await upgrades.deployProxy(equipFactory, [backgroundName, backgroundSymbol])
  );
  await background.deployed();

  await setupContextForSlots(
    catalog,
    soldier,
    soldier,
    weapon,
    weapon,
    weaponGem,
    weaponGem,
    background,
    background,
    mintFromMock,
    nestMintFromMock,
  );

  return { catalog, soldier, weapon, weaponGem, background, view };
}

async function equippableFixture() {
  const equipFactory = await ethers.getContractFactory('RMRKMinifiedEquippableMockUpgradeable');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const equip = <RMRKMinifiedEquippableMockUpgradeable>await upgrades.deployProxy(equipFactory, ['Chunky', 'CHNK']);
  await equip.deployed();

  const renderUtils = <RMRKMultiAssetRenderUtils>await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  return { equip, renderUtils };
}

async function parentChildFixture(): Promise<{ parent: Contract; child: Contract }> {
  return parentChildFixtureWithArgs(
    'RMRKMinifiedEquippableMock',
    ['Chunky', 'CHNK'],
    ['Monkey', 'MONK'],
  );
}

// --------------- END FIXTURES -----------------------

describe('MinifiedEquippableMock with Fixed Parts', async () => {
  beforeEach(async function () {
    const { catalog, neon, mask, view } = await loadFixture(partsFixture);

    this.catalog = catalog;
    this.neon = neon;
    this.neonEquip = neon;
    this.mask = mask;
    this.maskEquip = mask;
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
    this.soldierEquip = soldier;
    this.weapon = weapon;
    this.weaponEquip = weapon;
    this.weaponGem = weaponGem;
    this.weaponGemEquip = weaponGem;
    this.background = background;
    this.backgroundEquip = background;
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

  describe('Init', async function () {
    it('can get names and symbols', async function () {
      expect(await this.equip.name()).to.equal('Chunky');
      expect(await this.equip.symbol()).to.equal('CHNK');
    });
  });

  shouldBehaveLikeEquippableAssets(mintFromMock);
});

// --------------- MULTI ASSET BEHAVIOR -----------------------

describe('MinifiedEquippableMock MA behavior', async () => {
  let nextTokenId = 1;
  let equip: RMRKMinifiedEquippableMockUpgradeable;
  let renderUtils: RMRKMultiAssetRenderUtils;

  beforeEach(async function () {
    ({ equip, renderUtils } = await loadFixture(equippableFixture));
    this.token = equip;
    this.renderUtils = renderUtils;
  });

  async function mintToNestable(token: Contract, to: string): Promise<number> {
    const tokenId = nextTokenId;
    nextTokenId++;
    await equip.mint(to, tokenId);
    return tokenId;
  }

  shouldBehaveLikeMultiAsset(mintToNestable, addAssetEntryEquippablesFromMock, addAssetToToken);
});

describe('MinifiedEquippableMock ERC721 behavior', function () {
  beforeEach(async function () {
    const { equip } = await loadFixture(equippableFixture);
    this.token = equip;
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMockUpgradable');
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
