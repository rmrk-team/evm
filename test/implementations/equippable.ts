import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { addResourceToToken, addResourceEntryEquippables } from '../utils';
import { setupContextForParts } from '../setup/equippableParts';
import { setupContextForSlots } from '../setup/equippableSlots';
import shouldBehaveLikeEquippableResources from '../behavior/equippableResources';
import shouldBehaveLikeEquippableWithParts from '../behavior/equippableParts';
import shouldBehaveLikeEquippableWithSlots from '../behavior/equippableSlots';
import shouldBehaveLikeMultiResource from '../behavior/multiresource';

async function mint(token: Contract, to: string): Promise<number> {
  await token.mint(to, 1, { value: ONE_ETH });
  return await token.totalSupply();
}

async function nestMint(token: Contract, to: string, destinationId: number): Promise<number> {
  await token.mintNesting(to, 1, destinationId, { value: ONE_ETH });
  return await token.totalSupply();
}

// --------------- FIXTURES -----------------------

const ONE_ETH = ethers.utils.parseEther('1.0');

async function partsFixture() {
  const baseSymbol = 'NCB';
  const baseType = 'mixed';

  const neonName = 'NeonCrisis';
  const neonSymbol = 'NC';

  const maskName = 'NeonMask';
  const maskSymbol = 'NM';

  const baseFactory = await ethers.getContractFactory('RMRKBaseStorageImpl');
  const nestingFactory = await ethers.getContractFactory('RMRKNestingWithEquippableImpl');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableImpl');

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
  );
  await mask.deployed();
  const maskEquip = await equipFactory.deploy(mask.address);
  await maskEquip.deployed();
  // Link nesting and equippable:
  mask.setEquippableAddress(maskEquip.address);

  await setupContextForParts(base, neon, neonEquip, mask, maskEquip, mint, nestMint);
  return { base, neon, neonEquip, mask, maskEquip };
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
  const nestingFactory = await ethers.getContractFactory('RMRKNestingWithEquippableImpl');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableImpl');

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
    mint,
    nestMint,
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
  };
}

async function resourcesFixture() {
  const Nesting = await ethers.getContractFactory('RMRKNestingWithEquippableImpl');
  const Equip = await ethers.getContractFactory('RMRKEquippableImpl');

  const nesting = await Nesting.deploy(
    'Chunky',
    'CHNK',
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
  );
  await nesting.deployed();

  const equip = await Equip.deploy(nesting.address);
  await equip.deployed();

  await nesting.setEquippableAddress(equip.address);

  return { nesting, equip };
}

async function multiResourceFixture() {
  const NestingFactory = await ethers.getContractFactory('RMRKNestingWithEquippableImpl');
  const EquipFactory = await ethers.getContractFactory('RMRKEquippableImpl');

  const nesting = await NestingFactory.deploy(
    'NestingWithEquippable',
    'NWE',
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
  );
  await nesting.deployed();

  const equip = await EquipFactory.deploy(nesting.address);
  await equip.deployed();

  await nesting.setEquippableAddress(equip.address);

  return { nesting, equip };
}

// --------------- END FIXTURES -----------------------

// --------------- EQUIPPABLE BEHAVIOR -----------------------

describe('EquippableImpl with Parts', async () => {
  beforeEach(async function () {
    const { base, neon, neonEquip, mask, maskEquip } = await loadFixture(partsFixture);

    this.base = base;
    this.neon = neon;
    this.neonEquip = neonEquip;
    this.mask = mask;
    this.maskEquip = maskEquip;
  });

  shouldBehaveLikeEquippableWithParts();
});

describe('EquippableImpl with Slots', async () => {
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
  });

  shouldBehaveLikeEquippableWithSlots(nestMint);
});

describe('EquippableImpl Resources', async () => {
  beforeEach(async function () {
    const { nesting, equip } = await loadFixture(resourcesFixture);
    this.nesting = nesting;
    this.equip = equip;
  });

  shouldBehaveLikeEquippableResources(mint);
});

// --------------- END EQUIPPABLE BEHAVIOR -----------------------

// --------------- MULTI RESOURCE BEHAVIOR -----------------------

describe('Equippable MR behavior with minted token', async () => {
  let mintingContract: Contract;

  beforeEach(async function () {
    const { nesting, equip } = await loadFixture(multiResourceFixture);
    mintingContract = nesting;
    this.token = equip;
  });

  async function mintToNesting(token: Contract, to: string): Promise<number> {
    await mintingContract.mint(to, 1, { value: ONE_ETH });
    return await mintingContract.totalSupply();
  }

  shouldBehaveLikeMultiResource(mintToNesting, addResourceEntryEquippables, addResourceToToken);
});

// --------------- MULTI RESOURCE BEHAVIOR END ------------------------
