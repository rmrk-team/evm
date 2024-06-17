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
  const kanariaAddress = await kanaria.getAddress();

  const gem = <RMRKEquippableMock>await equipFactory.deploy();
  await gem.waitForDeployment();
  const gemAddress = await gem.getAddress();

  const bulkWriterPerCollection = <RMRKBulkWriterPerCollection>(
    await bulkWriterPerCollectionFactory.deploy(kanariaAddress)
  );
  await bulkWriterPerCollection.waitForDeployment();

  const bulkWriter = <RMRKBulkWriter>await bulkWriterFactory.deploy();
  await bulkWriter.waitForDeployment();

  const [owner] = await ethers.getSigners();

  const kanariaId = await mintFromMock(kanaria, owner.address);
  const gemId1 = await nestMintFromMock(gem, kanariaAddress, kanariaId);
  const gemId2 = await nestMintFromMock(gem, kanariaAddress, kanariaId);
  const gemId3 = await nestMintFromMock(gem, kanariaAddress, kanariaId);
  await kanaria.acceptChild(kanariaId, 0, gemAddress, gemId1);
  await kanaria.acceptChild(kanariaId, 1, gemAddress, gemId2);
  await kanaria.acceptChild(kanariaId, 0, gemAddress, gemId3);

  await setUpCatalog(catalog, gemAddress);
  await setUpKanariaAsset(kanaria, kanariaId, await catalog.getAddress());
  await setUpGemAssets(gem, gemId1, gemId2, gemId3, kanariaAddress, await catalog.getAddress());

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

