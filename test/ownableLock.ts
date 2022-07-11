import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { OwnableLockMock } from '../typechain';

describe('Nesting', async () => {
  let ownableLock: OwnableLockMock;

  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const OLOCK = await ethers.getContractFactory('OwnableLockMock');
    ownableLock = await OLOCK.deploy();
    await ownableLock.deployed();
  });

  describe('Init', async function () {
    it('Owner', async function () {
      expect(await ownableLock.owner()).to.equal(owner.address);
    });

    it('Lock getter', async function () {
      expect(await ownableLock.getLock()).to.equal(false);
      await ownableLock.connect(owner).setLock();
      expect(await ownableLock.getLock()).to.equal(true);
      // Test second call of setLock
      await ownableLock.connect(owner).setLock();
      expect(await ownableLock.getLock()).to.equal(true);
    });

    it('Reverts if setLock caller is not owner', async function () {
      await expect(ownableLock.connect(addrs[0]).setLock()).to.be.revertedWith(
        'Ownable: caller is not the owner',
      );
    });

    it('Modifier', async function () {
      expect(await ownableLock.testLock()).to.equal(true);
      await ownableLock.connect(owner).setLock();
      await expect(ownableLock.connect(owner).testLock()).to.be.revertedWithCustomError(
        ownableLock,
        'RMRKLocked',
      );
    });
  });
});
