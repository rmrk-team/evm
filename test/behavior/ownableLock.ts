import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';

async function shouldBehaveOwnableLock(ismock: boolean) {
  let ownableLock: Contract;

  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    ownableLock = this.token;
  });

  describe('Init', async function () {
    it('can get owner', async function () {
      expect(await ownableLock.owner()).to.equal(owner.address);
    });

    it('can get lock', async function () {
      expect(await ownableLock.getLock()).to.equal(false);
      await ownableLock.connect(owner).setLock();
      expect(await ownableLock.getLock()).to.equal(true);
      // Test second call of setLock
      await ownableLock.connect(owner).setLock();
      expect(await ownableLock.getLock()).to.equal(true);
    });

    it('reverts if setLock caller is not owner', async function () {
      await expect(ownableLock.connect(addrs[0]).setLock()).to.be.revertedWithCustomError(
        ownableLock,
        'RMRKNotOwner',
      );
    });

    if (ismock) {
      it('fail when locked', async function () {
        expect(await ownableLock.testLock()).to.equal(true);
        await ownableLock.connect(owner).setLock();
        await expect(ownableLock.connect(owner).testLock()).to.be.revertedWithCustomError(
          ownableLock,
          'RMRKLocked',
        );
      });
    }
  });
}

export default shouldBehaveOwnableLock;
