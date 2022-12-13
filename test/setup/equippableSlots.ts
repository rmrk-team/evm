import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

const partIdForBody = 1;
const partIdForWeapon = 2;
const partIdForWeaponGem = 3;
const partIdForBackground = 4;

const uniqueSoldiers = 10;
const uniqueWeapons = 4;
// const uniqueWeaponGems = 2;
// const uniqueBackgrounds = 3;

const soldiersIds: number[] = [];
const weaponsIds: number[] = [];
const weaponGemsIds: number[] = [];
const backgroundsIds: number[] = [];

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
  base: Contract,
  soldier: Contract,
  soldierEquip: Contract,
  weapon: Contract,
  weaponEquip: Contract,
  weaponGem: Contract,
  weaponGemEquip: Contract,
  background: Contract,
  backgroundEquip: Contract,
  mint: (token: Contract, to: string) => Promise<number>,
  nestMint: (token: Contract, to: string, parentId: number) => Promise<number>,
) {
  const [, ...signersAddr] = await ethers.getSigners();
  addrs = signersAddr;

  await setupBase();

  await mintSoldiers();
  await mintWeapons();
  await mintWeaponGems();
  await mintBackgrounds();

  await addAssetsToSoldier();
  await addAssetsToWeapon();
  await addAssetsToWeaponGem();
  await addAssetsToBackground();

  return {
    base,
    soldier,
    soldierEquip,
    weapon,
    weaponEquip,
    weaponGem,
    weaponGemEquip,
    background,
    backgroundEquip,
  };

  async function setupBase(): Promise<void> {
    const partForBody = {
      itemType: ItemType.Fixed,
      z: 1,
      equippable: [],
      metadataURI: 'genericBody.png',
    };
    const partForWeapon = {
      itemType: ItemType.Slot,
      z: 2,
      equippable: [weaponEquip.address],
      metadataURI: '',
    };
    const partForWeaponGem = {
      itemType: ItemType.Slot,
      z: 3,
      equippable: [weaponGemEquip.address],
      metadataURI: 'noGem.png',
    };
    const partForBackground = {
      itemType: ItemType.Slot,
      z: 0,
      equippable: [backgroundEquip.address],
      metadataURI: 'noBackground.png',
    };

    await base.addPartList([
      { partId: partIdForBody, part: partForBody },
      { partId: partIdForWeapon, part: partForWeapon },
      { partId: partIdForWeaponGem, part: partForWeaponGem },
      { partId: partIdForBackground, part: partForBackground },
    ]);
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
      const newId = await nestMint(weapon, soldier.address, soldiersIds[i]);
      weaponsIds.push(newId);
      await soldier.connect(addrs[i % 3]).acceptChild(soldiersIds[i], 0, weapon.address, newId);
    }
  }

  async function mintWeaponGems(): Promise<void> {
    // This array is reused, so we "empty" it before
    weaponGemsIds.length = 0;
    // Mint one weapon gem for each weapon on each soldier
    for (let i = 0; i < uniqueSoldiers; i++) {
      const newId = await nestMint(weaponGem, weapon.address, weaponsIds[i]);
      weaponGemsIds.push(newId);
      await weapon.connect(addrs[i % 3]).acceptChild(weaponsIds[i], 0, weaponGem.address, newId);
    }
  }

  async function mintBackgrounds(): Promise<void> {
    // This array is reused, so we "empty" it before
    backgroundsIds.length = 0;
    // Mint one background to soldier
    for (let i = 0; i < uniqueSoldiers; i++) {
      const newId = await nestMint(background, soldier.address, soldiersIds[i]);
      backgroundsIds.push(newId);
      await soldier.connect(addrs[i % 3]).acceptChild(soldiersIds[i], 0, background.address, newId);
    }
  }

  async function addAssetsToSoldier(): Promise<void> {
    await soldierEquip.addEquippableAssetEntry(soldierResId, 0, base.address, 'ipfs:soldier/', [
      partIdForBody,
      partIdForWeapon,
      partIdForBackground,
    ]);
    for (let i = 0; i < uniqueSoldiers; i++) {
      await soldierEquip.addAssetToToken(soldiersIds[i], soldierResId, 0);
      await soldierEquip.connect(addrs[i % 3]).acceptAsset(soldiersIds[i], 0, soldierResId);
    }
  }

  async function addAssetsToWeapon(): Promise<void> {
    const equippableGroupId = 1; // Assets to equip will both use this

    for (let i = 0; i < weaponAssetsFull.length; i++) {
      await weaponEquip.addEquippableAssetEntry(
        weaponAssetsFull[i],
        0, // Not meant to equip
        ethers.constants.AddressZero, // Not meant to equip
        `ipfs:weapon/full/${weaponAssetsFull[i]}`,
        [],
      );
    }
    for (let i = 0; i < weaponAssetsEquip.length; i++) {
      await weaponEquip.addEquippableAssetEntry(
        weaponAssetsEquip[i],
        equippableGroupId,
        base.address,
        `ipfs:weapon/equip/${weaponAssetsEquip[i]}`,
        [partIdForWeaponGem],
      );
    }

    // Can be equipped into soldiers
    await weaponEquip.setValidParentForEquippableGroup(
      equippableGroupId,
      soldierEquip.address,
      partIdForWeapon,
    );

    // Add 2 assets to each weapon, one full, one for equip
    // There are 10 weapon tokens for 4 unique assets so we use %
    for (let i = 0; i < weaponsIds.length; i++) {
      await weaponEquip.addAssetToToken(weaponsIds[i], weaponAssetsFull[i % uniqueWeapons], 0);
      await weaponEquip.addAssetToToken(weaponsIds[i], weaponAssetsEquip[i % uniqueWeapons], 0);
      await weaponEquip
        .connect(addrs[i % 3])
        .acceptAsset(weaponsIds[i], 0, weaponAssetsFull[i % uniqueWeapons]);
      await weaponEquip
        .connect(addrs[i % 3])
        .acceptAsset(weaponsIds[i], 0, weaponAssetsEquip[i % uniqueWeapons]);
    }
  }

  async function addAssetsToWeaponGem(): Promise<void> {
    const equippableGroupId = 1; // Assets to equip will use this
    await weaponGemEquip.addEquippableAssetEntry(
      weaponGemAssetFull,
      0, // Not meant to equip
      ethers.constants.AddressZero, // Not meant to equip
      'ipfs:weagponGem/full/',
      [],
    );
    await weaponGemEquip.addEquippableAssetEntry(
      weaponGemAssetEquip,
      equippableGroupId,
      base.address,
      'ipfs:weagponGem/equip/',
      [],
    );
    // Can be equipped into weapons
    await weaponGemEquip.setValidParentForEquippableGroup(
      equippableGroupId,
      weaponEquip.address,
      partIdForWeaponGem,
    );

    for (let i = 0; i < uniqueSoldiers; i++) {
      await weaponGemEquip.addAssetToToken(weaponGemsIds[i], weaponGemAssetFull, 0);
      await weaponGemEquip.addAssetToToken(weaponGemsIds[i], weaponGemAssetEquip, 0);
      await weaponGemEquip
        .connect(addrs[i % 3])
        .acceptAsset(weaponGemsIds[i], 0, weaponGemAssetFull);
      await weaponGemEquip
        .connect(addrs[i % 3])
        .acceptAsset(weaponGemsIds[i], 0, weaponGemAssetEquip);
    }
  }

  async function addAssetsToBackground(): Promise<void> {
    const equippableGroupId = 1; // Assets to equip will use this
    await backgroundEquip.addEquippableAssetEntry(
      backgroundAssetId,
      equippableGroupId,
      base.address,
      'ipfs:background/',
      [],
    );
    // Can be equipped into soldiers
    await backgroundEquip.setValidParentForEquippableGroup(
      equippableGroupId,
      soldierEquip.address,
      partIdForBackground,
    );

    for (let i = 0; i < uniqueSoldiers; i++) {
      await backgroundEquip.addAssetToToken(backgroundsIds[i], backgroundAssetId, 0);
      await backgroundEquip
        .connect(addrs[i % 3])
        .acceptAsset(backgroundsIds[i], 0, backgroundAssetId);
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
