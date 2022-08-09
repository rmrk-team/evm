import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { addResourceToToken, mintTokenId, nestMinttokenId } from './utils';
import { equippablePartsContractsFixture } from './fixtures/equippablePartsFixture';
import { equippableSlotsContractsFixture } from './fixtures/equippableSlotsFixture';
import shouldBehaveLikeEquippableResources from './behavior/equippableResources';
import shouldBehaveLikeEquippableWithParts from './behavior/equippableParts';
import shouldBehaveLikeEquippableWithSlots from './behavior/equippableSlots';
import shouldBehaveLikeMultiResource from './behavior/multiresource';

async function partsFixture() {
  const Base = await ethers.getContractFactory('RMRKBaseStorageMock');
  const Nesting = await ethers.getContractFactory('RMRKNestingWithEquippableMock');
  const Equip = await ethers.getContractFactory('RMRKEquippableMock');

  return await equippablePartsContractsFixture(Base, Nesting, Equip, mintTokenId, nestMinttokenId);
}

async function slotsFixture() {
  const Base = await ethers.getContractFactory('RMRKBaseStorageMock');
  const Nesting = await ethers.getContractFactory('RMRKNestingWithEquippableMock');
  const Equip = await ethers.getContractFactory('RMRKEquippableMock');

  return await equippableSlotsContractsFixture(Base, Nesting, Equip, mintTokenId, nestMinttokenId);
}

describe('Equippable with Parts', async () => {
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

describe('Equippable Resources', async () => {
  shouldBehaveLikeEquippableResources('RMRKEquippableMock', 'RMRKNestingWithEquippableMock');
});

describe('Equippable with Slots', async () => {
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

  shouldBehaveLikeEquippableWithSlots(nestMinttokenId);
});

async function deployTokenFixture() {
  const NestingFactory = await ethers.getContractFactory('RMRKNestingWithEquippableMock');
  const EquipFactory = await ethers.getContractFactory('RMRKEquippableMock');

  const nesting = await NestingFactory.deploy('NestingWithEquippable', 'NWE');
  await nesting.deployed();

  const equip = await EquipFactory.deploy(nesting.address);
  await equip.deployed();

  await nesting.setEquippableAddress(equip.address);

  return { nesting, equip };
}

let nextResourceId = 1;

async function addResourceEntry(token: Contract, data?: string): Promise<BigNumber> {
  const resourceId = BigNumber.from(nextResourceId);
  const refId = BigNumber.from(1);
  const extendedResource = [
    resourceId,
    refId,
    ethers.constants.AddressZero,
    data !== undefined ? data : 'metaURI',
  ];
  nextResourceId++;
  await token.addResourceEntry(extendedResource, [], []);
  return resourceId;
}

// --------------- MULTI RESOURCE BEHAVIOR -----------------------

describe('Equippable MR behavior with minted token', async () => {
  let nextTokenId = 1;
  let mintingContract: Contract;

  beforeEach(async function () {
    const { nesting, equip } = await loadFixture(deployTokenFixture);
    mintingContract = nesting;
    this.token = equip;
  });

  async function mintToNesting(token: Contract, to: string): Promise<number> {
    const tokenId = nextTokenId;
    nextTokenId++;
    await mintingContract['mint(address,uint256)'](to, tokenId);
    return tokenId;
  }

  shouldBehaveLikeMultiResource(mintToNesting, addResourceEntry, addResourceToToken);
});

// --------------- MULTI RESOURCE BEHAVIOR END ------------------------
