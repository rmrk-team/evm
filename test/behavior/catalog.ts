import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { IOtherInterface, IERC165, IRMRKCatalog } from '../interfaces';
import { RMRKCatalogImpl } from '../../typechain-types';

async function shouldBehaveLikeCatalog(contractName: string, metadataURI: string, type: string) {
  let testCatalog: RMRKCatalogImpl;

  let addrs: SignerWithAddress[];
  const metadataUriDefault = 'src';

  const noType = 0n;
  const slotType = 1n;
  const fixedType = 2n;

  const sampleSlotPartData = {
    itemType: slotType,
    z: 0,
    equippable: [],
    metadataURI: metadataUriDefault,
  };

  const sampleFixedPartData = {
    itemType: fixedType,
    z: 0,
    equippable: [],
    metadataURI: metadataUriDefault,
  };

  beforeEach(async () => {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;

    const Catalog = await ethers.getContractFactory(contractName);
    testCatalog = <RMRKCatalogImpl>await Catalog.deploy(metadataURI, type);
    await testCatalog.waitForDeployment();
  });

  describe('Init Catalog', async function () {
    it('has right metadataURI', async function () {
      expect(await testCatalog.getMetadataURI()).to.equal(metadataURI);
    });

    it('has right type', async function () {
      expect(await testCatalog.getType()).to.equal(type);
    });

    it('supports catalog interface', async function () {
      expect(await testCatalog.supportsInterface(IRMRKCatalog)).to.equal(true);
    });

    it('supports IERC165 interface', async function () {
      expect(await testCatalog.supportsInterface(IERC165)).to.equal(true);
    });

    it('does not support other interfaces', async function () {
      expect(await testCatalog.supportsInterface(IOtherInterface)).to.equal(false);
    });
  });

  describe('add catalog entries', async function () {
    it('can add fixed part', async function () {
      const partId = 1;

      await testCatalog.addPart({ partId: partId, part: sampleFixedPartData });
      expect(await testCatalog.getPart(partId)).to.eql([2n, 0n, [], metadataUriDefault]);
    });

    it('can add slot part', async function () {
      const partId = 2;
      await testCatalog.addPart({ partId: partId, part: sampleSlotPartData });
      expect(await testCatalog.getPart(partId)).to.eql([1n, 0n, [], metadataUriDefault]);
    });

    it('can add parts list', async function () {
      const partId = 1;
      const partId2 = 2;
      const partData1 = {
        itemType: slotType,
        z: 0,
        equippable: [],
        metadataURI: 'src1',
      };
      const partData2 = {
        itemType: fixedType,
        z: 1,
        equippable: [],
        metadataURI: 'src2',
      };
      await testCatalog.addPartList([
        { partId: partId, part: partData1 },
        { partId: partId2, part: partData2 },
      ]);
      expect(await testCatalog.getParts([partId, partId2])).to.eql([
        [slotType, 0n, [], 'src1'],
        [fixedType, 1n, [], 'src2'],
      ]);
    });

    it('cannot add part with id 0', async function () {
      const partId = 0;
      await expect(
        testCatalog.addPart({ partId: partId, part: sampleSlotPartData }),
      ).to.be.revertedWithCustomError(testCatalog, 'RMRKIdZeroForbidden');
    });

    it('cannot add part with existing partId', async function () {
      const partId = 3;
      await testCatalog.addPart({ partId: partId, part: sampleSlotPartData });
      await expect(
        testCatalog.addPart({ partId: partId, part: sampleSlotPartData }),
      ).to.be.revertedWithCustomError(testCatalog, 'RMRKPartAlreadyExists');
    });

    it('cannot add part with item type None', async function () {
      const partId = 1;
      const badPartData = {
        itemType: noType,
        z: 0,
        equippable: [],
        metadataURI: metadataUriDefault,
      };
      await expect(
        testCatalog.addPart({ partId: partId, part: badPartData }),
      ).to.be.revertedWithCustomError(testCatalog, 'RMRKBadConfig');
    });

    it('cannot add fixed part with equippable addresses', async function () {
      const partId = 1;
      const badPartData = {
        itemType: fixedType,
        z: 0,
        equippable: [addrs[3].address],
        metadataURI: metadataUriDefault,
      };
      await expect(
        testCatalog.addPart({ partId: partId, part: badPartData }),
      ).to.be.revertedWithCustomError(testCatalog, 'RMRKBadConfig');
    });

    it('is not equippable if address was not added', async function () {
      const partId = 4;
      await testCatalog.addPart({ partId: partId, part: sampleSlotPartData });
      expect(await testCatalog.checkIsEquippable(partId, addrs[1].address)).to.eql(false);
    });

    it('is equippable if added in the part definition', async function () {
      const partId = 1;
      const partData = {
        itemType: slotType,
        z: 0,
        equippable: [addrs[1].address, addrs[2].address],
        metadataURI: metadataUriDefault,
      };
      await testCatalog.addPart({ partId: partId, part: partData });
      expect(await testCatalog.checkIsEquippable(partId, addrs[2].address)).to.eql(true);
    });

    it('is equippable if added afterward', async function () {
      const partId = 1;
      await expect(testCatalog.addPart({ partId: partId, part: sampleSlotPartData }))
        .to.emit(testCatalog, 'AddedPart')
        .withArgs(
          partId,
          sampleSlotPartData.itemType,
          sampleSlotPartData.z,
          sampleSlotPartData.equippable,
          sampleSlotPartData.metadataURI,
        );
      await expect(testCatalog.addEquippableAddresses(partId, [addrs[1].address]))
        .to.emit(testCatalog, 'AddedEquippables')
        .withArgs(partId, [addrs[1].address]);
      expect(await testCatalog.checkIsEquippable(partId, addrs[1].address)).to.eql(true);
    });

    it('is equippable if set afterward', async function () {
      const partId = 1;
      await testCatalog.addPart({ partId: partId, part: sampleSlotPartData });
      await expect(testCatalog.setEquippableAddresses(partId, [addrs[1].address]))
        .to.emit(testCatalog, 'SetEquippables')
        .withArgs(partId, [addrs[1].address]);
      expect(await testCatalog.checkIsEquippable(partId, addrs[1].address)).to.eql(true);
    });

    it('is equippable if set to all', async function () {
      const partId = 1;
      await testCatalog.addPart({ partId: partId, part: sampleSlotPartData });
      await expect(testCatalog.setEquippableToAll(partId))
        .to.emit(testCatalog, 'SetEquippableToAll')
        .withArgs(partId);
      expect(await testCatalog.checkIsEquippableToAll(partId)).to.eql(true);
      expect(await testCatalog.checkIsEquippable(partId, addrs[1].address)).to.eql(true);
    });

    it('cannot add nor set equippable addresses for non existing part', async function () {
      const partId = 1;
      await testCatalog.addPart({ partId: partId, part: sampleSlotPartData });
      await expect(testCatalog.addEquippableAddresses(partId, [])).to.be.revertedWithCustomError(
        testCatalog,
        'RMRKZeroLengthIdsPassed',
      );
      await expect(testCatalog.setEquippableAddresses(partId, [])).to.be.revertedWithCustomError(
        testCatalog,
        'RMRKZeroLengthIdsPassed',
      );
    });

    it('cannot add nor set empty list of equippable addresses', async function () {
      const NonExistingPartId = 1;
      await expect(
        testCatalog.addEquippableAddresses(NonExistingPartId, [addrs[1].address]),
      ).to.be.revertedWithCustomError(testCatalog, 'RMRKPartDoesNotExist');
      await expect(
        testCatalog.setEquippableAddresses(NonExistingPartId, [addrs[1].address]),
      ).to.be.revertedWithCustomError(testCatalog, 'RMRKPartDoesNotExist');
      await expect(testCatalog.setEquippableToAll(NonExistingPartId)).to.be.revertedWithCustomError(
        testCatalog,
        'RMRKPartDoesNotExist',
      );
    });

    it('cannot add nor set equippable addresses to non slot part', async function () {
      const fixedPartId = 1;
      await testCatalog.addPart({ partId: fixedPartId, part: sampleFixedPartData });
      await expect(
        testCatalog.addEquippableAddresses(fixedPartId, [addrs[1].address]),
      ).to.be.revertedWithCustomError(testCatalog, 'RMRKPartIsNotSlot');
      await expect(
        testCatalog.setEquippableAddresses(fixedPartId, [addrs[1].address]),
      ).to.be.revertedWithCustomError(testCatalog, 'RMRKPartIsNotSlot');
      await expect(testCatalog.setEquippableToAll(fixedPartId)).to.be.revertedWithCustomError(
        testCatalog,
        'RMRKPartIsNotSlot',
      );
    });

    it('cannot set equippable to all on non existing part', async function () {
      const nonExistingPartId = 1;
      await expect(testCatalog.setEquippableToAll(nonExistingPartId)).to.be.revertedWithCustomError(
        testCatalog,
        'RMRKPartDoesNotExist',
      );
    });

    it('resets equippable to all if addresses are set', async function () {
      const partId = 1;
      await testCatalog.addPart({ partId: partId, part: sampleSlotPartData });
      await testCatalog.setEquippableToAll(partId);

      // This should reset it:
      await testCatalog.setEquippableAddresses(partId, [addrs[1].address]);
      expect(await testCatalog.checkIsEquippableToAll(partId)).to.eql(false);
    });

    it('resets equippable to all if addresses are added', async function () {
      const partId = 1;
      await testCatalog.addPart({ partId: partId, part: sampleSlotPartData });
      await testCatalog.setEquippableToAll(partId);

      // This should reset it:
      await testCatalog.addEquippableAddresses(partId, [addrs[1].address]);
      expect(await testCatalog.checkIsEquippableToAll(partId)).to.eql(false);
    });

    it('can reset equippable addresses', async function () {
      const partId = 1;
      await testCatalog.addPart({ partId: partId, part: sampleSlotPartData });
      await testCatalog.addEquippableAddresses(partId, [addrs[1].address, addrs[2].address]);

      await testCatalog.resetEquippableAddresses(partId);
      expect(await testCatalog.checkIsEquippable(partId, addrs[1].address)).to.eql(false);
    });

    it('cannot reset equippable for fixed part', async function () {
      const partId = 1;
      await testCatalog.addPart({ partId: partId, part: sampleFixedPartData });
      await expect(testCatalog.resetEquippableAddresses(partId)).to.be.revertedWithCustomError(
        testCatalog,
        'RMRKPartIsNotSlot',
      );
    });
  });
}

export default shouldBehaveLikeCatalog;
