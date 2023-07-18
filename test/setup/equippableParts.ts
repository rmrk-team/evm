import { ethers } from 'hardhat';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

let addrs: SignerWithAddress[];

const partIdForHead1 = 1;
const partIdForHead2 = 2;
const partIdForHead3 = 3;
const partIdForBody1 = 4;
const partIdForBody2 = 5;
const partIdForHair1 = 6;
const partIdForHair2 = 7;
const partIdForHair3 = 8;
const partIdForMaskCatalog1 = 9;
const partIdForMaskCatalog2 = 10;
const partIdForMaskCatalog3 = 11;
const partIdForEars1 = 12;
const partIdForEars2 = 13;
const partIdForHorns1 = 14;
const partIdForHorns2 = 15;
const partIdForHorns3 = 16;
const partIdForMaskCatalogEquipped1 = 17;
const partIdForMaskCatalogEquipped2 = 18;
const partIdForMaskCatalogEquipped3 = 19;
const partIdForEarsEquipped1 = 20;
const partIdForEarsEquipped2 = 21;
const partIdForHornsEquipped1 = 22;
const partIdForHornsEquipped2 = 23;
const partIdForHornsEquipped3 = 24;
const partIdForMask = 25;

const uniqueNeons = 10;
const uniqueMasks = 4;
// Ids could be the same since they are different collections, but to avoid log problems we have them unique
const neons: BigNumber[] = [];
const masks: BigNumber[] = [];

const neonResIds = [100, 101, 102, 103, 104];
const maskAssetsFull = [1, 2, 3, 4]; // Must match the total of uniqueAssets
const maskAssetsEquip = [5, 6, 7, 8]; // Must match the total of uniqueAssets
const maskEquippableGroupId = 1; // Assets to equip will all use this

enum ItemType {
  None,
  Slot,
  Fixed,
}

