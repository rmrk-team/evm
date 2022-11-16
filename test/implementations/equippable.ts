import { Contract } from 'ethers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { setupContextForParts } from '../setup/equippableParts';
import { setupContextForSlots } from '../setup/equippableSlots';
import shouldBehaveLikeMultiAsset from '../behavior/multiasset';
import shouldControlValidMinting from '../behavior/mintingImpl';
import shouldHaveMetadata from '../behavior/metadata';
import shouldHaveRoyalties from '../behavior/royalties';
import {
  addAssetEntryEquippablesFromImpl,
  addAssetToToken,
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
  const equipFactory = await ethers.getContractFactory('RMRKEquippableImpl');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // Base
  const base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Neon token
  const neon = await equipFactory.deploy(
    neonName,
    neonSymbol,
    10000,
    ONE_ETH,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
  );
  await neon.deployed();

  // Weapon
  const mask = await equipFactory.deploy(
    maskName,
    maskSymbol,
    10000,
    ONE_ETH,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
  );
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
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // View
  const view = await viewFactory.deploy();
  await view.deployed();

  // Base
  const base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Soldier token
  const soldier = await equipFactory.deploy(
    soldierName,
    soldierSymbol,
    10000,
    ONE_ETH,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
  );
  await soldier.deployed();

  // Weapon
  const weapon = await equipFactory.deploy(
    weaponName,
    weaponSymbol,
    10000,
    ONE_ETH,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
  );
  await weapon.deployed();

  // Weapon Gem
  const weaponGem = await equipFactory.deploy(
    weaponGemName,
    weaponGemSymbol,
    10000,
    ONE_ETH,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
  );
  await weaponGem.deployed();

  // Background
  const background = await equipFactory.deploy(
    backgroundName,
    backgroundSymbol,
    10000,
    ONE_ETH,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
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
    mintFromImpl,
    nestMintFromImpl,
  );

  return { base, soldier, weapon, weaponGem, background, view };
}

async function assetsFixture() {
  const equipFactory = await ethers.getContractFactory('RMRKEquippableImpl');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const equip = await equipFactory.deploy(
    'Chunky',
    'CHNK',
    10000,
    ONE_ETH,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
  );
  await equip.deployed();

  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  return { equip, renderUtils };
}

async function equipFixture() {
  const equipFactory = await ethers.getContractFactory('RMRKEquippableImpl');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const equip = await equipFactory.deploy(
    'equipWithEquippable',
    'NWE',
    10000,
    ONE_ETH,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    1000, // 10%
  );
  await equip.deployed();

  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  return { equip, renderUtils };
}

// --------------- END FIXTURES -----------------------

// --------------- MULTI ASSET BEHAVIOR -----------------------

describe('RMRKEquippableImpl MR behavior', async () => {
  let equip: Contract;
  let renderUtils: Contract;

  beforeEach(async function () {
    ({ equip, renderUtils } = await loadFixture(equipFixture));
    this.token = equip;
    this.renderUtils = renderUtils;
  });

  async function mintToNestable(token: Contract, to: string): Promise<number> {
    await equip.mint(to, 1, { value: ONE_ETH });
    return await equip.totalSupply();
  }

  shouldBehaveLikeMultiAsset(mintToNestable, addAssetEntryEquippablesFromImpl, addAssetToToken);
});

// --------------- MULTI ASSET BEHAVIOR END ------------------------

describe('RMRKEquippableImpl Other', async function () {
  let equip: Contract;

  beforeEach(async function () {
    ({ equip } = await loadFixture(equipFixture));
    this.token = equip;
  });

  describe('Init', async function () {
    it('can get names and symbols', async function () {
      expect(await equip.name()).to.equal('equipWithEquippable');
      expect(await equip.symbol()).to.equal('NWE');
    });
  });

  shouldControlValidMinting();
  shouldHaveRoyalties(mintFromImpl);
  shouldHaveMetadata(mintFromImpl);
});
