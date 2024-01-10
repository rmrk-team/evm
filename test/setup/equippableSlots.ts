import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { RMRKCatalogImpl, RMRKEquippableMock } from '../../typechain-types';

const partIdForBody = 1;
const partIdForWeapon = 2;
const partIdForWeaponGem = 3;
const partIdForBackground = 4;

const uniqueSoldiers = 10;
const uniqueWeapons = 4;
// const uniqueWeaponGems = 2;
// const uniqueBackgrounds = 3;

const soldiersIds: bigint[] = [];
const weaponsIds: bigint[] = [];
const weaponGemsIds: bigint[] = [];
const backgroundsIds: bigint[] = [];

const soldierResId = 100;
const weaponAssetsFull = [1, 2, 3, 4]; // Must match the total of uniqueAssets
const weaponAssetsEquip = [5, 6, 7, 8]; // Must match the total of uniqueAssets
const weaponGemAssetFull = 101;
const weaponGemAssetEquip = 102;
const backgroundAssetId = 200;

enum ItemType {
  None,
  Slot,
  Fixed,
}

let addrs: SignerWithAddress[];

async function setupContextForSlots(
  catalog: RMRKCatalogImpl,
  catalogForWeapon: RMRKCatalogImpl,
  soldier: RMRKEquippableMock,
  weapon: RMRKEquippableMock,
  weaponGem: RMRKEquippableMock,
  background: RMRKEquippableMock,
  mint: (token: RMRKEquippableMock, to: string) => Promise<bigint>,
  nestMint: (token: RMRKEquippableMock, to: string, parentId: bigint) => Promise<bigint>,
) {
  const [, ...signersAddr] = await ethers.getSigners();
  addrs = signersAddr;

  await setupCatalog();

  await mintSoldiers();
  await mintWeapons();
  await mintWeaponGems();
  await mintBackgrounds();

  await addAssetsToSoldier();
  await addAssetsToWeapon();
  await addAssetsToWeaponGem();
  await addAssetsToBackground();

  return {
    catalog,
    soldier,
    soldierEquip: soldier,
    weapon,
    weaponEquip: weapon,
    weaponGem,
    weaponGemEquip: weaponGem,
    background,
    backgroundEquip: background,
  };

  async function setupCatalog(): Promise<void> {
    const partForBody = {
      itemType: ItemType.Fixed,
      z: 1,
      equippable: [],
      metadataURI: 'genericBody.png',
    };
    const partForWeapon = {
      itemType: ItemType.Slot,
      z: 2,
      equippable: [await weapon.getAddress()],
      metadataURI: '',
    };
    const partForWeaponGem = {
      itemType: ItemType.Slot,
      z: 3,
      equippable: [await weaponGem.getAddress()],
      metadataURI: 'noGem.png',
    };
    const partForBackground = {
      itemType: ItemType.Slot,
      z: 0,
      equippable: [await background.getAddress()],
      metadataURI: 'noBackground.png',
    };

    await catalog.addPartList([
      { partId: partIdForBody, part: partForBody },
      { partId: partIdForWeapon, part: partForWeapon },
      { partId: partIdForBackground, part: partForBackground },
    ]);

    await catalogForWeapon.addPartList([{ partId: partIdForWeaponGem, part: partForWeaponGem }]);
  }

  async function mintSoldiers(): Promise<void> {
    // This array is reused, so we "empty" it before
    soldiersIds.length = 0;
    // Using only first 3 addresses to mint
    for (let i = 0; i < uniqueSoldiers; i++) {
      const newId = await mint(soldier, addrs[i % 3].address);
      soldiersIds.push(newId);
    }
  }

  async function mintWeapons(): Promise<void> {
    // This array is reused, so we "empty" it before
    weaponsIds.length = 0;
    // Mint one weapon to soldier
    for (let i = 0; i < uniqueSoldiers; i++) {
      const newId = await nestMint(weapon, await soldier.getAddress(), soldiersIds[i]);
      weaponsIds.push(newId);
      await soldier
        .connect(addrs[i % 3])
        .acceptChild(soldiersIds[i], 0, await weapon.getAddress(), newId);
    }
  }

  async function mintWeaponGems(): Promise<void> {
    // This array is reused, so we "empty" it before
    weaponGemsIds.length = 0;
    // Mint one weapon gem for each weapon on each soldier
    for (let i = 0; i < uniqueSoldiers; i++) {
      const newId = await nestMint(weaponGem, await weapon.getAddress(), weaponsIds[i]);
      weaponGemsIds.push(newId);
      await weapon
        .connect(addrs[i % 3])
        .acceptChild(weaponsIds[i], 0, await weaponGem.getAddress(), newId);
    }
  }

  async function mintBackgrounds(): Promise<void> {
    // This array is reused, so we "empty" it before
    backgroundsIds.length = 0;
    // Mint one background to soldier
    for (let i = 0; i < uniqueSoldiers; i++) {
      const newId = await nestMint(background, await soldier.getAddress(), soldiersIds[i]);
      backgroundsIds.push(newId);
      await soldier
        .connect(addrs[i % 3])
        .acceptChild(soldiersIds[i], 0, await background.getAddress(), newId);
    }
  }

  async function addAssetsToSoldier(): Promise<void> {
    await soldier.addEquippableAssetEntry(
      soldierResId,
      0,
      await catalog.getAddress(),
      'ipfs:soldier/',
      [partIdForBody, partIdForWeapon, partIdForBackground],
    );
    for (let i = 0; i < uniqueSoldiers; i++) {
      await soldier.addAssetToToken(soldiersIds[i], soldierResId, 0);
      await soldier.connect(addrs[i % 3]).acceptAsset(soldiersIds[i], 0, soldierResId);
    }
  }

  async function addAssetsToWeapon(): Promise<void> {
    const equippableGroupId = 1n; // Assets to equip will both use this

    for (let i = 0; i < weaponAssetsFull.length; i++) {
      await weapon.addEquippableAssetEntry(
        weaponAssetsFull[i],
        0, // Not meant to equip
        ethers.ZeroAddress, // Not meant to equip
        `ipfs:weapon/full/${weaponAssetsFull[i]}`,
        [],
      );
    }
    for (let i = 0; i < weaponAssetsEquip.length; i++) {
      await weapon.addEquippableAssetEntry(
        weaponAssetsEquip[i],
        equippableGroupId,
        await catalogForWeapon.getAddress(),
        `ipfs:weapon/equip/${weaponAssetsEquip[i]}`,
        [partIdForWeaponGem],
      );
    }

    // Can be equipped into soldiers
    await weapon.setValidParentForEquippableGroup(
      equippableGroupId,
      await soldier.getAddress(),
      partIdForWeapon,
    );

    // Add 2 assets to each weapon, one full, one for equip
    // There are 10 weapon tokens for 4 unique assets so we use %
    for (let i = 0; i < weaponsIds.length; i++) {
      await weapon.addAssetToToken(weaponsIds[i], weaponAssetsFull[i % uniqueWeapons], 0);
      await weapon.addAssetToToken(weaponsIds[i], weaponAssetsEquip[i % uniqueWeapons], 0);
      await weapon
        .connect(addrs[i % 3])
        .acceptAsset(weaponsIds[i], 0, weaponAssetsFull[i % uniqueWeapons]);
      await weapon
        .connect(addrs[i % 3])
        .acceptAsset(weaponsIds[i], 0, weaponAssetsEquip[i % uniqueWeapons]);
    }
  }

  async function addAssetsToWeaponGem(): Promise<void> {
    const equippableGroupId = 1n; // Assets to equip will use this
    await weaponGem.addEquippableAssetEntry(
      weaponGemAssetFull,
      0, // Not meant to equip
      ethers.ZeroAddress, // Not meant to equip
      'ipfs:weagponGem/full/',
      [],
    );
    await weaponGem.addEquippableAssetEntry(
      weaponGemAssetEquip,
      equippableGroupId,
      await catalog.getAddress(),
      'ipfs:weagponGem/equip/',
      [],
    );
    // Can be equipped into weapons
    await weaponGem.setValidParentForEquippableGroup(
      equippableGroupId,
      await weapon.getAddress(),
      partIdForWeaponGem,
    );

    for (let i = 0; i < uniqueSoldiers; i++) {
      await weaponGem.addAssetToToken(weaponGemsIds[i], weaponGemAssetFull, 0);
      await weaponGem.addAssetToToken(weaponGemsIds[i], weaponGemAssetEquip, 0);
      await weaponGem.connect(addrs[i % 3]).acceptAsset(weaponGemsIds[i], 0, weaponGemAssetFull);
      await weaponGem.connect(addrs[i % 3]).acceptAsset(weaponGemsIds[i], 0, weaponGemAssetEquip);
    }
  }

  async function addAssetsToBackground(): Promise<void> {
    const equippableGroupId = 1n; // Assets to equip will use this
    await background.addEquippableAssetEntry(
      backgroundAssetId,
      equippableGroupId,
      await catalog.getAddress(),
      'ipfs:background/',
      [],
    );
    // Can be equipped into soldiers
    await background.setValidParentForEquippableGroup(
      equippableGroupId,
      await soldier.getAddress(),
      partIdForBackground,
    );

    for (let i = 0; i < uniqueSoldiers; i++) {
      await background.addAssetToToken(backgroundsIds[i], backgroundAssetId, 0);
      await background.connect(addrs[i % 3]).acceptAsset(backgroundsIds[i], 0, backgroundAssetId);
    }
  }
}

export {
  partIdForBody,
  partIdForWeapon,
  partIdForWeaponGem,
  partIdForBackground,
  soldierResId,
  weaponAssetsFull,
  weaponAssetsEquip,
  weaponGemAssetFull,
  weaponGemAssetEquip,
  backgroundAssetId,
  soldiersIds,
  weaponsIds,
  weaponGemsIds,
  backgroundsIds,
  ItemType,
  setupContextForSlots,
};
