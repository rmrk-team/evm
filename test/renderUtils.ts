import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ADDRESS_ZERO, bn, mintFromMock } from './utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// --------------- FIXTURES -----------------------

async function assetsFixture() {
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');
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
    ({ equip, renderUtils, renderUtilsEquip } = await loadFixture(assetsFixture));

    const signers = await ethers.getSigners();
    owner = signers[0];
    someBase = signers[1];

    tokenId = await mintFromMock(equip, owner.address);
    await equip.addAssetEntry(resId, 0, ADDRESS_ZERO, 'ipfs://res1.jpg', [], []);
    await equip.addAssetEntry(resId2, 1, someBase.address, 'ipfs://res2.jpg', [1], [3, 4]);
    await equip.addAssetEntry(resId3, 0, ADDRESS_ZERO, 'ipfs://res3.jpg', [], []);
    await equip.addAssetEntry(resId4, 2, someBase.address, 'ipfs://res4.jpg', [], [4]);
    await equip.addAssetToToken(tokenId, resId, 0);
    await equip.addAssetToToken(tokenId, resId2, 0);
    await equip.addAssetToToken(tokenId, resId3, resId);
    await equip.addAssetToToken(tokenId, resId4, 0);

    await equip.acceptAsset(tokenId, 0, resId);
    await equip.acceptAsset(tokenId, 1, resId2);
    await equip.setPriority(tokenId, [10, 5]);
  });

  describe('Render Utils MultiAsset', async function () {
    it('can get active assets', async function () {
      expect(await renderUtils.getActiveAssets(equip.address, tokenId)).to.eql([
        [resId, 10, 'ipfs://res1.jpg'],
        [resId2, 5, 'ipfs://res2.jpg'],
      ]);
    });
    it('can get pending assets', async function () {
      expect(await renderUtils.getPendingAssets(equip.address, tokenId)).to.eql([
        [resId4, bn(0), bn(0), 'ipfs://res4.jpg'],
        [resId3, bn(1), resId, 'ipfs://res3.jpg'],
      ]);
    });

    it('can get top asset by priority', async function () {
      expect(await renderUtils.getTopAssetMetaForToken(equip.address, tokenId)).to.eql(
        'ipfs://res2.jpg',
      );
    });

    it('cannot get top asset if token has no assets', async function () {
      const otherTokenId = await mintFromMock(equip, owner.address);
      await expect(
        renderUtils.getTopAssetMetaForToken(equip.address, otherTokenId),
      ).to.be.revertedWithCustomError(renderUtils, 'RMRKTokenHasNoAssets');
    });
  });

  describe('Render Utils Equip', async function () {
    it('can get active assets', async function () {
      expect(await renderUtilsEquip.getExtendedActiveAssets(equip.address, tokenId)).to.eql([
        [resId, bn(0), 10, ADDRESS_ZERO, 'ipfs://res1.jpg', [], []],
        [resId2, bn(1), 5, someBase.address, 'ipfs://res2.jpg', [bn(1)], [bn(3), bn(4)]],
      ]);
    });

    it('can get pending assets', async function () {
      expect(await renderUtilsEquip.getExtendedPendingAssets(equip.address, tokenId)).to.eql([
        [resId4, bn(2), bn(0), bn(0), someBase.address, 'ipfs://res4.jpg', [], [bn(4)]],
        [resId3, bn(0), bn(1), resId, ADDRESS_ZERO, 'ipfs://res3.jpg', [], []],
      ]);
    });
  });
});
