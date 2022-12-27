import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { RMRKBaseStorageImpl } from '../../typechain-types';
import shouldBehaveLikeBase from '../behavior/baseStorage';

async function baseFixture(): Promise<RMRKBaseStorageImpl> {
  const factory = await ethers.getContractFactory('RMRKBaseStorageImpl');
  const base = await factory.deploy('ipfs://baseMetadata', 'img/jpeg');
  await base.deployed();

  return base;
}

describe('BaseStorageImpl', async () => {
  shouldBehaveLikeBase('RMRKBaseStorageImpl', 'ipfs//:meta', 'misc');

  describe('Permissions', async () => {
    let base: RMRKBaseStorageImpl;
    let owner: SignerWithAddress;
    let contributor: SignerWithAddress;
    let other: SignerWithAddress;
    const fixedType = 2;
    const partId = 1;
    const partData = {
      itemType: fixedType,
      z: 0,
      equippable: [],
      metadataURI: 'ipfs://metadata',
    };

    beforeEach(async () => {
      [owner, contributor, other] = await ethers.getSigners();
      base = await loadFixture(baseFixture);
    });

    it('cannot do admin operations if not owner or contributor', async function () {
      await expect(
        base.connect(other).addPart({ partId: partId, part: partData }),
      ).to.be.revertedWithCustomError(base, 'RMRKNotOwnerOrContributor');

      await expect(
        base.connect(other).addPartList([{ partId: partId, part: partData }]),
      ).to.be.revertedWithCustomError(base, 'RMRKNotOwnerOrContributor');

      await expect(
        base.connect(other).addEquippableAddresses(partId, [other.address]),
      ).to.be.revertedWithCustomError(base, 'RMRKNotOwnerOrContributor');

      await expect(
        base.connect(other).setEquippableAddresses(partId, [other.address]),
      ).to.be.revertedWithCustomError(base, 'RMRKNotOwnerOrContributor');

      await expect(base.connect(other).setEquippableToAll(partId)).to.be.revertedWithCustomError(
        base,
        'RMRKNotOwnerOrContributor',
      );

      await expect(
        base.connect(other).resetEquippableAddresses(partId),
      ).to.be.revertedWithCustomError(base, 'RMRKNotOwnerOrContributor');
    });

    it('cannot add parts if locked', async function () {
      await base.setLock();
      await expect(
        base.connect(owner).addPart({ partId: partId, part: partData }),
      ).to.be.revertedWithCustomError(base, 'RMRKLocked');

      await expect(
        base.connect(owner).addPartList([{ partId: partId, part: partData }]),
      ).to.be.revertedWithCustomError(base, 'RMRKLocked');
    });

    it('can add part if owner', async function () {
      await base.connect(owner).addPart({ partId: partId, part: partData });
      expect(await base.getPart(partId)).to.eql([fixedType, 0, [], 'ipfs://metadata']);
    });

    it('can add part if contributor', async function () {
      await base.connect(owner).addContributor(contributor.address);
      await base.connect(contributor).addPart({ partId: partId, part: partData });
      expect(await base.getPart(partId)).to.eql([fixedType, 0, [], 'ipfs://metadata']);
    });
  });
});
