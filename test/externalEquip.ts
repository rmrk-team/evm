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
  RMRKCatalogMock,
  RMRKEquipRenderUtils,
  RMRKExternalEquipMock,
  RMRKMultiAssetRenderUtils,
  RMRKNestableExternalEquipMock,
} from '../typechain-types';

// --------------- FIXTURES -----------------------

async function partsFixture() {
  const catalogSymbol = 'NCB';
  const catalogType = 'mixed';

  const neonName = 'NeonCrisis';
  const neonSymbol = 'NC';

  const maskName = 'NeonMask';
  const maskSymbol = 'NM';

  const catalogFactory = await ethers.getContractFactory('RMRKCatalogMock');
  const nestableFactory = await ethers.getContractFactory('RMRKNestableExternalEquipMock');
  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipMock');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // Catalog
  const catalog = <RMRKCatalogMock>await catalogFactory.deploy(catalogSymbol, catalogType);
  await catalog.deployed();

  // Neon token
  const neon = <RMRKNestableExternalEquipMock>await nestableFactory.deploy(neonName, neonSymbol);
  await neon.deployed();

  // Neon Equip

  const neonEquip = <RMRKExternalEquipMock>await equipFactory.deploy(neon.address);
  await neonEquip.deployed();

  // View contract
  const view = <RMRKEquipRenderUtils>await viewFactory.deploy();
  await view.deployed();

  // Link nestable and equippable:
  await neonEquip.setNestableAddress(neon.address);
  await neon.setEquippableAddress(neonEquip.address);
  // Weapon
  const mask = await nestableFactory.deploy(maskName, maskSymbol);
  await mask.deployed();
  const maskEquip = await equipFactory.deploy(mask.address);
  await maskEquip.deployed();
  // Link nestable and equippable:
  await maskEquip.setNestableAddress(mask.address);
  await mask.setEquippableAddress(maskEquip.address);

  await setupContextForParts(
    catalog,
    neon,
    neonEquip,
    mask,
    maskEquip,
    mintFromMock,
    nestMintFromMock,
  );
  return { catalog, neon, neonEquip, mask, maskEquip, view };
}

async function slotsFixture() {
  const catalogSymbol = 'SSB';
  const catalogType = 'mixed';

  const soldierName = 'SnakeSoldier';
  const soldierSymbol = 'SS';

  const weaponName = 'SnakeWeapon';
  const weaponSymbol = 'SW';

  const weaponGemName = 'SnakeWeaponGem';
  const weaponGemSymbol = 'SWG';

  const backgroundName = 'SnakeBackground';
  const backgroundSymbol = 'SB';

  const catalogFactory = await ethers.getContractFactory('RMRKCatalogMock');
  const nestableFactory = await ethers.getContractFactory('RMRKNestableExternalEquipMock');
  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipMock');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // View
  const view = await viewFactory.deploy();
  await view.deployed();

  // catalog
  const catalog = <RMRKCatalogMock>await catalogFactory.deploy(catalogSymbol, catalogType);
  await catalog.deployed();

  // Soldier token
  const soldier = <RMRKNestableExternalEquipMock>(
    await nestableFactory.deploy(soldierName, soldierSymbol)
  );
  await soldier.deployed();
  const soldierEquip = <RMRKExternalEquipMock>await equipFactory.deploy(soldier.address);
  await soldierEquip.deployed();

  // Link nestable and equippable:
  await soldierEquip.setNestableAddress(soldier.address);
  await soldier.setEquippableAddress(soldierEquip.address);

  // Weapon
  const weapon = await nestableFactory.deploy(weaponName, weaponSymbol);
  await weapon.deployed();
  const weaponEquip = await equipFactory.deploy(weapon.address);
  await weaponEquip.deployed();
  // Link nestable and equippable:
  await weaponEquip.setNestableAddress(weapon.address);
  await weapon.setEquippableAddress(weaponEquip.address);

  // Weapon Gem
  const weaponGem = await nestableFactory.deploy(weaponGemName, weaponGemSymbol);
  await weaponGem.deployed();
  const weaponGemEquip = await equipFactory.deploy(weaponGem.address);
  await weaponGemEquip.deployed();
  // Link nestable and equippable:
  await weaponGemEquip.setNestableAddress(weaponGem.address);
  await weaponGem.setEquippableAddress(weaponGemEquip.address);

  // Background
  const background = await nestableFactory.deploy(backgroundName, backgroundSymbol);
  await background.deployed();
  const backgroundEquip = await equipFactory.deploy(background.address);
  await backgroundEquip.deployed();
  // Link nestable and equippable:
  await backgroundEquip.setNestableAddress(background.address);
  await background.setEquippableAddress(backgroundEquip.address);

  await setupContextForSlots(
    catalog,
    soldier,
    soldierEquip,
    weapon,
    weaponEquip,
    weaponGem,
    weaponGemEquip,
    background,
    backgroundEquip,
    mintFromMock,
    nestMintFromMock,
  );

  return {
    catalog,
    soldier,
    soldierEquip,
    weapon,
    weaponEquip,
    weaponGem,
    weaponGemEquip,
    background,
    backgroundEquip,
    view,
  };
}

