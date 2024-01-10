import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import {
  partIdForHead1,
  partIdForBody1,
  partIdForHair1,
  partIdForMaskCatalog1,
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
// All use a single catalog.
// Neon will use an asset per token, which uses fixed parts to compose the body
// Mask will have 2 assets per weapon, one for full view, one for equipping. Both are composed using fixed parts
async function shouldBehaveLikeEquippableWithParts() {
  let catalogContract: Contract;
  let neonContract: Contract;
  let maskContract: Contract;
  let viewContract: Contract;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;

    catalogContract = this.catalog;
    neonContract = this.neon;
    maskContract = this.mask;
    viewContract = this.view;
  });

  describe('Equip', async function () {
    it('can equip weapon', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = maskAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await expect(
        neonContract
          .connect(addrs[0])
          .equip([neons[0], childIndex, neonResIds[0], partIdForMask, weaponResId]),
      )
        .to.emit(neonContract, 'ChildAssetEquipped')
        .withArgs(
          neons[0],
          neonResIds[0],
          partIdForMask,
          masks[0],
          await maskContract.getAddress(),
          weaponResId,
        );

      // All part slots are included on the response:
      const expectedSlots = [bn(partIdForMask)];
      const expectedEquips = [
        [bn(neonResIds[0]), bn(weaponResId), bn(masks[0]), await maskContract.getAddress()],
      ];
      const expectedMetadata = ['ipfs:weapon/equip/5'];
      expect(
        await viewContract.getEquipped(await neonContract.getAddress(), neons[0], neonResIds[0]),
      ).to.eql([expectedSlots, expectedEquips, expectedMetadata]);

      // Child is marked as equipped:
      expect(
        await neonContract.isChildEquipped(neons[0], await maskContract.getAddress(), masks[0]),
      ).to.eql(true);
    });

    it('cannot equip non existing child in slot', async function () {
      // Weapon is child on index 0
      const badChildIndex = 3;
      const weaponResId = maskAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await expect(
        neonContract
          .connect(addrs[0])
          .equip([neons[0], badChildIndex, neonResIds[0], partIdForMask, weaponResId]),
      ).to.be.reverted; // Bad index
    });
  });

  describe('Compose', async function () {
    it('can compose all parts for neon', async function () {
      const childIndex = 0;
      const weaponResId = maskAssetsEquip[0]; // This asset is assigned to weapon first weapon
      await neonContract
        .connect(addrs[0])
        .equip([neons[0], childIndex, neonResIds[0], partIdForMask, weaponResId]);

      const expectedFixedParts = [
        [
          bn(partIdForHead1), // partId
          1n, // z
          'ipfs://head1.png', // metadataURI
        ],
        [
          bn(partIdForBody1), // partId
          1n, // z
          'ipfs://body1.png', // metadataURI
        ],
        [
          bn(partIdForHair1), // partId
          2n, // z
          'ipfs://hair1.png', // metadataURI
        ],
      ];
      const expectedSlotParts = [
        [
          bn(partIdForMask), // partId
          bn(maskAssetsEquip[0]), // childAssetId
          2n, // z
          await maskContract.getAddress(), // childAddress
          masks[0], // childTokenId
          'ipfs:weapon/equip/5', // childAssetMetadata
          '', // partMetadata
        ],
      ];
      const allAssets = await viewContract.composeEquippables(
        await neonContract.getAddress(),
        neons[0],
        neonResIds[0],
      );
      expect(allAssets).to.eql([
        'ipfs:neonRes/1', // metadataURI
        0n, // equippableGroupId
        await catalogContract.getAddress(), // catalogAddress,
        expectedFixedParts,
        expectedSlotParts,
      ]);
    });

    it('can compose all parts for mask', async function () {
      const expectedFixedParts = [
        [
          bn(partIdForMaskCatalog1), // partId
          3n, // z
          'ipfs://maskCatalog1.png', // metadataURI
        ],
        [
          bn(partIdForHorns1), // partId
          5n, // z
          'ipfs://horn1.png', // metadataURI
        ],
        [
          bn(partIdForEars1), // partId
          4n, // z
          'ipfs://ears1.png', // metadataURI
        ],
      ];
      const allAssets = await viewContract.composeEquippables(
        await maskContract.getAddress(),
        masks[0],
        maskAssetsEquip[0],
      );
      expect(allAssets).to.eql([
        `ipfs:weapon/equip/${maskAssetsEquip[0]}`, // metadataURI
        bn(maskEquippableGroupId), // equippableGroupId
        await catalogContract.getAddress(), // catalogAddress
        expectedFixedParts,
        [],
      ]);
    });

    it('cannot compose equippables for neon with not associated asset', async function () {
      const wrongResId = maskAssetsEquip[1];
      await expect(
        viewContract.composeEquippables(await maskContract.getAddress(), masks[0], wrongResId),
      ).to.be.revertedWithCustomError(maskContract, 'RMRKTokenDoesNotHaveAsset');
    });

    it('cannot compose equippables for mask for asset with no catalog', async function () {
      const noCatalogAssetId = 99;
      await maskContract.addEquippableAssetEntry(
        noCatalogAssetId,
        0, // Not meant to equip
        ethers.ZeroAddress, // Not meant to equip
        `ipfs:weapon/full/customAsset.png`,
        [],
      );
      await maskContract.addAssetToToken(masks[0], noCatalogAssetId, 0);
      await maskContract.connect(addrs[0]).acceptAsset(masks[0], 0, noCatalogAssetId);
      await expect(
        viewContract.composeEquippables(
          await maskContract.getAddress(),
          masks[0],
          noCatalogAssetId,
        ),
      ).to.be.revertedWithCustomError(viewContract, 'RMRKNotComposableAsset');
    });
  });
}

export default shouldBehaveLikeEquippableWithParts;
