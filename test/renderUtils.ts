import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  ADDRESS_ZERO,
  bn,
  mintFromMock,
  mintFromMockPremint,
  nestMintFromMock,
  nestMintFromMockPreMint,
} from './utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  RMRKCatalogImpl,
  RMRKEquippablePreMint,
  RMRKEquipRenderUtils,
  RMRKMultiAssetPreMint,
  RMRKMultiAssetRenderUtils,
  RMRKNestableMultiAssetPreMint,
  RMRKNestableMultiAssetPreMintSoulbound,
  RMRKRenderUtils,
  RMRKEquippableMock,
  RMRKNestableRenderUtils,
} from '../typechain-types';
import {
  assetForGemALeft,
  assetForGemAMid,
  assetForGemARight,
  assetForGemBLeft,
  assetForGemBMid,
  assetForGemBRight,
  assetForKanariaFull,
  slotIdGemLeft,
  slotIdGemMid,
  slotIdGemRight,
  setUpCatalog,
  setUpKanariaAsset,
  setUpGemAssets,
} from './kanariaUtils';
import { BigNumber } from 'ethers';

// --------------- FIXTURES -----------------------

async function multiAsetNestableAndEquipRenderUtilsFixture() {
  const catalogFactory = await ethers.getContractFactory('RMRKCatalogImpl');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');
  const renderUtilsNestableFactory = await ethers.getContractFactory('RMRKNestableRenderUtils');
  const renderUtilsEquipFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  const catalog = <RMRKCatalogImpl>await catalogFactory.deploy('ipfs://catalog.json', 'misc');
  await catalog.deployed();

  const equip = <RMRKEquippableMock>await equipFactory.deploy();
  await equip.deployed();

  const renderUtils = <RMRKMultiAssetRenderUtils>await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  const renderUtilsNestable = <RMRKNestableRenderUtils>await renderUtilsNestableFactory.deploy();
  await renderUtilsNestable.deployed();

  const renderUtilsEquip = <RMRKEquipRenderUtils>await renderUtilsEquipFactory.deploy();
  await renderUtilsEquip.deployed();

  return { catalog, equip, renderUtils, renderUtilsNestable, renderUtilsEquip };
}

async function advancedEquipRenderUtilsFixture() {
  const catalogFactory = await ethers.getContractFactory('RMRKCatalogImpl');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const renderUtilsEquipFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  const catalog = <RMRKCatalogImpl>await catalogFactory.deploy('ipfs://catalog.json', 'misc');

  const kanaria = <RMRKEquippableMock>await equipFactory.deploy();
  kanaria.deployed();

  const gem = <RMRKEquippableMock>await equipFactory.deploy();
  gem.deployed();

  const renderUtilsEquip = <RMRKEquipRenderUtils>await renderUtilsEquipFactory.deploy();
  await renderUtilsEquip.deployed();

  return { catalog, kanaria, gem, renderUtilsEquip };
}
async function extendedNftRenderUtilsFixture() {
  const deployer = (await ethers.getSigners())[0];
  const multiAssetFactory = await ethers.getContractFactory('RMRKMultiAssetPreMint');
  const nestableMultiAssetFactory = await ethers.getContractFactory(
    'RMRKNestableMultiAssetPreMint',
  );
  const nestableMultiAssetSoulboundFactory = await ethers.getContractFactory(
    'RMRKNestableMultiAssetPreMintSoulbound',
  );
  const catalogFactory = await ethers.getContractFactory('RMRKCatalogImpl');
  const equipFactory = await ethers.getContractFactory('RMRKEquippablePreMint');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  const multiAsset = <RMRKMultiAssetPreMint>(
    await multiAssetFactory.deploy(
      'MultiAsset',
      'MA',
      'ipfs://collection-meta',
      10000,
      deployer.address,
      500,
    )
  );
  await multiAsset.deployed();

  const nestableMultiAssetSoulbound = <RMRKNestableMultiAssetPreMintSoulbound>(
    await nestableMultiAssetSoulboundFactory.deploy(
      'NestableMultiAssetSoulbound',
      'NMAS',
      'ipfs://collection-meta',
      10000,
      deployer.address,
      500,
    )
  );
  await nestableMultiAssetSoulbound.deployed();

  const nestableMultiAsset = <RMRKNestableMultiAssetPreMint>(
    await nestableMultiAssetFactory.deploy(
      'NestableMultiAsset',
      'NMA',
      'ipfs://collection-meta',
      10000,
      deployer.address,
      500,
    )
  );
  await nestableMultiAsset.deployed();

  const catalog = <RMRKCatalogImpl>await catalogFactory.deploy('ipfs://catalog.json', 'misc');
  await catalog.deployed();

  const equip = <RMRKEquippablePreMint>(
    await equipFactory.deploy(
      'Equippable',
      'EQ',
      'ipfs://collection-meta',
      10000,
      deployer.address,
      500,
    )
  );
  await equip.deployed();

  const renderUtils = <RMRKEquipRenderUtils>await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  return {
    multiAsset,
    nestableMultiAssetSoulbound,
    nestableMultiAsset,
    catalog,
    equip,
    renderUtils,
  };
}

