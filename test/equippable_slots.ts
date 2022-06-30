import { ethers } from 'hardhat';
import { expect } from 'chai';
import { RMRKBaseStorageMock, RMRKEquippableMock, RMRKNestingMock } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber } from 'ethers';

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

  describe('Validations', async function () {
    it('can validate equips of weapons into soldiers', async function () {
      // This resource is not equippable
      expect(
        await soldierEquip.validateChildEquip(
          weaponEquip.address,
          weaponResourcesFull[0],
          partIdForWeapon,
        ),
      ).to.eql(false);

      // This resource is equippable into weapon part
      expect(
        await soldierEquip.validateChildEquip(
          weaponEquip.address,
          weaponResourcesEquip[0],
          partIdForWeapon,
        ),
      ).to.eql(true);

      // This resource is NOT equippable into weapon gem part
      expect(
        await soldierEquip.validateChildEquip(
          weaponEquip.address,
          weaponResourcesEquip[0],
          partIdForWeaponGem,
        ),
      ).to.eql(false);
    });

    it('can validate equips of weapon gems into weapons', async function () {
      // This resource is not equippable
      expect(
        await weaponEquip.validateChildEquip(
          weaponGemEquip.address,
          weaponGemResourceFull,
          partIdForWeaponGem,
        ),
      ).to.eql(false);

      // This resource is equippable into weapon gem slot
      expect(
        await weaponEquip.validateChildEquip(
          weaponGemEquip.address,
          weaponGemResourceEquip,
          partIdForWeaponGem,
        ),
      ).to.eql(true);

      // This resource is NOT equippable into background slot
      expect(
        await weaponEquip.validateChildEquip(
          weaponGemEquip.address,
          weaponGemResourceEquip,
          partIdForBackground,
        ),
      ).to.eql(false);
    });

    it('can validate equips of backgrounds into soldiers', async function () {
      // This resource is equippable into background slot
      expect(
        await soldierEquip.validateChildEquip(
          backgroundEquip.address,
          backgroundResourceId,
          partIdForBackground,
        ),
      ).to.eql(true);

      // This resource is NOT equippable into weapon slot
      expect(
        await soldierEquip.validateChildEquip(
          backgroundEquip.address,
          backgroundResourceId,
          partIdForWeapon,
        ),
      ).to.eql(false);
    });
  });

  describe.only('Equip', async function () {
    it('can equip weapon', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId);
      // All part slots are included on the response:
      const expectedSlots = [bn(partIdForWeapon), bn(partIdForBackground)];
      // If a slot has nothing equipped, it returns an empty equip:
      const expectedEquips = [
        [bn(soldierResId), bn(weaponResId), bn(weapons[0]), weaponEquip.address],
        [bn(0), bn(0), bn(0), ethers.constants.AddressZero],
      ];
      expect(await soldierEquip.getEquipped(soldiers[0], soldierResId)).to.eql([
        expectedSlots,
        expectedEquips,
      ]);

      // Child is marked as equpped:
      expect(await weaponEquip.isEquipped(weapons[0])).to.eql(true);
    });

    it('can equip weapon and background', async function () {
      // Weapon is child on index 0, background on index 1
      const weaponChildIndex = 0;
      const backgroundChildIndex = 1;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip(soldiers[0], soldierResId, partIdForWeapon, weaponChildIndex, weaponResId);
      await soldierEquip
        .connect(addrs[0])
        .equip(
          soldiers[0],
          soldierResId,
          partIdForBackground,
          backgroundChildIndex,
          backgroundResourceId,
        );

      const expectedSlots = [bn(partIdForWeapon), bn(partIdForBackground)];
      const expectedEquips = [
        [bn(soldierResId), bn(weaponResId), bn(weapons[0]), weaponEquip.address],
        [bn(soldierResId), bn(backgroundResourceId), bn(backgrounds[0]), backgroundEquip.address],
      ];
      expect(await soldierEquip.getEquipped(soldiers[0], soldierResId)).to.eql([
        expectedSlots,
        expectedEquips,
      ]);

      // Children are marked as equpped:
      expect(await weaponEquip.isEquipped(weapons[0])).to.eql(true);
      expect(await backgroundEquip.isEquipped(backgrounds[0])).to.eql(true);
    });

    it('cannot equip non existing child in slot (weapon in background)', async function () {
      // Weapon is child on index 0, background on index 1
      const badChildIndex = 3;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip(soldiers[0], soldierResId, partIdForWeapon, badChildIndex, weaponResId),
      ).to.be.reverted; // Bad index
    });

    it('cannot equip wrong child in slot (weapon in background)', async function () {
      // Weapon is child on index 0, background on index 1
      const backgroundChildIndex = 1;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip(soldiers[0], soldierResId, partIdForWeapon, backgroundChildIndex, weaponResId),
      ).to.be.revertedWith('RMRKEquippableBasePartNotEquippable()');
    });

    it('cannot equip child in wrong slot (weapon in background)', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip(soldiers[0], soldierResId, partIdForBackground, childIndex, weaponResId),
      ).to.be.revertedWith('RMRKEquippableBasePartNotEquippable()');
    });

    it('cannot equip child with wrong resource (weapon in background)', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, backgroundResourceId),
      ).to.be.revertedWith('RMRKEquippableBasePartNotEquippable()');
    });

    it('cannot equip if not owner', async function () {
      //
    });

    it('cannot equip 2 children into the same slot', async function () {
      //
    });

    it('cannot equip if not intented on base', async function () {
      //
    });

    it('cannot equip on not slot part on base', async function () {
      //
    });

    it('cannot mark equipped from wrong parent', async function () {
      //
    });
  });

  describe('Unequip', async function () {
    it('can unequipp', async function () {
      //
    });

    it('cannot unequipp if not equipped', async function () {
      //
    });

    it('cannot unequipp if not owner', async function () {
      //
    });
  });

  describe.only('Replace equip', async function () {
    it('can replace equip', async function () {
      //
    });

    it('cannot replace equip if not equipped', async function () {
      //
    });

    it('cannot replace equip if not owner', async function () {
      //
    });
  });

  async function deployContracts(): Promise<void> {
    const Base = await ethers.getContractFactory('RMRKBaseStorageMock');
    const Nesting = await ethers.getContractFactory('RMRKNestingMock');
    const Equip = await ethers.getContractFactory('RMRKEquippableMock');

    // Base
    base = await Base.deploy(baseSymbol, baseType);
    await base.deployed();

    // Soldier token
    soldier = await Nesting.deploy(soldierName, soldierSymbol);
    await soldier.deployed();
    soldierEquip = await Equip.deploy();
    await soldierEquip.deployed();

    // Link nesting and equippable:
    soldierEquip.setNestingAddress(soldier.address);
    soldier.setEquippableAddress(soldierEquip.address);
    // Weapon
    weapon = await Nesting.deploy(weaponName, weaponSymbol);
    await weapon.deployed();
    weaponEquip = await Equip.deploy();
    await weaponEquip.deployed();
    // Link nesting and equippable:
    weaponEquip.setNestingAddress(weapon.address);
    weapon.setEquippableAddress(weaponEquip.address);

    // Weapon Gem
    weaponGem = await Nesting.deploy(weaponGemName, weaponGemSymbol);
    await weaponGem.deployed();
    weaponGemEquip = await Equip.deploy();
    await weaponGemEquip.deployed();
    // Link nesting and equippable:
    weaponGemEquip.setNestingAddress(weaponGem.address);
    weaponGem.setEquippableAddress(weaponGemEquip.address);

    // Background
    background = await Nesting.deploy(backgroundName, backgroundSymbol);
    await background.deployed();
    backgroundEquip = await Equip.deploy();
    await backgroundEquip.deployed();
    // Link nesting and equippable:
    backgroundEquip.setNestingAddress(background.address);
    background.setEquippableAddress(backgroundEquip.address);
  }

  async function setupBase(): Promise<void> {
    const partForBody = {
      itemType: ItemType.Fixed,
      z: 1,
      equippable: [],
      src: '',
      fallbackSrc: '',
    };
    const partForWeapon = {
      itemType: ItemType.Slot,
      z: 2,
      equippable: [weaponEquip.address],
      src: '',
      fallbackSrc: '',
    };
    const partForWeaponGem = {
      itemType: ItemType.Slot,
      z: 3,
      equippable: [weaponGemEquip.address],
      src: '',
      fallbackSrc: '',
    };
    const partForBackground = {
      itemType: ItemType.Slot,
      z: 0,
      equippable: [backgroundEquip.address],
      src: '',
      fallbackSrc: '',
    };

    await base.addPartList([
      { partId: partIdForBody, part: partForBody },
      { partId: partIdForWeapon, part: partForWeapon },
      { partId: partIdForWeaponGem, part: partForWeaponGem },
      { partId: partIdForBackground, part: partForBackground },
    ]);
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
    await soldierEquip.addResourceEntry(
      {
        id: soldierResId,
        equippableRefId: 0,
        metadataURI: 'ipfs:soldier/',
        baseAddress: base.address,
        slotId: partIdForBody,
        custom: [],
      },
      [partIdForBody], // Fixed parts
      [partIdForWeapon, partIdForBackground], // Can receive these
    );
    await soldierEquip.setTokenEnumeratedResource(soldierResId, true);
    for (let i = 0; i < soldiers.length; i++) {
      await soldierEquip.addResourceToToken(soldiers[i], soldierResId, 0);
      await soldierEquip.connect(addrs[i % 3]).acceptResource(soldiers[i], 0);
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
          slotId: 0, // Not meant to equip
          custom: [],
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
          slotId: partIdForWeapon,
          custom: [],
        },
        [],
        [partIdForWeaponGem],
      );
    }

    // Can be equipped into soldiers
    await weaponEquip.setValidParentRefId(equippableRefId, soldierEquip.address, partIdForWeapon);

    // Add 2 resources to each weapon, one full, one for equip
    // There are 10 weapon tokens for 4 unique resources so we use %
    for (let i = 0; i < weapons.length; i++) {
      await weaponEquip.addResourceToToken(weapons[i], weaponResourcesFull[i % uniqueWeapons], 0);
      await weaponEquip.addResourceToToken(weapons[i], weaponResourcesEquip[i % uniqueWeapons], 0);
      await weaponEquip.connect(addrs[i % 3]).acceptResource(weapons[i], 0);
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
        slotId: 0, // Not meant to equip
        custom: [],
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
        slotId: partIdForWeaponGem,
        custom: [],
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
    for (let i = 0; i < soldiers.length; i++) {
      await weaponGemEquip.addResourceToToken(weaponGems[i], weaponGemResourceFull, 0);
      await weaponGemEquip.addResourceToToken(weaponGems[i], weaponGemResourceEquip, 0);
      await weaponGemEquip.connect(addrs[i % 3]).acceptResource(weaponGems[i], 0);
      await weaponGemEquip.connect(addrs[i % 3]).acceptResource(weaponGems[i], 0);
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
        slotId: partIdForBackground,
        custom: [],
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
    for (let i = 0; i < soldiers.length; i++) {
      await backgroundEquip.addResourceToToken(backgrounds[i], backgroundResourceId, 0);
      await backgroundEquip.connect(addrs[i % 3]).acceptResource(backgrounds[i], 0);
    }
  }

  function bn(x: number): BigNumber {
    return BigNumber.from(x);
  }
});
