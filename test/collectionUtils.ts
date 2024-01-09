import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ADDRESS_ZERO, bn, mintFromMockPremint } from './utils';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import {
  RMRKCollectionUtils,
  RMRKEquippablePreMint,
  RMRKMultiAssetPreMint,
  RMRKNestableMultiAssetPreMint,
  RMRKNestableMultiAssetPreMintSoulbound,
} from '../typechain-types';

const maxSupply = bn(10000);
const royaltyBps = bn(500);
const collectionMeta = 'ipfs://collection-meta';

async function collectionUtilsFixture() {
  const deployer = (await ethers.getSigners())[0];
  const multiAssetFactory = await ethers.getContractFactory('RMRKMultiAssetPreMint');
  const nestableMultiAssetFactory = await ethers.getContractFactory(
    'RMRKNestableMultiAssetPreMint',
  );
  const nestableMultiAssetSoulboundFactory = await ethers.getContractFactory(
    'RMRKNestableMultiAssetPreMintSoulbound',
  );
  const equipFactory = await ethers.getContractFactory('RMRKEquippablePreMint');
  const collectionUtilsFactory = await ethers.getContractFactory('RMRKCollectionUtils');

  const multiAsset = <RMRKMultiAssetPreMint>(
    await multiAssetFactory.deploy(
      'MultiAsset',
      'MA',
      collectionMeta,
      maxSupply,
      await deployer.getAddress(),
      royaltyBps,
    )
  );
  await multiAsset.waitForDeployment();

  const nestableMultiAssetSoulbound = <RMRKNestableMultiAssetPreMintSoulbound>(
    await nestableMultiAssetSoulboundFactory.deploy(
      'NestableMultiAssetSoulbound',
      'NMAS',
      collectionMeta,
      maxSupply,
      await deployer.getAddress(),
      royaltyBps,
    )
  );
  await nestableMultiAssetSoulbound.waitForDeployment();

  const nestableMultiAsset = <RMRKNestableMultiAssetPreMint>(
    await nestableMultiAssetFactory.deploy(
      'NestableMultiAsset',
      'NMA',
      collectionMeta,
      maxSupply,
      await deployer.getAddress(),
      royaltyBps,
    )
  );
  await nestableMultiAsset.waitForDeployment();

  const equip = <RMRKEquippablePreMint>(
    await equipFactory.deploy(
      'Equippable',
      'EQ',
      collectionMeta,
      maxSupply,
      await deployer.getAddress(),
      royaltyBps,
    )
  );
  await equip.waitForDeployment();

  const collectionUtils = <RMRKCollectionUtils>await collectionUtilsFactory.deploy();
  await collectionUtils.waitForDeployment();

  return {
    multiAsset,
    nestableMultiAssetSoulbound,
    nestableMultiAsset,
    equip,
    collectionUtils,
  };
}

