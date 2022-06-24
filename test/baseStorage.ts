import { ethers } from 'hardhat';
import { expect } from 'chai';
import { RMRKBaseStorageMock } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('MultiResource', async () => {
  let testBase: RMRKBaseStorageMock;

  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const baseName = 'RmrkBaseStorageTest';

  const srcDefault = 'src';
  const fallbackSrcDefault = 'fallback';

  const noType = 1;
  const slotType = 1;
  const fixedType = 2;

  const baseData = {
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
    testBase = await Base.deploy(baseName);
    await testBase.deployed();
  });

  describe('Init Base Storage', async function () {
    it('Name equality', async function () {
      expect(await testBase.name()).to.equal(baseName);
    });
  });

  describe('add base entries', async function () {
    it('can add fixed base entry', async function () {
      const id = 1;

      const baseData = {
        itemType: fixedType,
        z: 0,
        equippable: [],
        src: srcDefault,
        fallbackSrc: fallbackSrcDefault,
      };

      await testBase.connect(owner).addBaseEntry({ id: id, base: baseData });
      expect(await testBase.getBaseEntry(id)).to.eql([2, 0, [], srcDefault, fallbackSrcDefault]);
    });

    it('can add slot base entry', async function () {
      const id = 2;

      const baseData = {
        itemType: slotType,
        z: 0,
        equippable: [],
        src: srcDefault,
        fallbackSrc: fallbackSrcDefault,
      };

      await testBase.connect(owner).addBaseEntry({ id: id, base: baseData });
      expect(await testBase.getBaseEntry(id)).to.eql([1, 0, [], srcDefault, fallbackSrcDefault]);
    });

    it('can add base entry list', async function () {
      const id = 3;
      await testBase.connect(owner).addBaseEntryList([{ id: id, base: baseData }]);
      expect(await testBase.getBaseEntry(id)).to.eql([2, 0, [], srcDefault, fallbackSrcDefault]);
    });

    it('cannot add base entry with existing id', async function () {
      const id = 3;
      await testBase.connect(owner).addBaseEntry({ id: id, base: baseData });
      await expect(
        testBase.connect(owner).addBaseEntry({ id: id, base: baseData }),
      ).to.be.revertedWith('RMRKBaseAlreadyExists()');
    });

    it('check is equippable should return false', async function () {
      const id = 4;
      await testBase.connect(owner).addBaseEntry({ id: id, base: baseData });
      expect(await testBase.checkIsEquippable(id, addrs[1].address)).to.eql(false);
    });

    it('check is equippable should return true', async function () {
      const id = 5;
      await testBase.connect(owner).addBaseEntry({ id: id, base: baseData });
      await testBase.connect(owner).addEquippableAddresses(id, [addrs[1].address]);
      expect(await testBase.checkIsEquippable(id, addrs[1].address)).to.eql(true);
    });

    it('cannot multi check equippables with unequal input arrays', async function () {
      const id = 6;
      const id2 = 7;
      await expect(
        testBase.checkIsEquippableMulti([id, id2], [addrs[1].address]),
      ).to.be.revertedWith('RMRKMismatchedInputArrayLength()');
    });

    it('check is equippable multi should return true', async function () {
      const id = 6;
      const id2 = 7;

      await testBase.connect(owner).addBaseEntry({ id: id, base: baseData });
      await testBase.connect(owner).addBaseEntry({ id: id2, base: baseData });
      await testBase.connect(owner).addEquippableAddresses(id, [addrs[1].address]);
      await testBase.connect(owner).addEquippableAddresses(id2, [addrs[2].address]);

      expect(
        await testBase.checkIsEquippableMulti([id, id2], [addrs[1].address, addrs[2].address]),
      ).to.eql([true, true]);
    });
  });
});
