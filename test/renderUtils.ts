import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { bn, mintFromMock } from './utils';
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
  let other: SignerWithAddress;
  let equip: Contract;
  let renderUtils: Contract;
  let renderUtilsEquip: Contract;
  let tokenId: number;

  const resId = bn(1);
  const resId2 = bn(2);

  before(async function () {
    ({ equip, renderUtils, renderUtilsEquip } = await loadFixture(resourcesFixture));

    const signers = await ethers.getSigners();
    owner = signers[0];
    other = signers[1];

    tokenId = await mintFromMock(equip, owner.address);
    await equip.addResourceEntry(
      {
        id: resId,
        equippableRefId: 0,
        metadataURI: 'ipfs://res1.jpg',
        baseAddress: ethers.constants.AddressZero,
      },
      [],
      [],
    );
    await equip.addResourceEntry(
      {
        id: resId2,
        equippableRefId: 1,
        metadataURI: 'ipfs://res2.jpg',
        baseAddress: other.address,
      },
      [1],
      [3, 4],
    );
    await equip.addResourceToToken(tokenId, resId, 0);
    await equip.addResourceToToken(tokenId, resId2, 0);
    await equip.acceptResource(tokenId, 0);
  });

  describe('Render Utils MultiResource', async function () {
    it('supports interface', async function () {
      expect(await renderUtils.supportsInterface('0x93668f28')).to.equal(true);
    });

    it('does not support other interfaces', async function () {
      expect(await renderUtils.supportsInterface('0xffffffff')).to.equal(false);
    });

    it('can get active resource by index', async function () {
      expect(await renderUtils.getResourceByIndex(equip.address, tokenId, 0)).to.eql(
        'ipfs://res1.jpg',
      );
    });

    it('can get pending resource by index', async function () {
      expect(await renderUtils.getPendingResourceByIndex(equip.address, tokenId, 0)).to.eql(
        'ipfs://res2.jpg',
      );
    });

    it('can get resources by id', async function () {
      expect(await renderUtils.getResourcesById(equip.address, [resId, resId2])).to.eql([
        'ipfs://res1.jpg',
        'ipfs://res2.jpg',
      ]);
    });

    it('can get top resource by priority', async function () {
      const otherTokenId = await mintFromMock(equip, owner.address);
      await equip.addResourceToToken(otherTokenId, resId, 0);
      await equip.addResourceToToken(otherTokenId, resId2, 0);
      await equip.acceptResource(otherTokenId, 0);
      await equip.acceptResource(otherTokenId, 0);
      await equip.setPriority(otherTokenId, [1, 0]);
      expect(await renderUtils.getTopResourceMetaForToken(equip.address, otherTokenId)).to.eql(
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
    it('supports interface', async function () {
      expect(await renderUtilsEquip.supportsInterface('0x65307461')).to.equal(true);
    });

    it('can get extended active resource by index', async function () {
      expect(await renderUtilsEquip.getExtendedResourceByIndex(equip.address, tokenId, 0)).to.eql([
        resId,
        bn(0),
        ethers.constants.AddressZero,
        'ipfs://res1.jpg',
      ]);
    });

    it('can get extended pending resource by index', async function () {
      expect(
        await renderUtilsEquip.getPendingExtendedResourceByIndex(equip.address, tokenId, 0),
      ).to.eql([resId2, bn(1), other.address, 'ipfs://res2.jpg']);
    });

    it('can get extended resources by id', async function () {
      expect(
        await renderUtilsEquip.getExtendedResourcesById(equip.address, [resId, resId2]),
      ).to.eql([
        [resId, bn(0), ethers.constants.AddressZero, 'ipfs://res1.jpg'],
        [resId2, bn(1), other.address, 'ipfs://res2.jpg'],
      ]);
    });
  });
});
