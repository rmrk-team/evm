import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ADDRESS_ZERO, bn, mintFromMock, nestMintFromMock } from './utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  RMRKRenderUtils,
  RMRKCatalogMock,
  RMRKEquippableMock,
  RMRKEquipRenderUtils,
  RMRKMultiAssetRenderUtils,
} from '../typechain-types';

// --------------- FIXTURES -----------------------

async function multiAsetAndEquipRenderUtilsFixture() {
  const catalogFactory = await ethers.getContractFactory('RMRKCatalogMock');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');
  const renderUtilsEquipFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  const catalog = <RMRKCatalogMock>await catalogFactory.deploy('ipfs://catalog.json', 'misc');
  await catalog.deployed();

  const equip = <RMRKEquippableMock>await equipFactory.deploy('Chunky', 'CHNK');
  await equip.deployed();

  const renderUtils = <RMRKMultiAssetRenderUtils>await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  const renderUtilsEquip = <RMRKEquipRenderUtils>await renderUtilsEquipFactory.deploy();
  await renderUtilsEquip.deployed();

  return { catalog, equip, renderUtils, renderUtilsEquip };
}

async function advancedEquipRenderUtilsFixture() {
  const catalogFactory = await ethers.getContractFactory('RMRKCatalogMock');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const renderUtilsEquipFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');

  const catalog = <RMRKCatalogMock>await catalogFactory.deploy('ipfs://catalog.json', 'misc');

  const kanaria = <RMRKEquippableMock>await equipFactory.deploy('Kanaria', 'KAN');
  kanaria.deployed();

  const gem = <RMRKEquippableMock>await equipFactory.deploy('Kanaria Gem', 'KGEM');
  gem.deployed();

  const renderUtilsEquip = <RMRKEquipRenderUtils>await renderUtilsEquipFactory.deploy();
  await renderUtilsEquip.deployed();

  return { catalog, kanaria, gem, renderUtilsEquip };
}

async function simpleRenderUtilsFixture() {
  const equipFactory = await ethers.getContractFactory('RMRKEquippableMock');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKRenderUtils');

  const token = <RMRKEquippableMock>await equipFactory.deploy('Kanaria', 'KAN');
  token.deployed();

  const renderUtils = <RMRKEquipRenderUtils>await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  return { token, renderUtils };
}