describe('Bulk writer', async function () {
  let owner: SignerWithAddress;
  let catalog: RMRKCatalogImpl;
  let kanaria: RMRKEquippableMock;
  let kanariaAddress: string;
  let gem: RMRKEquippableMock;
  let gemAddress: string;
  let bulkWriter: RMRKBulkWriter;
  let bulkWritterAddress: string;
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
    kanariaAddress = await kanaria.getAddress();
    gemAddress = await gem.getAddress();
    bulkWritterAddress = await bulkWriter.getAddress();
  });

  describe('With General Bulk Writer', async function () {
    describe('Bulk Equip', async function () {
      beforeEach(async function () {
        await kanaria.setApprovalForAllForAssets(bulkWritterAddress, true);
        await kanaria.equip({
          tokenId: kanariaId,
          childIndex: 0,
          assetId: assetForKanariaFull,
          slotPartId: slotIdGemLeft,
          childAssetId: assetForGemALeft,
        });
      });

      it('can replace equip', async function () {
        await bulkWriter.replaceEquip(kanariaAddress, {
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
          kanariaAddress,
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
          kanariaAddress,
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
          kanariaAddress,
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
        await kanaria.setApprovalForAllForAssets(bulkWritterAddress, false);

        // On a single call we remove the gem from the first slot and add 2 gems on the other 2 slots
        await expect(
          bulkWriter.bulkEquip(
            kanariaAddress,
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
          bulkWriter.replaceEquip(kanariaAddress, {
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
            kanariaAddress,
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
          bulkWriter.connect(notOwner).replaceEquip(kanariaAddress, {
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
            kanariaAddress,
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
          bulkWriter,
          'RMRKCanOnlyDoBulkOperationsWithOneTokenAtATime',
        );
      });
    });

    describe('Bulk Child Transfer', async function () {
      beforeEach(async function () {
        await kanaria.setApprovalForAll(bulkWritterAddress, true);
      });

      it('can transfer children in bulk', async function () {
        await bulkWriter.bulkTransferChildren(kanariaAddress, kanariaId, [0, 2], owner.address, 0);

        expect((await gem.directOwnerOf(gemId1)).owner_).to.equal(owner.address);
        expect((await gem.directOwnerOf(gemId2)).owner_).to.equal(kanariaAddress);
        expect((await gem.directOwnerOf(gemId3)).owner_).to.equal(owner.address);
      });

      it('can transfer all children in bulk', async function () {
        await bulkWriter.bulkTransferAllChildren(kanariaAddress, kanariaId, owner.address, 0);

        expect((await gem.directOwnerOf(gemId1)).owner_).to.equal(owner.address);
        expect((await gem.directOwnerOf(gemId2)).owner_).to.equal(owner.address);
        expect((await gem.directOwnerOf(gemId3)).owner_).to.equal(owner.address);
      });

      it('can transfer all children in bulk and it ignores if soulbound', async function () {
        const soulboundFactory = await ethers.getContractFactory('RMRKSoulboundNestableMock');
        const soulbound = await soulboundFactory.deploy();
        await soulbound.waitForDeployment();
        const soulboundAddress = await soulbound.getAddress();
        const soulboundTokenId = 1n;

        await soulbound.nestMint(kanariaAddress, soulboundTokenId, kanariaId);
        await kanaria.acceptChild(kanariaId, 0, soulboundAddress, soulboundTokenId);

        await bulkWriter.bulkTransferAllChildren(kanariaAddress, kanariaId, owner.address, 0);

        expect((await soulbound.directOwnerOf(soulboundTokenId)).owner_).to.equal(kanariaAddress);
        expect((await gem.directOwnerOf(gemId1)).owner_).to.equal(owner.address);
        expect((await gem.directOwnerOf(gemId2)).owner_).to.equal(owner.address);
        expect((await gem.directOwnerOf(gemId3)).owner_).to.equal(owner.address);
      });

      it('cannot do operations if not writer is not approved', async function () {
        await kanaria.setApprovalForAll(bulkWritterAddress, false);

        // On a single call we remove the gem from the first slot and add 2 gems on the other 2 slots
        await expect(
          bulkWriter.bulkTransferChildren(kanariaAddress, kanariaId, [0, 2], owner.address, 0),
        ).to.be.revertedWithCustomError(kanaria, 'ERC721NotApprovedOrOwner');

        await expect(
          bulkWriter.bulkTransferAllChildren(kanariaAddress, kanariaId, owner.address, 0),
        ).to.be.revertedWithCustomError(kanaria, 'ERC721NotApprovedOrOwner');
      });

      it('cannot do operations if not token owner', async function () {
        const [, notOwner] = await ethers.getSigners();

        await expect(
          bulkWriter
            .connect(notOwner)
            .bulkTransferChildren(kanariaAddress, kanariaId, [0, 2], owner.address, 0),
        ).to.be.revertedWithCustomError(bulkWriter, 'RMRKCanOnlyDoBulkOperationsOnOwnedTokens');

        await expect(
          bulkWriter
            .connect(notOwner)
            .bulkTransferAllChildren(kanariaAddress, kanariaId, owner.address, 0),
        ).to.be.revertedWithCustomError(bulkWriter, 'RMRKCanOnlyDoBulkOperationsOnOwnedTokens');
      });
    });

    describe('Unequip+Transfer+Accept+Unequip+Equip', async function () {
      let kanariaId2: bigint;
      let gemId4: bigint;
      let defaultEquipData = {
        tokenId: 0n,
        childIndex: 0n,
        assetId: 0n,
        slotPartId: 0n,
        childAssetId: 0n,
      };
      beforeEach(async function () {
        // Mint and configure a second kanaria
        kanariaId2 = await mintFromMock(kanaria, owner.address);
        await kanaria.addAssetToToken(kanariaId2, assetForKanariaFull, 0);
        await kanaria.acceptAsset(kanariaId2, 0, assetForKanariaFull);

        // Mint and configure a gem into the second kanaria
        gemId4 = await nestMintFromMock(gem, kanariaAddress, kanariaId2);
        await gem.addAssetToToken(gemId4, assetForGemALeft, 0);
        await gem.acceptAsset(gemId4, 0, assetForGemALeft);

        // Approve the bulk writer for all operations
        await kanaria.setApprovalForAllForAssets(bulkWritterAddress, true); // For equip / unequip
        await kanaria.setApprovalForAll(bulkWritterAddress, true); // For transfer and accepting children
      });

      it('can transfer and accept child', async function () {
        // We unnest it first so it starts from EoA
        await kanaria.transferChild(
          kanariaId,
          owner.address,
          0,
          0,
          gemAddress,
          gemId1,
          false,
          ethers.ZeroHash,
        );
        await gem.setApprovalForAll(bulkWritterAddress, true); // For transfer and accepting children

        // Parent data must be empty in this case
        const parentData = {
          parentCollection: ethers.ZeroAddress,
          parentTokenId: 0,
          childIndexInParent: 0,
          parentEquippedAssetId: 0,
          parentEquippedSlotPartId: 0,
        };

        await bulkWriter.transferAndEquip(
          gemAddress,
          gemId1,
          kanariaAddress,
          kanariaId2,
          parentData,
          defaultEquipData,
        );

        expect(await gem.directOwnerOf(gemId1)).to.eql([kanariaAddress, kanariaId2, true]);
        expect(await kanaria.childrenOf(kanariaId2)).to.eql([[gemId1, gemAddress]]);
      });

      it('cannot transfer and accept child if not owned', async function () {
        const [, notOwner] = await ethers.getSigners();
        const parentData = {
          parentCollection: kanariaAddress,
          parentTokenId: kanariaId,
          childIndexInParent: 0,
          parentEquippedAssetId: 0,
          parentEquippedSlotPartId: 0,
        };

        await expect(
          bulkWriter
            .connect(notOwner)
            .transferAndEquip(
              gemAddress,
              gemId1,
              kanariaAddress,
              kanariaId2,
              parentData,
              defaultEquipData,
            ),
        ).to.be.revertedWithCustomError(bulkWriter, 'RMRKCanOnlyDoBulkOperationsOnOwnedTokens');
      });

      it('can nest transfer and accept child', async function () {
        const parentData = {
          parentCollection: kanariaAddress,
          parentTokenId: kanariaId,
          childIndexInParent: 0,
          parentEquippedAssetId: 0,
          parentEquippedSlotPartId: 0,
        };

        await bulkWriter.transferAndEquip(
          gemAddress,
          gemId1,
          kanariaAddress,
          kanariaId2,
          parentData,
          defaultEquipData,
        );

        expect(await gem.directOwnerOf(gemId1)).to.eql([kanariaAddress, kanariaId2, true]);
        expect(await kanaria.childrenOf(kanariaId2)).to.eql([[gemId1, gemAddress]]);
      });

      it('can unequip, nest transfer and accept child', async function () {
        // The token we are moving is equipped
        await kanaria.equip({
          tokenId: kanariaId,
          childIndex: 0,
          assetId: assetForKanariaFull,
          slotPartId: slotIdGemLeft,
          childAssetId: assetForGemALeft,
        });

        const parentData = {
          parentCollection: kanariaAddress,
          parentTokenId: kanariaId,
          childIndexInParent: 0,
          parentEquippedAssetId: assetForKanariaFull,
          parentEquippedSlotPartId: slotIdGemLeft,
        };

        await bulkWriter.transferAndEquip(
          gemAddress,
          gemId1,
          kanariaAddress,
          kanariaId2,
          parentData,
          defaultEquipData,
        );

        expect(await gem.directOwnerOf(gemId1)).to.eql([kanariaAddress, kanariaId2, true]);
        expect(await kanaria.childrenOf(kanariaId2)).to.eql([[gemId1, gemAddress]]);
      });

      it('can unequip, nest transfer, accept child and equip in new parent', async function () {
        // The token we are moving is equipped
        await kanaria.equip({
          tokenId: kanariaId,
          childIndex: 0,
          assetId: assetForKanariaFull,
          slotPartId: slotIdGemLeft,
          childAssetId: assetForGemALeft,
        });

        const parentData = {
          parentCollection: kanariaAddress,
          parentTokenId: kanariaId,
          childIndexInParent: 0,
          parentEquippedAssetId: assetForKanariaFull,
          parentEquippedSlotPartId: slotIdGemLeft,
        };
        const newEquipData = {
          tokenId: kanariaId2,
          childIndex: 0,
          assetId: assetForKanariaFull,
          slotPartId: slotIdGemLeft,
          childAssetId: assetForGemALeft,
        };

        await bulkWriter.transferAndEquip(
          gemAddress,
          gemId1,
          kanariaAddress,
          kanariaId2,
          parentData,
          newEquipData,
        );

        expect(await gem.directOwnerOf(gemId1)).to.eql([kanariaAddress, kanariaId2, true]);
        expect(await kanaria.childrenOf(kanariaId2)).to.eql([[gemId1, gemAddress]]);
        expect(await kanaria.isChildEquipped(kanariaId2, gemAddress, gemId1)).to.be.true;
      });

      it('can unequip, nest transfer, accept child, unequip destination slot and equip in new parent', async function () {
        // The token we are moving is equipped
        await kanaria.equip({
          tokenId: kanariaId,
          childIndex: 0,
          assetId: assetForKanariaFull,
          slotPartId: slotIdGemLeft,
          childAssetId: assetForGemALeft,
        });
        // The destination slot is also equipped, the bulk writer should unequip it first
        await kanaria.acceptChild(kanariaId2, 0, gemAddress, gemId4);
        await kanaria.equip({
          tokenId: kanariaId2,
          childIndex: 0,
          assetId: assetForKanariaFull,
          slotPartId: slotIdGemLeft,
          childAssetId: assetForGemALeft,
        });

        const parentData = {
          parentCollection: kanariaAddress,
          parentTokenId: kanariaId,
          childIndexInParent: 0,
          parentEquippedAssetId: assetForKanariaFull,
          parentEquippedSlotPartId: slotIdGemLeft,
        };
        const newEquipData = {
          tokenId: kanariaId2,
          childIndex: 1,
          assetId: assetForKanariaFull,
          slotPartId: slotIdGemLeft,
          childAssetId: assetForGemALeft,
        };

        await bulkWriter.transferAndEquip(
          gemAddress,
          gemId1,
          kanariaAddress,
          kanariaId2,
          parentData,
          newEquipData,
        );

        expect(await gem.directOwnerOf(gemId1)).to.eql([kanariaAddress, kanariaId2, true]);
        expect(await kanaria.childrenOf(kanariaId2)).to.eql([
          [gemId4, gemAddress],
          [gemId1, gemAddress],
        ]);
        expect(await kanaria.isChildEquipped(kanariaId2, gemAddress, gemId1)).to.be.true;
      });
    });
  });

  describe('With Bulk Writer Per Collection', async function () {
    beforeEach(async function () {
      await kanaria.setApprovalForAllForAssets(await bulkWriterPerCollection.getAddress(), true);

      await kanaria.equip({
        tokenId: kanariaId,
        childIndex: 0,
        assetId: assetForKanariaFull,
        slotPartId: slotIdGemLeft,
        childAssetId: assetForGemALeft,
      });
    });

    it('can get managed collection', async function () {
      expect(await bulkWriterPerCollection.getCollection()).to.equal(kanariaAddress);
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
