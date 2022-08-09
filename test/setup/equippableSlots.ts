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
      await soldier.connect(addrs[i % 3]).acceptChild(soldiersIds[i], 0);
    }
  }

  async function mintWeaponGems(): Promise<void> {
    // This array is reused, so we "empty" it before
    weaponGemsIds.length = 0;
    // Mint one weapon gem for each weapon on each soldier
    for (let i = 0; i < uniqueSoldiers; i++) {
      const newId = await nestMint(weaponGem, weapon.address, weaponsIds[i]);
      weaponGemsIds.push(newId);
      await weapon.connect(addrs[i % 3]).acceptChild(weaponsIds[i], 0);
    }
  }

  async function mintBackgrounds(): Promise<void> {
    // This array is reused, so we "empty" it before
    backgroundsIds.length = 0;
    // Mint one background to soldier
    for (let i = 0; i < uniqueSoldiers; i++) {
      const newId = await nestMint(background, soldier.address, soldiersIds[i]);
      backgroundsIds.push(newId);
      await soldier.connect(addrs[i % 3]).acceptChild(soldiersIds[i], 0);
    }
  }

  async function addResourcesToSoldier(): Promise<void> {
    await soldierEquip.addResourceEntry(
      {
        id: soldierResId,
        equippableRefId: 0,
        metadataURI: 'ipfs:soldier/',
        baseAddress: base.address,
      },
      [partIdForBody], // Fixed parts
      [partIdForWeapon, partIdForBackground], // Can receive these
    );
    await soldierEquip.setTokenEnumeratedResource(soldierResId, true);
    for (let i = 0; i < uniqueSoldiers; i++) {
      await soldierEquip.addResourceToToken(soldiersIds[i], soldierResId, 0);
      await soldierEquip.connect(addrs[i % 3]).acceptResource(soldiersIds[i], 0);
    }
  }

  async function addResourcesToWeapon(): Promise<void> {
    const equippableRefId = 1; // Resources to equip will both use this

    for (let i = 0; i < weaponResourcesFull.length; i++) {
      await weaponEquip.addResourceEntry(
        {
          id: weaponResourcesFull[i],
          equippableRefId: 0, // Not meant to equip
          metadataURI: `ipfs:weapon/full/${weaponResourcesFull[i]}`,
          baseAddress: ethers.constants.AddressZero, // Not meant to equip
        },
        [],
        [],
      );
    }
    for (let i = 0; i < weaponResourcesEquip.length; i++) {
      await weaponEquip.addResourceEntry(
        {
          id: weaponResourcesEquip[i],
          equippableRefId: equippableRefId,
          metadataURI: `ipfs:weapon/equip/${weaponResourcesEquip[i]}`,
          baseAddress: base.address,
        },
        [],
        [partIdForWeaponGem],
      );
    }

    // Can be equipped into soldiers
    await weaponEquip.setValidParentRefId(equippableRefId, soldierEquip.address, partIdForWeapon);

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
      await weaponEquip.connect(addrs[i % 3]).acceptResource(weaponsIds[i], 0);
      await weaponEquip.connect(addrs[i % 3]).acceptResource(weaponsIds[i], 0);
    }
  }

  async function addResourcesToWeaponGem(): Promise<void> {
    const equippableRefId = 1; // Resources to equip will use this
    await weaponGemEquip.addResourceEntry(
      {
        id: weaponGemResourceFull,
        equippableRefId: 0, // Not meant to equip
        metadataURI: 'ipfs:weagponGem/full/',
        baseAddress: ethers.constants.AddressZero, // Not meant to equip
      },
      [],
      [],
    );
    await weaponGemEquip.addResourceEntry(
      {
        id: weaponGemResourceEquip,
        equippableRefId: equippableRefId,
        metadataURI: 'ipfs:weagponGem/equip/',
        baseAddress: base.address,
      },
      [],
      [],
    );
    // Can be equipped into weapons
    await weaponGemEquip.setValidParentRefId(
      equippableRefId,
      weaponEquip.address,
      partIdForWeaponGem,
    );

    await weaponGemEquip.setTokenEnumeratedResource(weaponGemResourceFull, true);
    await weaponGemEquip.setTokenEnumeratedResource(weaponGemResourceEquip, true);
    for (let i = 0; i < uniqueSoldiers; i++) {
      await weaponGemEquip.addResourceToToken(weaponGemsIds[i], weaponGemResourceFull, 0);
      await weaponGemEquip.addResourceToToken(weaponGemsIds[i], weaponGemResourceEquip, 0);
      await weaponGemEquip.connect(addrs[i % 3]).acceptResource(weaponGemsIds[i], 0);
      await weaponGemEquip.connect(addrs[i % 3]).acceptResource(weaponGemsIds[i], 0);
    }
  }

  async function addResourcesToBackground(): Promise<void> {
    const equippableRefId = 1; // Resources to equip will use this
    await backgroundEquip.addResourceEntry(
      {
        id: backgroundResourceId,
        equippableRefId: equippableRefId,
        metadataURI: 'ipfs:background/',
        baseAddress: base.address,
      },
      [],
      [],
    );
    // Can be equipped into soldiers
    await backgroundEquip.setValidParentRefId(
      equippableRefId,
      soldierEquip.address,
      partIdForBackground,
    );

    await backgroundEquip.setTokenEnumeratedResource(backgroundResourceId, true);
    for (let i = 0; i < uniqueSoldiers; i++) {
      await backgroundEquip.addResourceToToken(backgroundsIds[i], backgroundResourceId, 0);
      await backgroundEquip.connect(addrs[i % 3]).acceptResource(backgroundsIds[i], 0);
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
