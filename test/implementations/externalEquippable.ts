import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { setupContextForParts } from '../setup/equippableParts';
import { setupContextForSlots } from '../setup/equippableSlots';
import shouldBehaveLikeEquippableResources from '../behavior/equippableResources';
import shouldBehaveLikeEquippableWithParts from '../behavior/equippableParts';
import shouldBehaveLikeEquippableWithSlots from '../behavior/equippableSlots';
import shouldBehaveLikeMultiResource from '../behavior/multiresource';
import shouldControlValidMinting from '../behavior/mintingImpl';
import shouldHaveMetadata from '../behavior/metadata';
import shouldHaveRoyalties from '../behavior/royalties';
import {
  addResourceEntryEquippables,
  addResourceToToken,
  ADDRESS_ZERO,
  mintFromImpl,
  nestMintFromImpl,
  ONE_ETH,
} from '../utils';

// --------------- FIXTURES -----------------------

async function partsFixture() {
  const baseSymbol = 'NCB';
  const baseType = 'mixed';

  const neonName = 'NeonCrisis';
  const neonSymbol = 'NC';

  const maskName = 'NeonMask';
  const maskSymbol = 'NM';

  const baseFactory = await ethers.getContractFactory('RMRKBaseStorageImpl');
  const nestingFactory = await ethers.getContractFactory('RMRKNestingExternalEquipImpl');
  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipImpl');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // View
  const view = await viewFactory.deploy();
  await view.deployed();

  // Base
  const base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Neon token
  const neon = await nestingFactory.deploy(
    neonName,
    neonSymbol,
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
  );
  const neonEquip = await equipFactory.deploy(neon.address);
  await neon.deployed();
  await neonEquip.deployed();
  // Link nesting and equippable:
  neon.setEquippableAddress(neonEquip.address);

  // Weapon
  const mask = await nestingFactory.deploy(
    maskName,
    maskSymbol,
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
  );
  await mask.deployed();
  const maskEquip = await equipFactory.deploy(mask.address);
  await maskEquip.deployed();
  // Link nesting and equippable:
  mask.setEquippableAddress(maskEquip.address);

  await setupContextForParts(
    base,
    neon,
    neonEquip,
    mask,
    maskEquip,
    mintFromImpl,
    nestMintFromImpl,
  );
  return { base, neon, neonEquip, mask, maskEquip, view };
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
  const nestingFactory = await ethers.getContractFactory('RMRKNestingExternalEquipImpl');
  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipImpl');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // View
  const view = await viewFactory.deploy();
  await view.deployed();

  // Base
  const base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Soldier token
  const soldier = await nestingFactory.deploy(
    soldierName,
    soldierSymbol,
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
  );
  await soldier.deployed();
  const soldierEquip = await equipFactory.deploy(soldier.address);
  await soldierEquip.deployed();
  // Link nesting and equippable:
  soldier.setEquippableAddress(soldierEquip.address);

  // Weapon
  const weapon = await nestingFactory.deploy(
    weaponName,
    weaponSymbol,
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
  );
  await weapon.deployed();
  const weaponEquip = await equipFactory.deploy(weapon.address);
  await weaponEquip.deployed();
  // Link nesting and equippable:
  weapon.setEquippableAddress(weaponEquip.address);

  // Weapon Gem
  const weaponGem = await nestingFactory.deploy(
    weaponGemName,
    weaponGemSymbol,
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
  );
  await weaponGem.deployed();
  const weaponGemEquip = await equipFactory.deploy(weaponGem.address);
  await weaponGemEquip.deployed();
  // Link nesting and equippable:
  weaponGem.setEquippableAddress(weaponGemEquip.address);

  // Background
  const background = await nestingFactory.deploy(
    backgroundName,
    backgroundSymbol,
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
  );
  await background.deployed();
  const backgroundEquip = await equipFactory.deploy(background.address);
  await backgroundEquip.deployed();
  // Link nesting and equippable:
  background.setEquippableAddress(backgroundEquip.address);

  await setupContextForSlots(
    base,
    soldier,
    soldierEquip,
    weapon,
    weaponEquip,
    weaponGem,
    weaponGemEquip,
    background,
    backgroundEquip,
    mintFromImpl,
    nestMintFromImpl,
  );

  return {
    base,
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

async function resourcesFixture() {
  const nestingFactory = await ethers.getContractFactory('RMRKNestingExternalEquipImpl');
  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipImpl');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiResourceRenderUtils');

  const nesting = await nestingFactory.deploy(
    'Chunky',
    'CHNK',
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
  );
  await nesting.deployed();

  const equip = await equipFactory.deploy(nesting.address);
  await equip.deployed();

  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  await nesting.setEquippableAddress(equip.address);

  return { nesting, equip, renderUtils };
}

async function equipFixture() {
  const nestingFactory = await ethers.getContractFactory('RMRKNestingExternalEquipImpl');
  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipImpl');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiResourceRenderUtils');

  const nesting = await nestingFactory.deploy(
    'NestingWithEquippable',
    'NWE',
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    1000, // 10%
  );
  await nesting.deployed();

  const equip = await equipFactory.deploy(nesting.address);
  await equip.deployed();

  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  await nesting.setEquippableAddress(equip.address);

  return { nesting, equip, renderUtils };
}

// --------------- END FIXTURES -----------------------

// --------------- EQUIPPABLE BEHAVIOR -----------------------

describe('ExternalEquippableImpl with Parts', async () => {
  beforeEach(async function () {
    const { base, neon, neonEquip, mask, maskEquip, view } = await loadFixture(partsFixture);

    this.base = base;
    this.neon = neon;
    this.neonEquip = neonEquip;
    this.mask = mask;
    this.maskEquip = maskEquip;
    this.view = view;
  });

  shouldBehaveLikeEquippableWithParts();
});

describe('ExternalEquippableImpl with Slots', async () => {
  beforeEach(async function () {
    const {
      base,
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

    this.base = base;
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

  shouldBehaveLikeEquippableWithSlots(nestMintFromImpl);
});

describe('ExternalEquippableImpl Resources', async () => {
  beforeEach(async function () {
    const { nesting, equip, renderUtils } = await loadFixture(resourcesFixture);
    this.nesting = nesting;
    this.equip = equip;
    this.renderUtils = renderUtils;
  });

  shouldBehaveLikeEquippableResources(mintFromImpl);
});

// --------------- END EQUIPPABLE BEHAVIOR -----------------------

// --------------- MULTI RESOURCE BEHAVIOR -----------------------

describe('ExternalEquippableImpl MR behavior', async () => {
  let nesting: Contract;
  let equip: Contract;
  let renderUtils: Contract;

  beforeEach(async function () {
    ({ nesting, equip, renderUtils } = await loadFixture(equipFixture));
    this.token = equip;
    this.renderUtils = renderUtils;
  });

  // Mint needs to happen on the nesting contract, but the MR behavior happens on the equip one.
  async function mintToNesting(token: Contract, to: string): Promise<number> {
    await nesting.mint(to, 1, { value: ONE_ETH });
    return await nesting.totalSupply();
  }

  shouldBehaveLikeMultiResource(mintToNesting, addResourceEntryEquippables, addResourceToToken);
});

// --------------- MULTI RESOURCE BEHAVIOR END ------------------------

describe('ExternalEquippableImpl Other', async function () {
  beforeEach(async function () {
    const { nesting } = await loadFixture(equipFixture);
    this.token = nesting;
  });

  shouldControlValidMinting();
  shouldHaveRoyalties(mintFromImpl);
  shouldHaveMetadata(mintFromImpl);
});
