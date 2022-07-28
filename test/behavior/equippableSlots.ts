import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';

// The general idea is having these tokens: Soldier, Weapon, WeaponGem and Background.
// Weapon and Background can be equipped into Soldier. WeaponGem can be equipped into Weapon
// All use a single base.
// Soldier will use a single enumerated fixed resource for simplicity
// Weapon will have 2 resources per weapon, one for full view, one for equipping
// Background will have a single resource for each, it can be used as full view and to equip
// Weapon Gems will have 2 enumerated resources, one for full view, one for equipping.
async function shouldBehaveLikeEquippableWithSlots(
  equippableContractName: string,
  nestingContractName: string,
  baseContractName: string,
) {
  let base: Contract;
  let soldier: Contract;
  let soldierEquip: Contract;
  let weapon: Contract;
  let weaponEquip: Contract;
  let weaponGem: Contract;
  let weaponGemEquip: Contract;
  let background: Contract;
  let backgroundEquip: Contract;

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
    const [, ...signersAddr] = await ethers.getSigners();
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
    it('can get nesting address', async function () {
      expect(await soldierEquip.getNestingAddress()).to.eql(soldier.address);
      expect(await weaponEquip.getNestingAddress()).to.eql(weapon.address);
      expect(await weaponGemEquip.getNestingAddress()).to.eql(weaponGem.address);
      expect(await backgroundEquip.getNestingAddress()).to.eql(background.address);
    });

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

  describe('Equip', async function () {
    it('can equip weapon', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await equipWeaponAndCheckFromAddress(soldierOwner, childIndex, weaponResId);
    });

    it('can equip weapon if approved', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const approved = addrs[1];
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldier.connect(soldierOwner).approve(approved.address, soldiers[0]);
      await equipWeaponAndCheckFromAddress(approved, childIndex, weaponResId);
    });

    it('can equip weapon if approved for all', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const approved = addrs[1];
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldier.connect(soldierOwner).setApprovalForAll(approved.address, true);
      await equipWeaponAndCheckFromAddress(approved, childIndex, weaponResId);
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

      // Children are marked as equipped:
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
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKEquippableBasePartNotEquippable');
    });

    it('cannot equip child in wrong slot (weapon in background)', async function () {
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip(soldiers[0], soldierResId, partIdForBackground, childIndex, weaponResId),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKEquippableBasePartNotEquippable');
    });

    it('cannot equip child with wrong resource (weapon in background)', async function () {
      const childIndex = 0;
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, backgroundResourceId),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKEquippableBasePartNotEquippable');
    });

    it('cannot equip if not owner', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await expect(
        soldierEquip
          .connect(addrs[1]) // Owner is addrs[0]
          .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId),
      ).to.be.revertedWithCustomError(soldierEquip, 'ERC721NotApprovedOrOwner');
    });

    it('cannot equip 2 children into the same slot', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId);

      const newWeaponId = 999;
      const weaponResourceIndex = 3;
      await mintWeaponToSoldier(addrs[0], soldiers[0], newWeaponId, weaponResourceIndex);

      const newWeaponChildIndex = 2;
      const newWeaponResId = weaponResourcesEquip[weaponResourceIndex];
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip(soldiers[0], soldierResId, partIdForWeapon, newWeaponChildIndex, newWeaponResId),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKSlotAlreadyUsed');
    });

    it('cannot equip if not intented on base', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon

      // Remove equipable addresses for part.
      await base.resetEquippableAddresses(partIdForWeapon);
      await expect(
        soldierEquip
          .connect(addrs[0]) // Owner is addrs[0]
          .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKEquippableEquipNotAllowedByBase');
    });

    it('cannot child into 2 different slots', async function () {
      // Weapon is child on index 0, background on index 1.
      const childIndex = 0;

      // We add a new partId which receives weapons
      const partIdForWeaponAlt = 5;
      const partForWeaponAlt = {
        itemType: ItemType.Slot,
        z: 2,
        equippable: [weaponEquip.address],
        metadataURI: '',
      };
      await base.addPart({ partId: partIdForWeaponAlt, part: partForWeaponAlt });

      // Ad a new resource to first weapon, which can go into new slot
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      const newWeaponResId = 99;
      const newEquippableRefId = 2; // New resources to equip will use this
      await addNewEquipableResourceToWeapon(newWeaponResId, newEquippableRefId, partIdForWeaponAlt);

      // If all went good, we can the weapon's new resource into the new slot
      await soldierEquip
        .connect(addrs[0])
        .equip(soldiers[0], soldierResId, partIdForWeaponAlt, childIndex, newWeaponResId);

      // Trying to equip the same child again into another slot must fail
      await expect(
        soldierEquip
          .connect(addrs[0]) // Owner is addrs[0]
          .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKAlreadyEquipped');
    });

    it('cannot equip on not slot part on base', async function () {
      // Weapon is child on index 0, background on index 1.
      const childIndex = 0;

      // We add a new partId which receives weapons
      const partIdForWeaponAlt = 5;
      // FIXME: It should not be possible to add a fixed part with equippable addresses
      const partForWeaponAlt = {
        itemType: ItemType.Fixed, // This is what we're testing
        z: 2,
        equippable: [weaponEquip.address],
        metadataURI: '',
      };
      await base.addPart({ partId: partIdForWeaponAlt, part: partForWeaponAlt });

      // Ad a new resource to first weapon, which can go into new slot
      const newWeaponResId = 99;
      const newEquippableRefId = 2; // New resources to equip will use this
      await addNewEquipableResourceToWeapon(newWeaponResId, newEquippableRefId, partIdForWeaponAlt);

      await expect(
        soldierEquip
          .connect(addrs[0]) // Owner is addrs[0]
          .equip(soldiers[0], soldierResId, partIdForWeaponAlt, childIndex, newWeaponResId),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKEquippableEquipNotAllowedByBase');
    });

    it('cannot mark equipped from wrong parent', async function () {
      // Even if the caller is the owner, only the current parent contract can mark it as equipped
      await expect(
        weaponEquip.connect(addrs[0]).markEquipped(weapons[0], weaponResourcesEquip[0], true),
      ).to.be.revertedWithCustomError(weaponEquip, 'RMRKCallerCannotChangeEquipStatus');
      // Just in case, we also test setting it unequiped
      await expect(
        weaponEquip.connect(addrs[0]).markEquipped(weapons[0], weaponResourcesEquip[0], false),
      ).to.be.revertedWithCustomError(weaponEquip, 'RMRKCallerCannotChangeEquipStatus');
    });
  });

  describe('Unequip', async function () {
    it('can unequip', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(soldierOwner)
        .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId);

      await unequipWeaponAndCheckFromAddress(soldierOwner);
    });

    it('can unequip if approved', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      const approved = addrs[1];

      await soldierEquip
        .connect(soldierOwner)
        .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId);

      await soldier.connect(soldierOwner).approve(approved.address, soldiers[0]);
      await unequipWeaponAndCheckFromAddress(approved);
    });

    it('can unequip if approved for all', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      const approved = addrs[1];

      await soldierEquip
        .connect(soldierOwner)
        .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId);

      await soldier.connect(soldierOwner).setApprovalForAll(approved.address, true);
      await unequipWeaponAndCheckFromAddress(approved);
    });

    it('cannot unequip if not equipped', async function () {
      await expect(
        soldierEquip.connect(addrs[0]).unequip(soldiers[0], soldierResId, partIdForWeapon),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKNotEquipped');
    });

    it('cannot unequip if not owner', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId);

      await expect(
        soldierEquip.connect(addrs[1]).unequip(soldiers[0], soldierResId, partIdForWeapon),
      ).to.be.revertedWithCustomError(soldierEquip, 'ERC721NotApprovedOrOwner');
    });
  });

  describe('Replace equip', async function () {
    it('can replace equip', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(soldierOwner)
        .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId);

      await replaceWeaponAndCheckFromAddress(soldierOwner);
    });

    it('can replace equip if approved', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(soldierOwner)
        .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId);

      const approved = addrs[1];
      await soldier.connect(soldierOwner).approve(approved.address, soldiers[0]);
      await replaceWeaponAndCheckFromAddress(approved);
    });

    it('can replace equip if approved for all', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(soldierOwner)
        .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId);

      const approved = addrs[1];
      await soldier.connect(soldierOwner).setApprovalForAll(approved.address, true);
      await replaceWeaponAndCheckFromAddress(approved);
    });

    it('cannot replace equip if not equipped', async function () {
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await expect(
        soldierEquip
          .connect(addrs[0])
          .replaceEquipment(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKNotEquipped');
    });

    it('cannot replace equip if not owner', async function () {
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId);

      const newWeaponId = 999;
      const weaponResourceIndex = 3;
      await mintWeaponToSoldier(addrs[0], soldiers[0], newWeaponId, weaponResourceIndex);

      const newWeaponChildIndex = 2;
      const newWeaponResId = weaponResourcesEquip[weaponResourceIndex];
      await expect(
        soldierEquip
          .connect(addrs[1])
          .replaceEquipment(
            soldiers[0],
            soldierResId,
            partIdForWeapon,
            newWeaponChildIndex,
            newWeaponResId,
          ),
      ).to.be.revertedWithCustomError(soldierEquip, 'ERC721NotApprovedOrOwner');
    });
  });

  describe('Transfer equipped', async function () {
      /*
      This test fails for now -- implementing channel from child to childEquippable,
      after which the revert may not even be necessary. Revert must also be implemented
      from top-level via nestingImpl override of unnestSelf() since it must be triggered
      by the unnest call. Error does not yet exist, first securing markEquipped() channel.

      It says the target contract doesn't have a custom error 'RMRKNotNesting', meaning
      that while it's defined, it's not implemented yet.
      */
    it('Unnest fails if self is equipped', async function () {
      // Weapon is child on index 0
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId);

      await expect(weapon.connect(addrs[0]).unnestSelf(11, 0)).to.be.revertedWithCustomError(
        weaponEquip,
        'RMRKNotNesting',
      );
    });
  });

  describe('Compose', async function () {
    it('can get composables for soldier', async function () {
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip(soldiers[0], soldierResId, partIdForWeapon, childIndex, weaponResId);

      const expectedResource = [
        bn(soldierResId), // id
        bn(0), // equippableRefId
        base.address, // baseAddress
        'ipfs:soldier/', // metadataURI
        [],
      ];
      const expectedFixedParts = [
        [
          bn(partIdForBody), // partId
          1, // z
          'genericBody.png', // metadataURI
        ],
      ];
      const expectedSlotParts = [
        [
          bn(partIdForWeapon), // partId
          bn(weaponResourcesEquip[0]), // childResourceId
          2, // z
          bn(weapons[0]), // childTokenId
          weaponEquip.address, // childAddress
          '', // metadataURI
        ],
        [
          // Nothing on equipped on background slot:
          bn(partIdForBackground), // partId
          bn(0), // childResourceId
          0, // z
          bn(0), // childTokenId
          ethers.constants.AddressZero, // childAddress
          'noBackground.png', // metadataURI
        ],
      ];
      const allResources = await soldierEquip.composeEquippables(soldiers[0], soldierResId);
      expect(allResources).to.eql([expectedResource, expectedFixedParts, expectedSlotParts]);
    });

    it('cannot get composables for soldier with not associated resource', async function () {
      const wrongResId = weaponResourcesEquip[1];
      await expect(
        weaponEquip.composeEquippables(weapons[0], wrongResId),
      ).to.be.revertedWithCustomError(weaponEquip, 'RMRKTokenDoesNotHaveActiveResource');
    });
  });

  async function deployContracts(): Promise<void> {
    const Base = await ethers.getContractFactory(baseContractName);
    const Nesting = await ethers.getContractFactory(nestingContractName);
    const Equip = await ethers.getContractFactory(equippableContractName);

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
    // Using only first 3 addresses to mint
    for (let i = 0; i < soldiers.length; i++) {
      await soldier['mint(address,uint256)'](addrs[i % 3].address, soldiers[i]);
    }
  }

  async function mintWeapons(): Promise<void> {
    // Mint one weapon to soldier
    for (let i = 0; i < soldiers.length; i++) {
      await weapon['mint(address,uint256,uint256)'](soldier.address, weapons[i], soldiers[i]);
      await soldier.connect(addrs[i % 3]).acceptChild(soldiers[i], 0);
    }
  }

  async function mintWeaponGems(): Promise<void> {
    // Mint one weapon gem for each weapon on each soldier
    for (let i = 0; i < soldiers.length; i++) {
      await weaponGem['mint(address,uint256,uint256)'](weapon.address, weaponGems[i], weapons[i]);
      await weapon.connect(addrs[i % 3]).acceptChild(weapons[i], 0);
    }
  }

  async function mintBackgrounds(): Promise<void> {
    // Mint one background to soldier
    for (let i = 0; i < soldiers.length; i++) {
      await background['mint(address,uint256,uint256)'](
        soldier.address,
        backgrounds[i],
        soldiers[i],
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
      // FIXME: Tests past without this accept:
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

  async function mintWeaponToSoldier(
    soldierOwner: SignerWithAddress,
    soldierId: number,
    newWeaponId: number,
    resourceIndex: number,
  ): Promise<void> {
    // Mint another weapon to the soldier and accept it
    await weapon['mint(address,uint256,uint256)'](
      soldier.address,
      newWeaponId, // New weapon id
      soldierId,
    );
    await soldier.connect(soldierOwner).acceptChild(soldierId, 0);

    // Add resources to weapon
    await weaponEquip.addResourceToToken(newWeaponId, weaponResourcesFull[resourceIndex], 0);
    await weaponEquip.addResourceToToken(newWeaponId, weaponResourcesEquip[resourceIndex], 0);
    await weaponEquip.connect(soldierOwner).acceptResource(newWeaponId, 0);
  }

  async function addNewEquipableResourceToWeapon(
    newWeaponResId: number,
    newEquippableRefId: number,
    partIdForWeaponAlt: number,
  ): Promise<void> {
    await weaponEquip.addResourceEntry(
      {
        id: newWeaponResId,
        equippableRefId: newEquippableRefId,
        metadataURI: `ipfs:weapon/equipAlt/${newWeaponResId}`,
        baseAddress: base.address,
        custom: [],
      },
      [],
      [partIdForWeaponGem],
    );
    // Make it equippable into soldier using new slot
    await weaponEquip.setValidParentRefId(
      newEquippableRefId,
      soldierEquip.address,
      partIdForWeaponAlt,
    );
    // Add the resource to the weapon and accept it
    await weaponEquip.addResourceToToken(weapons[0], newWeaponResId, 0);
    await weaponEquip.connect(addrs[0]).acceptResource(weapons[0], 0);
  }

  async function equipWeaponAndCheckFromAddress(
    from: SignerWithAddress,
    childIndex: number,
    weaponResId: number,
  ): Promise<void> {
    await soldierEquip
      .connect(from)
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

    // Child is marked as equipped:
    expect(await weaponEquip.isEquipped(weapons[0])).to.eql(true);
  }

  async function unequipWeaponAndCheckFromAddress(from: SignerWithAddress): Promise<void> {
    await soldierEquip.connect(from).unequip(soldiers[0], soldierResId, partIdForWeapon);

    const expectedSlots = [bn(partIdForWeapon), bn(partIdForBackground)];
    // If a slot has nothing equipped, it returns an empty equip:
    const expectedEquips = [
      [bn(0), bn(0), bn(0), ethers.constants.AddressZero],
      [bn(0), bn(0), bn(0), ethers.constants.AddressZero],
    ];
    expect(await soldierEquip.getEquipped(soldiers[0], soldierResId)).to.eql([
      expectedSlots,
      expectedEquips,
    ]);

    // Child is marked as not equipped:
    expect(await weaponEquip.isEquipped(weapons[0])).to.eql(false);
  }

  async function replaceWeaponAndCheckFromAddress(from: SignerWithAddress): Promise<void> {
    const newWeaponId = 999;
    const weaponResourceIndex = 3;
    await mintWeaponToSoldier(addrs[0], soldiers[0], newWeaponId, weaponResourceIndex);

    const newWeaponChildIndex = 2;
    const newWeaponResId = weaponResourcesEquip[weaponResourceIndex];
    await soldierEquip
      .connect(from)
      .replaceEquipment(
        soldiers[0],
        soldierResId,
        partIdForWeapon,
        newWeaponChildIndex,
        newWeaponResId,
      );

    const expectedSlots = [bn(partIdForWeapon), bn(partIdForBackground)];
    // If a slot has nothing equipped, it returns an empty equip:
    const expectedEquips = [
      [bn(soldierResId), bn(newWeaponResId), bn(newWeaponId), weaponEquip.address],
      [bn(0), bn(0), bn(0), ethers.constants.AddressZero],
    ];
    expect(await soldierEquip.getEquipped(soldiers[0], soldierResId)).to.eql([
      expectedSlots,
      expectedEquips,
    ]);

    // Child is marked as equipped:
    expect(await weaponEquip.isEquipped(weapons[0])).to.eql(false);
    expect(await weaponEquip.isEquipped(newWeaponId)).to.eql(true);
  }

  function bn(x: number): BigNumber {
    return BigNumber.from(x);
  }
};

export default shouldBehaveLikeEquippableWithSlots;
