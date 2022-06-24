import { ethers } from 'hardhat';
import { expect } from 'chai';
import { RMRKBaseStorageMock, RMRKEquippableMock, RMRKNestingMock } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// The general idea is having these tokens: Soldier, Weapon, WeaponGem and Background.
// Weapon and Background can be equipped into Soldier. WeaponGem can be equipped into Weapon
// All use a single base.
// Soldier will use a single enumerated fixed resource for simplicity
// Weapon will have 2 resources per weapon, one for full view, one for equipping
// Background will have a single resource for each, it can be use as full view and to equip
// Weapon Gems will have 2 enumerated resources, one for full view, one for equipping.
describe('Equipping', async () => {
  let base: RMRKBaseStorageMock;
  let soldier: RMRKNestingMock;
  let soldierEquip: RMRKEquippableMock;
  let weapon: RMRKNestingMock;
  let weaponEquip: RMRKEquippableMock;
  let weaponGem: RMRKNestingMock;
  let weaponGemEquip: RMRKEquippableMock;
  let background: RMRKNestingMock;
  let backgroundEquip: RMRKEquippableMock;

  let owner: SignerWithAddress;
  let addrs: any[];

  const baseName = 'SnakeSoldierBase';

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

  enum ItemType {
    None, 
    Slot,
    Fixed,
  }

  beforeEach(async () => {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    await deployContracts();
    await setupBase();

    await mintSoldiers();
    await mintWeapons();
    await mintWeaponGems();
    await mintBackgrounds();

    await addResourcesToSoldier();
    await addResourcesToWeapon();
    await addResourcesToWeaponGem();
    await addResourcesToBackground();
  });

  describe('Init', async function () {
    it('it can get names and symbols', async function () {
      //
    });
  });

  async function deployContracts(): Promise<void> {
    const Base = await ethers.getContractFactory('RMRKBaseStorageMock');
    const Nesting = await ethers.getContractFactory('RMRKNestingMock');
    const Equip = await ethers.getContractFactory('RMRKEquippableMock');

    // Base
    base = await Base.deploy(baseName);
    await base.deployed();

    // Soldier token
    soldier = await Nesting.deploy(soldierName, soldierSymbol);
    await soldier.deployed();
    soldierEquip = await Equip.deploy();
    await soldierEquip.deployed();
    soldierEquip.setNestingAddress(soldier.address);

    // Weapon
    weapon = await Nesting.deploy(weaponName, weaponSymbol);
    await weapon.deployed();
    weaponEquip = await Equip.deploy();
    weaponEquip.setNestingAddress(weapon.address);
    await weaponEquip.deployed();

    // Weapon Gem
    weaponGem = await Nesting.deploy(weaponGemName, weaponGemSymbol);
    await weaponGem.deployed();
    weaponGemEquip = await Equip.deploy();
    weaponGemEquip.setNestingAddress(weaponGem.address);
    await weaponGemEquip.deployed();

    // Background
    background = await Nesting.deploy(backgroundName, backgroundSymbol);
    await background.deployed();
    backgroundEquip = await Equip.deploy();
    backgroundEquip.setNestingAddress(background.address);
    await backgroundEquip.deployed();
  }

  async function setupBase(): Promise<void> {
    const baseForBody = {
      itemType: ItemType.Fixed,
      z: 1,
      equippableInto: [],
      src: '',
      fallbackSrc: '',
    };
    const baseForWeapon = {
      itemType: ItemType.Slot,
      z: 2,
      equippableInto: [soldier.address],
      src: '',
      fallbackSrc: '',
    };
    const baseForWeaponGem = {
      itemType: ItemType.Slot,
      z: 3,
      equippableInto: [weapon.address],
      src: '',
      fallbackSrc: '',
    };
    const baseForBackground = {
      itemType: ItemType.Slot,
      z: 0,
      equippableInto: [soldier.address],
      src: '',
      fallbackSrc: '',
    };

    await base.addBaseEntryList([
      { id: partIdForBody, base: baseForBody },
      { id: partIdForWeapon, base: baseForWeapon },
      { id: partIdForWeaponGem, base: baseForWeaponGem },
      { id: partIdForBackground, base: baseForBackground },
    ]);

    // FIXME: Why this if it is set when adding base entry?
    base.addEquippableAddresses(partIdForWeapon, [soldierEquip.address]);
    base.addEquippableAddresses(partIdForBackground, [soldierEquip.address]);
    base.addEquippableAddresses(partIdForWeaponGem, [weapon.address]);
  }

  async function mintSoldiers(): Promise<void> {
    // Using only first 3 addresses to mint
    for (let i = 0; i < soldiers.length; i++) {
      await soldier['mint(address,uint256)'](addrs[i % 3].address, soldiers[i]);
    }
  }
  async function mintWeapons(): Promise<void> {
    // Mint one weapon to soldier
    for (let i = 0; i < soldiers.length; i++) {
      await weapon['mint(address,uint256,uint256,bytes)'](
        soldier.address,
        weapons[i],
        soldiers[i],
        ethers.utils.hexZeroPad('0x1', 1),
      );
      await soldier.connect(addrs[i % 3]).acceptChild(soldiers[i], 0);
    }
  }
  async function mintWeaponGems(): Promise<void> {
    // Mint one weapon gem for each weapon on each soldier
    for (let i = 0; i < soldiers.length; i++) {
      await weaponGem['mint(address,uint256,uint256,bytes)'](
        weapon.address,
        weaponGems[i],
        weapons[i],
        ethers.utils.hexZeroPad('0x1', 1),
      );
      await weapon.connect(addrs[i % 3]).acceptChild(weapons[i], 0);
    }
  }
  async function mintBackgrounds(): Promise<void> {
    // Mint one background to soldier
    for (let i = 0; i < soldiers.length; i++) {
      await background['mint(address,uint256,uint256,bytes)'](
        soldier.address,
        backgrounds[i],
        soldiers[i],
        ethers.utils.hexZeroPad('0x1', 1),
      );
      await soldier.connect(addrs[i % 3]).acceptChild(soldiers[i], 0);
    }
  }

  async function addResourcesToSoldier(): Promise<void> {
    const resId = 1;
    await soldierEquip.addResourceEntry(
      {
        id: resId,
        equippableRefId: 0,
        metadataURI: 'ipfs:soldier/',
        baseAddress: base.address,
        slotId: partIdForBody,
        custom: [],
      },
      [], // FIXME: Should part id for body be here?
      [partIdForWeapon, partIdForWeapon], // Can receive these
    );
    await soldierEquip.setTokenEnumeratedResource(resId, true);
    for (let i = 0; i < soldiers.length; i++) {
      await soldierEquip.addResourceToToken(soldiers[i], resId, 0);
      await soldierEquip.connect(addrs[i % 3]).acceptResource(soldiers[i], 0);
    }
  }

  async function addResourcesToWeapon(): Promise<void> {
    const equippableRefId = 1; // Resources to equip will both use this
    const resourcesFull = [1, 2, 3, 4]; // Must match the total of uniqueResources
    const resourcesEquip = [5, 6, 7, 8]; // Must match the total of uniqueResources

    for (let i = 0; i < resourcesFull.length; i++) {
      await weaponEquip.addResourceEntry(
        {
          id: resourcesFull[i],
          equippableRefId: 0, // Not meant to equip
          metadataURI: `ipfs:weapon/full/${resourcesFull[i]}`,
          baseAddress: ethers.constants.AddressZero, // Not meant to equip
          slotId: 0, // Not meant to equip
          custom: [],
        },
        [],
        [],
      );
    }
    for (let i = 0; i < resourcesEquip.length; i++) {
      await weaponEquip.addResourceEntry(
        {
          id: resourcesEquip[i],
          equippableRefId: equippableRefId,
          metadataURI: `ipfs:weapon/equip/${resourcesEquip[i]}`,
          baseAddress: base.address,
          slotId: partIdForWeapon,
          custom: [],
        },
        [],
        [],
      );
    }

    // Add 2 resources to each weapon, one full, one for equip
    // There are 10 weapon tokens for 4 unique resources so we use %
    for (let i = 0; i < weapons.length; i++) {
      await weaponEquip.addResourceToToken(weapons[i], resourcesFull[i % uniqueWeapons], 0);
      await weaponEquip.addResourceToToken(weapons[i], resourcesEquip[i % uniqueWeapons], 0);
      await weaponEquip.connect(addrs[i % 3]).acceptResource(weapons[i], 0);
    }
  }

  async function addResourcesToWeaponGem(): Promise<void> {
    const equippableRefId = 1; // Resources to equip will both use this
    const resFull = 1;
    const resEquip = 2;
    await weaponGemEquip.addResourceEntry(
      {
        id: resFull,
        equippableRefId: 0, // Not meant to equip
        metadataURI: 'ipfs:weagponGem/full/',
        baseAddress: ethers.constants.AddressZero, // Not meant to equip
        slotId: 0, // Not meant to equip
        custom: [],
      },
      [],
      [],
    );
    await weaponGemEquip.addResourceEntry(
      {
        id: resEquip,
        equippableRefId: equippableRefId,
        metadataURI: 'ipfs:weagponGem/equip/',
        baseAddress: base.address,
        slotId: partIdForWeaponGem,
        custom: [],
      },
      [],
      [],
    );
    await weaponGemEquip.setTokenEnumeratedResource(resFull, true);
    await weaponGemEquip.setTokenEnumeratedResource(resEquip, true);
    for (let i = 0; i < soldiers.length; i++) {
      await weaponGemEquip.addResourceToToken(weaponGems[i], resFull, 0);
      await weaponGemEquip.addResourceToToken(weaponGems[i], resEquip, 0);
      await weaponGemEquip.connect(addrs[i % 3]).acceptResource(weaponGems[i], 0);
      await weaponGemEquip.connect(addrs[i % 3]).acceptResource(weaponGems[i], 0);
    }
  }

  async function addResourcesToBackground(): Promise<void> {
    const resId = 1;
    await backgroundEquip.addResourceEntry(
      {
        id: resId,
        equippableRefId: 0,
        metadataURI: 'ipfs:background/',
        baseAddress: base.address,
        slotId: partIdForBackground,
        custom: [],
      },
      [],
      [],
    );
    await backgroundEquip.setTokenEnumeratedResource(resId, true);
    for (let i = 0; i < soldiers.length; i++) {
      await backgroundEquip.addResourceToToken(backgrounds[i], resId, 0);
      await backgroundEquip.connect(addrs[i % 3]).acceptResource(backgrounds[i], 0);
    }
  }
});