describe('MultiAsset Nestable and Equip Render Utils', async function () {
  let owner: SignerWithAddress;
  let catalog: RMRKCatalogImpl;
  let equip: RMRKEquippableMock;
  let renderUtils: RMRKMultiAssetRenderUtils;
  let renderUtilsNestable: RMRKNestableRenderUtils;
  let renderUtilsEquip: RMRKEquipRenderUtils;
  let tokenId: BigNumber;

  const resId = bn(1);
  const resId2 = bn(2);
  const resId3 = bn(3);
  const resId4 = bn(4);

  beforeEach(async function () {
    ({ catalog, equip, renderUtils, renderUtilsNestable, renderUtilsEquip } = await loadFixture(
      multiAsetNestableAndEquipRenderUtilsFixture,
    ));

    const signers = await ethers.getSigners();
    owner = signers[0];

    tokenId = await mintFromMock(equip, owner.address);
    await equip.addEquippableAssetEntry(resId, 0, ADDRESS_ZERO, 'ipfs://res1.jpg', []);
    await equip.addEquippableAssetEntry(resId2, 1, catalog.address, 'ipfs://res2.jpg', [1, 3, 4]);
    await equip.addEquippableAssetEntry(resId3, 0, ADDRESS_ZERO, 'ipfs://res3.jpg', []);
    await equip.addEquippableAssetEntry(resId4, 2, catalog.address, 'ipfs://res4.jpg', [4]);
    await equip.addAssetToToken(tokenId, resId, 0);
    await equip.addAssetToToken(tokenId, resId2, 0);
    await equip.addAssetToToken(tokenId, resId3, resId);
    await equip.addAssetToToken(tokenId, resId4, 0);

    await equip.acceptAsset(tokenId, 0, resId);
    await equip.acceptAsset(tokenId, 1, resId2);
    await equip.setPriority(tokenId, [10, 5]);
  });

  describe('Render Utils MultiAsset', async function () {
    it('can get active assets', async function () {
      expect(await renderUtils.getExtendedActiveAssets(equip.address, tokenId)).to.eql([
        [resId, bn(10), 'ipfs://res1.jpg'],
        [resId2, bn(5), 'ipfs://res2.jpg'],
      ]);
    });

    it('can get assets by id', async function () {
      expect(await renderUtils.getAssetsById(equip.address, tokenId, [resId, resId2])).to.eql([
        'ipfs://res1.jpg',
        'ipfs://res2.jpg',
      ]);
    });

    it('can get pending assets', async function () {
      expect(await renderUtils.getPendingAssets(equip.address, tokenId)).to.eql([
        [resId4, bn(0), bn(0), 'ipfs://res4.jpg'],
        [resId3, bn(1), resId, 'ipfs://res3.jpg'],
      ]);
    });

    it('can get top asset by priority', async function () {
      expect(await renderUtils.getTopAssetMetaForToken(equip.address, tokenId)).to.eql(
        'ipfs://res2.jpg',
      );

      await equip.setPriority(tokenId, [0, 1]);
      expect(await renderUtils.getTopAssetMetaForToken(equip.address, tokenId)).to.eql(
        'ipfs://res1.jpg',
      );
    });

    it('can get full top asset data', async function () {
      expect(await renderUtils.getTopAsset(equip.address, tokenId)).to.eql([
        resId2,
        bn(5),
        'ipfs://res2.jpg',
      ]);
    });

    it('cannot get active assets if token has no assets', async function () {
      const otherTokenId = await mintFromMock(equip, owner.address);
      await expect(
        renderUtils.getExtendedActiveAssets(equip.address, otherTokenId),
      ).to.be.revertedWithCustomError(renderUtils, 'RMRKTokenHasNoAssets');
      await expect(
        renderUtilsEquip.getExtendedEquippableActiveAssets(equip.address, otherTokenId),
      ).to.be.revertedWithCustomError(renderUtils, 'RMRKTokenHasNoAssets');
    });

    it('cannot get pending assets if token has no assets', async function () {
      const otherTokenId = await mintFromMock(equip, owner.address);
      await expect(
        renderUtils.getPendingAssets(equip.address, otherTokenId),
      ).to.be.revertedWithCustomError(renderUtils, 'RMRKTokenHasNoAssets');
      await expect(
        renderUtilsEquip.getExtendedPendingAssets(equip.address, otherTokenId),
      ).to.be.revertedWithCustomError(renderUtils, 'RMRKTokenHasNoAssets');
    });

    it('cannot get top asset if token has no assets', async function () {
      const otherTokenId = await mintFromMock(equip, owner.address);
      await expect(
        renderUtils.getTopAssetMetaForToken(equip.address, otherTokenId),
      ).to.be.revertedWithCustomError(renderUtils, 'RMRKTokenHasNoAssets');
    });
  });

  describe('Render Utils Nestable', async function () {
    let parentId: BigNumber;
    let childId1: BigNumber;
    let childId2: BigNumber;

    beforeEach(async function () {
      parentId = await mintFromMock(equip, owner.address);
      childId1 = await nestMintFromMock(equip, equip.address, parentId);
      childId2 = await nestMintFromMock(equip, equip.address, parentId);
      await equip.acceptChild(parentId, 0, equip.address, childId1);
      await equip.acceptChild(parentId, 0, equip.address, childId2);
    });

    it('can get total descendants', async function () {
      expect(await renderUtilsNestable.getTotalDescendants(equip.address, parentId)).to.eql([
        bn(2),
        false,
      ]);

      const grandChildId = await nestMintFromMock(equip, equip.address, childId1);
      await equip.acceptChild(childId1, 0, equip.address, grandChildId);

      expect(await renderUtilsNestable.getTotalDescendants(equip.address, parentId)).to.eql([
        bn(3),
        true,
      ]);
    });

    it('can tell if a token has multiple levels of nesting', async function () {
      expect(
        await renderUtilsNestable.hasMoreThanOneLevelOfNesting(equip.address, parentId),
      ).to.eql(false);

      const grandChildId = await nestMintFromMock(equip, equip.address, childId1);
      await equip.acceptChild(childId1, 0, equip.address, grandChildId);

      expect(
        await renderUtilsNestable.hasMoreThanOneLevelOfNesting(equip.address, parentId),
      ).to.eql(true);
    });
  });

  describe('Render Utils Equip', async function () {
    it('can get active assets', async function () {
      expect(
        await renderUtilsEquip.getExtendedEquippableActiveAssets(equip.address, tokenId),
      ).to.eql([
        [resId, bn(0), bn(10), ADDRESS_ZERO, 'ipfs://res1.jpg', []],
        [resId2, bn(1), bn(5), catalog.address, 'ipfs://res2.jpg', [bn(1), bn(3), bn(4)]],
      ]);
    });

    it('can get pending assets', async function () {
      expect(await renderUtilsEquip.getExtendedPendingAssets(equip.address, tokenId)).to.eql([
        [resId4, bn(2), bn(0), bn(0), catalog.address, 'ipfs://res4.jpg', [bn(4)]],
        [resId3, bn(0), bn(1), resId, ADDRESS_ZERO, 'ipfs://res3.jpg', []],
      ]);
    });

    it('can get top equippable data for asset by priority', async function () {
      expect(
        await renderUtilsEquip.getTopAssetAndEquippableDataForToken(equip.address, tokenId),
      ).to.eql([resId2, bn(1), bn(5), catalog.address, 'ipfs://res2.jpg', [bn(1), bn(3), bn(4)]]);
    });

    it('cannot get equippable slots from parent if parent is not an NFT', async function () {
      await expect(
        renderUtilsEquip.getEquippableSlotsFromParent(equip.address, tokenId, 1),
      ).to.be.revertedWithCustomError(renderUtilsEquip, 'RMRKParentIsNotNFT');
    });
  });
});

