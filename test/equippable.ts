import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { addResourceToToken } from './utils';
import shouldBehaveLikeEquippableWithParts from './behavior/equippableParts';
import shouldBehaveLikeEquippableResources from './behavior/equippableResources';
import shouldBehaveLikeEquippableWithSlots from './behavior/equippableSlots';
import shouldBehaveLikeMultiResource from './behavior/multiresource';

describe('Equippable with Parts', async () => {
  shouldBehaveLikeEquippableWithParts();
});

describe('Equippable Resources', async () => {
  shouldBehaveLikeEquippableResources('RMRKEquippableMock', 'RMRKNestingWithEquippableMock');
});

describe('Equippable with Slots', async () => {
  shouldBehaveLikeEquippableWithSlots();
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
