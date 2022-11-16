import { Contract } from 'ethers';
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
  const nestableFactory = await ethers.getContractFactory('RMRKNestableExternalEquipImpl');
  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipImpl');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // View
  const view = await viewFactory.deploy();
  await view.deployed();

  // Base
  const base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Neon token
  const neon = await nestableFactory.deploy(
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
  // Link nestable and equippable:
  neon.setEquippableAddress(neonEquip.address);

  // Weapon
  const mask = await nestableFactory.deploy(
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
  // Link nestable and equippable:
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
  const nestableFactory = await ethers.getContractFactory('RMRKNestableExternalEquipImpl');
  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipImpl');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // View
  const view = await viewFactory.deploy();
  await view.deployed();

  // Base
  const base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Soldier token
  const soldier = await nestableFactory.deploy(
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
  // Link nestable and equippable:
  soldier.setEquippableAddress(soldierEquip.address);

  // Weapon
  const weapon = await nestableFactory.deploy(
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
  // Link nestable and equippable:
  weapon.setEquippableAddress(weaponEquip.address);

  // Weapon Gem
  const weaponGem = await nestableFactory.deploy(
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
  // Link nestable and equippable:
  weaponGem.setEquippableAddress(weaponGemEquip.address);

  // Background
  const background = await nestableFactory.deploy(
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
  // Link nestable and equippable:
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

async function assetsFixture() {
  const nestableFactory = await ethers.getContractFactory('RMRKNestableExternalEquipImpl');
  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipImpl');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const nestable = await nestableFactory.deploy(
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
  await nestable.deployed();

  const equip = await equipFactory.deploy(nestable.address);
  await equip.deployed();

  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  await nestable.setEquippableAddress(equip.address);

  return { nestable, equip, renderUtils };
}

async function equipFixture() {
  const nestableFactory = await ethers.getContractFactory('RMRKNestableExternalEquipImpl');
  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipImpl');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const nestable = await nestableFactory.deploy(
    'NestableWithEquippable',
    'NWE',
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    1000, // 10%
  );
  await nestable.deployed();

  const equip = await equipFactory.deploy(nestable.address);
  await equip.deployed();

  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  await nestable.setEquippableAddress(equip.address);

  return { nestable, equip, renderUtils };
}

// --------------- END FIXTURES -----------------------

// --------------- MULTI ASSET BEHAVIOR -----------------------

describe('ExternalEquippableImpl MR behavior', async () => {
  let nestable: Contract;
  let equip: Contract;
  let renderUtils: Contract;

  beforeEach(async function () {
    ({ nestable, equip, renderUtils } = await loadFixture(equipFixture));
    this.token = equip;
    this.renderUtils = renderUtils;
  });

  // Mint needs to happen on the nestable contract, but the MR behavior happens on the equip one.
  async function mintToNestable(token: Contract, to: string): Promise<number> {
    await nestable.mint(to, 1, { value: ONE_ETH });
    return await nestable.totalSupply();
  }

  shouldBehaveLikeMultiAsset(mintToNestable, addAssetEntryEquippablesFromImpl, addAssetToToken);
});

// --------------- MULTI ASSET BEHAVIOR END ------------------------

describe('ExternalEquippableImpl Other', async function () {
  beforeEach(async function () {
    const { nestable } = await loadFixture(equipFixture);
    this.token = nestable;
  });

  shouldControlValidMinting();
  shouldHaveRoyalties(mintFromImpl);
  shouldHaveMetadata(mintFromImpl);
});