async function assetsFixture() {
  const Nestable = await ethers.getContractFactory('RMRKNestableExternalEquipMock');
  const Equip = await ethers.getContractFactory('RMRKExternalEquipMock');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const nestable = await Nestable.deploy('Chunky', 'CHNK');
  await nestable.deployed();

  const equip = await Equip.deploy(nestable.address);
  await equip.deployed();

  await nestable.setEquippableAddress(equip.address);

  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  return { nestable, equip, renderUtils };
}

async function multiAssetFixture() {
  const NestableFactory = await ethers.getContractFactory('RMRKNestableExternalEquipMock');
  const EquipFactory = await ethers.getContractFactory('RMRKExternalEquipMock');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const nestable = <RMRKNestableExternalEquipMock>(
    await NestableFactory.deploy('NestableWithEquippable', 'NWE')
  );
  await nestable.deployed();

  const equip = <RMRKExternalEquipMock>await EquipFactory.deploy(nestable.address);
  await equip.deployed();

  const renderUtils = <RMRKMultiAssetRenderUtils>await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  await nestable.setEquippableAddress(equip.address);

  return { nestable, equip, renderUtils };
}

// --------------- END FIXTURES -----------------------

// --------------- EQUIPPABLE BEHAVIOR -----------------------

describe('ExternalEquippableMock with Parts', async () => {
  beforeEach(async function () {
    const { catalog, neon, neonEquip, mask, maskEquip, view } = await loadFixture(partsFixture);

    this.catalog = catalog;
    this.neon = neon;
    this.neonEquip = neonEquip;
    this.mask = mask;
    this.maskEquip = maskEquip;
    this.view = view;
  });

  shouldBehaveLikeEquippableWithParts();
});

describe('ExternalEquippableMock with Slots', async () => {
  beforeEach(async function () {
    const {
      catalog,
      soldier,
      soldierEquip,
      weapon,
      weaponEquip,
      weaponGem,
      weaponGemEquip,
      background,
      backgroundEquip,
      view,
    } = await loadFixture(slotsFixture);

    this.catalog = catalog;
    this.soldier = soldier;
    this.soldierEquip = soldierEquip;
    this.weapon = weapon;
    this.weaponEquip = weaponEquip;
    this.weaponGem = weaponGem;
    this.weaponGemEquip = weaponGemEquip;
    this.background = background;
    this.backgroundEquip = backgroundEquip;
    this.view = view;
  });

  shouldBehaveLikeEquippableWithSlots(nestMintFromMock);
});

describe('ExternalEquippableMock Assets', async () => {
  let nextTokenId = 1;
  let nestable: RMRKNestableExternalEquipMock;
  let equip: RMRKExternalEquipMock;
  let renderUtils: RMRKMultiAssetRenderUtils;

  beforeEach(async function () {
    ({ nestable, equip, renderUtils } = await loadFixture(assetsFixture));
    this.nestable = nestable;
    this.equip = equip;
    this.renderUtils = renderUtils;
  });

  describe('Init', async function () {
    it('can get names and symbols', async function () {
      expect(await this.nestable.name()).to.equal('Chunky');
      expect(await this.nestable.symbol()).to.equal('CHNK');
    });
  });

  describe('Linking', async function () {
    it('can set nestable/equippable addresses', async function () {
      expect(await this.nestable.setEquippableAddress(ethers.constants.AddressZero))
        .to.emit(this.nestable, 'EquippableAddressSet')
        .withArgs(this.equip.address, ethers.constants.AddressZero);

      expect(await this.equip.setNestableAddress(ethers.constants.AddressZero))
        .to.emit(this.equip, 'EquippableAddressSet')
        .withArgs(this.nestable.address, ethers.constants.AddressZero);
    });

    it('can get nestable address', async function () {
      expect(await this.equip.getNestableAddress()).to.eql(this.nestable.address);
      expect(await this.nestable.getEquippableAddress()).to.eql(this.equip.address);
    });
  });

  // Mint needs to happen on the nestable contract, but the MR behavior happens on the equip one.
  async function mintToNestable(token: Contract, to: string): Promise<number> {
    const tokenId = nextTokenId;
    nextTokenId++;
    await nestable.mint(to, tokenId);
    return tokenId;
  }

  shouldBehaveLikeEquippableAssets(mintToNestable);
});

// --------------- END EQUIPPABLE BEHAVIOR -----------------------

// --------------- MULTI ASSET BEHAVIOR -----------------------

describe('ExternalEquippableMock MR behavior', async () => {
  let nextTokenId = 1;
  let nestable: RMRKNestableExternalEquipMock;
  let equip: RMRKExternalEquipMock;
  let renderUtils: RMRKMultiAssetRenderUtils;

  beforeEach(async function () {
    ({ nestable, equip, renderUtils } = await loadFixture(multiAssetFixture));
    this.token = equip;
    this.renderUtils = renderUtils;
  });

  // Mint needs to happen on the nestable contract, but the MR behavior happens on the equip one.
  async function mintToNestable(token: Contract, to: string): Promise<number> {
    const tokenId = nextTokenId;
    nextTokenId++;
    await nestable.mint(to, tokenId);
    return tokenId;
  }

  shouldBehaveLikeMultiAsset(mintToNestable, addAssetEntryEquippablesFromMock, addAssetToToken);
});

// --------------- MULTI ASSET BEHAVIOR END ------------------------
