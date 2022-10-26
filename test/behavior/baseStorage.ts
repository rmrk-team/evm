import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

async function shouldBehaveLikeBase(contractName: string, metadataURI: string, type: string) {
  let testBase: Contract;

  let addrs: SignerWithAddress[];
  const metadataUriDefault = 'src';

  const noType = 0;
  const slotType = 1;
  const fixedType = 2;

  const sampleSlotPartData = {
    itemType: slotType,
    z: 0,
    equippable: [],
    metadataURI: metadataUriDefault,
  };

  beforeEach(async () => {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;

    const Base = await ethers.getContractFactory(contractName);
    testBase = await Base.deploy(metadataURI, type);
    await testBase.deployed();
  });

  describe('Init Base Storage', async function () {
    it('has right metadataURI', async function () {
      expect(await testBase.getMetadataURI()).to.equal(metadataURI);
    });

    it('has right type', async function () {
      expect(await testBase.getType()).to.equal(type);
    });

    it('supports interface', async function () {
      expect(await testBase.supportsInterface('0xd912401f')).to.equal(true);
    });

    it('does not support other interfaces', async function () {
      expect(await testBase.supportsInterface('0xffffffff')).to.equal(false);
    });
  });

  describe('add base entries', async function () {
    it('can add fixed part', async function () {
      const partId = 1;
      const partData = {
        itemType: fixedType,
        z: 0,
        equippable: [],
        metadataURI: metadataUriDefault,
      };

      await testBase.addPart({ partId: partId, part: partData });
      expect(await testBase.getPart(partId)).to.eql([2, 0, [], metadataUriDefault]);
    });

    it('can add slot part', async function () {
      const partId = 2;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      expect(await testBase.getPart(partId)).to.eql([1, 0, [], metadataUriDefault]);
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
      await testBase.addPartList([
        { partId: partId, part: partData1 },
        { partId: partId2, part: partData2 },
      ]);
      expect(await testBase.getParts([partId, partId2])).to.eql([
        [slotType, 0, [], 'src1'],
        [fixedType, 1, [], 'src2'],
      ]);
    });

    it('cannot add part with id 0', async function () {
      const partId = 0;
      await expect(
        testBase.addPart({ partId: partId, part: sampleSlotPartData }),
      ).to.be.revertedWithCustomError(testBase, 'RMRKIdZeroForbidden');
    });

    it('cannot add part with existing partId', async function () {
      const partId = 3;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      await expect(
        testBase.addPart({ partId: partId, part: sampleSlotPartData }),
      ).to.be.revertedWithCustomError(testBase, 'RMRKPartAlreadyExists');
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
        testBase.addPart({ partId: partId, part: badPartData }),
      ).to.be.revertedWithCustomError(testBase, 'RMRKBadConfig');
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
        testBase.addPart({ partId: partId, part: badPartData }),
      ).to.be.revertedWithCustomError(testBase, 'RMRKBadConfig');
    });

    it('is not equippable if address was not added', async function () {
      const partId = 4;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      expect(await testBase.checkIsEquippable(partId, addrs[1].address)).to.eql(false);
    });

    it('is equippable if added in the part definition', async function () {
      const partId = 1;
      const partData = {
        itemType: slotType,
        z: 0,
        equippable: [addrs[1].address, addrs[2].address],
        metadataURI: metadataUriDefault,
      };
      await testBase.addPart({ partId: partId, part: partData });
      expect(await testBase.checkIsEquippable(partId, addrs[2].address)).to.eql(true);
    });

    it('is equippable if added afterward', async function () {
      const partId = 1;
      await expect(testBase.addPart({ partId: partId, part: sampleSlotPartData }))
        .to.emit(testBase, 'AddedPart')
        .withArgs(
          partId,
          sampleSlotPartData.itemType,
          sampleSlotPartData.z,
          sampleSlotPartData.equippable,
          sampleSlotPartData.metadataURI,
        );
      await expect(testBase.addEquippableAddresses(partId, [addrs[1].address]))
        .to.emit(testBase, 'AddedEquippables')
        .withArgs(partId, [addrs[1].address]);
      expect(await testBase.checkIsEquippable(partId, addrs[1].address)).to.eql(true);
    });

    it('is equippable if set afterward', async function () {
      const partId = 1;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      await expect(testBase.setEquippableAddresses(partId, [addrs[1].address]))
        .to.emit(testBase, 'SetEquippables')
        .withArgs(partId, [addrs[1].address]);
      expect(await testBase.checkIsEquippable(partId, addrs[1].address)).to.eql(true);
    });

    it('is equippable if set to all', async function () {
      const partId = 1;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      await expect(testBase.setEquippableToAll(partId))
        .to.emit(testBase, 'SetEquippableToAll')
        .withArgs(partId);
      expect(await testBase.checkIsEquippableToAll(partId)).to.eql(true);
      expect(await testBase.checkIsEquippable(partId, addrs[1].address)).to.eql(true);
    });

    it('cannot add nor set equippable addresses for non existing part', async function () {
      const partId = 1;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      await expect(testBase.addEquippableAddresses(partId, [])).to.be.revertedWithCustomError(
        testBase,
        'RMRKZeroLengthIdsPassed',
      );
      await expect(testBase.setEquippableAddresses(partId, [])).to.be.revertedWithCustomError(
        testBase,
        'RMRKZeroLengthIdsPassed',
      );
    });

    it('cannot add nor set empty list of equippable addresses', async function () {
      const NonExistingPartId = 1;
      await expect(
        testBase.addEquippableAddresses(NonExistingPartId, [addrs[1].address]),
      ).to.be.revertedWithCustomError(testBase, 'RMRKPartDoesNotExist');
      await expect(
        testBase.setEquippableAddresses(NonExistingPartId, [addrs[1].address]),
      ).to.be.revertedWithCustomError(testBase, 'RMRKPartDoesNotExist');
      await expect(testBase.setEquippableToAll(NonExistingPartId)).to.be.revertedWithCustomError(
        testBase,
        'RMRKPartDoesNotExist',
      );
    });

    it('cannot add nor set equippable addresses to non slot part', async function () {
      const fixedPartId = 1;
      const partData = {
        itemType: fixedType, // This is what we're testing
        z: 0,
        equippable: [],
        metadataURI: metadataUriDefault,
      };
      await testBase.addPart({ partId: fixedPartId, part: partData });
      await expect(
        testBase.addEquippableAddresses(fixedPartId, [addrs[1].address]),
      ).to.be.revertedWithCustomError(testBase, 'RMRKPartIsNotSlot');
      await expect(
        testBase.setEquippableAddresses(fixedPartId, [addrs[1].address]),
      ).to.be.revertedWithCustomError(testBase, 'RMRKPartIsNotSlot');
      await expect(testBase.setEquippableToAll(fixedPartId)).to.be.revertedWithCustomError(
        testBase,
        'RMRKPartIsNotSlot',
      );
    });

    it('cannot set equippable to all on non existing part', async function () {
      const nonExistingPartId = 1;
      await expect(testBase.setEquippableToAll(nonExistingPartId)).to.be.revertedWithCustomError(
        testBase,
        'RMRKPartDoesNotExist',
      );
    });

    it('resets equippable to all if addresses are set', async function () {
      const partId = 1;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      await testBase.setEquippableToAll(partId);

      // This should reset it:
      testBase.setEquippableAddresses(partId, [addrs[1].address]);
      expect(await testBase.checkIsEquippableToAll(partId)).to.eql(false);
    });

    it('resets equippable to all if addresses are added', async function () {
      const partId = 1;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      await testBase.setEquippableToAll(partId);

      // This should reset it:
      testBase.addEquippableAddresses(partId, [addrs[1].address]);
      expect(await testBase.checkIsEquippableToAll(partId)).to.eql(false);
    });

    it('can reset equippable addresses', async function () {
      const partId = 1;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      testBase.addEquippableAddresses(partId, [addrs[1].address, addrs[2].address]);

      await testBase.resetEquippableAddresses(partId);
    });
  });
}

export default shouldBehaveLikeBase;
