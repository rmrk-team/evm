import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ADDRESS_ZERO, bn, mintFromMock, nestMintFromMock } from './utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  RMRKCatalogMock,
  RMRKEquippableMock,
  RMRKBulkWriter,
  RMRKBulkWriterPerCollection,
} from '../typechain-types';
import {
  assetForGemAFull,
  assetForGemALeft,
  assetForGemAMid,
  assetForGemARight,
  assetForGemBFull,
  assetForGemBLeft,
  assetForGemBMid,
  assetForGemBRight,
  assetForKanariaFull,
  slotIdGemLeft,
  slotIdGemMid,
  slotIdGemRight,
  setUpCatalog,
  setUpKanariaAsset,
  setUpGemAssets,
} from './kanariaUtils';

// --------------- FIXTURES -----------------------

async function bulkWriterFixture() {
  const catalogFactory = await ethers.getContractFactory('RMRKCatalogMock');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const bulkWriterPerCollectionFactory = await ethers.getContractFactory(
    'RMRKBulkWriterPerCollection',
  );
  const bulkWriterFactory = await ethers.getContractFactory('RMRKBulkWriter');

  const catalog = <RMRKCatalogMock>await catalogFactory.deploy('ipfs://catalog.json', 'misc');

  const kanaria = <RMRKEquippableMock>await equipFactory.deploy();
  kanaria.deployed();

  const gem = <RMRKEquippableMock>await equipFactory.deploy();
  gem.deployed();

  const bulkWriterPerCollection = <RMRKBulkWriterPerCollection>(
    await bulkWriterPerCollectionFactory.deploy(kanaria.address)
  );
  await bulkWriterPerCollection.deployed();

  const bulkWriter = <RMRKBulkWriter>await bulkWriterFactory.deploy();
  await bulkWriter.deployed();

  const [owner] = await ethers.getSigners();

  const kanariaId = await mintFromMock(kanaria, owner.address);
  const gemId1 = await nestMintFromMock(gem, kanaria.address, kanariaId);
  const gemId2 = await nestMintFromMock(gem, kanaria.address, kanariaId);
  const gemId3 = await nestMintFromMock(gem, kanaria.address, kanariaId);
  await kanaria.acceptChild(kanariaId, 0, gem.address, gemId1);
  await kanaria.acceptChild(kanariaId, 1, gem.address, gemId2);
  await kanaria.acceptChild(kanariaId, 0, gem.address, gemId3);

  await setUpCatalog(catalog, gem.address);
  await setUpKanariaAsset(kanaria, kanariaId, catalog.address);
  await setUpGemAssets(gem, gemId1, gemId2, gemId3, kanaria.address, catalog.address);

  await kanaria.equip({
    tokenId: kanariaId,
    childIndex: 0,
    assetId: assetForKanariaFull,
    slotPartId: slotIdGemLeft,
    childAssetId: assetForGemALeft,
  });

  return {
    catalog,
    kanaria,
    gem,
    bulkWriter,
    bulkWriterPerCollection,
    owner,
    kanariaId,
    gemId1,
    gemId2,
    gemId3,
  };
}

