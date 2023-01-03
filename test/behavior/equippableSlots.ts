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
  nestMint: (token: Contract, to: string, parentId: number) => Promise<number>,
) {
  let catalog: Contract;
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

    catalog = this.catalog;
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
      // This asset is not equippable
      expect(
        await weaponEquip.canTokenBeEquippedWithAssetIntoSlot(
          soldierEquip.address,
          weaponsIds[0],
          weaponAssetsFull[0],
          partIdForWeapon,
        ),
      ).to.eql(false);

      // This asset is equippable into weapon part
      expect(
        await weaponEquip.canTokenBeEquippedWithAssetIntoSlot(
          soldierEquip.address,
          weaponsIds[0],
          weaponAssetsEquip[0],
          partIdForWeapon,
        ),
      ).to.eql(true);

      // This asset is NOT equippable into weapon gem part
      expect(
        await weaponEquip.canTokenBeEquippedWithAssetIntoSlot(
          soldierEquip.address,
          weaponsIds[0],
          weaponAssetsEquip[0],
          partIdForWeaponGem,
        ),
      ).to.eql(false);
    });

    it('can validate equips of weapon gems into weapons', async function () {
      // This asset is not equippable
      expect(
        await weaponGemEquip.canTokenBeEquippedWithAssetIntoSlot(
          weaponEquip.address,
          weaponGemsIds[0],
          weaponGemAssetFull,
          partIdForWeaponGem,
        ),
      ).to.eql(false);

      // This asset is equippable into weapon gem slot
      expect(
        await weaponGemEquip.canTokenBeEquippedWithAssetIntoSlot(
          weaponEquip.address,
          weaponGemsIds[0],
          weaponGemAssetEquip,
          partIdForWeaponGem,
        ),
      ).to.eql(true);

      // This asset is NOT equippable into background slot
      expect(
        await weaponGemEquip.canTokenBeEquippedWithAssetIntoSlot(
          weaponEquip.address,
          weaponGemsIds[0],
          weaponGemAssetEquip,
          partIdForBackground,
        ),
      ).to.eql(false);
    });

    it('can validate equips of backgrounds into soldiers', async function () {
      // This asset is equippable into background slot
      expect(
        await backgroundEquip.canTokenBeEquippedWithAssetIntoSlot(
          soldierEquip.address,
          backgroundsIds[0],
          backgroundAssetId,
          partIdForBackground,
        ),
      ).to.eql(true);

      // This asset is NOT equippable into weapon slot
      expect(
        await backgroundEquip.canTokenBeEquippedWithAssetIntoSlot(
          soldierEquip.address,
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
      await soldier.connect(soldierOwner).approve(approved.address, soldiersIds[0]);
      await equipWeaponAndCheckFromAddress(approved, childIndex, weaponResId);
    });

    it('can equip weapon if approved for all', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const approved = addrs[1];
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await soldier.connect(soldierOwner).setApprovalForAll(approved.address, true);
      await equipWeaponAndCheckFromAddress(approved, childIndex, weaponResId);
    });

    it('can equip weapon and background', async function () {
      // Weapon is child on index 0, background on index 1
      const weaponChildIndex = 0;
      const backgroundChildIndex = 1;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
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
          backgroundAssetId,
        ]);

      const expectedSlots = [bn(partIdForWeapon), bn(partIdForBackground)];
      const expectedEquips = [
        [bn(soldierResId), bn(weaponResId), bn(weaponsIds[0]), weaponEquip.address],
        [bn(soldierResId), bn(backgroundAssetId), bn(backgroundsIds[0]), backgroundEquip.address],
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
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
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

    it('cannot equip into a slot not set on the parent asset (gem into soldier)', async function () {
      const soldierOwner = addrs[0];
      const soldierId = soldiersIds[0];
      const childIndex = 2;

      const newWeaponGemId = await nestMint(weaponGem, soldier.address, soldierId);
      await soldier
        .connect(soldierOwner)
        .acceptChild(soldierId, 0, weaponGem.address, newWeaponGemId);

      // Add assets to weapon
      await weaponGemEquip.addAssetToToken(newWeaponGemId, weaponGemAssetFull, 0);
      await weaponGemEquip.addAssetToToken(newWeaponGemId, weaponGemAssetEquip, 0);
      await weaponGemEquip.connect(soldierOwner).acceptAsset(newWeaponGemId, 0, weaponGemAssetFull);
      await weaponGemEquip
        .connect(soldierOwner)
        .acceptAsset(newWeaponGemId, 0, weaponGemAssetEquip);

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
          .equip([soldierId, childIndex, soldierResId, partIdForWeaponGem, weaponGemAssetEquip]),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKTargetAssetCannotReceiveSlot');
    });

    it('cannot equip wrong child in slot (weapon in background)', async function () {
      // Weapon is child on index 0, background on index 1
      const backgroundChildIndex = 1;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
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
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKTokenCannotBeEquippedWithAssetIntoSlot');
    });

    it('cannot equip child in wrong slot (weapon in background)', async function () {
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip([soldiersIds[0], childIndex, soldierResId, partIdForBackground, weaponResId]),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKTokenCannotBeEquippedWithAssetIntoSlot');
    });

    it('cannot equip child with wrong asset (weapon in background)', async function () {
      const childIndex = 0;
      await expect(
        soldierEquip
          .connect(addrs[0])
          .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, backgroundAssetId]),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKTokenCannotBeEquippedWithAssetIntoSlot');
    });

    it('cannot equip if not owner', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await expect(
        soldierEquip
          .connect(addrs[1]) // Owner is addrs[0]
          .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]),
      ).to.be.revertedWithCustomError(soldierEquip, 'ERC721NotApprovedOrOwner');
    });

    it('cannot equip 2 children into the same slot', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      const weaponAssetIndex = 3;
      await mintWeaponToSoldier(addrs[0], soldiersIds[0], weaponAssetIndex);

      const newWeaponChildIndex = 2;
      const newWeaponResId = weaponAssetsEquip[weaponAssetIndex];
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

    it('cannot equip if not intented on catalog', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon

      // Remove equippable addresses for part.
      await catalog.resetEquippableAddresses(partIdForWeapon);
      await expect(
        soldierEquip
          .connect(addrs[0]) // Owner is addrs[0]
          .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]),
      ).to.be.revertedWithCustomError(soldierEquip, 'RMRKEquippableEquipNotAllowedByCatalog');
    });
  });

  describe('Unequip', async function () {
    it('can unequip', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon

      await soldierEquip
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
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
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
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await soldierEquip
        .connect(addrs[0])
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await expect(
        soldierEquip.connect(addrs[1]).unequip(soldiersIds[0], soldierResId, partIdForWeapon),
      ).to.be.revertedWithCustomError(soldierEquip, 'ERC721NotApprovedOrOwner');
    });
  });

  describe('Transfer equipped', async function () {
    it('can unequip and transfer child', async function () {
      // Weapon is child on index 0, background on index 1
      const soldierOwner = addrs[0];
      const childIndex = 0;
      const weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon

      await soldierEquip
        .connect(soldierOwner)
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await unequipWeaponAndCheckFromAddress(soldierOwner);
      await soldier
        .connect(soldierOwner)
        .transferChild(
          soldiersIds[0],
          soldierOwner.address,
          0,
          childIndex,
          weapon.address,
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
      await soldierEquip
        .connect(addrs[0])
        .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]);

      await expect(
        soldier
          .connect(soldierOwner)
          .transferChild(
            soldiersIds[0],
            soldierOwner.address,
            0,
            childIndex,
            weapon.address,
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
          bn(weaponAssetsEquip[0]), // childAssetId
          2, // z
          weaponEquip.address, // childAddress
          bn(weaponsIds[0]), // childTokenId
          'ipfs:weapon/equip/5', // childAssetMetadata
          '', // partMetadata
        ],
        [
          // Nothing on equipped on background slot:
          bn(partIdForBackground), // partId
          bn(0), // childAssetId
          0, // z
          ethers.constants.AddressZero, // childAddress
          bn(0), // childTokenId
          '', // childAssetMetadata
          'noBackground.png', // partMetadata
        ],
      ];
      const allAssets = await view.composeEquippables(
        soldierEquip.address,
        soldiersIds[0],
        soldierResId,
      );
      expect(allAssets).to.eql([
        'ipfs:soldier/', // metadataURI
        bn(0), // equippableGroupId
        catalog.address, // catalogAddress
        expectedFixedParts,
        expectedSlotParts,
      ]);
    });

    it('can compose equippables for simple asset', async function () {
      const allAssets = await view.composeEquippables(
        backgroundEquip.address,
        backgroundsIds[0],
        backgroundAssetId,
      );
      expect(allAssets).to.eql([
        'ipfs:background/', // metadataURI
        bn(1), // equippableGroupId
        catalog.address, // catalogAddress,
        [],
        [],
      ]);
    });

    it('cannot compose equippables for soldier with not associated asset', async function () {
      const wrongResId = weaponAssetsEquip[1];
      await expect(
        view.composeEquippables(weaponEquip.address, weaponsIds[0], wrongResId),
      ).to.be.revertedWithCustomError(weaponEquip, 'RMRKTokenDoesNotHaveAsset');
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
      .to.emit(soldierEquip, 'ChildAssetEquipped')
      .withArgs(
        soldiersIds[0],
        soldierResId,
        partIdForWeapon,
        weaponsIds[0],
        weaponEquip.address,
        weaponAssetsEquip[0],
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
      .to.emit(soldierEquip, 'ChildAssetUnequipped')
      .withArgs(
        soldiersIds[0],
        soldierResId,
        partIdForWeapon,
        weaponsIds[0],
        weaponEquip.address,
        weaponAssetsEquip[0],
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

  async function mintWeaponToSoldier(
    soldierOwner: SignerWithAddress,
    soldierId: number,
    assetIndex: number,
  ): Promise<number> {
    // Mint another weapon to the soldier and accept it
    const newWeaponId = await nestMint(weapon, soldier.address, soldierId);
    await soldier.connect(soldierOwner).acceptChild(soldierId, 0, weapon.address, newWeaponId);

    // Add assets to weapon
    await weaponEquip.addAssetToToken(newWeaponId, weaponAssetsFull[assetIndex], 0);
    await weaponEquip.addAssetToToken(newWeaponId, weaponAssetsEquip[assetIndex], 0);
    await weaponEquip
      .connect(soldierOwner)
      .acceptAsset(newWeaponId, 0, weaponAssetsFull[assetIndex]);
    await weaponEquip
      .connect(soldierOwner)
      .acceptAsset(newWeaponId, 0, weaponAssetsEquip[assetIndex]);

    return newWeaponId;
  }
}

export default shouldBehaveLikeEquippableWithSlots;
