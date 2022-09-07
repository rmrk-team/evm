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
  const nestingFactory = await ethers.getContractFactory('RMRKNestingWithEquippableMock');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableWithNestingMock');
  const viewFactory = await ethers.getContractFactory('RMRKEquippableViews');

  // Base
  const base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Neon token
  const neon = await nestingFactory.deploy(neonName, neonSymbol);
  await neon.deployed();

  // Neon Equip

  const neonEquip = await equipFactory.deploy(neon.address);
  await neonEquip.deployed();

  // View contract
  const view = await viewFactory.deploy();
  await view.deployed();

  // Link nesting and equippable:
  neonEquip.setNestingAddress(neon.address);
  neon.setEquippableAddress(neonEquip.address);
  // Weapon
  const mask = await nestingFactory.deploy(maskName, maskSymbol);
  await mask.deployed();
  const maskEquip = await equipFactory.deploy(mask.address);
  await maskEquip.deployed();
  // Link nesting and equippable:
  maskEquip.setNestingAddress(mask.address);
  mask.setEquippableAddress(maskEquip.address);

  await setupContextForParts(
    base,
    neon,
    neonEquip,
    mask,
    maskEquip,
    mintFromMock,
    nestMintFromMock,
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

  const baseFactory = await ethers.getContractFactory('RMRKBaseStorageMock');
  const nestingFactory = await ethers.getContractFactory('RMRKNestingWithEquippableMock');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableWithNestingMock');
  const viewFactory = await ethers.getContractFactory('RMRKEquippableViews');

  // View
  const view = await viewFactory.deploy();
  await view.deployed();

  // Base
  const base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Soldier token
  const soldier = await nestingFactory.deploy(soldierName, soldierSymbol);
  await soldier.deployed();
  const soldierEquip = await equipFactory.deploy(soldier.address);
  await soldierEquip.deployed();

  // Link nesting and equippable:
  soldierEquip.setNestingAddress(soldier.address);
  soldier.setEquippableAddress(soldierEquip.address);

  // Weapon
  const weapon = await nestingFactory.deploy(weaponName, weaponSymbol);
  await weapon.deployed();
  const weaponEquip = await equipFactory.deploy(weapon.address);
  await weaponEquip.deployed();
  // Link nesting and equippable:
  weaponEquip.setNestingAddress(weapon.address);
  weapon.setEquippableAddress(weaponEquip.address);

  // Weapon Gem
  const weaponGem = await nestingFactory.deploy(weaponGemName, weaponGemSymbol);
  await weaponGem.deployed();
  const weaponGemEquip = await equipFactory.deploy(weaponGem.address);
  await weaponGemEquip.deployed();
  // Link nesting and equippable:
  weaponGemEquip.setNestingAddress(weaponGem.address);
  weaponGem.setEquippableAddress(weaponGemEquip.address);

  // Background
  const background = await nestingFactory.deploy(backgroundName, backgroundSymbol);
  await background.deployed();
  const backgroundEquip = await equipFactory.deploy(background.address);
  await backgroundEquip.deployed();
  // Link nesting and equippable:
  backgroundEquip.setNestingAddress(background.address);
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
    mintFromMock,
    nestMintFromMock,
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
  const Nesting = await ethers.getContractFactory('RMRKNestingWithEquippableMock');
  const Equip = await ethers.getContractFactory('RMRKEquippableWithNestingMock');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKRenderUtils');

  const nesting = await Nesting.deploy('Chunky', 'CHNK');
  await nesting.deployed();

  const equip = await Equip.deploy(nesting.address);
  await equip.deployed();

  await nesting.setEquippableAddress(equip.address);

  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  return { nesting, equip, renderUtils };
}

async function multiResourceFixture() {
  const NestingFactory = await ethers.getContractFactory('RMRKNestingWithEquippableMock');
  const EquipFactory = await ethers.getContractFactory('RMRKEquippableWithNestingMock');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKRenderUtils');

  const nesting = await NestingFactory.deploy('NestingWithEquippable', 'NWE');
  await nesting.deployed();

  const equip = await EquipFactory.deploy(nesting.address);
  await equip.deployed();

  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  await nesting.setEquippableAddress(equip.address);

  return { nesting, equip, renderUtils };
}

// --------------- END FIXTURES -----------------------

// --------------- EQUIPPABLE BEHAVIOR -----------------------

describe('EquippableMock with Parts', async () => {
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

describe('EquippableMock with Slots', async () => {
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

  shouldBehaveLikeEquippableWithSlots(nestMintFromMock);
});

describe('EquippableMock Resources', async () => {
  beforeEach(async function () {
    const { nesting, equip, renderUtils } = await loadFixture(resourcesFixture);
    this.nesting = nesting;
    this.equip = equip;
    this.renderUtils = renderUtils;
  });

  describe('Init', async function () {
    it('can get names and symbols', async function () {
      expect(await this.nesting.name()).to.equal('Chunky');
      expect(await this.nesting.symbol()).to.equal('CHNK');
    });
  });

  describe('Linking', async function () {
    it('can set nesting/equippable addresses', async function () {
      expect(await this.nesting.setEquippableAddress(ethers.constants.AddressZero))
        .to.emit(this.nesting, 'EquippableAddressSet')
        .withArgs(this.equip.address, ethers.constants.AddressZero);

      expect(await this.equip.setNestingAddress(ethers.constants.AddressZero))
        .to.emit(this.equip, 'EquippableAddressSet')
        .withArgs(this.nesting.address, ethers.constants.AddressZero);
    });

    it('can get nesting address', async function () {
      expect(await this.equip.getNestingAddress()).to.eql(this.nesting.address);
      expect(await this.nesting.getEquippableAddress()).to.eql(this.equip.address);
    });
  });

  shouldBehaveLikeEquippableResources(mintFromMock);
});

// --------------- END EQUIPPABLE BEHAVIOR -----------------------

// --------------- MULTI RESOURCE BEHAVIOR -----------------------

describe('EquippableMock MR behavior', async () => {
  let nextTokenId = 1;
  let nesting: Contract;
  let equip: Contract;
  let renderUtils: Contract;

  beforeEach(async function () {
    ({ nesting, equip, renderUtils } = await loadFixture(multiResourceFixture));
    this.token = equip;
    this.renderUtils = renderUtils;
  });

  // Mint needs to happen on the nesting contract, but the MR behavior happens on the equip one.
  async function mintToNesting(token: Contract, to: string): Promise<number> {
    const tokenId = nextTokenId;
    nextTokenId++;
    await nesting['mint(address,uint256)'](to, tokenId);
    return tokenId;
  }

  shouldBehaveLikeMultiResource(mintToNesting, addResourceEntryEquippables, addResourceToToken);
});

// --------------- MULTI RESOURCE BEHAVIOR END ------------------------
