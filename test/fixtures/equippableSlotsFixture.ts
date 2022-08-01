import { ethers } from 'hardhat';
import { Contract } from 'ethers';

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

// const uniqueSoldiers = 10;
const uniqueWeapons = 4;
// const uniqueWeaponGems = 2;
// const uniqueBackgrounds = 3;
// Ids could be the same since they are different collections, but to avoid log problems we have them unique
const soldiers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const weapons = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const weaponGems = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
const backgrounds = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40];

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

let addrs: any[];

let baseContract: Contract;
let soldierContract: Contract;
let soldierEquipContract: Contract;
let weaponContract: Contract;
let weaponEquipContract: Contract;
let weaponGemContract: Contract;
let weaponGemEquipContract: Contract;
let backgroundContract: Contract;
let backgroundEquipContract: Contract;

export async function equippableSlotsContractsFixture() {
  const [, ...signersAddr] = await ethers.getSigners();
  addrs = signersAddr;

  const Base = await ethers.getContractFactory('RMRKBaseStorageMock');
  const Nesting = await ethers.getContractFactory('RMRKNestingWithEquippableMock');
  const Equip = await ethers.getContractFactory('RMRKEquippableMock');

  // Base
  baseContract = await Base.deploy(baseSymbol, baseType);
  await baseContract.deployed();

  // Soldier token
  soldierContract = await Nesting.deploy(soldierName, soldierSymbol);
  await soldierContract.deployed();
  soldierEquipContract = await Equip.deploy();
  await soldierEquipContract.deployed();

  // Link nesting and equippable:
  soldierEquipContract.setNestingAddress(soldierContract.address);
  soldierContract.setEquippableAddress(soldierEquipContract.address);
  // Weapon
  weaponContract = await Nesting.deploy(weaponName, weaponSymbol);
  await weaponContract.deployed();
  weaponEquipContract = await Equip.deploy();
  await weaponEquipContract.deployed();
  // Link nesting and equippable:
  weaponEquipContract.setNestingAddress(weaponContract.address);
  weaponContract.setEquippableAddress(weaponEquipContract.address);

  // Weapon Gem
  weaponGemContract = await Nesting.deploy(weaponGemName, weaponGemSymbol);
  await weaponGemContract.deployed();
  weaponGemEquipContract = await Equip.deploy();
  await weaponGemEquipContract.deployed();
  // Link nesting and equippable:
  weaponGemEquipContract.setNestingAddress(weaponGemContract.address);
  weaponGemContract.setEquippableAddress(weaponGemEquipContract.address);

  // Background
  backgroundContract = await Nesting.deploy(backgroundName, backgroundSymbol);
  await backgroundContract.deployed();
  backgroundEquipContract = await Equip.deploy();
  await backgroundEquipContract.deployed();
  // Link nesting and equippable:
  backgroundEquipContract.setNestingAddress(backgroundContract.address);
  backgroundContract.setEquippableAddress(backgroundEquipContract.address);
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
    baseContract,
    soldierContract,
    soldierEquipContract,
    weaponContract,
    weaponEquipContract,
    weaponGemContract,
    weaponGemEquipContract,
    backgroundContract,
    backgroundEquipContract,
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
    equippable: [weaponEquipContract.address],
    metadataURI: '',
  };
  const partForWeaponGem = {
    itemType: ItemType.Slot,
    z: 3,
    equippable: [weaponGemEquipContract.address],
    metadataURI: 'noGem.png',
  };
  const partForBackground = {
    itemType: ItemType.Slot,
    z: 0,
    equippable: [backgroundEquipContract.address],
    metadataURI: 'noBackground.png',
  };

  await baseContract.addPartList([
    { partId: partIdForBody, part: partForBody },
    { partId: partIdForWeapon, part: partForWeapon },
    { partId: partIdForWeaponGem, part: partForWeaponGem },
    { partId: partIdForBackground, part: partForBackground },
  ]);
}

async function mintSoldiers(): Promise<void> {
  // Using only first 3 addresses to mint
  for (let i = 0; i < soldiers.length; i++) {
    await soldierContract['mint(address,uint256)'](addrs[i % 3].address, soldiers[i]);
  }
}

async function mintWeapons(): Promise<void> {
  // Mint one weapon to soldier
  for (let i = 0; i < soldiers.length; i++) {
    await weaponContract['mint(address,uint256,uint256)'](
      soldierContract.address,
      weapons[i],
      soldiers[i],
    );
    await soldierContract.connect(addrs[i % 3]).acceptChild(soldiers[i], 0);
  }
}

async function mintWeaponGems(): Promise<void> {
  // Mint one weapon gem for each weapon on each soldier
  for (let i = 0; i < soldiers.length; i++) {
    await weaponGemContract['mint(address,uint256,uint256)'](
      weaponContract.address,
      weaponGems[i],
      weapons[i],
    );
    await weaponContract.connect(addrs[i % 3]).acceptChild(weapons[i], 0);
  }
}

async function mintBackgrounds(): Promise<void> {
  // Mint one background to soldier
  for (let i = 0; i < soldiers.length; i++) {
    await backgroundContract['mint(address,uint256,uint256)'](
      soldierContract.address,
      backgrounds[i],
      soldiers[i],
    );
    await soldierContract.connect(addrs[i % 3]).acceptChild(soldiers[i], 0);
  }
}

