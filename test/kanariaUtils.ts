import { ethers } from 'hardhat';
import { RMRKCatalogMock, RMRKEquippableMock } from '../typechain-types';

// These refIds are used from the child's perspective, to group assets that can be equipped into a parent
// With it, we avoid the need to do set it asset by asset
const noEquippableGroup = 0;
const equippableRefIdLeftGem = 1;
const equippableRefIdMidGem = 2;
const equippableRefIdRightGem = 3;

const assetForGemAFull = 1;
const assetForGemALeft = 2;
const assetForGemAMid = 3;
const assetForGemARight = 4;
const assetForGemBFull = 5;
const assetForGemBLeft = 6;
const assetForGemBMid = 7;
const assetForGemBRight = 8;
const assetForKanariaFull = 9;

const slotIdGemLeft = 1;
const slotIdGemMid = 2;
const slotIdGemRight = 3;

async function setUpCatalog(catalog: RMRKCatalogMock, gemAddress: string): Promise<void> {
  await catalog.addPartList([
    {
      // Gems slot 1
      partId: slotIdGemLeft,
      part: {
        itemType: 1, // Slot
        z: 4,
        equippable: [gemAddress], // Only gems tokens can be equipped here
        metadataURI: 'ipfs://metadataSlotGemLeft',
      },
    },
    {
      // Gems slot 2
      partId: slotIdGemMid,
      part: {
        itemType: 1, // Slot
        z: 4,
        equippable: [gemAddress], // Only gems tokens can be equipped here
        metadataURI: 'ipfs://metadataSlotGemMid',
      },
    },
    {
      // Gems slot 3
      partId: slotIdGemRight,
      part: {
        itemType: 1, // Slot
        z: 4,
        equippable: [gemAddress], // Only gems tokens can be equipped here
        metadataURI: 'ipfs://metadataSlotGemRight',
      },
    },
  ]);
}

async function setUpKanariaAsset(
  kanaria: RMRKEquippableMock,
  kanariaId: number,
  catalogAddress: string,
): Promise<void> {
  await kanaria.addEquippableAssetEntry(
    assetForKanariaFull,
    noEquippableGroup,
    catalogAddress,
    `ipfs://kanaria/full.svg`,
    [slotIdGemLeft, slotIdGemMid, slotIdGemRight],
  );
  await kanaria.addAssetToToken(kanariaId, assetForKanariaFull, 0);
  await kanaria.acceptAsset(kanariaId, 0, assetForKanariaFull);
}

async function setUpGemAssets(
  gem: RMRKEquippableMock,
  gemId1: number,
  gemId2: number,
  gemId3: number,
  kanariaAddress: string,
  catalogAddress: string,
): Promise<void> {
  const [owner] = await ethers.getSigners();
  // We'll add 4 assets for each gem, a full version and 3 versions matching each slot.
  // We will have only 2 types of gems -> 4x2: 8 assets.
  // This is not composed by others, so fixed and slot parts are never used.
  await gem.addEquippableAssetEntry(
    assetForGemAFull,
    noEquippableGroup,
    catalogAddress,
    `ipfs://gems/typeA/full.svg`,
    [],
  );
  await gem.addEquippableAssetEntry(
    assetForGemALeft,
    equippableRefIdLeftGem,
    catalogAddress,
    `ipfs://gems/typeA/left.svg`,
    [],
  );
  await gem.addEquippableAssetEntry(
    assetForGemAMid,
    equippableRefIdMidGem,
    catalogAddress,
    `ipfs://gems/typeA/mid.svg`,
    [],
  );
  await gem.addEquippableAssetEntry(
    assetForGemARight,
    equippableRefIdRightGem,
    catalogAddress,
    `ipfs://gems/typeA/right.svg`,
    [],
  );
  await gem.addEquippableAssetEntry(
    assetForGemBFull,
    noEquippableGroup,
    catalogAddress,
    `ipfs://gems/typeB/full.svg`,
    [],
  );
  await gem.addEquippableAssetEntry(
    assetForGemBLeft,
    equippableRefIdLeftGem,
    catalogAddress,
    `ipfs://gems/typeB/left.svg`,
    [],
  );
  await gem.addEquippableAssetEntry(
    assetForGemBMid,
    equippableRefIdMidGem,
    catalogAddress,
    `ipfs://gems/typeB/mid.svg`,
    [],
  );
  await gem.addEquippableAssetEntry(
    assetForGemBRight,
    equippableRefIdRightGem,
    catalogAddress,
    `ipfs://gems/typeB/right.svg`,
    [],
  );

  await gem.setValidParentForEquippableGroup(equippableRefIdLeftGem, kanariaAddress, slotIdGemLeft);
  await gem.setValidParentForEquippableGroup(equippableRefIdMidGem, kanariaAddress, slotIdGemMid);
  await gem.setValidParentForEquippableGroup(
    equippableRefIdRightGem,
    kanariaAddress,
    slotIdGemRight,
  );

  // We add assets of type A to gem 1 and 2, and type Bto gem 3. Both are nested into the first kanaria
  // This means gems 1 and 2 will have the same asset, which is totally valid.
  await gem.addAssetToToken(gemId1, assetForGemAFull, 0);
  await gem.addAssetToToken(gemId1, assetForGemALeft, 0);
  await gem.addAssetToToken(gemId1, assetForGemAMid, 0);
  await gem.addAssetToToken(gemId1, assetForGemARight, 0);
  await gem.addAssetToToken(gemId2, assetForGemAFull, 0);
  await gem.addAssetToToken(gemId2, assetForGemALeft, 0);
  await gem.addAssetToToken(gemId2, assetForGemAMid, 0);
  await gem.addAssetToToken(gemId2, assetForGemARight, 0);
  await gem.addAssetToToken(gemId3, assetForGemBFull, 0);
  await gem.addAssetToToken(gemId3, assetForGemBLeft, 0);
  await gem.addAssetToToken(gemId3, assetForGemBMid, 0);
  await gem.addAssetToToken(gemId3, assetForGemBRight, 0);

  // We accept them backwards to easily know the right indices
  await gem.acceptAsset(gemId1, 3, assetForGemARight);
  await gem.acceptAsset(gemId1, 2, assetForGemAMid);
  await gem.acceptAsset(gemId1, 1, assetForGemALeft);
  await gem.acceptAsset(gemId1, 0, assetForGemAFull);
  await gem.acceptAsset(gemId2, 3, assetForGemARight);
  await gem.acceptAsset(gemId2, 2, assetForGemAMid);
  await gem.acceptAsset(gemId2, 1, assetForGemALeft);
  await gem.acceptAsset(gemId2, 0, assetForGemAFull);
  await gem.acceptAsset(gemId3, 3, assetForGemBRight);
  await gem.acceptAsset(gemId3, 2, assetForGemBMid);
  await gem.acceptAsset(gemId3, 1, assetForGemBLeft);
  await gem.acceptAsset(gemId3, 0, assetForGemBFull);
}

export {
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
};
