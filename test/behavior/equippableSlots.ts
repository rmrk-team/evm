import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';
import {
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
} from '../setup/equippableSlots';
import { bn } from '../utils';

// The general idea is having these tokens: Soldier, Weapon, WeaponGem and Background.
// Weapon and Background can be equipped into Soldier. WeaponGem can be equipped into Weapon
// All use a single base.
// Soldier will use a single enumerated fixed resource for simplicity
// Weapon will have 2 resources per weapon, one for full view, one for equipping
// Background will have a single resource for each, it can be used as full view and to equip
// Weapon Gems will have 2 enumerated resources, one for full view, one for equipping.
async function shouldBehaveLikeEquippableWithSlots(
  nestMint: (token: Contract, to: string, parentId: number) => Promise<number>,
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
  let view: Contract

  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;

    base = this.base;
    soldier = this.soldier;
    soldierEquip = this.soldierEquip;
    weapon = this.weapon;
    weaponEquip = this.weaponEquip;
    weaponGem = this.weaponGem;
    weaponGemEquip = this.weaponGemEquip;
    background = this.background;
    backgroundEquip = this.backgroundEquip;
    view = this.view;
  });

  describe.only('Validations', async function () {
    it('can validate equips of weapons into soldiers', async function () {
      // This resource is not equippable
      expect(
        await weaponEquip.canTokenBeEquippedWithResourceIntoSlot(
          soldierEquip.address,
          weaponsIds[0],
          weaponResourcesFull[0],
          partIdForWeapon,
        ),
      ).to.eql(false);

      // This resource is equippable into weapon part
      expect(
        await weaponEquip.canTokenBeEquippedWithResourceIntoSlot(
          soldierEquip.address,
          weaponsIds[0],
          weaponResourcesEquip[0],
          partIdForWeapon,
        ),
      ).to.eql(true);

      // This resource is NOT equippable into weapon gem part
      expect(
        await weaponEquip.canTokenBeEquippedWithResourceIntoSlot(
          soldierEquip.address,
          weaponsIds[0],
          weaponResourcesEquip[0],
          partIdForWeaponGem,
        ),
      ).to.eql(false);
    });

    it('can validate equips of weapon gems into weapons', async function () {
      // This resource is not equippable
      expect(
        await weaponGemEquip.canTokenBeEquippedWithResourceIntoSlot(
          weaponEquip.address,
          weaponGemsIds[0],
          weaponGemResourceFull,
          partIdForWeaponGem,
        ),
      ).to.eql(false);

      // This resource is equippable into weapon gem slot
      expect(
        await weaponGemEquip.canTokenBeEquippedWithResourceIntoSlot(
          weaponEquip.address,
          weaponGemsIds[0],
          weaponGemResourceEquip,
          partIdForWeaponGem,
        ),
      ).to.eql(true);

      // This resource is NOT equippable into background slot
      expect(
        await weaponGemEquip.canTokenBeEquippedWithResourceIntoSlot(
          weaponEquip.address,
          weaponGemsIds[0],
          weaponGemResourceEquip,
          partIdForBackground,
        ),
      ).to.eql(false);
    });

    it('can validate equips of backgrounds into soldiers', async function () {
      // This resource is equippable into background slot
      expect(
        await backgroundEquip.canTokenBeEquippedWithResourceIntoSlot(
          soldierEquip.address,
          backgroundsIds[0],
          backgroundResourceId,
          partIdForBackground,
        ),
      ).to.eql(true);

      // This resource is NOT equippable into weapon slot
      expect(
        await backgroundEquip.canTokenBeEquippedWithResourceIntoSlot(
          soldierEquip.address,
          backgroundsIds[0],
          backgroundResourceId,
          partIdForWeapon,
        ),
      ).to.eql(false);
    });
  });

  describe.only('Equip', async function () {
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
      await soldier.connect(soldierOwner).approve(approved.address, soldiersIds[0]);
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
        .equip([soldiersIds[0], weaponChildIndex, soldierResId, partIdForWeapon, weaponResId]);
      await soldierEquip
        .connect(addrs[0])
        .equip([
          soldiersIds[0],
          backgroundChildIndex,
          soldierResId,
          partIdForBackground,
          backgroundResourceId,
        ]);

      const expectedSlots = [bn(partIdForWeapon), bn(partIdForBackground)];
      const expectedEquips = [
        [bn(soldierResId), bn(weaponResId), bn(weaponsIds[0]), weaponEquip.address],
        [
          bn(soldierResId),
          bn(backgroundResourceId),
          bn(backgroundsIds[0]),
          backgroundEquip.address,
        ],
      ];
      expect(await soldierEquip.getEquipped(soldiersIds[0], soldierResId)).to.eql([
        expectedSlots,
        expectedEquips,
      ]);

      // Children are marked as equipped:
      expect(
        await soldierEquip.isChildEquipped(soldiersIds[0], weapon.address, weaponsIds[0]),
      ).to.eql(true);
      expect(
        await soldierEquip.isChildEquipped(soldiersIds[0], background.address, backgroundsIds[0]),
      ).to.eql(true);
    });

    it('cannot equip non existing child in slot (weapon in background)', async function () {
      // Weapon is child on index 0, background on index 1
      const badChildIndex = 3;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip([soldiersIds[0], badChildIndex, soldierResId, partIdForWeapon, weaponResId]),
      ).to.be.reverted; // Bad index
    });

    it('cannot equip wrong child in slot (weapon in background)', async function () {
      // Weapon is child on index 0, background on index 1
      const backgroundChildIndex = 1;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip([
            soldiersIds[0],
            backgroundChildIndex,
            soldierResId,
            partIdForWeapon,
            weaponResId,
          ]),
      ).to.be.revertedWithCustomError(
        soldierEquip,
        'RMRKTokenCannotBeEquippedWithResourceIntoSlot',
      );
    });

    it('cannot equip child in wrong slot (weapon in background)', async function () {
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip([soldiersIds[0], childIndex, soldierResId, partIdForBackground, weaponResId]),
      ).to.be.revertedWithCustomError(
        soldierEquip,
        'RMRKTokenCannotBeEquippedWithResourceIntoSlot',
      );
    });

    it('cannot equip child with wrong resource (weapon in background)', async function () {
      const childIndex = 0;
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, backgroundResourceId]),
      ).to.be.revertedWithCustomError(
        soldierEquip,
        'RMRKTokenCannotBeEquippedWithResourceIntoSlot',
      );
    });

    it('cannot equip if not owner', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await expect(
        soldierEquip
          .connect(addrs[1]) // Owner is addrs[0]
          .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]),
      ).to.be.revertedWithCustomError(soldierEquip, 'ERC721NotApprovedOrOwner');
    });

    it('cannot equip 2 children into the same slot', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      const weaponResourceIndex = 3;
      await mintWeaponToSoldier(addrs[0], soldiersIds[0], weaponResourceIndex);

      const newWeaponChildIndex = 2;
      const newWeaponResId = weaponResourcesEquip[weaponResourceIndex];
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip([
            soldiersIds[0],
            newWeaponChildIndex,
            soldierResId,
            partIdForWeapon,
            newWeaponResId,
          ]),
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
          .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKEquippableEquipNotAllowedByBase');
    });

    // TODO: Discuss if we want to prevent this. A weird base implementation could allow it.
    it.skip('cannot equip child into 2 different slots', async function () {
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
      await addNewEquippableResourceToWeapon(
        newWeaponResId,
        newEquippableRefId,
        partIdForWeaponAlt,
      );

      // If all went good, we can equip the weapon's new resource into the new slot
      await soldierEquip
        .connect(addrs[0])
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeaponAlt, newWeaponResId]);

      // Trying to equip the same child again into another slot must fail
      await expect(
        soldierEquip
          .connect(addrs[0]) // Owner is addrs[0]
          .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKAlreadyEquipped');
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
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

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
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await soldier.connect(soldierOwner).approve(approved.address, soldiersIds[0]);
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
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await soldier.connect(soldierOwner).setApprovalForAll(approved.address, true);
      await unequipWeaponAndCheckFromAddress(approved);
    });

    it('cannot unequip if not equipped', async function () {
      await expect(
        soldierEquip.connect(addrs[0]).unequip(soldiersIds[0], soldierResId, partIdForWeapon),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKNotEquipped');
    });

    it('cannot unequip if not owner', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await expect(
        soldierEquip.connect(addrs[1]).unequip(soldiersIds[0], soldierResId, partIdForWeapon),
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
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await replaceWeaponAndCheckFromAddress(soldierOwner);
    });

    it('can replace equip if approved', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(soldierOwner)
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      const approved = addrs[1];
      await soldier.connect(soldierOwner).approve(approved.address, soldiersIds[0]);
      await replaceWeaponAndCheckFromAddress(approved);
    });

    it('can replace equip if approved for all', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(soldierOwner)
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

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
          .replaceEquipment([
            soldiersIds[0],
            childIndex,
            soldierResId,
            partIdForWeapon,
            weaponResId,
          ]),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKNotEquipped');
    });

    it('cannot replace equip if not owner', async function () {
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      const weaponResourceIndex = 3;
      await mintWeaponToSoldier(addrs[0], soldiersIds[0], weaponResourceIndex);

      const newWeaponChildIndex = 2;
      const newWeaponResId = weaponResourcesEquip[weaponResourceIndex];
      await expect(
        soldierEquip
          .connect(addrs[1])
          .replaceEquipment([
            soldiersIds[0],
            newWeaponChildIndex,
            soldierResId,
            partIdForWeapon,
            newWeaponResId,
          ]),
      ).to.be.revertedWithCustomError(soldierEquip, 'ERC721NotApprovedOrOwner');
    });
  });

  describe('Transfer equipped', async function () {
    it('Can unequip and unnest', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon

      await soldierEquip
        .connect(soldierOwner)
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await unequipWeaponAndCheckFromAddress(soldierOwner);
      await soldier
        .connect(soldierOwner)
        .unnestChild(soldiersIds[0], childIndex, soldierOwner.address);
    });

    it('Unnest fails if child is equipped', async function () {
      const soldierOwner = addrs[0];
      // Weapon is child on index 0
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await expect(
        soldier.connect(soldierOwner).unnestChild(soldiersIds[0], childIndex, soldierOwner.address),
      ).to.be.revertedWithCustomError(weapon, 'RMRKMustUnequipFirst');
    });
  });

  describe('Compose', async function () {
    it('can get composables for soldier', async function () {
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      const expectedResource = [
        bn(soldierResId), // id
        bn(0), // equippableRefId
        base.address, // baseAddress
        'ipfs:soldier/', // metadataURI
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
          bn(weaponsIds[0]), // childTokenId
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
      const allResources = await soldierEquip.composeEquippables(soldiersIds[0], soldierResId);
      expect(allResources).to.eql([expectedResource, expectedFixedParts, expectedSlotParts]);
    });

    it('can get composables for simple resource', async function () {
      const expectedResource = [
        bn(backgroundResourceId), // id
        bn(1), // equippableRefId
        base.address, // baseAddress
        'ipfs:background/', // metadataURI
      ];
      const allResources = await backgroundEquip.composeEquippables(
        backgroundsIds[0],
        backgroundResourceId,
      );
      expect(allResources).to.eql([expectedResource, [], []]);
    });

    it('cannot get composables for soldier with not associated resource', async function () {
      const wrongResId = weaponResourcesEquip[1];
      await expect(
        weaponEquip.composeEquippables(weaponsIds[0], wrongResId),
      ).to.be.revertedWithCustomError(weaponEquip, 'RMRKTokenDoesNotHaveActiveResource');
    });
  });

  async function addNewEquippableResourceToWeapon(
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
      },
      [],
      [partIdForWeaponGem],
    );
    // Make it equippable into soldier using new slot
    await expect(
      weaponEquip.setValidParentRefId(newEquippableRefId, soldierEquip.address, partIdForWeaponAlt),
    )
      .to.emit(weaponEquip, 'ValidParentReferenceIdSet')
      .withArgs(newEquippableRefId, soldierEquip.address, partIdForWeaponAlt);

    // Add the resource to the weapon and accept it
    await weaponEquip.addResourceToToken(weaponsIds[0], newWeaponResId, 0);
    await weaponEquip.connect(addrs[0]).acceptResource(weaponsIds[0], 0);
  }

  async function equipWeaponAndCheckFromAddress(
    from: SignerWithAddress,
    childIndex: number,
    weaponResId: number,
  ): Promise<void> {
    await expect(
      soldierEquip
        .connect(from)
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]),
    )
      .to.emit(soldierEquip, 'ChildResourceEquipped')
      .withArgs(
        soldiersIds[0],
        soldierResId,
        partIdForWeapon,
        weaponsIds[0],
        weaponEquip.address,
        weaponResourcesEquip[0],
      );
    // All part slots are included on the response:
    const expectedSlots = [bn(partIdForWeapon), bn(partIdForBackground)];
    // If a slot has nothing equipped, it returns an empty equip:
    const expectedEquips = [
      [bn(soldierResId), bn(weaponResId), bn(weaponsIds[0]), weaponEquip.address],
      [bn(0), bn(0), bn(0), ethers.constants.AddressZero],
    ];
    expect(await view.getEquipped(soldierEquip.address, soldiersIds[0], soldierResId)).to.eql([
      expectedSlots,
      expectedEquips,
    ]);

    // Child is marked as equipped:
    expect(
      await soldierEquip.isChildEquipped(soldiersIds[0], weapon.address, weaponsIds[0]),
    ).to.eql(true);
  }

  async function unequipWeaponAndCheckFromAddress(from: SignerWithAddress): Promise<void> {
    await expect(soldierEquip.connect(from).unequip(soldiersIds[0], soldierResId, partIdForWeapon))
      .to.emit(soldierEquip, 'ChildResourceUnequipped')
      .withArgs(
        soldiersIds[0],
        soldierResId,
        partIdForWeapon,
        weaponsIds[0],
        weaponEquip.address,
        weaponResourcesEquip[0],
      );

    const expectedSlots = [bn(partIdForWeapon), bn(partIdForBackground)];
    // If a slot has nothing equipped, it returns an empty equip:
    const expectedEquips = [
      [bn(0), bn(0), bn(0), ethers.constants.AddressZero],
      [bn(0), bn(0), bn(0), ethers.constants.AddressZero],
    ];
    expect(await soldierEquip.getEquipped(soldiersIds[0], soldierResId)).to.eql([
      expectedSlots,
      expectedEquips,
    ]);

    // Child is marked as not equipped:
    expect(
      await soldierEquip.isChildEquipped(soldiersIds[0], weapon.address, weaponsIds[0]),
    ).to.eql(false);
  }

  async function replaceWeaponAndCheckFromAddress(from: SignerWithAddress): Promise<void> {
    const weaponResourceIndex = 3;
    const newWeaponId = await mintWeaponToSoldier(addrs[0], soldiersIds[0], weaponResourceIndex);

    const newWeaponChildIndex = 2;
    const newWeaponResId = weaponResourcesEquip[weaponResourceIndex];
    await soldierEquip
      .connect(from)
      .replaceEquipment([
        soldiersIds[0],
        newWeaponChildIndex,
        soldierResId,
        partIdForWeapon,
        newWeaponResId,
      ]);

    const expectedSlots = [bn(partIdForWeapon), bn(partIdForBackground)];
    // If a slot has nothing equipped, it returns an empty equip:
    const expectedEquips = [
      [bn(soldierResId), bn(newWeaponResId), bn(newWeaponId), weaponEquip.address],
      [bn(0), bn(0), bn(0), ethers.constants.AddressZero],
    ];
    expect(await soldierEquip.getEquipped(soldiersIds[0], soldierResId)).to.eql([
      expectedSlots,
      expectedEquips,
    ]);

    // Child is marked as equipped:
    expect(
      await soldierEquip.isChildEquipped(soldiersIds[0], weapon.address, weaponsIds[0]),
    ).to.eql(false);
    expect(await soldierEquip.isChildEquipped(soldiersIds[0], weapon.address, newWeaponId)).to.eql(
      true,
    );
  }

  async function mintWeaponToSoldier(
    soldierOwner: SignerWithAddress,
    soldierId: number,
    resourceIndex: number,
  ): Promise<number> {
    // Mint another weapon to the soldier and accept it
    const newWeaponId = await nestMint(weapon, soldier.address, soldierId);
    await soldier.connect(soldierOwner).acceptChild(soldierId, 0);

    // Add resources to weapon
    await weaponEquip.addResourceToToken(newWeaponId, weaponResourcesFull[resourceIndex], 0);
    await weaponEquip.addResourceToToken(newWeaponId, weaponResourcesEquip[resourceIndex], 0);
    await weaponEquip.connect(soldierOwner).acceptResource(newWeaponId, 0);
    await weaponEquip.connect(soldierOwner).acceptResource(newWeaponId, 0);

    return newWeaponId;
  }
}

export default shouldBehaveLikeEquippableWithSlots;
