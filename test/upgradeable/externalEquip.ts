import { Contract } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  addAssetToToken,
  mintFromMock,
  nestMintFromMock,
  addAssetEntryEquippablesFromMock,
} from '../utils';
import { setupContextForParts } from './setup/equippablePartsUpgradeable';
import { setupContextForSlots } from './setup/equippableSlots';
import shouldBehaveLikeEquippableAssets from './behavior/equippableAssets';
import shouldBehaveLikeEquippableWithParts from './behavior/equippableParts';
import shouldBehaveLikeEquippableWithSlots from './behavior/equippableSlots';
import shouldBehaveLikeMultiAsset from './behavior/multiasset';
import {
  RMRKCatalogMockUpgradeable,
  RMRKEquipRenderUtils,
  RMRKExternalEquipMockUpgradeable,
  RMRKMultiAssetRenderUtils,
  RMRKNestableExternalEquipMockUpgradeable,
} from '../../typechain-types';

// --------------- FIXTURES -----------------------

async function partsFixture() {
  const catalogSymbol = 'NCB';
  const catalogType = 'mixed';

  const neonName = 'NeonCrisis';
  const neonSymbol = 'NC';

  const maskName = 'NeonMask';
  const maskSymbol = 'NM';

  const catalogFactory = await ethers.getContractFactory('RMRKCatalogMockUpgradeable');
  const nestableFactory = await ethers.getContractFactory(
    'RMRKNestableExternalEquipMockUpgradeable',
  );
  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipMockUpgradeable');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // Catalog
  const catalog = <RMRKCatalogMockUpgradeable>(
    await upgrades.deployProxy(catalogFactory, [catalogSymbol, catalogType])
  );
  await catalog.deployed();

  // Neon token
  const neon = <RMRKNestableExternalEquipMockUpgradeable>(
    await upgrades.deployProxy(nestableFactory, [neonName, neonSymbol])
  );
  await neon.deployed();

  // Neon Equip

  const neonEquip = <RMRKExternalEquipMockUpgradeable>(
    await upgrades.deployProxy(equipFactory, [neon.address])
  );
  await neonEquip.deployed();

  // View contract
  const view = <RMRKEquipRenderUtils>await viewFactory.deploy();
  await view.deployed();

  // Link nestable and equippable:
  await neonEquip.setNestableAddress(neon.address);
  await neon.setEquippableAddress(neonEquip.address);
  // Weapon
  const mask = await upgrades.deployProxy(nestableFactory, [maskName, maskSymbol]);
  await mask.deployed();
  const maskEquip = await upgrades.deployProxy(equipFactory, [mask.address]);
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

  const catalogFactory = await ethers.getContractFactory('RMRKCatalogMockUpgradeable');
  const nestableFactory = await ethers.getContractFactory(
    'RMRKNestableExternalEquipMockUpgradeable',
  );
  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipMockUpgradeable');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // View
  const view = await viewFactory.deploy();
  await view.deployed();

  // catalog
  const catalog = <RMRKCatalogMockUpgradeable>(
    await upgrades.deployProxy(catalogFactory, [catalogSymbol, catalogType])
  );
  await catalog.deployed();

  // Soldier token
  const soldier = <RMRKNestableExternalEquipMockUpgradeable>(
    await upgrades.deployProxy(nestableFactory, [soldierName, soldierSymbol])
  );
  await soldier.deployed();
  const soldierEquip = <RMRKExternalEquipMockUpgradeable>(
    await upgrades.deployProxy(equipFactory, [soldier.address])
  );
  await soldierEquip.deployed();

  // Link nestable and equippable:
  await soldierEquip.setNestableAddress(soldier.address);
  await soldier.setEquippableAddress(soldierEquip.address);

  // Weapon
  const weapon = await upgrades.deployProxy(nestableFactory, [weaponName, weaponSymbol]);
  await weapon.deployed();
  const weaponEquip = await upgrades.deployProxy(equipFactory, [weapon.address]);
  await weaponEquip.deployed();
  // Link nestable and equippable:
  await weaponEquip.setNestableAddress(weapon.address);
  await weapon.setEquippableAddress(weaponEquip.address);

  // Weapon Gem
  const weaponGem = await upgrades.deployProxy(nestableFactory, [weaponGemName, weaponGemSymbol]);
  await weaponGem.deployed();
  const weaponGemEquip = await upgrades.deployProxy(equipFactory, [weaponGem.address]);
  await weaponGemEquip.deployed();
  // Link nestable and equippable:
  await weaponGemEquip.setNestableAddress(weaponGem.address);
  await weaponGem.setEquippableAddress(weaponGemEquip.address);

  // Background
  const background = await upgrades.deployProxy(nestableFactory, [
    backgroundName,
    backgroundSymbol,
  ]);
  await background.deployed();
  const backgroundEquip = await upgrades.deployProxy(equipFactory, [background.address]);
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
  const Nestable = await ethers.getContractFactory('RMRKNestableExternalEquipMockUpgradeable');
  const Equip = await ethers.getContractFactory('RMRKExternalEquipMockUpgradeable');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const nestable = await upgrades.deployProxy(Nestable, ['Chunky', 'CHNK']);
  await nestable.deployed();

  const equip = await upgrades.deployProxy(Equip, [nestable.address]);
  await equip.deployed();

  await nestable.setEquippableAddress(equip.address);

  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  return { nestable, equip, renderUtils };
}

async function multiAssetFixture() {
  const NestableFactory = await ethers.getContractFactory(
    'RMRKNestableExternalEquipMockUpgradeable',
  );
  const EquipFactory = await ethers.getContractFactory('RMRKExternalEquipMockUpgradeable');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const nestable = <RMRKNestableExternalEquipMockUpgradeable>(
    await upgrades.deployProxy(NestableFactory, ['NestableWithEquippable', 'NWE'])
  );
  await nestable.deployed();

  const equip = <RMRKExternalEquipMockUpgradeable>(
    await upgrades.deployProxy(EquipFactory, [nestable.address])
  );
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

describe('ExternalEquippableMockUpgradeable Assets', async () => {
  let nextTokenId = 1;
  let nestable: RMRKNestableExternalEquipMockUpgradeable;
  let equip: RMRKExternalEquipMockUpgradeable;
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
      await expect(this.nestable.setEquippableAddress(ethers.constants.AddressZero))
        .to.emit(this.nestable, 'EquippableAddressSet')
        .withArgs(this.equip.address, ethers.constants.AddressZero);

      await expect(this.equip.setNestableAddress(ethers.constants.AddressZero))
        .to.emit(this.equip, 'NestableAddressSet')
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

describe('ExternalEquippableMockUpgradeable MR behavior', async () => {
  let nextTokenId = 1;
  let nestable: RMRKNestableExternalEquipMockUpgradeable;
  let equip: RMRKExternalEquipMockUpgradeable;
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
