import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import shouldBehaveLikeEquippableWithParts from './behavior/equippableParts';
import shouldBehaveLikeEquippableResources from './behavior/equippableResources';
import shouldBehaveLikeEquippableWithSlots from './behavior/equippableSlots';
import {
  shouldHandleAcceptsForResources,
  shouldHandleApprovalsForResources,
  shouldHandleOverwritesForResources,
  shouldHandleRejectsForResources,
  shouldHandleSetPriorities,
  shouldSupportInterfacesForResources,
} from './behavior/multiresource';

describe('Equippable with Parts', async () => {
  shouldBehaveLikeEquippableWithParts();
});

describe('Equippable Resources', async () => {
  shouldBehaveLikeEquippableResources('RMRKEquippableMock', 'RMRKNestingWithEquippableMock');
});

describe('Equippable with Slots', async () => {
  shouldBehaveLikeEquippableWithSlots();
});

// --------------- MULTI RESOURCE BEHAVIOR -----------------------

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

async function addResourceToToken(
  token: Contract,
  tokenId: number,
  resId: BigNumber,
  overwrites: BigNumber | number,
): Promise<void> {
  await token.addResourceToToken(tokenId, resId, overwrites);
}

describe('EquippableMock MR behavior with minted token', async () => {
  const tokenId = 1;

  beforeEach(async function () {
    const tokenOwner = (await ethers.getSigners())[1];
    const { nesting, equip } = await loadFixture(deployTokenFixture);
    await nesting['mint(address,uint256)'](tokenOwner.address, tokenId);
    this.token = equip;
  });

  shouldSupportInterfacesForResources();
  shouldHandleApprovalsForResources(tokenId);
  shouldHandleOverwritesForResources(tokenId, addResourceEntry, addResourceToToken);
});

describe('EquippableMock MR behavior with minted token and pending resources', async () => {
  const tokenId = 1;
  const resId1 = BigNumber.from(1);
  const resData1 = 'data1';
  const resId2 = BigNumber.from(2);
  const resData2 = 'data2';

  beforeEach(async function () {
    const tokenOwner = (await ethers.getSigners())[1];
    const { nesting, equip } = await loadFixture(deployTokenFixture);

    // Mint and add 2 resources to token
    await nesting['mint(address,uint256)'](tokenOwner.address, tokenId);

    const extendedResource1 = [resId1, 0, ethers.constants.AddressZero, resData1];
    const extendedResource2 = [resId2, 0, ethers.constants.AddressZero, resData2];
    await equip.addResourceEntry(extendedResource1, [], []);
    await equip.addResourceEntry(extendedResource2, [], []);

    await equip.addResourceToToken(tokenId, resId1, 0);
    await equip.addResourceToToken(tokenId, resId2, 0);

    this.token = equip;
  });

  shouldHandleAcceptsForResources(tokenId, resId1, resData1, resId2, resData2);
  shouldHandleRejectsForResources(tokenId, resId1, resData1, resId2, resData2);
  shouldHandleSetPriorities(tokenId);
});

// --------------- MULTI RESOURCE BEHAVIOR END ------------------------