async function setupContextForParts(
  catalog: Contract,
  neon: Contract,
  neonEquip: Contract,
  mask: Contract,
  maskEquip: Contract,
  mint: (token: Contract, to: string) => Promise<BigNumber>,
  nestMint: (token: Contract, to: string, parentId: BigNumber) => Promise<BigNumber>,
) {
  const [, ...signersAddr] = await ethers.getSigners();
  addrs = signersAddr;

  await setupCatalog();

  await mintNeons();
  await mintMasks();

  await addAssetsToNeon();
  await addAssetsToMask();

  async function setupCatalog(): Promise<void> {
    const partForHead1 = {
      itemType: ItemType.Fixed,
      z: 1,
      equippable: [],
      metadataURI: 'ipfs://head1.png',
    };
    const partForHead2 = {
      itemType: ItemType.Fixed,
      z: 1,
      equippable: [],
      metadataURI: 'ipfs://head2.png',
    };
    const partForHead3 = {
      itemType: ItemType.Fixed,
      z: 1,
      equippable: [],
      metadataURI: 'ipfs://head3.png',
    };
    const partForBody1 = {
      itemType: ItemType.Fixed,
      z: 1,
      equippable: [],
      metadataURI: 'ipfs://body1.png',
    };
    const partForBody2 = {
      itemType: ItemType.Fixed,
      z: 1,
      equippable: [],
      metadataURI: 'ipfs://body2.png',
    };
    const partForHair1 = {
      itemType: ItemType.Fixed,
      z: 2,
      equippable: [],
      metadataURI: 'ipfs://hair1.png',
    };
    const partForHair2 = {
      itemType: ItemType.Fixed,
      z: 2,
      equippable: [],
      metadataURI: 'ipfs://hair2.png',
    };
    const partForHair3 = {
      itemType: ItemType.Fixed,
      z: 2,
      equippable: [],
      metadataURI: 'ipfs://hair3.png',
    };
    const partForMaskCatalog1 = {
      itemType: ItemType.Fixed,
      z: 3,
      equippable: [],
      metadataURI: 'ipfs://maskCatalog1.png',
    };
    const partForMaskCatalog2 = {
      itemType: ItemType.Fixed,
      z: 3,
      equippable: [],
      metadataURI: 'ipfs://maskCatalog2.png',
    };
    const partForMaskCatalog3 = {
      itemType: ItemType.Fixed,
      z: 3,
      equippable: [],
      metadataURI: 'ipfs://maskCatalog3.png',
    };
    const partForEars1 = {
      itemType: ItemType.Fixed,
      z: 4,
      equippable: [],
      metadataURI: 'ipfs://ears1.png',
    };
    const partForEars2 = {
      itemType: ItemType.Fixed,
      z: 4,
      equippable: [],
      metadataURI: 'ipfs://ears2.png',
    };
    const partForHorns1 = {
      itemType: ItemType.Fixed,
      z: 5,
      equippable: [],
      metadataURI: 'ipfs://horn1.png',
    };
    const partForHorns2 = {
      itemType: ItemType.Fixed,
      z: 5,
      equippable: [],
      metadataURI: 'ipfs://horn2.png',
    };
    const partForHorns3 = {
      itemType: ItemType.Fixed,
      z: 5,
      equippable: [],
      metadataURI: 'ipfs://horn3.png',
    };
    const partForMaskCatalogEquipped1 = {
      itemType: ItemType.Fixed,
      z: 3,
      equippable: [],
      metadataURI: 'ipfs://maskCatalogEquipped1.png',
    };
    const partForMaskCatalogEquipped2 = {
      itemType: ItemType.Fixed,
      z: 3,
      equippable: [],
      metadataURI: 'ipfs://maskCatalogEquipped2.png',
    };
    const partForMaskCatalogEquipped3 = {
      itemType: ItemType.Fixed,
      z: 3,
      equippable: [],
      metadataURI: 'ipfs://maskCatalogEquipped3.png',
    };
    const partForEarsEquipped1 = {
      itemType: ItemType.Fixed,
      z: 4,
      equippable: [],
      metadataURI: 'ipfs://earsEquipped1.png',
    };
    const partForEarsEquipped2 = {
      itemType: ItemType.Fixed,
      z: 4,
      equippable: [],
      metadataURI: 'ipfs://earsEquipped2.png',
    };
    const partForHornsEquipped1 = {
      itemType: ItemType.Fixed,
      z: 5,
      equippable: [],
      metadataURI: 'ipfs://hornEquipped1.png',
    };
    const partForHornsEquipped2 = {
      itemType: ItemType.Fixed,
      z: 5,
      equippable: [],
      metadataURI: 'ipfs://hornEquipped2.png',
    };
    const partForHornsEquipped3 = {
      itemType: ItemType.Fixed,
      z: 5,
      equippable: [],
      metadataURI: 'ipfs://hornEquipped3.png',
    };
    const partForMask = {
      itemType: ItemType.Slot,
      z: 2,
      equippable: [maskEquip.address],
      metadataURI: '',
    };

    await catalog.addPartList([
      { partId: partIdForHead1, part: partForHead1 },
      { partId: partIdForHead2, part: partForHead2 },
      { partId: partIdForHead3, part: partForHead3 },
      { partId: partIdForBody1, part: partForBody1 },
      { partId: partIdForBody2, part: partForBody2 },
      { partId: partIdForHair1, part: partForHair1 },
      { partId: partIdForHair2, part: partForHair2 },
      { partId: partIdForHair3, part: partForHair3 },
      { partId: partIdForMaskCatalog1, part: partForMaskCatalog1 },
      { partId: partIdForMaskCatalog2, part: partForMaskCatalog2 },
      { partId: partIdForMaskCatalog3, part: partForMaskCatalog3 },
      { partId: partIdForEars1, part: partForEars1 },
      { partId: partIdForEars2, part: partForEars2 },
      { partId: partIdForHorns1, part: partForHorns1 },
      { partId: partIdForHorns2, part: partForHorns2 },
      { partId: partIdForHorns3, part: partForHorns3 },
      { partId: partIdForMaskCatalogEquipped1, part: partForMaskCatalogEquipped1 },
      { partId: partIdForMaskCatalogEquipped2, part: partForMaskCatalogEquipped2 },
      { partId: partIdForMaskCatalogEquipped3, part: partForMaskCatalogEquipped3 },
      { partId: partIdForEarsEquipped1, part: partForEarsEquipped1 },
      { partId: partIdForEarsEquipped2, part: partForEarsEquipped2 },
      { partId: partIdForHornsEquipped1, part: partForHornsEquipped1 },
      { partId: partIdForHornsEquipped2, part: partForHornsEquipped2 },
      { partId: partIdForHornsEquipped3, part: partForHornsEquipped3 },
      { partId: partIdForMask, part: partForMask },
    ]);
  }

  async function mintNeons(): Promise<void> {
    // This array is reused, so we "empty" it before
    neons.length = 0;
    // Using only first 3 addresses to mint
    for (let i = 0; i < uniqueNeons; i++) {
      const newId = await mint(neon, addrs[i % 3].address);
      neons.push(newId);
    }
  }

  async function mintMasks(): Promise<void> {
    // This array is reused, so we "empty" it before
    masks.length = 0;
    // Mint one weapon to neon
    for (let i = 0; i < uniqueNeons; i++) {
      const newId = await nestMint(mask, neon.address, neons[i]);
      masks.push(newId);
      await neon.connect(addrs[i % 3]).acceptChild(neons[i], 0, mask.address, newId);
    }
  }

  async function addAssetsToNeon(): Promise<void> {
    await neonEquip.addEquippableAssetEntry(neonResIds[0], 0, catalog.address, 'ipfs:neonRes/1', [
      partIdForHead1,
      partIdForBody1,
      partIdForHair1,
      partIdForMask,
    ]);
    await neonEquip.addEquippableAssetEntry(neonResIds[1], 0, catalog.address, 'ipfs:neonRes/2', [
      partIdForHead2,
      partIdForBody2,
      partIdForHair2,
      partIdForMask,
    ]);
    await neonEquip.addEquippableAssetEntry(neonResIds[2], 0, catalog.address, 'ipfs:neonRes/3', [
      partIdForHead3,
      partIdForBody1,
      partIdForHair3,
      partIdForMask,
    ]);
    await neonEquip.addEquippableAssetEntry(neonResIds[3], 0, catalog.address, 'ipfs:neonRes/4', [
      partIdForHead1,
      partIdForBody2,
      partIdForHair2,
      partIdForMask,
    ]);
    await neonEquip.addEquippableAssetEntry(neonResIds[4], 0, catalog.address, 'ipfs:neonRes/1', [
      partIdForHead2,
      partIdForBody1,
      partIdForHair1,
      partIdForMask,
    ]);

    for (let i = 0; i < uniqueNeons; i++) {
      await neonEquip.addAssetToToken(neons[i], neonResIds[i % neonResIds.length], 0);
      await neonEquip
        .connect(addrs[i % 3])
        .acceptAsset(neons[i], 0, neonResIds[i % neonResIds.length]);
    }
  }

  async function addAssetsToMask(): Promise<void> {
    // Assets for full view, composed with fixed parts
    await maskEquip.addEquippableAssetEntry(
      maskAssetsFull[0],
      0, // Not meant to equip
      catalog.address, // Not meant to equip, but catalog needed for parts
      `ipfs:weapon/full/${maskAssetsFull[0]}`,
      [partIdForMaskCatalog1, partIdForHorns1, partIdForEars1],
    );
    await maskEquip.addEquippableAssetEntry(
      maskAssetsFull[1],
      0, // Not meant to equip
      catalog.address, // Not meant to equip, but catalog needed for parts
      `ipfs:weapon/full/${maskAssetsFull[1]}`,
      [partIdForMaskCatalog2, partIdForHorns2, partIdForEars2],
    );
    await maskEquip.addEquippableAssetEntry(
      maskAssetsFull[2],
      0, // Not meant to equip
      catalog.address, // Not meant to equip, but catalog needed for parts
      `ipfs:weapon/full/${maskAssetsFull[2]}`,
      [partIdForMaskCatalog3, partIdForHorns1, partIdForEars2],
    );
    await maskEquip.addEquippableAssetEntry(
      maskAssetsFull[3],
      0, // Not meant to equip
      catalog.address, // Not meant to equip, but catalog needed for parts
      `ipfs:weapon/full/${maskAssetsFull[3]}`,
      [partIdForMaskCatalog2, partIdForHorns2, partIdForEars1],
    );

    // Assets for equipping view, also composed with fixed parts
    await maskEquip.addEquippableAssetEntry(
      maskAssetsEquip[0],
      maskEquippableGroupId,
      catalog.address,
      `ipfs:weapon/equip/${maskAssetsEquip[0]}`,
      [partIdForMaskCatalog1, partIdForHorns1, partIdForEars1],
    );

    // Assets for equipping view, also composed with fixed parts
    await maskEquip.addEquippableAssetEntry(
      maskAssetsEquip[1],
      maskEquippableGroupId,
      catalog.address,
      `ipfs:weapon/equip/${maskAssetsEquip[1]}`,
      [partIdForMaskCatalog2, partIdForHorns2, partIdForEars2],
    );

    // Assets for equipping view, also composed with fixed parts
    await maskEquip.addEquippableAssetEntry(
      maskAssetsEquip[2],
      maskEquippableGroupId,
      catalog.address,
      `ipfs:weapon/equip/${maskAssetsEquip[2]}`,
      [partIdForMaskCatalog3, partIdForHorns1, partIdForEars2],
    );

    // Assets for equipping view, also composed with fixed parts
    await maskEquip.addEquippableAssetEntry(
      maskAssetsEquip[3],
      maskEquippableGroupId,
      catalog.address,
      `ipfs:weapon/equip/${maskAssetsEquip[3]}`,
      [partIdForMaskCatalog2, partIdForHorns2, partIdForEars1],
    );

    // Can be equipped into neons
    await maskEquip.setValidParentForEquippableGroup(
      maskEquippableGroupId,
      neonEquip.address,
      partIdForMask,
    );

    // Add 2 assets to each weapon, one full, one for equip
    // There are 10 weapon tokens for 4 unique assets so we use %
    for (let i = 0; i < masks.length; i++) {
      await maskEquip.addAssetToToken(masks[i], maskAssetsFull[i % uniqueMasks], 0);
      await maskEquip.addAssetToToken(masks[i], maskAssetsEquip[i % uniqueMasks], 0);
      await maskEquip
        .connect(addrs[i % 3])
        .acceptAsset(masks[i], 0, maskAssetsFull[i % uniqueMasks]);
      await maskEquip
        .connect(addrs[i % 3])
        .acceptAsset(masks[i], 0, maskAssetsEquip[i % uniqueMasks]);
    }
  }
}

export {
  partIdForHead1,
  partIdForHead2,
  partIdForHead3,
  partIdForBody1,
  partIdForBody2,
  partIdForHair1,
  partIdForHair2,
  partIdForHair3,
  partIdForMaskCatalog1,
  partIdForMaskCatalog2,
  partIdForMaskCatalog3,
  partIdForEars1,
  partIdForEars2,
  partIdForHorns1,
  partIdForHorns2,
  partIdForHorns3,
  partIdForMaskCatalogEquipped1,
  partIdForMaskCatalogEquipped2,
  partIdForMaskCatalogEquipped3,
  partIdForEarsEquipped1,
  partIdForEarsEquipped2,
  partIdForHornsEquipped1,
  partIdForHornsEquipped2,
  partIdForHornsEquipped3,
  partIdForMask,
  uniqueNeons,
  uniqueMasks,
  neons,
  masks,
  neonResIds,
  maskAssetsFull,
  maskAssetsEquip,
  maskEquippableGroupId,
  setupContextForParts,
};
