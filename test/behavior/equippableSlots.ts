import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { Contract } from 'ethers';
import {
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
} from '../setup/equippableSlots';
import { bn } from '../utils';

// The general idea is having these tokens: Soldier, Weapon, WeaponGem and Background.
// Weapon and Background can be equipped into Soldier. WeaponGem can be equipped into Weapon
// All use a single catalog.
// Soldier will use a single enumerated fixed asset for simplicity
// Weapon will have 2 assets per weapon, one for full view, one for equipping
// Background will have a single asset for each, it can be used as full view and to equip
// Weapon Gems will have 2 enumerated assets, one for full view, one for equipping.
async function shouldBehaveLikeEquippableWithSlots(
  nestMint: (token: Contract, to: string, parentId: bigint) => Promise<bigint>,
) {
  let catalog: Contract;
  let soldier: Contract;
  let weapon: Contract;
  let weaponGem: Contract;
  let background: Contract;
  let view: Contract;

  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;

    catalog = this.catalog;
    soldier = this.soldier;
    weapon = this.weapon;
    weaponGem = this.weaponGem;
    background = this.background;
    view = this.view;
  });

  describe('Validations', async function () {
    it('can validate equips of weapons into soldiers', async function () {
      // This asset is not equippable
      expect(
        await weapon.canTokenBeEquippedWithAssetIntoSlot(
          await soldier.getAddress(),
          weaponsIds[0],
          weaponAssetsFull[0],
          partIdForWeapon,
        ),
      ).to.eql(false);

      // This asset is equippable into weapon part
      expect(
        await weapon.canTokenBeEquippedWithAssetIntoSlot(
          await soldier.getAddress(),
          weaponsIds[0],
          weaponAssetsEquip[0],
          partIdForWeapon,
        ),
      ).to.eql(true);

      // This asset is NOT equippable into weapon gem part
      expect(
        await weapon.canTokenBeEquippedWithAssetIntoSlot(
          await soldier.getAddress(),
          weaponsIds[0],
          weaponAssetsEquip[0],
          partIdForWeaponGem,
        ),
      ).to.eql(false);
    });

    it('can validate equips of weapon gems into weapons', async function () {
      // This asset is not equippable
      expect(
        await weaponGem.canTokenBeEquippedWithAssetIntoSlot(
          await weapon.getAddress(),
          weaponGemsIds[0],
          weaponGemAssetFull,
          partIdForWeaponGem,
        ),
      ).to.eql(false);

      // This asset is equippable into weapon gem slot
      expect(
        await weaponGem.canTokenBeEquippedWithAssetIntoSlot(
          await weapon.getAddress(),
          weaponGemsIds[0],
          weaponGemAssetEquip,
          partIdForWeaponGem,
        ),
      ).to.eql(true);

      // This asset is NOT equippable into background slot
      expect(
        await weaponGem.canTokenBeEquippedWithAssetIntoSlot(
          await weapon.getAddress(),
          weaponGemsIds[0],
          weaponGemAssetEquip,
          partIdForBackground,
        ),
      ).to.eql(false);
    });

    it('can validate equips of backgrounds into soldiers', async function () {
      // This asset is equippable into background slot
      expect(
        await background.canTokenBeEquippedWithAssetIntoSlot(
          await soldier.getAddress(),
          backgroundsIds[0],
          backgroundAssetId,
          partIdForBackground,
        ),
      ).to.eql(true);

      // This asset is NOT equippable into weapon slot
      expect(
        await background.canTokenBeEquippedWithAssetIntoSlot(
          await soldier.getAddress(),
          backgroundsIds[0],
          backgroundAssetId,
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
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await equipWeaponAndCheckFromAddress(soldierOwner, childIndex, weaponResId);
    });

    it('can equip weapon if approved', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const approved = addrs[1];
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await soldier
        .connect(soldierOwner)
        .approveForAssets(await approved.getAddress(), soldiersIds[0]);
      await equipWeaponAndCheckFromAddress(approved, childIndex, weaponResId);
    });

    it('can equip weapon if approved for all', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const approved = addrs[1];
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await soldier
        .connect(soldierOwner)
        .setApprovalForAllForAssets(await approved.getAddress(), true);
      await equipWeaponAndCheckFromAddress(approved, childIndex, weaponResId);
    });

    it('can equip weapon and background', async function () {
      // Weapon is child on index 0, background on index 1
      const weaponChildIndex = 0;
      const backgroundChildIndex = 1;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await soldier
        .connect(addrs[0])
        .equip([soldiersIds[0], weaponChildIndex, soldierResId, partIdForWeapon, weaponResId]);
      await soldier
        .connect(addrs[0])
        .equip([
          soldiersIds[0],
          backgroundChildIndex,
          soldierResId,
          partIdForBackground,
          backgroundAssetId,
        ]);

      const expectedSlots = [bn(partIdForWeapon), bn(partIdForBackground)];
      const expectedEquips = [
        [bn(soldierResId), bn(weaponResId), weaponsIds[0], await weapon.getAddress()],
        [bn(soldierResId), bn(backgroundAssetId), backgroundsIds[0], await background.getAddress()],
      ];
      const expectedMetadata = ['ipfs:weapon/equip/5', 'ipfs:background/'];
      expect(
        await view.getEquipped(await soldier.getAddress(), soldiersIds[0], soldierResId),
      ).to.eql([expectedSlots, expectedEquips, expectedMetadata]);

      // Children are marked as equipped:
      expect(
        await soldier.isChildEquipped(soldiersIds[0], await weapon.getAddress(), weaponsIds[0]),
      ).to.eql(true);
      expect(
        await soldier.isChildEquipped(
          soldiersIds[0],
          await background.getAddress(),
          backgroundsIds[0],
        ),
      ).to.eql(true);
    });

    it('cannot equip non existing child in slot (weapon in background)', async function () {
      // Weapon is child on index 0, background on index 1
      const badChildIndex = 3;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await expect(
        soldier
          .connect(addrs[0])
          .equip([soldiersIds[0], badChildIndex, soldierResId, partIdForWeapon, weaponResId]),
      ).to.be.reverted; // Bad index
    });

    it('cannot set a valid equippable group with id 0', async function () {
      const equippableGroupId = 0;
      // The malicious child indicates it can be equipped into soldier:
      await expect(
        weaponGem.setValidParentForEquippableGroup(
          equippableGroupId,
          await soldier.getAddress(),
          partIdForWeaponGem,
        ),
      ).to.be.revertedWithCustomError(weaponGem, 'RMRKIdZeroForbidden');
    });

    it('cannot set a valid equippable group with part id 0', async function () {
      const equippableGroupId = 1n;
      const partId = 0;
      // The malicious child indicates it can be equipped into soldier:
      await expect(
        weaponGem.setValidParentForEquippableGroup(
          equippableGroupId,
          await soldier.getAddress(),
          partId,
        ),
      ).to.be.revertedWithCustomError(weaponGem, 'RMRKIdZeroForbidden');
    });

    it('cannot equip into a slot not set on the parent asset (gem into soldier)', async function () {
      const soldierOwner = addrs[0];
      const soldierId = soldiersIds[0];
      const childIndex = 2;

      const newWeaponGemId = await nestMint(weaponGem, await soldier.getAddress(), soldierId);
      await soldier
        .connect(soldierOwner)
        .acceptChild(soldierId, 0, await weaponGem.getAddress(), newWeaponGemId);

      // Add assets to weapon
      await weaponGem.addAssetToToken(newWeaponGemId, weaponGemAssetFull, 0);
      await weaponGem.addAssetToToken(newWeaponGemId, weaponGemAssetEquip, 0);
      await weaponGem.connect(soldierOwner).acceptAsset(newWeaponGemId, 0, weaponGemAssetFull);
      await weaponGem.connect(soldierOwner).acceptAsset(newWeaponGemId, 0, weaponGemAssetEquip);

      // The malicious child indicates it can be equipped into soldier:
      await weaponGem.setValidParentForEquippableGroup(
        1, // equippableGroupId for gems
        await soldier.getAddress(),
        partIdForWeaponGem,
      );

      // Weapon is child on index 0, background on index 1
      await expect(
        soldier
          .connect(addrs[0])
          .equip([soldierId, childIndex, soldierResId, partIdForWeaponGem, weaponGemAssetEquip]),
      ).to.be.revertedWithCustomError(soldier, 'RMRKTargetAssetCannotReceiveSlot');
    });

    it('cannot equip wrong child in slot (weapon in background)', async function () {
      // Weapon is child on index 0, background on index 1
      const backgroundChildIndex = 1;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await expect(
        soldier
          .connect(addrs[0])
          .equip([
            soldiersIds[0],
            backgroundChildIndex,
            soldierResId,
            partIdForWeapon,
            weaponResId,
          ]),
      ).to.be.revertedWithCustomError(soldier, 'RMRKTokenCannotBeEquippedWithAssetIntoSlot');
    });

    it('cannot equip child in wrong slot (weapon in background)', async function () {
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await expect(
        soldier
          .connect(addrs[0])
          .equip([soldiersIds[0], childIndex, soldierResId, partIdForBackground, weaponResId]),
      ).to.be.revertedWithCustomError(soldier, 'RMRKTokenCannotBeEquippedWithAssetIntoSlot');
    });

    it('cannot equip child with wrong asset (weapon in background)', async function () {
      const childIndex = 0;
      await expect(
        soldier
          .connect(addrs[0])
          .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, backgroundAssetId]),
      ).to.be.revertedWithCustomError(soldier, 'RMRKTokenCannotBeEquippedWithAssetIntoSlot');
    });

    it('cannot equip if not owner', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await expect(
        soldier
          .connect(addrs[1]) // Owner is addrs[0]
          .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]),
      ).to.be.revertedWithCustomError(soldier, 'RMRKNotApprovedForAssetsOrOwner');
    });

    it('cannot equip 2 children into the same slot', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await soldier
        .connect(addrs[0])
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      const weaponAssetIndex = 3;
      await mintWeaponToSoldier(addrs[0], soldiersIds[0], weaponAssetIndex);

      const newWeaponChildIndex = 2;
      const newWeaponResId = weaponAssetsEquip[weaponAssetIndex];
      await expect(
        soldier
          .connect(addrs[0])
          .equip([
            soldiersIds[0],
            newWeaponChildIndex,
            soldierResId,
            partIdForWeapon,
            newWeaponResId,
          ]),
      ).to.be.revertedWithCustomError(soldier, 'RMRKSlotAlreadyUsed');
    });

    it('cannot equip if not intented on catalog', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon

      // Remove equippable addresses for part.
      await catalog.resetEquippableAddresses(partIdForWeapon);
      await expect(
        soldier
          .connect(addrs[0]) // Owner is addrs[0]
          .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]),
      ).to.be.revertedWithCustomError(soldier, 'RMRKEquippableEquipNotAllowedByCatalog');
    });

    describe('With equipped children', async function () {
      let soldierID: bigint;
      let soldierOwner: SignerWithAddress;
      let weaponChildIndex = 0;
      let backgroundChildIndex = 1;
      let weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon

      beforeEach(async function () {
        soldierID = soldiersIds[0];
        soldierOwner = addrs[0];

        await soldier
          .connect(soldierOwner)
          .equip([soldierID, weaponChildIndex, soldierResId, partIdForWeapon, weaponResId]);
        await soldier
          .connect(soldierOwner)
          .equip([
            soldierID,
            backgroundChildIndex,
            soldierResId,
            partIdForBackground,
            backgroundAssetId,
          ]);
      });

      it('can replace parent equipped asset and still unequip it', async function () {
        // Weapon is child on index 0, background on index 1
        const newSoldierResId = soldierResId + 1;
        await soldier.addEquippableAssetEntry(
          newSoldierResId,
          0,
          await catalog.getAddress(),
          'ipfs:soldier/',
          [partIdForBody, partIdForWeapon, partIdForBackground],
        );
        await soldier.addAssetToToken(soldierID, newSoldierResId, soldierResId);
        await soldier.connect(soldierOwner).acceptAsset(soldierID, 0, newSoldierResId);

        // Children still marked as equipped, so the cannot be transferred
        expect(
          await soldier.isChildEquipped(soldierID, await weapon.getAddress(), weaponsIds[0]),
        ).to.eql(true);
        expect(
          await soldier.isChildEquipped(
            soldierID,
            await background.getAddress(),
            backgroundsIds[0],
          ),
        ).to.eql(true);

        await soldier.connect(soldierOwner).unequip(soldierID, soldierResId, partIdForWeapon);
        await soldier.connect(soldierOwner).unequip(soldierID, soldierResId, partIdForBackground);
        expect(
          await soldier.isChildEquipped(soldierID, await weapon.getAddress(), weaponsIds[0]),
        ).to.eql(false);
        expect(
          await soldier.isChildEquipped(
            soldierID,
            await background.getAddress(),
            backgroundsIds[0],
          ),
        ).to.eql(false);
      });

      it('can replace child equipped asset and still unequip it', async function () {
        // Weapon is child on index 0, background on index 1
        const newWeaponAssetId = weaponAssetsEquip[0] + 10;
        const weaponId = weaponsIds[0];
        await weapon.addEquippableAssetEntry(
          newWeaponAssetId,
          1, // equippableGroupId
          await catalog.getAddress(),
          'ipfs:weapon/new',
          [],
        );
        await weapon.addAssetToToken(weaponId, newWeaponAssetId, weaponAssetsEquip[0]);
        await weapon.connect(soldierOwner).acceptAsset(weaponId, 0, newWeaponAssetId);

        // Children still marked as equipped, so the cannot be transferred
        expect(
          await soldier.isChildEquipped(soldierID, await weapon.getAddress(), weaponsIds[0]),
        ).to.eql(true);

        await soldier.connect(soldierOwner).unequip(soldierID, soldierResId, partIdForWeapon);

        expect(
          await soldier.isChildEquipped(soldierID, await weapon.getAddress(), weaponsIds[0]),
        ).to.eql(false);
      });

      it('can replace parent equipped asset and cannot not re-equip on top', async function () {
        // Weapon is child on index 0, background on index 1
        const newSoldierResId = soldierResId + 1;
        await soldier.addEquippableAssetEntry(
          newSoldierResId,
          0,
          await catalog.getAddress(),
          'ipfs:soldier/',
          [partIdForBody, partIdForWeapon, partIdForBackground],
        );
        await soldier.addAssetToToken(soldierID, newSoldierResId, soldierResId);
        await soldier.connect(soldierOwner).acceptAsset(soldierID, 0, newSoldierResId);

        await expect(
          soldier
            .connect(soldierOwner)
            .equip([soldierID, weaponChildIndex, newSoldierResId, partIdForWeapon, weaponResId]),
        ).to.be.revertedWithCustomError(soldier, 'RMRKSlotAlreadyUsed');
      });
    });
  });

  describe('Unequip', async function () {
    it('can unequip', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon

      await soldier
        .connect(soldierOwner)
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await unequipWeaponAndCheckFromAddress(soldierOwner);
    });

    it('can unequip if approved', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      const approved = addrs[1];

      await soldier
        .connect(soldierOwner)
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await soldier
        .connect(soldierOwner)
        .approveForAssets(await approved.getAddress(), soldiersIds[0]);
      await unequipWeaponAndCheckFromAddress(approved);
    });

    it('can unequip if approved for all', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      const approved = addrs[1];

      await soldier
        .connect(soldierOwner)
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await soldier
        .connect(soldierOwner)
        .setApprovalForAllForAssets(await approved.getAddress(), true);
      await unequipWeaponAndCheckFromAddress(approved);
    });

    it('cannot unequip if not equipped', async function () {
      await expect(
        soldier.connect(addrs[0]).unequip(soldiersIds[0], soldierResId, partIdForWeapon),
      ).to.be.revertedWithCustomError(soldier, 'RMRKNotEquipped');
    });

    it('cannot unequip if not owner', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await soldier
        .connect(addrs[0])
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await expect(
        soldier.connect(addrs[1]).unequip(soldiersIds[0], soldierResId, partIdForWeapon),
      ).to.be.revertedWithCustomError(soldier, 'RMRKNotApprovedForAssetsOrOwner');
    });
  });

  describe('Transfer equipped', async function () {
    it('can unequip and transfer child', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon

      await soldier
        .connect(soldierOwner)
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await unequipWeaponAndCheckFromAddress(soldierOwner);
      await soldier
        .connect(soldierOwner)
        .transferChild(
          soldiersIds[0],
          await soldierOwner.getAddress(),
          0,
          childIndex,
          await weapon.getAddress(),
          weaponsIds[0],
          false,
          '0x',
        );
    });

    it('child transfer fails if child is equipped', async function () {
      const soldierOwner = addrs[0];
      // Weapon is child on index 0
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await soldier
        .connect(addrs[0])
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await expect(
        soldier
          .connect(soldierOwner)
          .transferChild(
            soldiersIds[0],
            await soldierOwner.getAddress(),
            0,
            childIndex,
            await weapon.getAddress(),
            weaponsIds[0],
            false,
            '0x',
          ),
      ).to.be.revertedWithCustomError(weapon, 'RMRKMustUnequipFirst');
    });
  });

  describe('Compose', async function () {
    it('can compose equippables for soldier', async function () {
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await soldier
        .connect(addrs[0])
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      const expectedFixedParts = [
        [
          bn(partIdForBody), // partId
          1n, // z
          'genericBody.png', // metadataURI
        ],
      ];
      const expectedSlotParts = [
        [
          bn(partIdForWeapon), // partId
          bn(weaponAssetsEquip[0]), // childAssetId
          2n, // z
          await weapon.getAddress(), // childAddress
          weaponsIds[0], // childTokenId
          'ipfs:weapon/equip/5', // childAssetMetadata
          '', // partMetadata
        ],
        [
          // Nothing on equipped on background slot:
          bn(partIdForBackground), // partId
          0n, // childAssetId
          0n, // z
          ethers.ZeroAddress, // childAddress
          0n, // childTokenId
          '', // childAssetMetadata
          'noBackground.png', // partMetadata
        ],
      ];
      const allAssets = await view.composeEquippables(
        await soldier.getAddress(),
        soldiersIds[0],
        soldierResId,
      );
      expect(allAssets).to.eql([
        'ipfs:soldier/', // metadataURI
        0n, // equippableGroupId
        await catalog.getAddress(), // catalogAddress
        expectedFixedParts,
        expectedSlotParts,
      ]);
    });

    it('can compose equippables for simple asset', async function () {
      const allAssets = await view.composeEquippables(
        await background.getAddress(),
        backgroundsIds[0],
        backgroundAssetId,
      );
      expect(allAssets).to.eql([
        'ipfs:background/', // metadataURI
        bn(1), // equippableGroupId
        await catalog.getAddress(), // catalogAddress,
        [],
        [],
      ]);
    });

    it('cannot compose equippables for soldier with not associated asset', async function () {
      const wrongResId = weaponAssetsEquip[1];
      await expect(
        view.composeEquippables(await weapon.getAddress(), weaponsIds[0], wrongResId),
      ).to.be.revertedWithCustomError(weapon, 'RMRKTokenDoesNotHaveAsset');
    });
  });

  async function equipWeaponAndCheckFromAddress(
    from: SignerWithAddress,
    childIndex: number,
    weaponResId: number,
  ): Promise<void> {
    // It's ok if nothing equipped
    const expectedSlots = [bn(partIdForWeapon), bn(partIdForBackground)];
    expect(await view.getEquipped(await soldier.getAddress(), soldiersIds[0], soldierResId)).to.eql(
      [
        expectedSlots,
        [
          [0n, 0n, 0n, ethers.ZeroAddress],
          [0n, 0n, 0n, ethers.ZeroAddress],
        ],
        ['', ''],
      ],
    );

    await expect(
      soldier
        .connect(from)
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]),
    )
      .to.emit(soldier, 'ChildAssetEquipped')
      .withArgs(
        soldiersIds[0],
        soldierResId,
        partIdForWeapon,
        weaponsIds[0],
        await weapon.getAddress(),
        weaponAssetsEquip[0],
      );
    // All part slots are included on the response:
    // If a slot has nothing equipped, it returns an empty equip:
    const expectedEquips = [
      [bn(soldierResId), bn(weaponResId), weaponsIds[0], await weapon.getAddress()],
      [0n, 0n, 0n, ethers.ZeroAddress],
    ];
    const expectedMetadata = ['ipfs:weapon/equip/5', ''];
    expect(await view.getEquipped(await soldier.getAddress(), soldiersIds[0], soldierResId)).to.eql(
      [expectedSlots, expectedEquips, expectedMetadata],
    );

    // Child is marked as equipped:
    expect(
      await soldier.isChildEquipped(soldiersIds[0], await weapon.getAddress(), weaponsIds[0]),
    ).to.eql(true);
  }

  async function unequipWeaponAndCheckFromAddress(from: SignerWithAddress): Promise<void> {
    await expect(soldier.connect(from).unequip(soldiersIds[0], soldierResId, partIdForWeapon))
      .to.emit(soldier, 'ChildAssetUnequipped')
      .withArgs(
        soldiersIds[0],
        soldierResId,
        partIdForWeapon,
        weaponsIds[0],
        await weapon.getAddress(),
        weaponAssetsEquip[0],
      );

    const expectedSlots = [bn(partIdForWeapon), bn(partIdForBackground)];
    // If a slot has nothing equipped, it returns an empty equip:
    const expectedEquips = [
      [0n, 0n, 0n, ethers.ZeroAddress],
      [0n, 0n, 0n, ethers.ZeroAddress],
    ];
    const expectedMetadata = ['', ''];
    expect(await view.getEquipped(await soldier.getAddress(), soldiersIds[0], soldierResId)).to.eql(
      [expectedSlots, expectedEquips, expectedMetadata],
    );

    // Child is marked as not equipped:
    expect(
      await soldier.isChildEquipped(soldiersIds[0], await weapon.getAddress(), weaponsIds[0]),
    ).to.eql(false);
  }

  async function mintWeaponToSoldier(
    soldierOwner: SignerWithAddress,
    soldierId: bigint,
    assetIndex: number,
  ): Promise<bigint> {
    // Mint another weapon to the soldier and accept it
    const newWeaponId = await nestMint(weapon, await soldier.getAddress(), soldierId);
    await soldier
      .connect(soldierOwner)
      .acceptChild(soldierId, 0, await weapon.getAddress(), newWeaponId);

    // Add assets to weapon
    await weapon.addAssetToToken(newWeaponId, weaponAssetsFull[assetIndex], 0);
    await weapon.addAssetToToken(newWeaponId, weaponAssetsEquip[assetIndex], 0);
    await weapon.connect(soldierOwner).acceptAsset(newWeaponId, 0, weaponAssetsFull[assetIndex]);
    await weapon.connect(soldierOwner).acceptAsset(newWeaponId, 0, weaponAssetsEquip[assetIndex]);

    return newWeaponId;
  }
}

export default shouldBehaveLikeEquippableWithSlots;
