import { Contract } from 'ethers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  addResourceToToken,
  addResourceEntryEquippables,
  mintFromImpl,
  nestMintFromImpl,
  ONE_ETH,
} from '../utils';
import { setupContextForParts } from '../setup/equippableParts';
import { setupContextForSlots } from '../setup/equippableSlots';
import shouldBehaveLikeEquippableResources from '../behavior/equippableResources';
import shouldBehaveLikeEquippableWithParts from '../behavior/equippableParts';
import shouldBehaveLikeEquippableWithSlots from '../behavior/equippableSlots';
import shouldBehaveLikeMultiResource from '../behavior/multiresource';
import shouldControlValidMinting from '../behavior/mintingImpl';

// --------------- FIXTURES -----------------------

async function partsFixture() {
  const baseSymbol = 'NCB';
  const baseType = 'mixed';

  const neonName = 'NeonCrisis';
  const neonSymbol = 'NC';

  const maskName = 'NeonMask';
  const maskSymbol = 'NM';

  const baseFactory = await ethers.getContractFactory('RMRKBaseStorageImpl');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableImpl');
  const viewFactory = await ethers.getContractFactory('RMRKEquippableViews');

  // Base
  const base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Neon token
  const neon = await equipFactory.deploy(neonName, neonSymbol, 10000, ONE_ETH);
  await neon.deployed();

  // Weapon
  const mask = await equipFactory.deploy(maskName, maskSymbol, 10000, ONE_ETH);
  await mask.deployed();

  // View
  const view = await viewFactory.deploy();
  await view.deployed();

  await setupContextForParts(base, neon, neon, mask, mask, mintFromImpl, nestMintFromImpl);
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

  const baseFactory = await ethers.getContractFactory('RMRKBaseStorageImpl');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableImpl');
  const viewFactory = await ethers.getContractFactory('RMRKEquippableViews');

  // View
  const view = await viewFactory.deploy();
  await view.deployed();

  // Base
  const base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Soldier token
  const soldier = await equipFactory.deploy(soldierName, soldierSymbol, 10000, ONE_ETH);
  await soldier.deployed();

  // Weapon
  const weapon = await equipFactory.deploy(weaponName, weaponSymbol, 10000, ONE_ETH);
  await weapon.deployed();

  // Weapon Gem
  const weaponGem = await equipFactory.deploy(weaponGemName, weaponGemSymbol, 10000, ONE_ETH);
  await weaponGem.deployed();

  // Background
  const background = await equipFactory.deploy(backgroundName, backgroundSymbol, 10000, ONE_ETH);
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
    mintFromImpl,
    nestMintFromImpl,
  );

  return { base, soldier, weapon, weaponGem, background, view };
}

async function resourcesFixture() {
  const equipFactory = await ethers.getContractFactory('RMRKEquippableImpl');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKRenderUtils');

  const equip = await equipFactory.deploy('Chunky', 'CHNK', 10000, ONE_ETH);
  await equip.deployed();

  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  return { equip, renderUtils };
}

async function equipFixture() {
  const equipFactory = await ethers.getContractFactory('RMRKEquippableImpl');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKRenderUtils');

  const equip = await equipFactory.deploy('equipWithEquippable', 'NWE', 10000, ONE_ETH);
  await equip.deployed();

  const renderUtils = await renderUtilsFactory.deploy();
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

  shouldBehaveLikeEquippableWithSlots(nestMintFromImpl);
});

describe('EquippableMock Resources', async () => {
  beforeEach(async function () {
    const { equip, renderUtils } = await loadFixture(resourcesFixture);
    this.nesting = equip;
    this.equip = equip;
    this.renderUtils = renderUtils;
  });

  describe('Init', async function () {
    it('can get names and symbols', async function () {
      expect(await this.equip.name()).to.equal('Chunky');
      expect(await this.equip.symbol()).to.equal('CHNK');
    });
  });

  shouldBehaveLikeEquippableResources(mintFromImpl);
});

// --------------- END EQUIPPABLE BEHAVIOR -----------------------

// --------------- MULTI RESOURCE BEHAVIOR -----------------------

describe('EquippableMock MR behavior', async () => {
  let equip: Contract;
  let renderUtils: Contract;

  beforeEach(async function () {
    ({ equip, renderUtils } = await loadFixture(equipFixture));
    this.token = equip;
    this.renderUtils = renderUtils;
  });

  async function mintToNesting(token: Contract, to: string): Promise<number> {
    await equip.mint(to, 1, { value: ONE_ETH });
    return await equip.totalSupply();
  }

  shouldBehaveLikeMultiResource(mintToNesting, addResourceEntryEquippables, addResourceToToken);
});

// --------------- MULTI RESOURCE BEHAVIOR END ------------------------

describe('EquippableMock Minting', async function () {
  beforeEach(async function () {
    const { equip } = await loadFixture(equipFixture);
    this.token = equip;
  });

  shouldControlValidMinting();
});
