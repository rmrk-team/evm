import { ethers } from 'hardhat';
import { Contract, ContractFactory } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

const baseSymbol = 'SSB';
const baseType = 'mixed';

const soldierName = 'SnakeSoldier';
const soldierSymbol = 'SS';

const weaponName = 'SnakeWeapon';
const weaponSymbol = 'SW';

const weaponGemName = 'SnakeWeaponGem';
const weaponGemSymbol = 'SWG';

const backgroundName = 'SnakeBackground';
const backgroundSymbol = 'SB';

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

let base: Contract;
let soldier: Contract;
let soldierEquip: Contract;
let weapon: Contract;
let weaponEquip: Contract;
let weaponGem: Contract;
let weaponGemEquip: Contract;
let background: Contract;
let backgroundEquip: Contract;

async function equippableSlotsContractsFixture(
  baseFactory: ContractFactory,
  nestingFactory: ContractFactory,
  equipFactory: ContractFactory,
  mint: (token: Contract, to: string) => Promise<number>,
  nestMint: (token: Contract, to: string, parentId: number) => Promise<number>,
) {
  const [, ...signersAddr] = await ethers.getSigners();
  addrs = signersAddr;

  // Base
  base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Soldier token
  soldier = await nestingFactory.deploy(soldierName, soldierSymbol);
  await soldier.deployed();
  soldierEquip = await equipFactory.deploy(soldier.address);
  await soldierEquip.deployed();

  // Link nesting and equippable:
  soldierEquip.setNestingAddress(soldier.address);
  soldier.setEquippableAddress(soldierEquip.address);
  // Weapon
  weapon = await nestingFactory.deploy(weaponName, weaponSymbol);
  await weapon.deployed();
  weaponEquip = await equipFactory.deploy(weapon.address);
  await weaponEquip.deployed();
  // Link nesting and equippable:
  weaponEquip.setNestingAddress(weapon.address);
  weapon.setEquippableAddress(weaponEquip.address);

  // Weapon Gem
  weaponGem = await nestingFactory.deploy(weaponGemName, weaponGemSymbol);
  await weaponGem.deployed();
  weaponGemEquip = await equipFactory.deploy(weaponGem.address);
  await weaponGemEquip.deployed();
  // Link nesting and equippable:
  weaponGemEquip.setNestingAddress(weaponGem.address);
  weaponGem.setEquippableAddress(weaponGemEquip.address);

  // Background
  background = await nestingFactory.deploy(backgroundName, backgroundSymbol);
  await background.deployed();
  backgroundEquip = await equipFactory.deploy(background.address);
  await backgroundEquip.deployed();
  // Link nesting and equippable:
  backgroundEquip.setNestingAddress(background.address);
  background.setEquippableAddress(backgroundEquip.address);
  await setupBase();

  await mintSoldiers(mint);
  await mintWeapons(nestMint);
  await mintWeaponGems(nestMint);
  await mintBackgrounds(nestMint);

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
}

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

async function mintSoldiers(mint: (token: Contract, to: string) => Promise<number>): Promise<void> {
  // Using only first 3 addresses to mint
  for (let i = 0; i < uniqueSoldiers; i++) {
    const newId = await mint(soldier, addrs[i % 3].address);
    soldiersIds.push(newId);
  }
}

async function mintWeapons(
  nestMint: (token: Contract, to: string, parentId: number) => Promise<number>,
): Promise<void> {
  // Mint one weapon to soldier
  for (let i = 0; i < uniqueSoldiers; i++) {
    const newId = await nestMint(weapon, soldier.address, soldiersIds[i]);
    weaponsIds.push(newId);
    await soldier.connect(addrs[i % 3]).acceptChild(soldiersIds[i], 0);
  }
}

async function mintWeaponGems(
  nestMint: (token: Contract, to: string, parentId: number) => Promise<number>,
): Promise<void> {
  // Mint one weapon gem for each weapon on each soldier
  for (let i = 0; i < uniqueSoldiers; i++) {
    const newId = await nestMint(weaponGem, weapon.address, weaponsIds[i]);
    weaponGemsIds.push(newId);
    await weapon.connect(addrs[i % 3]).acceptChild(weaponsIds[i], 0);
  }
}

async function mintBackgrounds(
  nestMint: (token: Contract, to: string, parentId: number) => Promise<number>,
): Promise<void> {
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
    await weaponEquip.addResourceToToken(weaponsIds[i], weaponResourcesFull[i % uniqueWeapons], 0);
    await weaponEquip.addResourceToToken(weaponsIds[i], weaponResourcesEquip[i % uniqueWeapons], 0);
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
  equippableSlotsContractsFixture,
};
