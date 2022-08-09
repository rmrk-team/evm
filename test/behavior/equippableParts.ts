import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
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
  maskResourcesEquip,
  maskEquippableRefId,
} from '../fixtures/equippablePartsFixture'

// The general idea is having these tokens: Neon and Mask
// Masks can be equipped into Neons.
// All use a single base.
// Neon will use a resource per token, which uses fixed parts to compose the body
// Mask will have 2 resources per weapon, one for full view, one for equipping. Both are composed using fixed parts
async function shouldBehaveLikeEquippableWithParts() {
  let baseContract: Contract;
  let neonEquipContract: Contract;
  let maskEquipContract: Contract;

  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;

    baseContract = this.base;
    neonEquipContract = this.neonEquip;
    maskEquipContract = this.maskEquip;
  });

  describe('Equip', async function () {
    it('can equip weapon', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = maskResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await neonEquipContract
        .connect(addrs[0])
        .equip(neons[0], neonResIds[0], partIdForMask, childIndex, weaponResId);
      // All part slots are included on the response:
      const expectedSlots = [bn(partIdForMask)];
      const expectedEquips = [
        [bn(neonResIds[0]), bn(weaponResId), bn(masks[0]), maskEquipContract.address],
      ];
      expect(await neonEquipContract.getEquipped(neons[0], neonResIds[0])).to.eql([
        expectedSlots,
        expectedEquips,
      ]);

      // Child is marked as equipped:
      expect(await maskEquipContract.isEquipped(masks[0])).to.eql(true);
    });

    it('cannot equip non existing child in slot', async function () {
      // Weapon is child on index 0
      const badChildIndex = 3;
      const weaponResId = maskResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await expect(
        neonEquipContract
          .connect(addrs[0])
          .equip(neons[0], neonResIds[0], partIdForMask, badChildIndex, weaponResId),
      ).to.be.reverted; // Bad index
    });
  });

  describe('Compose', async function () {
    it('can compose all parts for neon', async function () {
      const childIndex = 0;
      const weaponResId = maskResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await neonEquipContract
        .connect(addrs[0])
        .equip(neons[0], neonResIds[0], partIdForMask, childIndex, weaponResId);

      const expectedResource = [
        bn(neonResIds[0]), // id
        bn(0), // equippableRefId
        baseContract.address, // baseAddress
        'ipfs:neonRes/1', // metadataURI
      ];
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
          bn(maskResourcesEquip[0]), // childResourceId
          2, // z
          bn(masks[0]), // childTokenId
          maskEquipContract.address, // childAddress
          '', // metadataURI
        ],
      ];
      const allResources = await neonEquipContract.composeEquippables(neons[0], neonResIds[0]);
      expect(allResources).to.eql([expectedResource, expectedFixedParts, expectedSlotParts]);
    });

    it('can compose all parts for mask', async function () {
      const expectedResource = [
        bn(maskResourcesEquip[0]), // id
        bn(maskEquippableRefId), // equippableRefId
        baseContract.address, // baseAddress
        `ipfs:weapon/equip/${maskResourcesEquip[0]}`, // metadataURI
      ];
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
      const allResources = await maskEquipContract.composeEquippables(
        masks[0],
        maskResourcesEquip[0],
      );
      expect(allResources).to.eql([expectedResource, expectedFixedParts, []]);
    });

    it('cannot get composables for neon with not associated resource', async function () {
      const wrongResId = maskResourcesEquip[1];
      await expect(
        maskEquipContract.composeEquippables(masks[0], wrongResId),
      ).to.be.revertedWithCustomError(maskEquipContract, 'RMRKTokenDoesNotHaveActiveResource');
    });

    it('cannot get composables for mask for resource with no base', async function () {
      const noBaseResourceId = 99;
      await maskEquipContract.addResourceEntry(
        {
          id: noBaseResourceId,
          equippableRefId: 0, // Not meant to equip
          metadataURI: `ipfs:weapon/full/customResource.png`,
          baseAddress: ethers.constants.AddressZero, // Not meant to equip
        },
        [],
        [],
      );
      await maskEquipContract.addResourceToToken(masks[0], noBaseResourceId, 0);
      await maskEquipContract.connect(addrs[0]).acceptResource(masks[0], 0);
      await expect(
        maskEquipContract.composeEquippables(masks[0], noBaseResourceId),
      ).to.be.revertedWithCustomError(maskEquipContract, 'RMRKNotComposableResource');
    });
  });

  function bn(x: number): BigNumber {
    return BigNumber.from(x);
  }
}

export default shouldBehaveLikeEquippableWithParts;
