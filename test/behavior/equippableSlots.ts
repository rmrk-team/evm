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
  let view: Contract;

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

  describe('Validations', async function () {
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
      expect(await view.getEquipped(soldierEquip.address, soldiersIds[0], soldierResId)).to.eql([
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

    it('cannot set a valid equippable group with id 0', async function () {
      const equippableGroupId = 0;
      // The malicious child indicates it can be equipped into soldier:
      await expect(
        weaponGemEquip.setValidParentForEquippableGroup(
          equippableGroupId,
          soldierEquip.address,
          partIdForWeaponGem,
        ),
      ).to.be.revertedWithCustomError(weaponGemEquip, 'RMRKIdZeroForbidden');
    });

    it('cannot set a valid equippable group with part id 0', async function () {
      const equippableGroupId = 1;
      const partId = 0;
      // The malicious child indicates it can be equipped into soldier:
      await expect(
        weaponGemEquip.setValidParentForEquippableGroup(
          equippableGroupId,
          soldierEquip.address,
          partId,
        ),
      ).to.be.revertedWithCustomError(weaponGemEquip, 'RMRKIdZeroForbidden');
    });

    it('cannot equip into a slot not set on the parent resource (gem into soldier)', async function () {
      const soldierOwner = addrs[0];
      const soldierId = soldiersIds[0];
      const childIndex = 2;

      const newWeaponGemId = await nestMint(weaponGem, soldier.address, soldierId);
      await soldier
        .connect(soldierOwner)
        .acceptChild(soldierId, 0, weaponGem.address, newWeaponGemId);

      // Add resources to weapon
      await weaponGemEquip.addResourceToToken(newWeaponGemId, weaponGemResourceFull, 0);
      await weaponGemEquip.addResourceToToken(newWeaponGemId, weaponGemResourceEquip, 0);
      await weaponGemEquip
        .connect(soldierOwner)
        .acceptResource(newWeaponGemId, weaponGemResourceFull);
      await weaponGemEquip
        .connect(soldierOwner)
        .acceptResource(newWeaponGemId, weaponGemResourceEquip);

      // The malicious child indicates it can be equipped into soldier:
      await weaponGemEquip.setValidParentForEquippableGroup(
        1, // equippableGroupId for gems
        soldierEquip.address,
        partIdForWeaponGem,
      );

      // Weapon is child on index 0, background on index 1
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip([soldierId, childIndex, soldierResId, partIdForWeaponGem, weaponGemResourceEquip]),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKTargetResourceCannotReceiveSlot');
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

      // Remove equippable addresses for part.
      await base.resetEquippableAddresses(partIdForWeapon);
      await expect(
        soldierEquip
          .connect(addrs[0]) // Owner is addrs[0]
          .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKEquippableEquipNotAllowedByBase');
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
        .unnestChild(
          soldiersIds[0],
          soldierOwner.address,
          childIndex,
          weapon.address,
          weaponsIds[0],
          false,
        );
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
        soldier
          .connect(soldierOwner)
          .unnestChild(
            soldiersIds[0],
            soldierOwner.address,
            childIndex,
            weapon.address,
            weaponsIds[0],
            false,
          ),
      ).to.be.revertedWithCustomError(weapon, 'RMRKMustUnequipFirst');
    });
  });

  describe('Compose', async function () {
    it('can compose equippables for soldier', async function () {
      const childIndex = 0;
      const weaponResId = weaponResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

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
          weaponEquip.address, // childAddress
          bn(weaponsIds[0]), // childTokenId
          'ipfs:weapon/equip/5', // childResourceMetadata
          '', // partMetadata
        ],
        [
          // Nothing on equipped on background slot:
          bn(partIdForBackground), // partId
          bn(0), // childResourceId
          0, // z
          ethers.constants.AddressZero, // childAddress
          bn(0), // childTokenId
          '', // childResourceMetadata
          'noBackground.png', // partMetadata
        ],
      ];
      const allResources = await view.composeEquippables(
        soldierEquip.address,
        soldiersIds[0],
        soldierResId,
      );
      expect(allResources).to.eql([
        'ipfs:soldier/', // metadataURI
        bn(0), // equippableGroupId
        base.address, // baseAddress
        expectedFixedParts,
        expectedSlotParts,
      ]);
    });

    it('can compose equippables for simple resource', async function () {
      const allResources = await view.composeEquippables(
        backgroundEquip.address,
        backgroundsIds[0],
        backgroundResourceId,
      );
      expect(allResources).to.eql([
        'ipfs:background/', // metadataURI
        bn(1), // equippableGroupId
        base.address, // baseAddress,
        [],
        [],
      ]);
    });

    it('cannot compose equippables for soldier with not associated resource', async function () {
      const wrongResId = weaponResourcesEquip[1];
      await expect(
        view.composeEquippables(weaponEquip.address, weaponsIds[0], wrongResId),
      ).to.be.revertedWithCustomError(weaponEquip, 'RMRKTokenDoesNotHaveResource');
    });
  });

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
    expect(await view.getEquipped(soldierEquip.address, soldiersIds[0], soldierResId)).to.eql([
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
    expect(await view.getEquipped(soldierEquip.address, soldiersIds[0], soldierResId)).to.eql([
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
    await soldier.connect(soldierOwner).acceptChild(soldierId, 0, weapon.address, newWeaponId);

    // Add resources to weapon
    await weaponEquip.addResourceToToken(newWeaponId, weaponResourcesFull[resourceIndex], 0);
    await weaponEquip.addResourceToToken(newWeaponId, weaponResourcesEquip[resourceIndex], 0);
    await weaponEquip
      .connect(soldierOwner)
      .acceptResource(newWeaponId, weaponResourcesFull[resourceIndex]);
    await weaponEquip
      .connect(soldierOwner)
      .acceptResource(newWeaponId, weaponResourcesEquip[resourceIndex]);

    return newWeaponId;
  }
}

export default shouldBehaveLikeEquippableWithSlots;