describe('MultiAsset and Equip Render Utils', async function () {
  let owner: SignerWithAddress;
  let catalog: RMRKCatalogMock;
  let equip: RMRKEquippableMock;
  let renderUtils: RMRKMultiAssetRenderUtils;
  let renderUtilsEquip: RMRKEquipRenderUtils;
  let tokenId: number;

  const resId = bn(1);
  const resId2 = bn(2);
  const resId3 = bn(3);
  const resId4 = bn(4);

  beforeEach(async function () {
    ({ catalog, equip, renderUtils, renderUtilsEquip } = await loadFixture(
      multiAsetAndEquipRenderUtilsFixture,
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
        [resId, 10, 'ipfs://res1.jpg'],
        [resId2, 5, 'ipfs://res2.jpg'],
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

  describe('Render Utils Equip', async function () {
    it('can get active assets', async function () {
      expect(
        await renderUtilsEquip.getExtendedEquippableActiveAssets(equip.address, tokenId),
      ).to.eql([
        [resId, bn(0), 10, ADDRESS_ZERO, 'ipfs://res1.jpg', []],
        [resId2, bn(1), 5, catalog.address, 'ipfs://res2.jpg', [bn(1), bn(3), bn(4)]],
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
      ).to.eql([resId2, bn(1), 5, catalog.address, 'ipfs://res2.jpg', [bn(1), bn(3), bn(4)]]);
    });

    it('cannot get equippable slots from parent if parent is not an NFT', async function () {
      await expect(
        renderUtilsEquip.getEquippableSlotsFromParent(equip.address, tokenId, equip.address, 1, 1),
      ).to.be.revertedWithCustomError(renderUtilsEquip, 'RMRKParentIsNotNFT');
    });
  });
});

// These refIds are used from the child's perspective, to group assets that can be equipped into a parent
// With it, we avoid the need to do set it asset by asset
const noEquippableGroup = 0;
const equippableRefIdLeftGem = 1;
const equippableRefIdMidGem = 2;
const equippableRefIdRightGem = 3;

const assetForGemAFull = 1;
const assetForGemALeft = 2;
const assetForGemAMid = 3;
const assetForGemARight = 4;
const assetForGemBFull = 5;
const assetForGemBLeft = 6;
const assetForGemBMid = 7;
const assetForGemBRight = 8;
const assetForKanariaFull = 9;

const slotIdGemLeft = 1;
const slotIdGemMid = 2;
const slotIdGemRight = 3;

describe('Advanced Equip Render Utils', async function () {
  let owner: SignerWithAddress;
  let catalog: RMRKCatalogMock;
  let kanaria: RMRKEquippableMock;
  let gem: RMRKEquippableMock;
  let renderUtilsEquip: RMRKEquipRenderUtils;
  let kanariaId: number;
  let gemId1: number;
  let gemId2: number;
  let gemId3: number;

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

  it('can get equippable slots from parent', async function () {
    await setUpCatalog(catalog, gem.address);
    await setUpKanariaAsset(kanaria, kanariaId, catalog.address);
    await setUpGemAssets(gem, gemId1, gemId2, gemId3, kanaria.address, catalog.address);

    expect(
      await renderUtilsEquip.getEquippableSlotsFromParent(
        gem.address,
        gemId1,
        kanaria.address,
        kanariaId,
        assetForKanariaFull,
      ),
    ).to.eql([
      bn(0), // child Index
      [
        // [Slot Id, asset Id, Asset priority]
        [bn(slotIdGemRight), bn(assetForGemARight), 0],
        [bn(slotIdGemMid), bn(assetForGemAMid), 1],
        [bn(slotIdGemLeft), bn(assetForGemALeft), 2],
      ],
    ]);
    expect(
      await renderUtilsEquip.getEquippableSlotsFromParent(
        gem.address,
        gemId2,
        kanaria.address,
        kanariaId,
        assetForKanariaFull,
      ),
    ).to.eql([
      bn(1), // child Index
      [
        // [Slot Id, asset Id, Asset priority]
        [bn(slotIdGemRight), bn(assetForGemARight), 0],
        [bn(slotIdGemMid), bn(assetForGemAMid), 1],
        [bn(slotIdGemLeft), bn(assetForGemALeft), 2],
      ],
    ]);
    expect(
      await renderUtilsEquip.getEquippableSlotsFromParent(
        gem.address,
        gemId3,
        kanaria.address,
        kanariaId,
        assetForKanariaFull,
      ),
    ).to.eql([
      bn(2), // child Index
      [
        // [Slot Id, asset Id, Asset priority]
        [bn(slotIdGemRight), bn(assetForGemBRight), 0],
        [bn(slotIdGemMid), bn(assetForGemBMid), 1],
        [bn(slotIdGemLeft), bn(assetForGemBLeft), 2],
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
        kanaria.address,
        kanariaId,
        assetForKanariaNotEquippable,
      ),
    ).to.be.revertedWithCustomError(renderUtilsEquip, 'RMRKNotComposableAsset');
  });

  it('cannot get equippable slots from parent if parent is not the expected one', async function () {
    await expect(
      renderUtilsEquip.getEquippableSlotsFromParent(
        gem.address,
        gemId1,
        gem.address, // Wrong parent address
        kanariaId,
        assetForKanariaFull,
      ),
    ).to.be.revertedWithCustomError(renderUtilsEquip, 'RMRKUnexpectedParent');
    await expect(
      renderUtilsEquip.getEquippableSlotsFromParent(
        gem.address,
        gemId1,
        kanaria.address,
        2, // Wrong parent id
        assetForKanariaFull,
      ),
    ).to.be.revertedWithCustomError(renderUtilsEquip, 'RMRKUnexpectedParent');
  });
});

async function setUpCatalog(catalog: RMRKCatalogMock, gemAddress: string): Promise<void> {
  await catalog.addPartList([
    {
      // Gems slot 1
      partId: slotIdGemLeft,
      part: {
        itemType: 1, // Slot
        z: 4,
        equippable: [gemAddress], // Only gems tokens can be equipped here
        metadataURI: '',
      },
    },
    {
      // Gems slot 2
      partId: slotIdGemMid,
      part: {
        itemType: 1, // Slot
        z: 4,
        equippable: [gemAddress], // Only gems tokens can be equipped here
        metadataURI: '',
      },
    },
    {
      // Gems slot 3
      partId: slotIdGemRight,
      part: {
        itemType: 1, // Slot
        z: 4,
        equippable: [gemAddress], // Only gems tokens can be equipped here
        metadataURI: '',
      },
    },
  ]);
}

async function setUpKanariaAsset(
  kanaria: RMRKEquippableMock,
  kanariaId: number,
  catalogAddress: string,
): Promise<void> {
  await kanaria.addEquippableAssetEntry(
    assetForKanariaFull,
    noEquippableGroup,
    catalogAddress,
    `ipfs://kanaria/full.svg`,
    [slotIdGemLeft, slotIdGemMid, slotIdGemRight],
  );
  await kanaria.addAssetToToken(kanariaId, assetForKanariaFull, 0);
  await kanaria.acceptAsset(kanariaId, 0, assetForKanariaFull);
}

async function setUpGemAssets(
  gem: RMRKEquippableMock,
  gemId1: number,
  gemId2: number,
  gemId3: number,
  kanariaAddress: string,
  catalogAddress: string,
): Promise<void> {
  const [owner] = await ethers.getSigners();
  // We'll add 4 assets for each gem, a full version and 3 versions matching each slot.
  // We will have only 2 types of gems -> 4x2: 8 assets.
  // This is not composed by others, so fixed and slot parts are never used.
  await gem.addEquippableAssetEntry(
    assetForGemAFull,
    noEquippableGroup,
    catalogAddress,
    `ipfs://gems/typeA/full.svg`,
    [],
  );
  await gem.addEquippableAssetEntry(
    assetForGemALeft,
    equippableRefIdLeftGem,
    catalogAddress,
    `ipfs://gems/typeA/left.svg`,
    [],
  );
  await gem.addEquippableAssetEntry(
    assetForGemAMid,
    equippableRefIdMidGem,
    catalogAddress,
    `ipfs://gems/typeA/mid.svg`,
    [],
  );
  await gem.addEquippableAssetEntry(
    assetForGemARight,
    equippableRefIdRightGem,
    catalogAddress,
    `ipfs://gems/typeA/right.svg`,
    [],
  );
  await gem.addEquippableAssetEntry(
    assetForGemBFull,
    noEquippableGroup,
    catalogAddress,
    `ipfs://gems/typeB/full.svg`,
    [],
  );
  await gem.addEquippableAssetEntry(
    assetForGemBLeft,
    equippableRefIdLeftGem,
    catalogAddress,
    `ipfs://gems/typeB/left.svg`,
    [],
  );
  await gem.addEquippableAssetEntry(
    assetForGemBMid,
    equippableRefIdMidGem,
    catalogAddress,
    `ipfs://gems/typeB/mid.svg`,
    [],
  );
  await gem.addEquippableAssetEntry(
    assetForGemBRight,
    equippableRefIdRightGem,
    catalogAddress,
    `ipfs://gems/typeB/right.svg`,
    [],
  );

  await gem.setValidParentForEquippableGroup(equippableRefIdLeftGem, kanariaAddress, slotIdGemLeft);
  await gem.setValidParentForEquippableGroup(equippableRefIdMidGem, kanariaAddress, slotIdGemMid);
  await gem.setValidParentForEquippableGroup(
    equippableRefIdRightGem,
    kanariaAddress,
    slotIdGemRight,
  );

  // We add assets of type A to gem 1 and 2, and type Bto gem 3. Both are nested into the first kanaria
  // This means gems 1 and 2 will have the same asset, which is totally valid.
  await gem.addAssetToToken(gemId1, assetForGemAFull, 0);
  await gem.addAssetToToken(gemId1, assetForGemALeft, 0);
  await gem.addAssetToToken(gemId1, assetForGemAMid, 0);
  await gem.addAssetToToken(gemId1, assetForGemARight, 0);
  await gem.addAssetToToken(gemId2, assetForGemAFull, 0);
  await gem.addAssetToToken(gemId2, assetForGemALeft, 0);
  await gem.addAssetToToken(gemId2, assetForGemAMid, 0);
  await gem.addAssetToToken(gemId2, assetForGemARight, 0);
  await gem.addAssetToToken(gemId3, assetForGemBFull, 0);
  await gem.addAssetToToken(gemId3, assetForGemBLeft, 0);
  await gem.addAssetToToken(gemId3, assetForGemBMid, 0);
  await gem.addAssetToToken(gemId3, assetForGemBRight, 0);

  // We accept them backwards to easily know the right indices
  await gem.acceptAsset(gemId1, 3, assetForGemARight);
  await gem.acceptAsset(gemId1, 2, assetForGemAMid);
  await gem.acceptAsset(gemId1, 1, assetForGemALeft);
  await gem.acceptAsset(gemId1, 0, assetForGemAFull);
  await gem.acceptAsset(gemId2, 3, assetForGemARight);
  await gem.acceptAsset(gemId2, 2, assetForGemAMid);
  await gem.acceptAsset(gemId2, 1, assetForGemALeft);
  await gem.acceptAsset(gemId2, 0, assetForGemAFull);
  await gem.acceptAsset(gemId3, 3, assetForGemBRight);
  await gem.acceptAsset(gemId3, 2, assetForGemBMid);
  await gem.acceptAsset(gemId3, 1, assetForGemBLeft);
  await gem.acceptAsset(gemId3, 0, assetForGemBFull);
}

describe('Render Utils', async function () {
  let owner: SignerWithAddress;
  let token: RMRKEquippableMock;
  let renderUtils: RMRKRenderUtils;

  beforeEach(async function () {
    ({ token, renderUtils } = await loadFixture(simpleRenderUtilsFixture));

    const signers = await ethers.getSigners();
    owner = signers[0];
  });

  it('can get pages of available ids', async function () {
    for (let i = 0; i < 9; i++) {
      await token.mint(owner.address, i + 1);
    }

    await token['burn(uint256)'](3);
    await token['burn(uint256)'](8);

    expect(await renderUtils.getPaginatedMintedIds(token.address, 1, 5)).to.eql([
      bn(1),
      bn(2),
      bn(4),
      bn(5),
    ]);
    expect(await renderUtils.getPaginatedMintedIds(token.address, 6, 10)).to.eql([
      bn(6),
      bn(7),
      bn(9),
    ]);
  });
});
