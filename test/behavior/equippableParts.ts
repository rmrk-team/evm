import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  partIdForHead1,
  partIdForBody1,
  partIdForHair1,
  partIdForMaskBase1,
  partIdForEars1,
  partIdForHorns1,
  partIdForMask,
  neons,
  masks,
  neonResIds,
  maskAssetsEquip,
  maskEquippableGroupId,
} from '../setup/equippableParts';
import { bn } from '../utils';

// The general idea is having these tokens: Neon and Mask
// Masks can be equipped into Neons.
// All use a single base.
// Neon will use an asset per token, which uses fixed parts to compose the body
// Mask will have 2 assets per weapon, one for full view, one for equipping. Both are composed using fixed parts
async function shouldBehaveLikeEquippableWithParts() {
  let baseContract: Contract;
  let neonEquipContract: Contract;
  let maskEquipContract: Contract;
  let maskContract: Contract;
  let viewContract: Contract;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;

    baseContract = this.base;
    neonEquipContract = this.neonEquip;
    maskEquipContract = this.maskEquip;
    maskContract = this.mask;
    viewContract = this.view;
  });

  describe('Equip', async function () {
    it('can equip weapon', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = maskAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await expect(
        neonEquipContract
          .connect(addrs[0])
          .equip([neons[0], childIndex, neonResIds[0], partIdForMask, weaponResId]),
      )
        .to.emit(neonEquipContract, 'ChildAssetEquipped')
        .withArgs(
          neons[0],
          neonResIds[0],
          partIdForMask,
          masks[0],
          maskEquipContract.address,
          weaponResId,
        );

      // All part slots are included on the response:
      const expectedSlots = [bn(partIdForMask)];
      const expectedEquips = [
        [bn(neonResIds[0]), bn(weaponResId), bn(masks[0]), maskEquipContract.address],
      ];
      expect(
        await viewContract.getEquipped(neonEquipContract.address, neons[0], neonResIds[0]),
      ).to.eql([expectedSlots, expectedEquips]);

      // Child is marked as equipped:
      expect(
        await neonEquipContract.isChildEquipped(neons[0], maskContract.address, masks[0]),
      ).to.eql(true);
    });

    it('cannot equip non existing child in slot', async function () {
      // Weapon is child on index 0
      const badChildIndex = 3;
      const weaponResId = maskAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await expect(
        neonEquipContract
          .connect(addrs[0])
          .equip([neons[0], badChildIndex, neonResIds[0], partIdForMask, weaponResId]),
      ).to.be.reverted; // Bad index
    });
  });

  describe('Compose', async function () {
    it('can compose all parts for neon', async function () {
      const childIndex = 0;
      const weaponResId = maskAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await neonEquipContract
        .connect(addrs[0])
        .equip([neons[0], childIndex, neonResIds[0], partIdForMask, weaponResId]);

      const expectedFixedParts = [
        [
          bn(partIdForHead1), // partId
          1, // z
          'ipfs://head1.png', // metadataURI
        ],
        [
          bn(partIdForBody1), // partId
          1, // z
          'ipfs://body1.png', // metadataURI
        ],
        [
          bn(partIdForHair1), // partId
          2, // z
          'ipfs://hair1.png', // metadataURI
        ],
      ];
      const expectedSlotParts = [
        [
          bn(partIdForMask), // partId
          bn(maskAssetsEquip[0]), // childAssetId
          2, // z
          maskEquipContract.address, // childAddress
          bn(masks[0]), // childTokenId
          'ipfs:weapon/equip/5', // childAssetMetadata
          '', // partMetadata
        ],
      ];
      const allAssets = await viewContract.composeEquippables(
        neonEquipContract.address,
        neons[0],
        neonResIds[0],
      );
      expect(allAssets).to.eql([
        'ipfs:neonRes/1', // metadataURI
        bn(0), // equippableGroupId
        baseContract.address, // baseAddress,
        expectedFixedParts,
        expectedSlotParts,
      ]);
    });

    it('can compose all parts for mask', async function () {
      const expectedFixedParts = [
        [
          bn(partIdForMaskBase1), // partId
          3, // z
          'ipfs://maskBase1.png', // metadataURI
        ],
        [
          bn(partIdForHorns1), // partId
          5, // z
          'ipfs://horn1.png', // metadataURI
        ],
        [
          bn(partIdForEars1), // partId
          4, // z
          'ipfs://ears1.png', // metadataURI
        ],
      ];
      const allAssets = await viewContract.composeEquippables(
        maskEquipContract.address,
        masks[0],
        maskAssetsEquip[0],
      );
      expect(allAssets).to.eql([
        `ipfs:weapon/equip/${maskAssetsEquip[0]}`, // metadataURI
        bn(maskEquippableGroupId), // equippableGroupId
        baseContract.address, // baseAddress
        expectedFixedParts,
        [],
      ]);
    });

    it('cannot compose equippables for neon with not associated asset', async function () {
      const wrongResId = maskAssetsEquip[1];
      await expect(
        viewContract.composeEquippables(maskEquipContract.address, masks[0], wrongResId),
      ).to.be.revertedWithCustomError(maskEquipContract, 'RMRKTokenDoesNotHaveAsset');
    });

    it('cannot compose equippables for mask for asset with no base', async function () {
      const noBaseAssetId = 99;
      await maskEquipContract.addAssetEntry(
        noBaseAssetId,
        0, // Not meant to equip
        ethers.constants.AddressZero, // Not meant to equip
        `ipfs:weapon/full/customAsset.png`,
        [],
      );
      await maskEquipContract.addAssetToToken(masks[0], noBaseAssetId, 0);
      await maskEquipContract.connect(addrs[0]).acceptAsset(masks[0], 0, noBaseAssetId);
      await expect(
        viewContract.composeEquippables(maskEquipContract.address, masks[0], noBaseAssetId),
      ).to.be.revertedWithCustomError(viewContract, 'RMRKNotComposableAsset');
    });
  });
}

export default shouldBehaveLikeEquippableWithParts;
