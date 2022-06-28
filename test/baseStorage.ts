import { ethers } from 'hardhat';
import { expect } from 'chai';
import { RMRKBaseStorageMock } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { test } from 'mocha';

describe('MultiResource', async () => {
  let testBase: RMRKBaseStorageMock;

  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const baseSymbol = 'BSE';
  const baseType = 'mixed';

  const srcDefault = 'src';
  const fallbackSrcDefault = 'fallback';

  const noType = 1;
  const slotType = 1;
  const fixedType = 2;

  const partData = {
    itemType: 2,
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

      const partData = {
        itemType: slotType,
        z: 0,
        equippable: [],
        src: srcDefault,
        fallbackSrc: fallbackSrcDefault,
      };

      await testBase.addPart({ partId: partId, part: partData });
      expect(await testBase.getPart(partId)).to.eql([1, 0, [], srcDefault, fallbackSrcDefault]);
    });

    it('can add parts list', async function () {
      const partId = 3;
      await testBase.addPartList([{ partId: partId, part: partData }]);
      expect(await testBase.getPart(partId)).to.eql([2, 0, [], srcDefault, fallbackSrcDefault]);
    });

    it('cannot add part with existing partId', async function () {
      const partId = 3;
      await testBase.addPart({ partId: partId, part: partData });
      await expect(testBase.addPart({ partId: partId, part: partData })).to.be.revertedWith(
        'RMRKPartAlreadyExists()',
      );
    });

    it('is not equippable if address was not added', async function () {
      const partId = 4;
      await testBase.addPart({ partId: partId, part: partData });
      expect(await testBase.checkIsEquippable(partId, addrs[1].address)).to.eql(false);
    });

    it('is equippable if added in the part definition', async function () {
      const partId = 1;
      const partData = {
        itemType: slotType,
        z: 0,
        equippable: [addrs[1].address],
        src: srcDefault,
        fallbackSrc: fallbackSrcDefault,
      };
      await testBase.addPart({ partId: partId, part: partData });
      expect(await testBase.checkIsEquippable(partId, addrs[1].address)).to.eql(true);
    });

    it('is equippable if added afterward', async function () {
      const partId = 1;
      const partData = {
        itemType: slotType,
        z: 0,
        equippable: [],
        src: srcDefault,
        fallbackSrc: fallbackSrcDefault,
      };
      await testBase.addPart({ partId: partId, part: partData });
      await testBase.addEquippableAddresses(partId, [addrs[1].address]);
      expect(await testBase.checkIsEquippable(partId, addrs[1].address)).to.eql(true);
    });

    it('is equippable if set afterward', async function () {
      const partId = 1;
      const partData = {
        itemType: slotType,
        z: 0,
        equippable: [],
        src: srcDefault,
        fallbackSrc: fallbackSrcDefault,
      };
      await testBase.addPart({ partId: partId, part: partData });
      await testBase.setEquippableAddresses(partId, [addrs[1].address]);
      expect(await testBase.checkIsEquippable(partId, addrs[1].address)).to.eql(true);
    });

    it('is equippable if set to all', async function () {
      const partId = 1;
      const partData = {
        itemType: slotType,
        z: 0,
        equippable: [],
        src: srcDefault,
        fallbackSrc: fallbackSrcDefault,
      };
      await testBase.addPart({ partId: partId, part: partData });
      await testBase.setEquippableToAll(partId);
      expect(await testBase.checkIsEquippable(partId, addrs[1].address)).to.eql(true);
    });

    it.skip('cannot add equippable addresses for non existing part', async function () {
      //
    });

    it.skip('cannot set equippable addresses for non existing part', async function () {
      //
    });

    it.skip('cannot set equippable to all for non existing part', async function () {
      //
    });

    it.skip('cannot add equippable addresses to non slot part', async function () {
      //
    });

    it.skip('cannot set equippable addresses to non slot part', async function () {
      //
    });

    it.skip('cannot set to all addresses to non slot part', async function () {
      //
    });

    it.skip('resets equippable to all if addresses are set', async function () {
      //
    });

    it.skip('resets equippable to all if addresses are added', async function () {
      //
    });
  });
});
