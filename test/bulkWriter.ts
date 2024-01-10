import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ADDRESS_ZERO, bn, mintFromMock, nestMintFromMock } from './utils';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import {
  RMRKCatalogImpl,
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
  const catalogFactory = await ethers.getContractFactory('RMRKCatalogImpl');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const bulkWriterPerCollectionFactory = await ethers.getContractFactory(
    'RMRKBulkWriterPerCollection',
  );
  const bulkWriterFactory = await ethers.getContractFactory('RMRKBulkWriter');

  const catalog = <RMRKCatalogImpl>await catalogFactory.deploy('ipfs://catalog.json', 'misc');

  const kanaria = <RMRKEquippableMock>await equipFactory.deploy();
  await kanaria.waitForDeployment();

  const gem = <RMRKEquippableMock>await equipFactory.deploy();
  await gem.waitForDeployment();

  const bulkWriterPerCollection = <RMRKBulkWriterPerCollection>(
    await bulkWriterPerCollectionFactory.deploy(await kanaria.getAddress())
  );
  await bulkWriterPerCollection.waitForDeployment();

  const bulkWriter = <RMRKBulkWriter>await bulkWriterFactory.deploy();
  await bulkWriter.waitForDeployment();

  const [owner] = await ethers.getSigners();

  const kanariaId = await mintFromMock(kanaria, await owner.getAddress());
  const gemId1 = await nestMintFromMock(gem, await kanaria.getAddress(), kanariaId);
  const gemId2 = await nestMintFromMock(gem, await kanaria.getAddress(), kanariaId);
  const gemId3 = await nestMintFromMock(gem, await kanaria.getAddress(), kanariaId);
  await kanaria.acceptChild(kanariaId, 0, await gem.getAddress(), gemId1);
  await kanaria.acceptChild(kanariaId, 1, await gem.getAddress(), gemId2);
  await kanaria.acceptChild(kanariaId, 0, await gem.getAddress(), gemId3);

  await setUpCatalog(catalog, await gem.getAddress());
  await setUpKanariaAsset(kanaria, kanariaId, await catalog.getAddress());
  await setUpGemAssets(
    gem,
    gemId1,
    gemId2,
    gemId3,
    await kanaria.getAddress(),
    await catalog.getAddress(),
  );

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
  let catalog: RMRKCatalogImpl;
  let kanaria: RMRKEquippableMock;
  let gem: RMRKEquippableMock;
  let bulkWriter: RMRKBulkWriter;
  let bulkWriterPerCollection: RMRKBulkWriterPerCollection;
  let kanariaId: bigint;
  let gemId1: bigint;
  let gemId2: bigint;
  let gemId3: bigint;

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
      await kanaria.setApprovalForAllForAssets(await bulkWriter.getAddress(), true);
    });

    it('can replace equip', async function () {
      await bulkWriter.replaceEquip(await kanaria.getAddress(), {
        tokenId: kanariaId,
        childIndex: 1,
        assetId: assetForKanariaFull,
        slotPartId: slotIdGemLeft,
        childAssetId: assetForGemALeft,
      });

      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemLeft),
      ).to.eql([bn(assetForKanariaFull), bn(assetForGemALeft), gemId2, await gem.getAddress()]);
    });

    it('can unequip and equip in bulk', async function () {
      // On a single call we remove the gem from the first slot and add 2 gems on the other 2 slots
      await bulkWriter.bulkEquip(
        await kanaria.getAddress(),
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

      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemLeft),
      ).to.eql([0n, 0n, 0n, ADDRESS_ZERO]);
      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemMid),
      ).to.eql([bn(assetForKanariaFull), bn(assetForGemAMid), gemId2, await gem.getAddress()]);
      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemRight),
      ).to.eql([bn(assetForKanariaFull), bn(assetForGemBRight), gemId3, await gem.getAddress()]);
    });

    it('can use bulk with only unequip operations', async function () {
      // On a single call we remove the gem from the first slot and add 2 gems on the other 2 slots
      await bulkWriter.bulkEquip(
        await kanaria.getAddress(),
        kanariaId,
        [
          {
            assetId: assetForKanariaFull,
            slotPartId: slotIdGemLeft,
          },
        ],
        [],
      );

      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemLeft),
      ).to.eql([0n, 0n, 0n, ADDRESS_ZERO]);
    });

    it('can use bulk with only equip operations', async function () {
      // On a single call we remove the gem from the first slot and add 2 gems on the other 2 slots
      await bulkWriter.bulkEquip(
        await kanaria.getAddress(),
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

      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemLeft),
      ).to.eql([bn(assetForKanariaFull), bn(assetForGemALeft), gemId1, await gem.getAddress()]);
      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemMid),
      ).to.eql([bn(assetForKanariaFull), bn(assetForGemAMid), gemId2, await gem.getAddress()]);
      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemRight),
      ).to.eql([bn(assetForKanariaFull), bn(assetForGemBRight), gemId3, await gem.getAddress()]);
    });

    it('cannot do operations if not writer is not approved', async function () {
      await kanaria.setApprovalForAllForAssets(await bulkWriter.getAddress(), false);

      // On a single call we remove the gem from the first slot and add 2 gems on the other 2 slots
      await expect(
        bulkWriter.bulkEquip(
          await kanaria.getAddress(),
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
      ).to.be.revertedWithCustomError(kanaria, 'RMRKNotApprovedForAssetsOrOwner');

      await expect(
        bulkWriter.replaceEquip(await kanaria.getAddress(), {
          tokenId: kanariaId,
          childIndex: 1,
          assetId: assetForKanariaFull,
          slotPartId: slotIdGemLeft,
          childAssetId: assetForGemALeft,
        }),
      ).to.be.revertedWithCustomError(kanaria, 'RMRKNotApprovedForAssetsOrOwner');
    });

    it('cannot do operations if not token owner', async function () {
      const [, notOwner] = await ethers.getSigners();

      await expect(
        bulkWriter.connect(notOwner).bulkEquip(
          await kanaria.getAddress(),
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
        bulkWriter.connect(notOwner).replaceEquip(await kanaria.getAddress(), {
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
          await kanaria.getAddress(),
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
      await kanaria.setApprovalForAllForAssets(await bulkWriterPerCollection.getAddress(), true);
    });

    it('can get managed collection', async function () {
      expect(await bulkWriterPerCollection.getCollection()).to.equal(await kanaria.getAddress());
    });

    it('can replace equip', async function () {
      await bulkWriterPerCollection.replaceEquip({
        tokenId: kanariaId,
        childIndex: 1,
        assetId: assetForKanariaFull,
        slotPartId: slotIdGemLeft,
        childAssetId: assetForGemALeft,
      });

      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemLeft),
      ).to.eql([bn(assetForKanariaFull), bn(assetForGemALeft), gemId2, await gem.getAddress()]);
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

      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemLeft),
      ).to.eql([0n, 0n, 0n, ADDRESS_ZERO]);
      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemMid),
      ).to.eql([bn(assetForKanariaFull), bn(assetForGemAMid), gemId2, await gem.getAddress()]);
      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemRight),
      ).to.eql([bn(assetForKanariaFull), bn(assetForGemBRight), gemId3, await gem.getAddress()]);
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

      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemLeft),
      ).to.eql([0n, 0n, 0n, ADDRESS_ZERO]);
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

      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemLeft),
      ).to.eql([bn(assetForKanariaFull), bn(assetForGemALeft), gemId1, await gem.getAddress()]);
      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemMid),
      ).to.eql([bn(assetForKanariaFull), bn(assetForGemAMid), gemId2, await gem.getAddress()]);
      expect(
        await kanaria.getEquipment(kanariaId, await catalog.getAddress(), slotIdGemRight),
      ).to.eql([bn(assetForKanariaFull), bn(assetForGemBRight), gemId3, await gem.getAddress()]);
    });

    it('cannot do operations if not writer is not approved', async function () {
      await kanaria.setApprovalForAllForAssets(await bulkWriterPerCollection.getAddress(), false);

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
      ).to.be.revertedWithCustomError(kanaria, 'RMRKNotApprovedForAssetsOrOwner');

      await expect(
        bulkWriterPerCollection.replaceEquip({
          tokenId: kanariaId,
          childIndex: 1,
          assetId: assetForKanariaFull,
          slotPartId: slotIdGemLeft,
          childAssetId: assetForGemALeft,
        }),
      ).to.be.revertedWithCustomError(kanaria, 'RMRKNotApprovedForAssetsOrOwner');
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
