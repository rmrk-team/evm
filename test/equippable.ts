import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  addResourceToToken,
  mintFromMock,
  nestMintFromMock,
  addResourceEntryEquippables,
} from './utils';
import { setupContextForParts } from './setup/equippableParts';
import { setupContextForSlots } from './setup/equippableSlots';
import shouldBehaveLikeEquippableResources from './behavior/equippableResources';
import shouldBehaveLikeEquippableWithParts from './behavior/equippableParts';
import shouldBehaveLikeEquippableWithSlots from './behavior/equippableSlots';
import shouldBehaveLikeMultiResource from './behavior/multiresource';

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

  // Base
  const base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Neon token
  const neon = await equipFactory.deploy(neonName, neonSymbol);
  await neon.deployed();

  // Weapon
  const mask = await equipFactory.deploy(maskName, maskSymbol);
  await mask.deployed();

  await setupContextForParts(base, neon, neon, mask, mask, mintFromMock, nestMintFromMock);
  return { base, neon, mask };
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

  // Base
  const base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Soldier token
  const soldier = await equipFactory.deploy(soldierName, soldierSymbol);
  await soldier.deployed();

  // Weapon
  const weapon = await equipFactory.deploy(weaponName, weaponSymbol);
  await weapon.deployed();

  // Weapon Gem
  const weaponGem = await equipFactory.deploy(weaponGemName, weaponGemSymbol);
  await weaponGem.deployed();

  // Background
  const background = await equipFactory.deploy(backgroundName, backgroundSymbol);
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

  return { base, soldier, weapon, weaponGem, background };
}

async function resourcesFixture() {
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');

  const equip = await equipFactory.deploy('Chunky', 'CHNK');
  await equip.deployed();

  return { equip };
}

async function multiResourceFixture() {
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');

  const equip = await equipFactory.deploy('equipWithEquippable', 'NWE');
  await equip.deployed();

  return { equip };
}

// --------------- END FIXTURES -----------------------

// --------------- EQUIPPABLE BEHAVIOR -----------------------

describe('EquippableMock with Parts', async () => {
  beforeEach(async function () {
    const { base, neon, mask } = await loadFixture(partsFixture);

    this.base = base;
    this.neon = neon;
    this.neonEquip = neon;
    this.mask = mask;
    this.maskEquip = mask;
  });

  shouldBehaveLikeEquippableWithParts();
});

describe('EquippableMock with Slots', async () => {
  beforeEach(async function () {
    const { base, soldier, weapon, weaponGem, background } = await loadFixture(slotsFixture);

    this.base = base;
    this.soldier = soldier;
    this.soldierEquip = soldier;
    this.weapon = weapon;
    this.weaponEquip = weapon;
    this.weaponGem = weaponGem;
    this.weaponGemEquip = weaponGem;
    this.background = background;
    this.backgroundEquip = background;
  });

  shouldBehaveLikeEquippableWithSlots(nestMintFromMock);
});

describe('EquippableMock Resources', async () => {
  beforeEach(async function () {
    const { equip } = await loadFixture(resourcesFixture);
    this.nesting = equip;
    this.equip = equip;
  });

  describe('Init', async function () {
    it('can get names and symbols', async function () {
      expect(await this.equip.name()).to.equal('Chunky');
      expect(await this.equip.symbol()).to.equal('CHNK');
    });
  });

  shouldBehaveLikeEquippableResources(mintFromMock);
});

// --------------- END EQUIPPABLE BEHAVIOR -----------------------

// --------------- MULTI RESOURCE BEHAVIOR -----------------------

describe('EquippableMock MR behavior', async () => {
  let nextTokenId = 1;
  let equip: Contract;

  beforeEach(async function () {
    ({ equip } = await loadFixture(multiResourceFixture));
    this.token = equip;
  });

  async function mintToNesting(token: Contract, to: string): Promise<number> {
    const tokenId = nextTokenId;
    nextTokenId++;
    await equip['mint(address,uint256)'](to, tokenId);
    return tokenId;
  }

  shouldBehaveLikeMultiResource(mintToNesting, addResourceEntryEquippables, addResourceToToken);
});

// --------------- MULTI RESOURCE BEHAVIOR END ------------------------
