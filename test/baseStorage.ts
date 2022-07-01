
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { RMRKBaseStorageMock } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('MultiResource', async () => {
  let testBase: RMRKBaseStorageMock;

  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const baseSymbol = 'BSE';
  const baseType = 'mixed';

  const srcDefault = 'src';
  const fallbackSrcDefault = 'fallback';

  // const noType = 0;
  const slotType = 1;
  const fixedType = 2;

  const sampleSlotPartData = {
    itemType: slotType,
    z: 0,
    equippable: [],
    src: srcDefault,
    fallbackSrc: fallbackSrcDefault,
  };

  beforeEach(async () => {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const Base = await ethers.getContractFactory('RMRKBaseStorageMock');
    testBase = await Base.deploy(baseSymbol, baseType);
    await testBase.deployed();
  });

  describe('Init Base Storage', async function () {
    it('has right symbol', async function () {
      expect(await testBase.symbol()).to.equal(baseSymbol);
    });

    it('has right type', async function () {
      expect(await testBase.type_()).to.equal(baseType);
    });
  });

  describe('add base entries', async function () {
    it('can add fixed part', async function () {
      const partId = 1;
      const partData = {
        itemType: fixedType,
        z: 0,
        equippable: [],
        src: srcDefault,
        fallbackSrc: fallbackSrcDefault,
      };

      await testBase.addPart({ partId: partId, part: partData });
      expect(await testBase.getPart(partId)).to.eql([2, 0, [], srcDefault, fallbackSrcDefault]);
    });

    it('can add slot part', async function () {
      const partId = 2;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      expect(await testBase.getPart(partId)).to.eql([1, 0, [], srcDefault, fallbackSrcDefault]);
    });

    it('can add parts list', async function () {
      const partId = 1;
      const partId2 = 2;
      const partData1 = {
        itemType: slotType,
        z: 0,
        equippable: [],
        src: 'src1',
        fallbackSrc: 'fallback1',
      };
      const partData2 = {
        itemType: fixedType,
        z: 1,
        equippable: [],
        src: 'src2',
        fallbackSrc: 'fallback2',
      };
      await testBase.addPartList([
        { partId: partId, part: partData1 },
        { partId: partId2, part: partData2 },
      ]);
      expect(await testBase.getParts([partId, partId2])).to.eql([
        [slotType, 0, [], 'src1', 'fallback1'],
        [fixedType, 1, [], 'src2', 'fallback2'],
      ]);
    });

    it('cannot add part with existing partId', async function () {
      const partId = 3;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      await expect(
        testBase.addPart({ partId: partId, part: sampleSlotPartData }),
      ).to.be.revertedWith('RMRKPartAlreadyExists()');
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
        src: srcDefault,
        fallbackSrc: fallbackSrcDefault,
      };
      await testBase.addPart({ partId: partId, part: partData });
      expect(await testBase.checkIsEquippable(partId, addrs[2].address)).to.eql(true);
    });

    it('is equippable if added afterward', async function () {
      const partId = 1;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      await testBase.addEquippableAddresses(partId, [addrs[1].address]);
      expect(await testBase.checkIsEquippable(partId, addrs[1].address)).to.eql(true);
    });

    it('is equippable if set afterward', async function () {
      const partId = 1;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      await testBase.setEquippableAddresses(partId, [addrs[1].address]);
      expect(await testBase.checkIsEquippable(partId, addrs[1].address)).to.eql(true);
    });

    it('is equippable if set to all', async function () {
      const partId = 1;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      await testBase.setEquippableToAll(partId);
      expect(await testBase.checkIsEquippableToAll(partId)).to.eql(true);
      expect(await testBase.checkIsEquippable(partId, addrs[1].address)).to.eql(true);
    });

    it('cannot add nor set equippable addresses for non existing part', async function () {
      const partId = 1;
      await testBase.addPart({ partId: partId, part: sampleSlotPartData });
      await expect(testBase.addEquippableAddresses(partId, [])).to.be.revertedWith(
        'RMRKZeroLengthIdsPassed()',
      );
      await expect(testBase.setEquippableAddresses(partId, [])).to.be.revertedWith(
        'RMRKZeroLengthIdsPassed()',
      );
    });

    it('cannot add nor set empty list of equippable addresses', async function () {
      const NonExistingPartId = 1;
      await expect(
        testBase.addEquippableAddresses(NonExistingPartId, [addrs[1].address]),
      ).to.be.revertedWith('RMRKPartDoesNotExist()');
      await expect(
        testBase.setEquippableAddresses(NonExistingPartId, [addrs[1].address]),
      ).to.be.revertedWith('RMRKPartDoesNotExist()');
      await expect(testBase.setEquippableToAll(NonExistingPartId)).to.be.revertedWith(
        'RMRKPartDoesNotExist()',
      );
    });

    it('cannot add nor set equippable addresses to non slot part', async function () {
      const fixedPartId = 1;
      const partData = {
        itemType: fixedType, // This is what we're testing
        z: 0,
        equippable: [],
        src: srcDefault,
        fallbackSrc: fallbackSrcDefault,
      };
      await testBase.addPart({ partId: fixedPartId, part: partData });
      await expect(
        testBase.addEquippableAddresses(fixedPartId, [addrs[1].address]),
      ).to.be.revertedWith('RMRKPartIsNotSlot()');
      await expect(
        testBase.setEquippableAddresses(fixedPartId, [addrs[1].address]),
      ).to.be.revertedWith('RMRKPartIsNotSlot()');
      await expect(testBase.setEquippableToAll(fixedPartId)).to.be.revertedWith(
        'RMRKPartIsNotSlot()',
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
});
