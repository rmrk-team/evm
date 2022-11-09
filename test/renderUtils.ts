import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ADDRESS_ZERO, bn, mintFromMock } from './utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// --------------- FIXTURES -----------------------

async function resourcesFixture() {
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiResourceRenderUtils');
  const renderUtilsEquipFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  const equip = await equipFactory.deploy('Chunky', 'CHNK');
  await equip.deployed();

  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  const renderUtilsEquip = await renderUtilsEquipFactory.deploy();
  await renderUtilsEquip.deployed();

  return { equip, renderUtils, renderUtilsEquip };
}

describe('Render Utils', async function () {
  let owner: SignerWithAddress;
  let someBase: SignerWithAddress;
  let equip: Contract;
  let renderUtils: Contract;
  let renderUtilsEquip: Contract;
  let tokenId: number;

  const resId = bn(1);
  const resId2 = bn(2);
  const resId3 = bn(3);
  const resId4 = bn(4);

  before(async function () {
    ({ equip, renderUtils, renderUtilsEquip } = await loadFixture(resourcesFixture));

    const signers = await ethers.getSigners();
    owner = signers[0];
    someBase = signers[1];

    tokenId = await mintFromMock(equip, owner.address);
    await equip.addResourceEntry(resId, 0, ADDRESS_ZERO, 'ipfs://res1.jpg', [], []);
    await equip.addResourceEntry(resId2, 1, someBase.address, 'ipfs://res2.jpg', [1], [3, 4]);
    await equip.addResourceEntry(resId3, 0, ADDRESS_ZERO, 'ipfs://res3.jpg', [], []);
    await equip.addResourceEntry(resId4, 2, someBase.address, 'ipfs://res4.jpg', [], [4]);
    await equip.addResourceToToken(tokenId, resId, 0);
    await equip.addResourceToToken(tokenId, resId2, 0);
    await equip.addResourceToToken(tokenId, resId3, resId);
    await equip.addResourceToToken(tokenId, resId4, 0);

    await equip.acceptResource(tokenId, resId);
    await equip.acceptResource(tokenId, resId2);
    await equip.setPriority(tokenId, [10, 5]);
  });

  describe('Render Utils MultiResource', async function () {
    it('can get active resources', async function () {
      expect(await renderUtils.getActiveResources(equip.address, tokenId)).to.eql([
        [resId, 10, 'ipfs://res1.jpg'],
        [resId2, 5, 'ipfs://res2.jpg'],
      ]);
    });
    it('can get pending resources', async function () {
      expect(await renderUtils.getPendingResources(equip.address, tokenId)).to.eql([
        [resId4, bn(0), bn(0), 'ipfs://res4.jpg'],
        [resId3, bn(1), resId, 'ipfs://res3.jpg'],
      ]);
    });

    it('can get top resource by priority', async function () {
      expect(await renderUtils.getTopResourceMetaForToken(equip.address, tokenId)).to.eql(
        'ipfs://res2.jpg',
      );
    });

    it('cannot get top resource if token has no resources', async function () {
      const otherTokenId = await mintFromMock(equip, owner.address);
      await expect(
        renderUtils.getTopResourceMetaForToken(equip.address, otherTokenId),
      ).to.be.revertedWithCustomError(renderUtils, 'RMRKTokenHasNoResources');
    });
  });

  describe('Render Utils Equip', async function () {
    it('can get active resources', async function () {
      expect(await renderUtilsEquip.getExtendedActiveResources(equip.address, tokenId)).to.eql([
        [resId, bn(0), 10, ADDRESS_ZERO, 'ipfs://res1.jpg', [], []],
        [resId2, bn(1), 5, someBase.address, 'ipfs://res2.jpg', [bn(1)], [bn(3), bn(4)]],
      ]);
    });

    it('can get pending resources', async function () {
      expect(await renderUtilsEquip.getExtendedPendingResources(equip.address, tokenId)).to.eql([
        [resId4, bn(2), bn(0), bn(0), someBase.address, 'ipfs://res4.jpg', [], [bn(4)]],
        [resId3, bn(0), bn(1), resId, ADDRESS_ZERO, 'ipfs://res3.jpg', [], []],
      ]);
    });
  });
});
