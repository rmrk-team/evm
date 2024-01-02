import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ADDRESS_ZERO, bn, mintFromMock, nestMintFromMock } from './utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  RMRKCatalogUtils,
  RMRKCatalogImpl,
  RMRKEquipRenderUtils,
  RMRKEquippableMock,
} from '../typechain-types';
import { setupContextForSlots } from './setup/equippableSlots';
import { BigNumber, Contract } from 'ethers';
import {
  backgroundAssetId,
  backgroundsIds,
  partIdForBackground,
  partIdForBody,
  partIdForWeapon,
  soldierResId,
  soldiersIds,
  weaponAssetsEquip,
  weaponsIds,
} from './setup/equippableSlots';

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

async function slotsFixture() {
  const catalogSymbol = 'SSB';
  const catalogType = 'mixed';

  const catalogFactory = await ethers.getContractFactory('RMRKCatalogImpl');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const viewFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  // View
  const view = <RMRKEquipRenderUtils>await viewFactory.deploy();
  await view.deployed();

  // catalog
  const catalog = <RMRKCatalogImpl>await catalogFactory.deploy(catalogSymbol, catalogType);
  await catalog.deployed();
  const catalogForWeapon = <RMRKCatalogImpl>await catalogFactory.deploy(catalogSymbol, catalogType);
  await catalogForWeapon.deployed();

  // Soldier token
  const soldier = <RMRKEquippableMock>await equipFactory.deploy();
  await soldier.deployed();

  // Weapon
  const weapon = <RMRKEquippableMock>await equipFactory.deploy();
  await weapon.deployed();

  // Weapon Gem
  const weaponGem = <RMRKEquippableMock>await equipFactory.deploy();
  await weaponGem.deployed();

  // Background
  const background = <RMRKEquippableMock>await equipFactory.deploy();
  await background.deployed();

  await setupContextForSlots(
    catalog,
    catalogForWeapon,
    soldier,
    weapon,
    weaponGem,
    background,
    mintFromMock,
    nestMintFromMock,
  );

  return { catalog, soldier, weapon, weaponGem, background, view };
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

describe('Collection Utils For Orphans', function () {
  let catalog: Contract;
  let soldier: Contract;
  let weapon: Contract;
  let background: Contract;
  let catalogUtils: RMRKCatalogUtils;

  let addrs: SignerWithAddress[];

  let soldierID: BigNumber;
  let soldierOwner: SignerWithAddress;
  let weaponChildIndex = 0;
  let backgroundChildIndex = 1;
  let weaponResId = weaponAssetsEquip[0]; // This asset is assigned to weapon first weapon

  beforeEach(async function () {
    [, ...addrs] = await ethers.getSigners();

    ({ catalogUtils } = await loadFixture(catalogUtilsFixture));
    ({ catalog, soldier, weapon, background } = await loadFixture(slotsFixture));

    soldierID = soldiersIds[0];
    soldierOwner = addrs[0];

    await soldier.connect(soldierOwner).equip({
      tokenId: soldierID,
      childIndex: weaponChildIndex,
      assetId: soldierResId,
      slotPartId: partIdForWeapon,
      childAssetId: weaponResId,
    });
    await soldier.connect(soldierOwner).equip({
      tokenId: soldierID,
      childIndex: backgroundChildIndex,
      assetId: soldierResId,
      slotPartId: partIdForBackground,
      childAssetId: backgroundAssetId,
    });
  });

  it('can replace parent equipped asset and detect it as orphan', async function () {
    // Weapon is child on index 0, background on index 1
    const newSoldierResId = soldierResId + 1;
    await soldier.addEquippableAssetEntry(newSoldierResId, 0, catalog.address, 'ipfs:soldier/', [
      partIdForBody,
      partIdForWeapon,
      partIdForBackground,
    ]);
    await soldier.addAssetToToken(soldierID, newSoldierResId, soldierResId);
    await soldier.connect(soldierOwner).acceptAsset(soldierID, 0, newSoldierResId);

    // Children still marked as equipped, so the cannot be transferred
    expect(await soldier.isChildEquipped(soldierID, weapon.address, weaponsIds[0])).to.eql(true);
    expect(await soldier.isChildEquipped(soldierID, background.address, backgroundsIds[0])).to.eql(
      true,
    );

    const equipments = await catalogUtils.getOrphanedEquipmentsFromParentAsset(
      soldier.address,
      soldierID,
      catalog.address,
      [partIdForBody, partIdForWeapon, partIdForBackground],
    );

    expect(equipments).to.eql([
      [
        bn(soldierResId),
        bn(partIdForWeapon),
        weapon.address,
        weaponsIds[0],
        bn(weaponAssetsEquip[0]),
      ],
      [
        bn(soldierResId),
        bn(partIdForBackground),
        background.address,
        backgroundsIds[0],
        bn(backgroundAssetId),
      ],
    ]);
  });

  it('can replace child equipped asset and still unequip it', async function () {
    // Weapon is child on index 0, background on index 1
    const newWeaponAssetId = weaponAssetsEquip[0] + 10;
    const weaponId = weaponsIds[0];
    await weapon.addEquippableAssetEntry(
      newWeaponAssetId,
      1, // equippableGroupId
      catalog.address,
      'ipfs:weapon/new',
      [],
    );
    await weapon.addAssetToToken(weaponId, newWeaponAssetId, weaponAssetsEquip[0]);
    await weapon.connect(soldierOwner).acceptAsset(weaponId, 0, newWeaponAssetId);

    // Children still marked as equipped, so it cannot be transferred or equip something else into the slot
    expect(await soldier.isChildEquipped(soldierID, weapon.address, weaponsIds[0])).to.eql(true);

    expect(
      await catalogUtils.getOrphanedEquipmentFromChildAsset(soldier.address, soldierID),
    ).to.eql([
      [
        bn(soldierResId),
        bn(partIdForWeapon),
        weapon.address,
        weaponsIds[0],
        bn(weaponAssetsEquip[0]),
      ],
    ]);
  });
});
