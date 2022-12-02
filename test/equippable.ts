import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
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
  RMRKBaseStorageMock,
  RMRKEquippableMock,
  RMRKEquipRenderUtils,
  RMRKMultiAssetRenderUtils,
} from '../typechain-types';
// --------------- FIXTURES -----------------------

async function partsFixture() {
  const baseSymbol = 'NCB';
  const baseType = 'mixed';

  const neonName = 'NeonCrisis';
  const neonSymbol = 'NC';

  const maskName = 'NeonMask';
  const maskSymbol = 'NM';

  const baseFactory = await ethers.getContractFactory('RMRKBaseStorageMock');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // Base
  const base = <RMRKBaseStorageMock>await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Neon token
  const neon = <RMRKEquippableMock>await equipFactory.deploy(neonName, neonSymbol);
  await neon.deployed();

  // Weapon
  const mask = <RMRKEquippableMock>await equipFactory.deploy(maskName, maskSymbol);
  await mask.deployed();

  // View
  const view = <RMRKEquipRenderUtils>await viewFactory.deploy();
  await view.deployed();

  await setupContextForParts(base, neon, neon, mask, mask, mintFromMock, nestMintFromMock);
  return { base, neon, mask, view };
}

async function slotsFixture() {
  const baseSymbol = 'SSB';
  const baseType = 'mixed';

  const soldierName = 'SnakeSoldier';
  const soldierSymbol = 'SS';

  const weaponName = 'SnakeWeapon';
  const weaponSymbol = 'SW';

  const weaponGemName = 'SnakeWeaponGem';
  const weaponGemSymbol = 'SWG';

  const backgroundName = 'SnakeBackground';
  const backgroundSymbol = 'SB';

  const baseFactory = await ethers.getContractFactory('RMRKBaseStorageMock');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // View
  const view = <RMRKEquipRenderUtils>await viewFactory.deploy();
  await view.deployed();

  // Base
  const base = <RMRKBaseStorageMock>await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Soldier token
  const soldier = <RMRKEquippableMock>await equipFactory.deploy(soldierName, soldierSymbol);
  await soldier.deployed();

  // Weapon
  const weapon = <RMRKEquippableMock>await equipFactory.deploy(weaponName, weaponSymbol);
  await weapon.deployed();

  // Weapon Gem
  const weaponGem = <RMRKEquippableMock>await equipFactory.deploy(weaponGemName, weaponGemSymbol);
  await weaponGem.deployed();

  // Background
  const background = <RMRKEquippableMock>(
    await equipFactory.deploy(backgroundName, backgroundSymbol)
  );
  await background.deployed();

  await setupContextForSlots(
    base,
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

  return { base, soldier, weapon, weaponGem, background, view };
}

async function assetsFixture() {
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const equip = <RMRKEquippableMock>await equipFactory.deploy('Chunky', 'CHNK');
  await equip.deployed();

  const renderUtils = <RMRKMultiAssetRenderUtils>await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  return { equip, renderUtils };
}

async function multiAssetFixture() {
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const equip = <RMRKEquippableMock>await equipFactory.deploy('equipWithEquippable', 'NWE');
  await equip.deployed();

  const renderUtils = <RMRKMultiAssetRenderUtils>await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  return { equip, renderUtils };
}

// --------------- END FIXTURES -----------------------

// --------------- EQUIPPABLE BEHAVIOR -----------------------

describe('EquippableMock with Parts', async () => {
  beforeEach(async function () {
    const { base, neon, mask, view } = await loadFixture(partsFixture);

    this.base = base;
    this.neon = neon;
    this.neonEquip = neon;
    this.mask = mask;
    this.maskEquip = mask;
    this.view = view;
  });

  shouldBehaveLikeEquippableWithParts();
});

describe('EquippableMock with Slots', async () => {
  beforeEach(async function () {
    const { base, soldier, weapon, weaponGem, background, view } = await loadFixture(slotsFixture);

    this.base = base;
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

describe('EquippableMock Assets', async () => {
  beforeEach(async function () {
    const { equip, renderUtils } = await loadFixture(assetsFixture);
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

// --------------- END EQUIPPABLE BEHAVIOR -----------------------

// --------------- MULTI ASSET BEHAVIOR -----------------------

describe('EquippableMock MR behavior', async () => {
  let nextTokenId = 1;
  let equip: RMRKEquippableMock;
  let renderUtils: RMRKMultiAssetRenderUtils;

  beforeEach(async function () {
    ({ equip, renderUtils } = await loadFixture(multiAssetFixture));
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

// --------------- MULTI ASSET BEHAVIOR END ------------------------