describe('Advanced Equip Render Utils', async function () {
  let owner: SignerWithAddress;
  let catalog: RMRKCatalogImpl;
  let kanaria: RMRKEquippableMock;
  let gem: RMRKEquippableMock;
  let renderUtilsEquip: RMRKEquipRenderUtils;
  let kanariaId: BigNumber;
  let gemId1: BigNumber;
  let gemId2: BigNumber;
  let gemId3: BigNumber;

  beforeEach(async function () {
    ({ catalog, kanaria, gem, renderUtilsEquip } = await loadFixture(
      advancedEquipRenderUtilsFixture,
    ));
    [owner] = await ethers.getSigners();

    kanariaId = await mintFromMock(kanaria, owner.address);
    gemId1 = await nestMintFromMock(gem, kanaria.address, kanariaId);
    gemId2 = await nestMintFromMock(gem, kanaria.address, kanariaId);
    gemId3 = await nestMintFromMock(gem, kanaria.address, kanariaId);
    await kanaria.acceptChild(kanariaId, 0, gem.address, gemId1);
    await kanaria.acceptChild(kanariaId, 1, gem.address, gemId2);
    await kanaria.acceptChild(kanariaId, 0, gem.address, gemId3);
  });

  it('can get equipped children from parent', async function () {
    await setUpCatalog(catalog, gem.address);
    await setUpKanariaAsset(kanaria, kanariaId, catalog.address);
    await setUpGemAssets(gem, gemId1, gemId2, gemId3, kanaria.address, catalog.address);

    await kanaria.equip({
      tokenId: kanariaId,
      childIndex: 0,
      assetId: assetForKanariaFull,
      slotPartId: slotIdGemLeft,
      childAssetId: assetForGemALeft,
    });
    await kanaria.equip({
      tokenId: kanariaId,
      childIndex: 1,
      assetId: assetForKanariaFull,
      slotPartId: slotIdGemMid,
      childAssetId: assetForGemAMid,
    });
    expect(
      await renderUtilsEquip.equippedChildrenOf(kanaria.address, kanariaId, assetForKanariaFull),
    ).to.eql([
      [bn(assetForKanariaFull), bn(assetForGemALeft), gemId1, gem.address],
      [bn(assetForKanariaFull), bn(assetForGemAMid), gemId2, gem.address],
    ]);
  });

  it('can get equippable slots from parent', async function () {
    await setUpCatalog(catalog, gem.address);
    await setUpKanariaAsset(kanaria, kanariaId, catalog.address);
    await setUpGemAssets(gem, gemId1, gemId2, gemId3, kanaria.address, catalog.address);

    await kanaria.equip({
      tokenId: kanariaId,
      childIndex: 0,
      assetId: assetForKanariaFull,
      slotPartId: slotIdGemLeft,
      childAssetId: assetForGemALeft,
    });
    await kanaria.equip({
      tokenId: kanariaId,
      childIndex: 1,
      assetId: assetForKanariaFull,
      slotPartId: slotIdGemMid,
      childAssetId: assetForGemAMid,
    });
    await kanaria.equip({
      tokenId: kanariaId,
      childIndex: 2,
      assetId: assetForKanariaFull,
      slotPartId: slotIdGemRight,
      childAssetId: assetForGemBRight,
    });

    expect(
      await renderUtilsEquip.getEquippableSlotsFromParent(gem.address, gemId1, assetForKanariaFull),
    ).to.eql([
      bn(0), // child Index
      [
        // [Slot Id, child asset Id, parent asset Id, Asset priority, catalog address, isEquipped, partMetadata, childAssetMetadata, parentAssetMetadata]
        [
          bn(slotIdGemRight),
          bn(assetForGemARight),
          bn(assetForKanariaFull),
          bn(0),
          catalog.address,
          false,
          'ipfs://metadataSlotGemRight',
          'ipfs://gems/typeA/right.svg',
          'ipfs://kanaria/full.svg',
        ],
        [
          bn(slotIdGemMid),
          bn(assetForGemAMid),
          bn(assetForKanariaFull),
          bn(1),
          catalog.address,
          false,
          'ipfs://metadataSlotGemMid',
          'ipfs://gems/typeA/mid.svg',
          'ipfs://kanaria/full.svg',
        ],
        [
          bn(slotIdGemLeft),
          bn(assetForGemALeft),
          bn(assetForKanariaFull),
          bn(2),
          catalog.address,
          true,
          'ipfs://metadataSlotGemLeft',
          'ipfs://gems/typeA/left.svg',
          'ipfs://kanaria/full.svg',
        ],
      ],
    ]);
    expect(
      await renderUtilsEquip.getEquippableSlotsFromParent(gem.address, gemId2, assetForKanariaFull),
    ).to.eql([
      bn(1), // child Index
      [
        // [Slot Id, child asset Id, parent asset Id, Asset priority, catalog address, isEquipped, partMetadata, childAssetMetadata, parentAssetMetadata]
        [
          bn(slotIdGemRight),
          bn(assetForGemARight),
          bn(assetForKanariaFull),
          bn(0),
          catalog.address,
          false,
          'ipfs://metadataSlotGemRight',
          'ipfs://gems/typeA/right.svg',
          'ipfs://kanaria/full.svg',
        ],
        [
          bn(slotIdGemMid),
          bn(assetForGemAMid),
          bn(assetForKanariaFull),
          bn(1),
          catalog.address,
          true,
          'ipfs://metadataSlotGemMid',
          'ipfs://gems/typeA/mid.svg',
          'ipfs://kanaria/full.svg',
        ],
        [
          bn(slotIdGemLeft),
          bn(assetForGemALeft),
          bn(assetForKanariaFull),
          bn(2),
          catalog.address,
          false,
          'ipfs://metadataSlotGemLeft',
          'ipfs://gems/typeA/left.svg',
          'ipfs://kanaria/full.svg',
        ],
      ],
    ]);
    // Here we test with the more generic function which checks for all parent's assets
    expect(
      await renderUtilsEquip.getAllEquippableSlotsFromParent(gem.address, gemId3, false),
    ).to.eql([
      bn(2), // child Index
      [
        // [Slot Id, child asset Id, parent asset Id, Asset priority, catalog address, isEquipped, partMetadata, childAssetMetadata, parentAssetMetadata]
        [
          bn(slotIdGemRight),
          bn(assetForGemBRight),
          bn(assetForKanariaFull),
          bn(0),
          catalog.address,
          true,
          'ipfs://metadataSlotGemRight',
          'ipfs://gems/typeB/right.svg',
          'ipfs://kanaria/full.svg',
        ],
        [
          bn(slotIdGemMid),
          bn(assetForGemBMid),
          bn(assetForKanariaFull),
          bn(1),
          catalog.address,
          false,
          'ipfs://metadataSlotGemMid',
          'ipfs://gems/typeB/mid.svg',
          'ipfs://kanaria/full.svg',
        ],
        [
          bn(slotIdGemLeft),
          bn(assetForGemBLeft),
          bn(assetForKanariaFull),
          bn(2),
          catalog.address,
          false,
          'ipfs://metadataSlotGemLeft',
          'ipfs://gems/typeB/left.svg',
          'ipfs://kanaria/full.svg',
        ],
      ],
    ]);

    // Again the more generic function which checks for all parent's assets, but this time filtering for only equipped results
    expect(
      await renderUtilsEquip.getAllEquippableSlotsFromParent(gem.address, gemId3, true),
    ).to.eql([
      bn(2), // child Index
      [
        // [Slot Id, child asset Id, parent asset Id, Asset priority, catalog address, isEquipped, partMetadata, childAssetMetadata, parentAssetMetadata]
        [
          bn(slotIdGemRight),
          bn(assetForGemBRight),
          bn(assetForKanariaFull),
          bn(0),
          catalog.address,
          true,
          'ipfs://metadataSlotGemRight',
          'ipfs://gems/typeB/right.svg',
          'ipfs://kanaria/full.svg',
        ],
      ],
    ]);
  });

  it('can get children with top metadata', async function () {
    await setUpCatalog(catalog, gem.address);
    await setUpKanariaAsset(kanaria, kanariaId, catalog.address);
    await setUpGemAssets(gem, gemId1, gemId2, gemId3, kanaria.address, catalog.address);

    // Gem assets are accepted in this order: right, mid, left, full
    await gem.setPriority(gemId1, [3, 2, 0, 1]); // Make left
    await gem.setPriority(gemId2, [3, 2, 1, 0]); // Make full the highest priority
    // We leave gemId3 as is, so it will be right

    expect(await renderUtilsEquip.getChildrenWithTopMetadata(kanaria.address, kanariaId)).to.eql([
      [gem.address, BigNumber.from(gemId1), 'ipfs://gems/typeA/left.svg'],
      [gem.address, BigNumber.from(gemId2), 'ipfs://gems/typeA/full.svg'],
      [gem.address, BigNumber.from(gemId3), 'ipfs://gems/typeB/right.svg'],
    ]);

    expect(
      await renderUtilsEquip.getTopAssetMetadataForTokens(gem.address, [gemId1, gemId2, gemId3]),
    ).to.eql([
      'ipfs://gems/typeA/left.svg',
      'ipfs://gems/typeA/full.svg',
      'ipfs://gems/typeB/right.svg',
    ]);
  });

  it('can get equippable slots from parent for pending child', async function () {
    await setUpCatalog(catalog, gem.address);
    await setUpKanariaAsset(kanaria, kanariaId, catalog.address);
    await setUpGemAssets(gem, gemId1, gemId2, gemId3, kanaria.address, catalog.address);

    // Transfer a gem out and then back so it becomes pending
    await kanaria.transferChild(kanariaId, owner.address, 0, 2, gem.address, gemId3, false, '0x');
    await gem.nestTransferFrom(owner.address, kanaria.address, gemId3, kanariaId, '0x');

    expect(
      await renderUtilsEquip.getPendingChildIndex(kanaria.address, kanariaId, gem.address, gemId3),
    ).to.eql(BigNumber.from(0));

    expect(
      await renderUtilsEquip.getEquippableSlotsFromParentForPendingChild(
        gem.address,
        gemId3,
        assetForKanariaFull,
      ),
    ).to.eql([
      bn(0), // child Index
      [
        // [Slot Id, child asset Id, parent asset Id, Asset priority, catalog address, isEquipped, partMetadata, childAssetMetadata, parentAssetMetadata]
        [
          bn(slotIdGemRight),
          bn(assetForGemBRight),
          bn(assetForKanariaFull),
          bn(0),
          catalog.address,
          false,
          'ipfs://metadataSlotGemRight',
          'ipfs://gems/typeB/right.svg',
          'ipfs://kanaria/full.svg',
        ],
        [
          bn(slotIdGemMid),
          bn(assetForGemBMid),
          bn(assetForKanariaFull),
          bn(1),
          catalog.address,
          false,
          'ipfs://metadataSlotGemMid',
          'ipfs://gems/typeB/mid.svg',
          'ipfs://kanaria/full.svg',
        ],
        [
          bn(slotIdGemLeft),
          bn(assetForGemBLeft),
          bn(assetForKanariaFull),
          bn(2),
          catalog.address,
          false,
          'ipfs://metadataSlotGemLeft',
          'ipfs://gems/typeB/left.svg',
          'ipfs://kanaria/full.svg',
        ],
      ],
    ]);
  });

  it('can get equippable slots from parent asset and excludes if catalog does not match', async function () {
    await setUpCatalog(catalog, gem.address);
    await setUpKanariaAsset(kanaria, kanariaId, catalog.address);
    await setUpGemAssets(gem, gemId1, gemId2, gemId3, kanaria.address, catalog.address);

    const catalogFactory = await ethers.getContractFactory('RMRKCatalogImpl');
    const otherCatalog = <RMRKCatalogImpl>(
      await catalogFactory.deploy('ipfs://catalog.json', 'misc')
    );
    await otherCatalog.deployed();

    const newResourceId = bn(99);
    await gem.addEquippableAssetEntry(
      newResourceId,
      1,
      otherCatalog.address,
      'ipfs://assetFromOtherCatalog.jpg',
      [],
    );
    await gem.addAssetToToken(gemId3, newResourceId, 0);
    await gem.acceptAsset(gemId3, 0, newResourceId);

    expect(
      await renderUtilsEquip.getEquippableSlotsFromParent(gem.address, gemId3, assetForKanariaFull),
    ).to.eql([
      bn(2), // child Index
      [
        // [Slot Id, child asset Id, parent asset Id, Asset priority, catalog address, isEquipped, partMetadata, childAssetMetadata, parentAssetMetadata]
        [
          bn(slotIdGemRight),
          bn(assetForGemBRight),
          bn(assetForKanariaFull),
          bn(0),
          catalog.address,
          false,
          'ipfs://metadataSlotGemRight',
          'ipfs://gems/typeB/right.svg',
          'ipfs://kanaria/full.svg',
        ],
        [
          bn(slotIdGemMid),
          bn(assetForGemBMid),
          bn(assetForKanariaFull),
          bn(1),
          catalog.address,
          false,
          'ipfs://metadataSlotGemMid',
          'ipfs://gems/typeB/mid.svg',
          'ipfs://kanaria/full.svg',
        ],
        [
          bn(slotIdGemLeft),
          bn(assetForGemBLeft),
          bn(assetForKanariaFull),
          bn(2),
          catalog.address,
          false,
          'ipfs://metadataSlotGemLeft',
          'ipfs://gems/typeB/left.svg',
          'ipfs://kanaria/full.svg',
        ],
      ],
    ]);
  });

  it('cannot get equippable slots from parent if the asset id is not composable', async function () {
    const assetForKanariaNotEquippable = 10;
    await setUpCatalog(catalog, gem.address);
    await setUpKanariaAsset(kanaria, kanariaId, catalog.address);
    await setUpGemAssets(gem, gemId1, gemId2, gemId3, kanaria.address, catalog.address);

    await kanaria.addEquippableAssetEntry(
      assetForKanariaNotEquippable,
      0,
      ADDRESS_ZERO,
      'ipfs://kanaria.jpg',
      [],
    );
    await kanaria.addAssetToToken(kanariaId, assetForKanariaNotEquippable, 0);
    await kanaria.acceptAsset(kanariaId, 0, assetForKanariaNotEquippable);
    await expect(
      renderUtilsEquip.getEquippableSlotsFromParent(
        gem.address,
        gemId1,
        assetForKanariaNotEquippable,
      ),
    ).to.be.revertedWithCustomError(renderUtilsEquip, 'RMRKNotComposableAsset');
  });

  it('fails checking expected parent if parent is not the expected one', async function () {
    await expect(
      renderUtilsEquip.checkExpectedParent(
        gem.address,
        gemId1,
        gem.address, // Wrong parent address
        kanariaId,
      ),
    ).to.be.revertedWithCustomError(renderUtilsEquip, 'RMRKUnexpectedParent');
    await expect(
      renderUtilsEquip.checkExpectedParent(
        gem.address,
        gemId1,
        kanaria.address,
        2, // Wrong parent id
      ),
    ).to.be.revertedWithCustomError(renderUtilsEquip, 'RMRKUnexpectedParent');
  });

  it('succeeds checking expected parent if parent is the expected one', async function () {
    await expect(
      renderUtilsEquip.checkExpectedParent(gem.address, gemId1, kanaria.address, kanariaId),
    ).to.not.be.reverted;
  });
});

