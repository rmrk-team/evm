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

  describe('With added parts', async () => {
    const partList = [
      {
        partId: 1n,
        part: { itemType: fixedType, z: 0n, equippable: [], metadataURI: 'ipfs://metadata1' },
      },
      {
        partId: 2n,
        part: { itemType: fixedType, z: 0n, equippable: [], metadataURI: 'ipfs://metadata2' },
      },
      {
        partId: 3n,
        part: { itemType: fixedType, z: 0n, equippable: [], metadataURI: 'ipfs://metadata3' },
      },
      {
        partId: 4n,
        part: { itemType: fixedType, z: 0n, equippable: [], metadataURI: 'ipfs://metadata4' },
      },
      {
        partId: 5n,
        part: { itemType: fixedType, z: 0n, equippable: [], metadataURI: 'ipfs://metadata5' },
      },
    ];

    beforeEach(async () => {
      catalog = await loadFixture(catalogFixture);
      [owner, contributor, other] = await ethers.getSigners();
      await catalog.connect(owner).addPartList(partList);
    });

    it('can get total parts', async function () {
      expect(await catalog.getTotalParts()).to.eql(5n);
    });

    it('can get part by index', async function () {
      expect(await catalog.getPartByIndex(0)).to.eql([fixedType, 0n, [], 'ipfs://metadata1']);
      expect(await catalog.getPartByIndex(4)).to.eql([fixedType, 0n, [], 'ipfs://metadata5']);
    });

    it('can get all part ids', async function () {
      expect(await catalog.getAllPartIds()).to.eql([1n, 2n, 3n, 4n, 5n]);
    });

    it('can get paginated part ids', async function () {
      expect(await catalog.getPaginatedPartIds(0, 2)).to.eql([1n, 2n]);
      expect(await catalog.getPaginatedPartIds(2, 2)).to.eql([3n, 4n]);
      expect(await catalog.getPaginatedPartIds(4, 2)).to.eql([5n]);
    });

    it.skip('can get all part ids up to 10k, skipped so tests run faster', async function () {
      const partList = Array.from({ length: 10000 }, (_, i) => ({
        partId: BigInt(i + 6),
        part: {
          itemType: fixedType,
          z: 0n,
          equippable: [],
          metadataURI: `ipfs://metadata${i + 6}`,
        },
      }));
      const chunkSize = 20;
      for (let i = 0; i < partList.length; i += chunkSize) {
        await catalog.connect(owner).addPartList(partList.slice(i, i + chunkSize));
      }
      expect(await catalog.getAllPartIds()).to.eql(
        Array.from({ length: 10005 }, (_, i) => BigInt(i + 1)),
      );
    }).timeout(120000);
  });

  describe('Permissions', async () => {
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
        catalog.connect(other).addEquippableAddresses(partId, [other.address]),
      ).to.be.revertedWithCustomError(catalog, 'RMRKNotOwnerOrContributor');

      await expect(
        catalog.connect(other).setEquippableAddresses(partId, [other.address]),
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
      await catalog.connect(owner).manageContributor(contributor.address, true);
      await catalog.connect(contributor).addPart({ partId: partId, part: partData });
      expect(await catalog.getPart(partId)).to.eql([fixedType, 0n, [], 'ipfs://metadata']);
    });

    it('can set metadataURI or type if owner', async function () {
      await catalog.connect(owner).setMetadataURI('ipfs://new');
      await catalog.connect(owner).setType('img/png');
      expect(await catalog.getMetadataURI()).to.eql('ipfs://new');
      expect(await catalog.getType()).to.eql('img/png');
    });

    it('can set metadataURI or type if contributor', async function () {
      await catalog.connect(owner).manageContributor(contributor.address, true);
      await catalog.connect(contributor).setMetadataURI('ipfs://new');
      await catalog.connect(contributor).setType('img/png');
      expect(await catalog.getMetadataURI()).to.eql('ipfs://new');
      expect(await catalog.getType()).to.eql('img/png');
    });

    it('cannot set metadataURI nor type if not owner or contributor', async function () {
      await expect(
        catalog.connect(other).setMetadataURI('ipfs://new'),
      ).to.be.revertedWithCustomError(catalog, 'RMRKNotOwnerOrContributor');
      await expect(catalog.connect(other).setType('img/png')).to.be.revertedWithCustomError(
        catalog,
        'RMRKNotOwnerOrContributor',
      );
    });
  });
});