describe('Collection Utils', function () {
  let issuer: SignerWithAddress;
  let holder: SignerWithAddress;
  let multiAsset: RMRKMultiAssetPreMint;
  let nestableMultiAssetSoulbound: RMRKNestableMultiAssetPreMintSoulbound;
  let nestableMultiAsset: RMRKNestableMultiAssetPreMint;
  let equip: RMRKEquippablePreMint;
  let collectionUtils: RMRKCollectionUtils;

  beforeEach(async function () {
    ({ multiAsset, nestableMultiAsset, nestableMultiAssetSoulbound, equip, collectionUtils } =
      await loadFixture(collectionUtilsFixture));

    [issuer, holder] = await ethers.getSigners();
  });

  it('can get collection data', async function () {
    await mintFromMockPremint(multiAsset, await holder.getAddress());
    await mintFromMockPremint(nestableMultiAsset, await holder.getAddress());
    await mintFromMockPremint(nestableMultiAssetSoulbound, await holder.getAddress());
    await mintFromMockPremint(equip, await holder.getAddress());

    expect(await collectionUtils.getCollectionData(await multiAsset.getAddress())).to.eql([
      1n,
      maxSupply,
      royaltyBps,
      await issuer.getAddress(),
      await issuer.getAddress(),
      'MultiAsset',
      'MA',
      collectionMeta,
    ]);

    expect(await collectionUtils.getCollectionData(await multiAsset.getAddress())).to.eql([
      1n,
      maxSupply,
      royaltyBps,
      await issuer.getAddress(),
      await issuer.getAddress(),
      'MultiAsset',
      'MA',
      collectionMeta,
    ]);

    expect(await collectionUtils.getCollectionData(await nestableMultiAsset.getAddress())).to.eql([
      1n,
      maxSupply,
      royaltyBps,
      await issuer.getAddress(),
      await issuer.getAddress(),
      'NestableMultiAsset',
      'NMA',
      collectionMeta,
    ]);

    expect(
      await collectionUtils.getCollectionData(await nestableMultiAssetSoulbound.getAddress()),
    ).to.eql([
      1n,
      maxSupply,
      royaltyBps,
      await issuer.getAddress(),
      await issuer.getAddress(),
      'NestableMultiAssetSoulbound',
      'NMAS',
      collectionMeta,
    ]);

    expect(await collectionUtils.getCollectionData(await equip.getAddress())).to.eql([
      1n,
      maxSupply,
      royaltyBps,
      await issuer.getAddress(),
      await issuer.getAddress(),
      'Equippable',
      'EQ',
      collectionMeta,
    ]);
  });

  it('can get different interface supports for collection', async function () {
    expect(await collectionUtils.getInterfaceSupport(await multiAsset.getAddress())).to.eql([
      true,
      true,
      false,
      false,
      false,
      true,
    ]);
    expect(await collectionUtils.getInterfaceSupport(await nestableMultiAsset.getAddress())).to.eql(
      [true, true, true, false, false, true],
    );
    expect(
      await collectionUtils.getInterfaceSupport(await nestableMultiAssetSoulbound.getAddress()),
    ).to.eql([true, true, true, false, true, true]);
    expect(await collectionUtils.getInterfaceSupport(await equip.getAddress())).to.eql([
      true,
      true,
      true,
      true,
      false,
      true,
    ]);
  });

  it('can get pages of available ids', async function () {
    await multiAsset.mint(await holder.getAddress(), 9, '');
    await multiAsset.connect(holder).burn(3);
    await multiAsset.connect(holder).burn(8);

    expect(await collectionUtils.getPaginatedMintedIds(await multiAsset.getAddress(), 1, 5)).to.eql(
      [bn(1), bn(2), bn(4), bn(5)],
    );
    expect(
      await collectionUtils.getPaginatedMintedIds(await multiAsset.getAddress(), 6, 10),
    ).to.eql([bn(6), bn(7), bn(9)]);
  });

  it('can trigger collection metadata update', async function () {
    await expect(
      collectionUtils
        .connect(issuer)
        .refreshCollectionTokensMetadata(await multiAsset.getAddress(), 1, 100),
    )
      .to.emit(collectionUtils, 'BatchMetadataUpdate')
      .withArgs(await multiAsset.getAddress(), 1, 100);
  });

  it('can trigger token metadata update', async function () {
    await expect(
      collectionUtils.connect(issuer).refreshTokenMetadata(await multiAsset.getAddress(), 1),
    )
      .to.emit(collectionUtils, 'MetadataUpdate')
      .withArgs(await multiAsset.getAddress(), 1);
  });

  it('does not emit event if contract address is not a contract', async function () {
    await expect(
      collectionUtils.connect(issuer).refreshCollectionTokensMetadata(ADDRESS_ZERO, 1, 100),
    ).to.not.emit(collectionUtils, 'BatchMetadataUpdate');
    await expect(collectionUtils.connect(issuer).refreshTokenMetadata(ADDRESS_ZERO, 1)).to.not.emit(
      collectionUtils,
      'MetadataUpdate',
    );
  });
});