describe('Advanced Equip Render Utils', async function () {
  let owner: SignerWithAddress;
  let catalog: RMRKCatalogMock;
  let kanaria: RMRKEquippableMock;
  let gem: RMRKEquippableMock;
  let bulkWriter: RMRKBulkWriter;
  let bulkWriterPerCollection: RMRKBulkWriterPerCollection;
  let kanariaId: BigNumber;
  let gemId1: BigNumber;
  let gemId2: BigNumber;
  let gemId3: BigNumber;

  beforeEach(async function () {
    ({
      catalog,
      kanaria,
      gem,
      bulkWriter,
      bulkWriterPerCollection,
      owner,
      kanariaId,
      gemId1,
      gemId2,
      gemId3,
    } = await loadFixture(bulkWriterFixture));
  });

  describe('With General Bulk Writer', async function () {
    beforeEach(async function () {
      await kanaria.setApprovalForAll(bulkWriter.address, true);
    });

    it('can replace equip', async function () {
      await bulkWriter.replaceEquip(kanaria.address, {
        tokenId: kanariaId,
        childIndex: 1,
        assetId: assetForKanariaFull,
        slotPartId: slotIdGemLeft,
        childAssetId: assetForGemALeft,
      });

      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemLeft)).to.eql([
        bn(assetForKanariaFull),
        bn(assetForGemALeft),
        gemId2,
        gem.address,
      ]);
    });

    it('can unequip and equip in bulk', async function () {
      // On a single call we remove the gem from the first slot and add 2 gems on the other 2 slots
      await bulkWriter.bulkEquip(
        kanaria.address,
        kanariaId,
        [
          {
            assetId: assetForKanariaFull,
            slotPartId: slotIdGemLeft,
          },
        ],
        [
          {
            tokenId: kanariaId,
            childIndex: 1,
            assetId: assetForKanariaFull,
            slotPartId: slotIdGemMid,
            childAssetId: assetForGemAMid,
          },
          {
            tokenId: kanariaId,
            childIndex: 2,
            assetId: assetForKanariaFull,
            slotPartId: slotIdGemRight,
            childAssetId: assetForGemBRight,
          },
        ],
      );

      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemLeft)).to.eql([
        bn(0),
        bn(0),
        bn(0),
        ADDRESS_ZERO,
      ]);
      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemMid)).to.eql([
        bn(assetForKanariaFull),
        bn(assetForGemAMid),
        gemId2,
        gem.address,
      ]);
      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemRight)).to.eql([
        bn(assetForKanariaFull),
        bn(assetForGemBRight),
        gemId3,
        gem.address,
      ]);
    });

    it('can use bulk with only unequip operations', async function () {
      // On a single call we remove the gem from the first slot and add 2 gems on the other 2 slots
      await bulkWriter.bulkEquip(
        kanaria.address,
        kanariaId,
        [
          {
            assetId: assetForKanariaFull,
            slotPartId: slotIdGemLeft,
          },
        ],
        [],
      );

      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemLeft)).to.eql([
        bn(0),
        bn(0),
        bn(0),
        ADDRESS_ZERO,
      ]);
    });

    it('can use bulk with only equip operations', async function () {
      // On a single call we remove the gem from the first slot and add 2 gems on the other 2 slots
      await bulkWriter.bulkEquip(
        kanaria.address,
        kanariaId,
        [],
        [
          {
            tokenId: kanariaId,
            childIndex: 1,
            assetId: assetForKanariaFull,
            slotPartId: slotIdGemMid,
            childAssetId: assetForGemAMid,
          },
          {
            tokenId: kanariaId,
            childIndex: 2,
            assetId: assetForKanariaFull,
            slotPartId: slotIdGemRight,
            childAssetId: assetForGemBRight,
          },
        ],
      );

      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemLeft)).to.eql([
        bn(assetForKanariaFull),
        bn(assetForGemALeft),
        gemId1,
        gem.address,
      ]);
      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemMid)).to.eql([
        bn(assetForKanariaFull),
        bn(assetForGemAMid),
        gemId2,
        gem.address,
      ]);
      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemRight)).to.eql([
        bn(assetForKanariaFull),
        bn(assetForGemBRight),
        gemId3,
        gem.address,
      ]);
    });

    it('cannot do operations if not writer is not approved', async function () {
      await kanaria.setApprovalForAll(bulkWriter.address, false);

      // On a single call we remove the gem from the first slot and add 2 gems on the other 2 slots
      await expect(
        bulkWriter.bulkEquip(
          kanaria.address,
          kanariaId,
          [
            {
              assetId: assetForKanariaFull,
              slotPartId: slotIdGemLeft,
            },
          ],
          [
            {
              tokenId: kanariaId,
              childIndex: 1,
              assetId: assetForKanariaFull,
              slotPartId: slotIdGemMid,
              childAssetId: assetForGemAMid,
            },
          ],
        ),
      ).to.be.revertedWithCustomError(kanaria, 'ERC721NotApprovedOrOwner');

      await expect(
        bulkWriter.replaceEquip(kanaria.address, {
          tokenId: kanariaId,
          childIndex: 1,
          assetId: assetForKanariaFull,
          slotPartId: slotIdGemLeft,
          childAssetId: assetForGemALeft,
        }),
      ).to.be.revertedWithCustomError(kanaria, 'ERC721NotApprovedOrOwner');
    });

    it('cannot do operations if not token owner', async function () {
      const [, notOwner] = await ethers.getSigners();

      await expect(
        bulkWriter.connect(notOwner).bulkEquip(
          kanaria.address,
          kanariaId,
          [
            {
              assetId: assetForKanariaFull,
              slotPartId: slotIdGemLeft,
            },
          ],
          [
            {
              tokenId: kanariaId,
              childIndex: 1,
              assetId: assetForKanariaFull,
              slotPartId: slotIdGemMid,
              childAssetId: assetForGemAMid,
            },
          ],
        ),
      ).to.be.revertedWithCustomError(bulkWriter, 'RMRKCanOnlyDoBulkOperationsOnOwnedTokens');

      await expect(
        bulkWriter.connect(notOwner).replaceEquip(kanaria.address, {
          tokenId: kanariaId,
          childIndex: 1,
          assetId: assetForKanariaFull,
          slotPartId: slotIdGemLeft,
          childAssetId: assetForGemALeft,
        }),
      ).to.be.revertedWithCustomError(bulkWriter, 'RMRKCanOnlyDoBulkOperationsOnOwnedTokens');
    });

    it('cannot do operations for if token id on equip data, does not match', async function () {
      const otherId = 2;
      await expect(
        bulkWriter.bulkEquip(
          kanaria.address,
          kanariaId,
          [],
          [
            {
              tokenId: otherId,
              childIndex: 1,
              assetId: assetForKanariaFull,
              slotPartId: slotIdGemMid,
              childAssetId: assetForGemAMid,
            },
          ],
        ),
      ).to.be.revertedWithCustomError(bulkWriter, 'RMRKCanOnlyDoBulkOperationsWithOneTokenAtATime');
    });
  });

  describe('With Bulk Writer Per Collection', async function () {
    beforeEach(async function () {
      await kanaria.setApprovalForAll(bulkWriterPerCollection.address, true);
    });

    it('can get managed collection', async function () {
      expect(await bulkWriterPerCollection.getCollection()).to.equal(kanaria.address);
    });

    it('can replace equip', async function () {
      await bulkWriterPerCollection.replaceEquip({
        tokenId: kanariaId,
        childIndex: 1,
        assetId: assetForKanariaFull,
        slotPartId: slotIdGemLeft,
        childAssetId: assetForGemALeft,
      });

      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemLeft)).to.eql([
        bn(assetForKanariaFull),
        bn(assetForGemALeft),
        gemId2,
        gem.address,
      ]);
    });

    it('can unequip and equip in bulk', async function () {
      // On a single call we remove the gem from the first slot and add 2 gems on the other 2 slots
      await bulkWriterPerCollection.bulkEquip(
        kanariaId,
        [
          {
            assetId: assetForKanariaFull,
            slotPartId: slotIdGemLeft,
          },
        ],
        [
          {
            tokenId: kanariaId,
            childIndex: 1,
            assetId: assetForKanariaFull,
            slotPartId: slotIdGemMid,
            childAssetId: assetForGemAMid,
          },
          {
            tokenId: kanariaId,
            childIndex: 2,
            assetId: assetForKanariaFull,
            slotPartId: slotIdGemRight,
            childAssetId: assetForGemBRight,
          },
        ],
      );

      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemLeft)).to.eql([
        bn(0),
        bn(0),
        bn(0),
        ADDRESS_ZERO,
      ]);
      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemMid)).to.eql([
        bn(assetForKanariaFull),
        bn(assetForGemAMid),
        gemId2,
        gem.address,
      ]);
      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemRight)).to.eql([
        bn(assetForKanariaFull),
        bn(assetForGemBRight),
        gemId3,
        gem.address,
      ]);
    });

    it('can use bulk with only unequip operations', async function () {
      // On a single call we remove the gem from the first slot and add 2 gems on the other 2 slots
      await bulkWriterPerCollection.bulkEquip(
        kanariaId,
        [
          {
            assetId: assetForKanariaFull,
            slotPartId: slotIdGemLeft,
          },
        ],
        [],
      );

      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemLeft)).to.eql([
        bn(0),
        bn(0),
        bn(0),
        ADDRESS_ZERO,
      ]);
    });

    it('can use bulk with only equip operations', async function () {
      // On a single call we remove the gem from the first slot and add 2 gems on the other 2 slots
      await bulkWriterPerCollection.bulkEquip(
        kanariaId,
        [],
        [
          {
            tokenId: kanariaId,
            childIndex: 1,
            assetId: assetForKanariaFull,
            slotPartId: slotIdGemMid,
            childAssetId: assetForGemAMid,
          },
          {
            tokenId: kanariaId,
            childIndex: 2,
            assetId: assetForKanariaFull,
            slotPartId: slotIdGemRight,
            childAssetId: assetForGemBRight,
          },
        ],
      );

      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemLeft)).to.eql([
        bn(assetForKanariaFull),
        bn(assetForGemALeft),
        gemId1,
        gem.address,
      ]);
      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemMid)).to.eql([
        bn(assetForKanariaFull),
        bn(assetForGemAMid),
        gemId2,
        gem.address,
      ]);
      expect(await kanaria.getEquipment(kanariaId, catalog.address, slotIdGemRight)).to.eql([
        bn(assetForKanariaFull),
        bn(assetForGemBRight),
        gemId3,
        gem.address,
      ]);
    });

    it('cannot do operations if not writer is not approved', async function () {
      await kanaria.setApprovalForAll(bulkWriterPerCollection.address, false);

      // On a single call we remove the gem from the first slot and add 2 gems on the other 2 slots
      await expect(
        bulkWriterPerCollection.bulkEquip(
          kanariaId,
          [
            {
              assetId: assetForKanariaFull,
              slotPartId: slotIdGemLeft,
            },
          ],
          [
            {
              tokenId: kanariaId,
              childIndex: 1,
              assetId: assetForKanariaFull,
              slotPartId: slotIdGemMid,
              childAssetId: assetForGemAMid,
            },
          ],
        ),
      ).to.be.revertedWithCustomError(kanaria, 'ERC721NotApprovedOrOwner');

      await expect(
        bulkWriterPerCollection.replaceEquip({
          tokenId: kanariaId,
          childIndex: 1,
          assetId: assetForKanariaFull,
          slotPartId: slotIdGemLeft,
          childAssetId: assetForGemALeft,
        }),
      ).to.be.revertedWithCustomError(kanaria, 'ERC721NotApprovedOrOwner');
    });

    it('cannot do operations if not token owner', async function () {
      const [, notOwner] = await ethers.getSigners();

      await expect(
        bulkWriterPerCollection.connect(notOwner).bulkEquip(
          kanariaId,
          [
            {
              assetId: assetForKanariaFull,
              slotPartId: slotIdGemLeft,
            },
          ],
          [
            {
              tokenId: kanariaId,
              childIndex: 1,
              assetId: assetForKanariaFull,
              slotPartId: slotIdGemMid,
              childAssetId: assetForGemAMid,
            },
          ],
        ),
      ).to.be.revertedWithCustomError(
        bulkWriterPerCollection,
        'RMRKCanOnlyDoBulkOperationsOnOwnedTokens',
      );

      await expect(
        bulkWriterPerCollection.connect(notOwner).replaceEquip({
          tokenId: kanariaId,
          childIndex: 1,
          assetId: assetForKanariaFull,
          slotPartId: slotIdGemLeft,
          childAssetId: assetForGemALeft,
        }),
      ).to.be.revertedWithCustomError(
        bulkWriterPerCollection,
        'RMRKCanOnlyDoBulkOperationsOnOwnedTokens',
      );
    });

    it('cannot do operations for if token id on equip data, does not match', async function () {
      const otherId = 2;
      await expect(
        bulkWriterPerCollection.bulkEquip(
          kanariaId,
          [],
          [
            {
              tokenId: otherId,
              childIndex: 1,
              assetId: assetForKanariaFull,
              slotPartId: slotIdGemMid,
              childAssetId: assetForGemAMid,
            },
          ],
        ),
      ).to.be.revertedWithCustomError(
        bulkWriterPerCollection,
        'RMRKCanOnlyDoBulkOperationsWithOneTokenAtATime',
      );
    });
  });
});
