import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { RMRKCatalogImpl } from '../../typechain-types';
import shouldBehaveLikeCatalog from '../behavior/catalog';

async function catalogFixture(): Promise<RMRKCatalogImpl> {
  const factory = await ethers.getContractFactory('RMRKCatalogImpl');
  const catalog = await factory.deploy('ipfs://catalogMetadata', 'img/jpeg');
  await catalog.waitForDeployment();

  return catalog;
}

describe('CatalogImpl', async () => {
  shouldBehaveLikeCatalog('RMRKCatalogImpl', 'ipfs//:meta', 'misc');

  describe('Permissions', async () => {
    let catalog: RMRKCatalogImpl;
    let owner: SignerWithAddress;
    let contributor: SignerWithAddress;
    let other: SignerWithAddress;
    const fixedType = 2n;
    const partId = 1n;
    const partData = {
      itemType: fixedType,
      z: 0n,
      equippable: [],
      metadataURI: 'ipfs://metadata',
    };

    beforeEach(async () => {
      [owner, contributor, other] = await ethers.getSigners();
      catalog = await loadFixture(catalogFixture);
    });

    it('cannot do admin operations if not owner or contributor', async function () {
      await expect(
        catalog.connect(other).addPart({ partId: partId, part: partData }),
      ).to.be.revertedWithCustomError(catalog, 'RMRKNotOwnerOrContributor');

      await expect(
        catalog.connect(other).addPartList([{ partId: partId, part: partData }]),
      ).to.be.revertedWithCustomError(catalog, 'RMRKNotOwnerOrContributor');

      await expect(
        catalog.connect(other).addEquippableAddresses(partId, [await other.getAddress()]),
      ).to.be.revertedWithCustomError(catalog, 'RMRKNotOwnerOrContributor');

      await expect(
        catalog.connect(other).setEquippableAddresses(partId, [await other.getAddress()]),
      ).to.be.revertedWithCustomError(catalog, 'RMRKNotOwnerOrContributor');

      await expect(catalog.connect(other).setEquippableToAll(partId)).to.be.revertedWithCustomError(
        catalog,
        'RMRKNotOwnerOrContributor',
      );

      await expect(
        catalog.connect(other).resetEquippableAddresses(partId),
      ).to.be.revertedWithCustomError(catalog, 'RMRKNotOwnerOrContributor');
    });

    it('cannot add parts if locked', async function () {
      await catalog.setLock();
      await expect(
        catalog.connect(owner).addPart({ partId: partId, part: partData }),
      ).to.be.revertedWithCustomError(catalog, 'RMRKLocked');

      await expect(
        catalog.connect(owner).addPartList([{ partId: partId, part: partData }]),
      ).to.be.revertedWithCustomError(catalog, 'RMRKLocked');
    });

    it('can add part if owner', async function () {
      await catalog.connect(owner).addPart({ partId: partId, part: partData });
      expect(await catalog.getPart(partId)).to.eql([fixedType, 0n, [], 'ipfs://metadata']);
    });

    it('can add part if contributor', async function () {
      await catalog.connect(owner).manageContributor(await contributor.getAddress(), true);
      await catalog.connect(contributor).addPart({ partId: partId, part: partData });
      expect(await catalog.getPart(partId)).to.eql([fixedType, 0n, [], 'ipfs://metadata']);
    });
  });
});
