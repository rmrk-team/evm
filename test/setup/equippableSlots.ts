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
const weaponResourcesFull = [1, 2, 3, 4]; // Must match the total of uniqueResources
const weaponResourcesEquip = [5, 6, 7, 8]; // Must match the total of uniqueResources
const weaponGemResourceFull = 101;
const weaponGemResourceEquip = 102;
const backgroundResourceId = 200;

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

  await addResourcesToSoldier();
  await addResourcesToWeapon();
  await addResourcesToWeaponGem();
  await addResourcesToBackground();

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
      await soldier.connect(addrs[i % 3]).acceptChild(soldiersIds[i], weapon.address, newId);
    }
  }

  async function mintWeaponGems(): Promise<void> {
    // This array is reused, so we "empty" it before
    weaponGemsIds.length = 0;
    // Mint one weapon gem for each weapon on each soldier
    for (let i = 0; i < uniqueSoldiers; i++) {
      const newId = await nestMint(weaponGem, weapon.address, weaponsIds[i]);
      weaponGemsIds.push(newId);
      await weapon.connect(addrs[i % 3]).acceptChild(weaponsIds[i], weaponGem.address, newId);
    }
  }

  async function mintBackgrounds(): Promise<void> {
    // This array is reused, so we "empty" it before
    backgroundsIds.length = 0;
    // Mint one background to soldier
    for (let i = 0; i < uniqueSoldiers; i++) {
      const newId = await nestMint(background, soldier.address, soldiersIds[i]);
      backgroundsIds.push(newId);
      await soldier.connect(addrs[i % 3]).acceptChild(soldiersIds[i], background.address, newId);
    }
  }

  async function addResourcesToSoldier(): Promise<void> {
    await soldierEquip.addResourceEntry(
      soldierResId,
      0,
      base.address,
      'ipfs:soldier/',
      [partIdForBody], // Fixed parts
      [partIdForWeapon, partIdForBackground], // Can receive these
    );
    for (let i = 0; i < uniqueSoldiers; i++) {
      await soldierEquip.addResourceToToken(soldiersIds[i], soldierResId, 0);
      await soldierEquip.connect(addrs[i % 3]).acceptResource(soldiersIds[i], 0, soldierResId);
    }
  }

  async function addResourcesToWeapon(): Promise<void> {
    const equippableGroupId = 1; // Resources to equip will both use this

    for (let i = 0; i < weaponResourcesFull.length; i++) {
      await weaponEquip.addResourceEntry(
        weaponResourcesFull[i],
        0, // Not meant to equip
        ethers.constants.AddressZero, // Not meant to equip
        `ipfs:weapon/full/${weaponResourcesFull[i]}`,
        [],
        [],
      );
    }
    for (let i = 0; i < weaponResourcesEquip.length; i++) {
      await weaponEquip.addResourceEntry(
        weaponResourcesEquip[i],
        equippableGroupId,
        base.address,
        `ipfs:weapon/equip/${weaponResourcesEquip[i]}`,
        [],
        [partIdForWeaponGem],
      );
    }

    // Can be equipped into soldiers
    await weaponEquip.setValidParentForEquippableGroup(
      equippableGroupId,
      soldierEquip.address,
      partIdForWeapon,
    );

    // Add 2 resources to each weapon, one full, one for equip
    // There are 10 weapon tokens for 4 unique resources so we use %
    for (let i = 0; i < weaponsIds.length; i++) {
      await weaponEquip.addResourceToToken(
        weaponsIds[i],
        weaponResourcesFull[i % uniqueWeapons],
        0,
      );
      await weaponEquip.addResourceToToken(
        weaponsIds[i],
        weaponResourcesEquip[i % uniqueWeapons],
        0,
      );
      await weaponEquip
        .connect(addrs[i % 3])
        .acceptResource(weaponsIds[i], 0, weaponResourcesFull[i % uniqueWeapons]);
      await weaponEquip
        .connect(addrs[i % 3])
        .acceptResource(weaponsIds[i], 0, weaponResourcesEquip[i % uniqueWeapons]);
    }
  }

  async function addResourcesToWeaponGem(): Promise<void> {
    const equippableGroupId = 1; // Resources to equip will use this
    await weaponGemEquip.addResourceEntry(
      weaponGemResourceFull,
      0, // Not meant to equip
      ethers.constants.AddressZero, // Not meant to equip
      'ipfs:weagponGem/full/',
      [],
      [],
    );
    await weaponGemEquip.addResourceEntry(
      weaponGemResourceEquip,
      equippableGroupId,
      base.address,
      'ipfs:weagponGem/equip/',
      [],
      [],
    );
    // Can be equipped into weapons
    await weaponGemEquip.setValidParentForEquippableGroup(
      equippableGroupId,
      weaponEquip.address,
      partIdForWeaponGem,
    );

    for (let i = 0; i < uniqueSoldiers; i++) {
      await weaponGemEquip.addResourceToToken(weaponGemsIds[i], weaponGemResourceFull, 0);
      await weaponGemEquip.addResourceToToken(weaponGemsIds[i], weaponGemResourceEquip, 0);
      await weaponGemEquip
        .connect(addrs[i % 3])
        .acceptResource(weaponGemsIds[i], 0, weaponGemResourceFull);
      await weaponGemEquip
        .connect(addrs[i % 3])
        .acceptResource(weaponGemsIds[i], 0, weaponGemResourceEquip);
    }
  }

  async function addResourcesToBackground(): Promise<void> {
    const equippableGroupId = 1; // Resources to equip will use this
    await backgroundEquip.addResourceEntry(
      backgroundResourceId,
      equippableGroupId,
      base.address,
      'ipfs:background/',
      [],
      [],
    );
    // Can be equipped into soldiers
    await backgroundEquip.setValidParentForEquippableGroup(
      equippableGroupId,
      soldierEquip.address,
      partIdForBackground,
    );

    for (let i = 0; i < uniqueSoldiers; i++) {
      await backgroundEquip.addResourceToToken(backgroundsIds[i], backgroundResourceId, 0);
      await backgroundEquip
        .connect(addrs[i % 3])
        .acceptResource(backgroundsIds[i], 0, backgroundResourceId);
    }
  }
}

export {
  partIdForBody,
  partIdForWeapon,
  partIdForWeaponGem,
  partIdForBackground,
  soldierResId,
  weaponResourcesFull,
  weaponResourcesEquip,
  weaponGemResourceFull,
  weaponGemResourceEquip,
  backgroundResourceId,
  soldiersIds,
  weaponsIds,
  weaponGemsIds,
  backgroundsIds,
  ItemType,
  setupContextForSlots,
};