describe('Extended NFT render utils', function () {
  let issuer: SignerWithAddress;
  let rootOwner: SignerWithAddress;
  let multiAsset: RMRKMultiAssetPreMint;
  let nestableMultiAssetSoulbound: RMRKNestableMultiAssetPreMintSoulbound;
  let nestableMultiAsset: RMRKNestableMultiAssetPreMint;
  let catalog: RMRKCatalogImpl;
  let equip: RMRKEquippablePreMint;
  let renderUtils: RMRKEquipRenderUtils;

  const metaURI = 'ipfs://meta';
  const supply = bn(10000);

  beforeEach(async function () {
    ({ multiAsset, nestableMultiAssetSoulbound, nestableMultiAsset, catalog, equip, renderUtils } =
      await loadFixture(extendedNftRenderUtilsFixture));

    [issuer, rootOwner] = await ethers.getSigners();
  });

  it('renders correct data for MultiAsset', async function () {
    const tokenId = await mintFromMockPremint(multiAsset, rootOwner.address);
    await multiAsset.addAssetEntry(metaURI);
    await multiAsset.addAssetEntry(metaURI);
    await multiAsset.addAssetEntry(metaURI);
    await multiAsset.addAssetEntry(metaURI);
    await multiAsset.addAssetToToken(tokenId, 1, 0); // Auto accepted
    await multiAsset.addAssetToToken(tokenId, 2, 0);
    await multiAsset.addAssetToToken(tokenId, 3, 0);
    await multiAsset.addAssetToToken(tokenId, 4, 0);
    await multiAsset.connect(rootOwner).acceptAsset(tokenId, 0, 2);
    await multiAsset.connect(rootOwner).setPriority(tokenId, [10, 42]);

    const data = await renderUtils.getExtendedNft(tokenId, multiAsset.address);

    expect(data.tokenMetadataUri).to.eql('ipfs://tokenURI');
    expect(data.directOwner).to.eql(rootOwner.address);
    expect(data.rootOwner).to.eql(rootOwner.address);
    expect(data.activeAssetCount).to.eql(bn(2));
    expect(data.pendingAssetCount).to.eql(bn(2));
    expect(data.priorities).to.eql([bn(10), bn(42)]);
    expect(data.maxSupply).to.eql(bn(10000));
    expect(data.totalSupply).to.eql(bn(1));
    expect(data.issuer).to.eql(issuer.address);
    expect(data.name).to.eql('MultiAsset');
    expect(data.symbol).to.eql('MA');
    expect(data.activeChildrenNumber).to.eql(bn(0));
    expect(data.pendingChildrenNumber).to.eql(bn(0));
    expect(data.isSoulbound).to.be.false;
    expect(data.hasMultiAssetInterface).to.be.true;
    expect(data.hasNestingInterface).to.be.false;
    expect(data.hasEquippableInterface).to.be.false;
  });

  it('renders correct data for soulbound Nestable', async function () {
    const tokenId = await mintFromMockPremint(nestableMultiAssetSoulbound, rootOwner.address);
    const child1 = await nestMintFromMockPreMint(
      nestableMultiAssetSoulbound,
      nestableMultiAssetSoulbound.address,
      tokenId,
    );
    await nestMintFromMockPreMint(
      nestableMultiAssetSoulbound,
      nestableMultiAssetSoulbound.address,
      tokenId,
    );
    const child3 = await nestMintFromMockPreMint(
      nestableMultiAssetSoulbound,
      nestableMultiAssetSoulbound.address,
      tokenId,
    );
    await nestableMultiAssetSoulbound
      .connect(rootOwner)
      .acceptChild(tokenId, 0, nestableMultiAssetSoulbound.address, child1);
    await nestableMultiAssetSoulbound
      .connect(rootOwner)
      .acceptChild(tokenId, 0, nestableMultiAssetSoulbound.address, child3);

    const data = await renderUtils.getExtendedNft(tokenId, nestableMultiAssetSoulbound.address);

    expect(data.tokenMetadataUri).to.eql('ipfs://tokenURI');
    expect(data.directOwner).to.eql(rootOwner.address);
    expect(data.rootOwner).to.eql(rootOwner.address);
    expect(data.activeAssetCount).to.eql(bn(0));
    expect(data.pendingAssetCount).to.eql(bn(0));
    expect(data.priorities).to.eql([]);
    expect(data.maxSupply).to.eql(bn(10000));
    expect(data.totalSupply).to.eql(bn(4));
    expect(data.issuer).to.eql(issuer.address);
    expect(data.name).to.eql('NestableMultiAssetSoulbound');
    expect(data.symbol).to.eql('NMAS');
    expect(data.activeChildrenNumber).to.eql(bn(2));
    expect(data.pendingChildrenNumber).to.eql(bn(1));
    expect(data.isSoulbound).to.be.true;
    expect(data.hasMultiAssetInterface).to.be.true;
    expect(data.hasNestingInterface).to.be.true;
    expect(data.hasEquippableInterface).to.be.false;
  });

  it('renders correct data for Nestable with MultiAsset', async function () {
    const parentId = await mintFromMockPremint(nestableMultiAsset, rootOwner.address);
    const tokenId = await mintFromMockPremint(nestableMultiAsset, rootOwner.address);
    await nestableMultiAsset.addAssetEntry(metaURI);
    await nestableMultiAsset.addAssetEntry(metaURI);
    await nestableMultiAsset.addAssetEntry(metaURI);
    await nestableMultiAsset.addAssetEntry(metaURI);
    await nestableMultiAsset.addAssetToToken(tokenId, 1, 0); // Auto accepted
    await nestableMultiAsset.addAssetToToken(tokenId, 2, 0);
    await nestableMultiAsset.addAssetToToken(tokenId, 3, 0);
    await nestableMultiAsset.addAssetToToken(tokenId, 4, 0);
    await nestableMultiAsset.connect(rootOwner).acceptAsset(tokenId, 0, 2);
    await nestableMultiAsset.connect(rootOwner).setPriority(tokenId, [10, 42]);
    const child1 = await nestMintFromMockPreMint(
      nestableMultiAsset,
      nestableMultiAsset.address,
      tokenId,
    );
    await nestMintFromMockPreMint(nestableMultiAsset, nestableMultiAsset.address, tokenId);
    const child3 = await nestMintFromMockPreMint(
      nestableMultiAsset,
      nestableMultiAsset.address,
      tokenId,
    );
    await nestableMultiAsset
      .connect(rootOwner)
      .acceptChild(tokenId, 0, nestableMultiAsset.address, child1);
    await nestableMultiAsset
      .connect(rootOwner)
      .acceptChild(tokenId, 0, nestableMultiAsset.address, child3);
    await nestableMultiAsset
      .connect(rootOwner)
      .nestTransferFrom(rootOwner.address, nestableMultiAsset.address, tokenId, parentId, '0x');
    await nestableMultiAsset
      .connect(rootOwner)
      .acceptChild(parentId, 0, nestableMultiAsset.address, tokenId);

    const data = await renderUtils.getExtendedNft(tokenId, nestableMultiAsset.address);

    expect(data.tokenMetadataUri).to.eql('ipfs://tokenURI');
    expect(data.directOwner).to.eql(nestableMultiAsset.address);
    expect(data.rootOwner).to.eql(rootOwner.address);
    expect(data.activeAssetCount).to.eql(bn(2));
    expect(data.pendingAssetCount).to.eql(bn(2));
    expect(data.priorities).to.eql([bn(10), bn(42)]);
    expect(data.maxSupply).to.eql(bn(10000));
    expect(data.totalSupply).to.eql(bn(5));
    expect(data.issuer).to.eql(issuer.address);
    expect(data.name).to.eql('NestableMultiAsset');
    expect(data.symbol).to.eql('NMA');
    expect(data.activeChildrenNumber).to.eql(bn(2));
    expect(data.pendingChildrenNumber).to.eql(bn(1));
    expect(data.isSoulbound).to.be.false;
    expect(data.hasMultiAssetInterface).to.be.true;
    expect(data.hasNestingInterface).to.be.true;
    expect(data.hasEquippableInterface).to.be.false;
  });

  it('renders correct data for Equippable', async function () {
    const parentId = await mintFromMockPremint(equip, rootOwner.address);
    const tokenId = await mintFromMockPremint(equip, rootOwner.address);
    await equip.addEquippableAssetEntry(0, ADDRESS_ZERO, 'ipfs://res1.jpg', []);
    await equip.addEquippableAssetEntry(1, catalog.address, 'ipfs://res2.jpg', [1, 3, 4]);
    await equip.addEquippableAssetEntry(0, ADDRESS_ZERO, 'ipfs://res3.jpg', []);
    await equip.addEquippableAssetEntry(2, catalog.address, 'ipfs://res4.jpg', [4]);
    await equip.addAssetToToken(tokenId, 1, 0); // Auto accepted
    await equip.addAssetToToken(tokenId, 2, 0);
    await equip.addAssetToToken(tokenId, 3, 1);
    await equip.addAssetToToken(tokenId, 4, 0);
    await equip.connect(rootOwner).acceptAsset(tokenId, 0, 2);
    await equip.connect(rootOwner).setPriority(tokenId, [10, 42]);
    const child1 = await nestMintFromMockPreMint(equip, equip.address, tokenId);
    await nestMintFromMockPreMint(equip, equip.address, tokenId);
    const child3 = await nestMintFromMockPreMint(equip, equip.address, tokenId);
    await equip.connect(rootOwner).acceptChild(tokenId, 0, equip.address, child1);
    await equip.connect(rootOwner).acceptChild(tokenId, 0, equip.address, child3);
    await equip
      .connect(rootOwner)
      .nestTransferFrom(rootOwner.address, equip.address, tokenId, parentId, '0x');
    await equip.connect(rootOwner).acceptChild(parentId, 0, equip.address, tokenId);

    const data = await renderUtils.getExtendedNft(tokenId, equip.address);

    expect(data.tokenMetadataUri).to.eql('ipfs://tokenURI');
    expect(data.directOwner).to.eql(equip.address);
    expect(data.rootOwner).to.eql(rootOwner.address);
    expect(data.activeAssetCount).to.eql(bn(2));
    expect(data.pendingAssetCount).to.eql(bn(2));
    expect(data.priorities).to.eql([bn(10), bn(42)]);
    expect(data.maxSupply).to.eql(bn(10000));
    expect(data.totalSupply).to.eql(bn(5));
    expect(data.issuer).to.eql(issuer.address);
    expect(data.name).to.eql('Equippable');
    expect(data.symbol).to.eql('EQ');
    expect(data.activeChildrenNumber).to.eql(bn(2));
    expect(data.pendingChildrenNumber).to.eql(bn(1));
    expect(data.isSoulbound).to.be.false;
    expect(data.hasMultiAssetInterface).to.be.true;
    expect(data.hasNestingInterface).to.be.true;
    expect(data.hasEquippableInterface).to.be.true;
  });

  describe('Nesting validation', function () {
    let parentTokenOne: BigNumber;
    let parentTokenTwo: BigNumber;
    let childTokenOne: BigNumber;
    let childTokenTwo: BigNumber;
    let childTokenThree: BigNumber;

    beforeEach(async function () {
      parentTokenOne = await mintFromMockPremint(nestableMultiAsset, rootOwner.address);
      parentTokenTwo = await mintFromMockPremint(nestableMultiAsset, rootOwner.address);
      childTokenOne = await nestMintFromMockPreMint(
        nestableMultiAsset,
        nestableMultiAsset.address,
        parentTokenOne,
      );
      childTokenTwo = await nestMintFromMockPreMint(
        nestableMultiAsset,
        nestableMultiAsset.address,
        parentTokenTwo,
      );
      childTokenThree = await nestMintFromMockPreMint(
        nestableMultiAsset,
        nestableMultiAsset.address,
        parentTokenOne,
      );
    });

    it('returns true if the specified token is nested into the given parent', async function () {
      expect(
        await renderUtils.validateChildOf(
          nestableMultiAsset.address,
          nestableMultiAsset.address,
          parentTokenOne,
          childTokenOne,
        ),
      ).to.be.true;
    });

    it('returns false if the child does not implement IERC6059', async function () {
      expect(
        await renderUtils.validateChildOf(
          nestableMultiAsset.address,
          multiAsset.address,
          parentTokenOne,
          childTokenOne,
        ),
      ).to.be.false;
    });

    it('returns false if the specified child token is not the child token of the parent token', async function () {
      expect(
        await renderUtils.validateChildOf(
          nestableMultiAsset.address,
          nestableMultiAsset.address,
          parentTokenOne,
          childTokenTwo,
        ),
      ).to.be.false;
    });

    it('returns true if the specified children are the child tokens of the given parent token', async function () {
      expect(
        await renderUtils.validateChildrenOf(
          nestableMultiAsset.address,
          [nestableMultiAsset.address, nestableMultiAsset.address],
          parentTokenOne,
          [childTokenOne, childTokenThree],
        ),
      ).to.eql([true, [true, true]]);
    });

    it('does not allow to pass different length child token address and token ID arrays', async function () {
      await expect(
        renderUtils.validateChildrenOf(
          nestableMultiAsset.address,
          [nestableMultiAsset.address, nestableMultiAsset.address],
          parentTokenOne,
          [childTokenOne],
        ),
      ).to.be.revertedWithCustomError(renderUtils, 'RMRKMismachedArrayLength');
    });

    it('returns false if one of the child tokens does not implement IERC6059', async function () {
      expect(
        await renderUtils.validateChildrenOf(
          nestableMultiAsset.address,
          [nestableMultiAsset.address, multiAsset.address],
          parentTokenOne,
          [childTokenOne, childTokenTwo],
        ),
      ).to.eql([false, [true, false]]);
    });

    it('returns false if any of the given tokens is not owned by the specified parent token', async function () {
      expect(
        await renderUtils.validateChildrenOf(
          nestableMultiAsset.address,
          [nestableMultiAsset.address, nestableMultiAsset.address, nestableMultiAsset.address],
          parentTokenOne,
          [childTokenOne, childTokenTwo, childTokenThree],
        ),
      ).to.eql([false, [true, false, true]]);
    });

    it('can get directOwnerOf with parents perspective', async function () {
      expect(
        await renderUtils.directOwnerOfWithParentsPerspective(
          nestableMultiAsset.address,
          parentTokenOne,
        ),
      ).to.eql([rootOwner.address, ethers.BigNumber.from(0), false, false, false]);
    });

    it('can identify rejected children', async function () {
      expect(
        await renderUtils.isTokenRejectedOrAbandoned(nestableMultiAsset.address, childTokenOne),
      ).to.be.false;
      await nestableMultiAsset
        .connect(rootOwner)
        .transferChild(
          parentTokenOne,
          ethers.constants.AddressZero,
          0,
          0,
          nestableMultiAsset.address,
          childTokenOne,
          true,
          '0x',
        );
      expect(
        await renderUtils.isTokenRejectedOrAbandoned(nestableMultiAsset.address, childTokenOne),
      ).to.be.true;
    });

    it('can identify abandoned children', async function () {
      await nestableMultiAsset
        .connect(rootOwner)
        .acceptChild(parentTokenOne, 0, nestableMultiAsset.address, childTokenOne);

      expect(
        await renderUtils.isTokenRejectedOrAbandoned(nestableMultiAsset.address, childTokenOne),
      ).to.be.false;
      await nestableMultiAsset
        .connect(rootOwner)
        .transferChild(
          parentTokenOne,
          ethers.constants.AddressZero,
          0,
          0,
          nestableMultiAsset.address,
          childTokenOne,
          false,
          '0x',
        );
      expect(
        await renderUtils.isTokenRejectedOrAbandoned(nestableMultiAsset.address, childTokenOne),
      ).to.be.true;
    });
  });
});