async function addResourcesToSoldier(): Promise<void> {
  await soldierEquipContract.addResourceEntry(
    {
      id: soldierResId,
      equippableRefId: 0,
      metadataURI: 'ipfs:soldier/',
      baseAddress: baseContract.address,
      custom: [],
    },
    [partIdForBody], // Fixed parts
    [partIdForWeapon, partIdForBackground], // Can receive these
  );
  await soldierEquipContract.setTokenEnumeratedResource(soldierResId, true);
  for (let i = 0; i < soldiers.length; i++) {
    await soldierEquipContract.addResourceToToken(soldiers[i], soldierResId, 0);
    await soldierEquipContract.connect(addrs[i % 3]).acceptResource(soldiers[i], 0);
  }
}

async function addResourcesToWeapon(): Promise<void> {
  const equippableRefId = 1; // Resources to equip will both use this

  for (let i = 0; i < weaponResourcesFull.length; i++) {
    await weaponEquipContract.addResourceEntry(
      {
        id: weaponResourcesFull[i],
        equippableRefId: 0, // Not meant to equip
        metadataURI: `ipfs:weapon/full/${weaponResourcesFull[i]}`,
        baseAddress: ethers.constants.AddressZero, // Not meant to equip
        custom: [],
      },
      [],
      [],
    );
  }
  for (let i = 0; i < weaponResourcesEquip.length; i++) {
    await weaponEquipContract.addResourceEntry(
      {
        id: weaponResourcesEquip[i],
        equippableRefId: equippableRefId,
        metadataURI: `ipfs:weapon/equip/${weaponResourcesEquip[i]}`,
        baseAddress: baseContract.address,
        custom: [],
      },
      [],
      [partIdForWeaponGem],
    );
  }

  // Can be equipped into soldiers
  await weaponEquipContract.setValidParentRefId(
    equippableRefId,
    soldierEquipContract.address,
    partIdForWeapon,
  );

  // Add 2 resources to each weapon, one full, one for equip
  // There are 10 weapon tokens for 4 unique resources so we use %
  for (let i = 0; i < weapons.length; i++) {
    await weaponEquipContract.addResourceToToken(
      weapons[i],
      weaponResourcesFull[i % uniqueWeapons],
      0,
    );
    await weaponEquipContract.addResourceToToken(
      weapons[i],
      weaponResourcesEquip[i % uniqueWeapons],
      0,
    );
    await weaponEquipContract.connect(addrs[i % 3]).acceptResource(weapons[i], 0);
    // FIXME Steven: Tests past without this accept:
    await weaponEquipContract.connect(addrs[i % 3]).acceptResource(weapons[i], 0);
  }
}

async function addResourcesToWeaponGem(): Promise<void> {
  const equippableRefId = 1; // Resources to equip will use this
  await weaponGemEquipContract.addResourceEntry(
    {
      id: weaponGemResourceFull,
      equippableRefId: 0, // Not meant to equip
      metadataURI: 'ipfs:weagponGem/full/',
      baseAddress: ethers.constants.AddressZero, // Not meant to equip
      custom: [],
    },
    [],
    [],
  );
  await weaponGemEquipContract.addResourceEntry(
    {
      id: weaponGemResourceEquip,
      equippableRefId: equippableRefId,
      metadataURI: 'ipfs:weagponGem/equip/',
      baseAddress: baseContract.address,
      custom: [],
    },
    [],
    [],
  );
  // Can be equipped into weapons
  await weaponGemEquipContract.setValidParentRefId(
    equippableRefId,
    weaponEquipContract.address,
    partIdForWeaponGem,
  );

  await weaponGemEquipContract.setTokenEnumeratedResource(weaponGemResourceFull, true);
  await weaponGemEquipContract.setTokenEnumeratedResource(weaponGemResourceEquip, true);
  for (let i = 0; i < soldiers.length; i++) {
    await weaponGemEquipContract.addResourceToToken(weaponGems[i], weaponGemResourceFull, 0);
    await weaponGemEquipContract.addResourceToToken(weaponGems[i], weaponGemResourceEquip, 0);
    await weaponGemEquipContract.connect(addrs[i % 3]).acceptResource(weaponGems[i], 0);
    await weaponGemEquipContract.connect(addrs[i % 3]).acceptResource(weaponGems[i], 0);
  }
}

async function addResourcesToBackground(): Promise<void> {
  const equippableRefId = 1; // Resources to equip will use this
  await backgroundEquipContract.addResourceEntry(
    {
      id: backgroundResourceId,
      equippableRefId: equippableRefId,
      metadataURI: 'ipfs:background/',
      baseAddress: baseContract.address,
      custom: [],
    },
    [],
    [],
  );
  // Can be equipped into soldiers
  await backgroundEquipContract.setValidParentRefId(
    equippableRefId,
    soldierEquipContract.address,
    partIdForBackground,
  );

  await backgroundEquipContract.setTokenEnumeratedResource(backgroundResourceId, true);
  for (let i = 0; i < soldiers.length; i++) {
    await backgroundEquipContract.addResourceToToken(backgrounds[i], backgroundResourceId, 0);
    await backgroundEquipContract.connect(addrs[i % 3]).acceptResource(backgrounds[i], 0);
  }
}
