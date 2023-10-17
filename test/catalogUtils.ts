import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ADDRESS_ZERO, bn } from './utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { RMRKCatalogUtils, RMRKCatalogImpl } from '../typechain-types';

const CATALOG_METADATA = 'ipfs://catalog-meta';
const CATALOG_TYPE = 'image/png';

async function catalogUtilsFixture() {
  const catalogFactory = await ethers.getContractFactory('RMRKCatalogImpl');
  const catalogUtilsFactory = await ethers.getContractFactory('RMRKCatalogUtils');

  const catalog = <RMRKCatalogImpl>await catalogFactory.deploy(CATALOG_METADATA, CATALOG_TYPE);
  await catalog.deployed();

  const catalogUtils = <RMRKCatalogUtils>await catalogUtilsFactory.deploy();

  return {
    catalog,
    catalogUtils,
  };
}

describe('Collection Utils', function () {
  let deployer: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let catalog: RMRKCatalogImpl;
  let catalogUtils: RMRKCatalogUtils;

  const partId = 1;
  const partId2 = 2;
  const partId3 = 3;
  const slotType = 1;
  const fixedType = 2;

  const partData1 = {
    itemType: slotType,
    z: 0,
    equippable: [],
    metadataURI: 'src1',
  };
  const partData2 = {
    itemType: slotType,
    z: 2,
    equippable: [],
    metadataURI: 'src2',
  };
  const partData3 = {
    itemType: fixedType,
    z: 1,
    equippable: [],
    metadataURI: 'src3',
  };

  beforeEach(async function () {
    ({ catalog, catalogUtils } = await loadFixture(catalogUtilsFixture));

    [deployer, ...addrs] = await ethers.getSigners();
    await catalog.addPartList([
      { partId: partId, part: partData1 },
      { partId: partId2, part: partData2 },
      { partId: partId3, part: partData3 },
    ]);
    await catalog.setEquippableToAll(partId);
    await catalog.addEquippableAddresses(partId2, [addrs[0].address, addrs[1].address]);
  });

  it('can get catalog data', async function () {
    expect(await catalogUtils.getCatalogData(catalog.address)).to.eql([
      deployer.address,
      CATALOG_TYPE,
      CATALOG_METADATA,
    ]);
  });

  it('can get catalog data if the catalog is not ownable', async function () {
    const catalogFactory = await ethers.getContractFactory('RMRKCatalog');
    const notOwnableCatalog = await catalogFactory.deploy(CATALOG_METADATA, CATALOG_TYPE);
    expect(await catalogUtils.getCatalogData(notOwnableCatalog.address)).to.eql([
      ADDRESS_ZERO,
      CATALOG_TYPE,
      CATALOG_METADATA,
    ]);
  });

  it('can parts data', async function () {
    expect(await catalogUtils.getExtendedParts(catalog.address, [partId, partId2, partId3])).to.eql(
      [
        [
          bn(partId), // partId
          partData1.itemType, // itemType
          partData1.z, // z
          partData1.equippable, // equippable
          true, // equippableToAll (set on beforeEach)
          partData1.metadataURI, // metadataURI
        ],
        [
          bn(partId2), // partId
          partData2.itemType, // itemType
          partData2.z, // z
          [addrs[0].address, addrs[1].address], // equippable (set on beforeEach)
          false, // equippableToAll
          partData2.metadataURI, // metadataURI
        ],
        [
          bn(partId3), // partId
          partData3.itemType, // itemType
          partData3.z, // z
          partData3.equippable, // equippable
          false, // equippableToAll (set on beforeEach)
          partData3.metadataURI, // metadataURI
        ],
      ],
    );
  });

  it('can get catalog and parts data', async function () {
    expect(await catalogUtils.getCatalogDataAndExtendedParts(catalog.address, [partId])).to.eql([
      deployer.address,
      CATALOG_TYPE,
      CATALOG_METADATA,
      [
        [
          bn(partId), // partId
          partData1.itemType, // itemType
          partData1.z, // z
          partData1.equippable, // equippable
          true, // equippableToAll (set on beforeEach)
          partData1.metadataURI, // metadataURI
        ],
      ],
    ]);
  });
});
