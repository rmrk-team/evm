import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ADDRESS_ZERO, bn, mintFromMockPremint } from './utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  RMRKCollectionUtils,
  RMRKEquippablePreMint,
  RMRKMultiAssetPreMint,
  RMRKNestableMultiAssetPreMint,
  RMRKNestableMultiAssetPreMintSoulbound,
} from '../typechain-types';
import { BigNumber } from 'ethers';

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
      deployer.address,
      royaltyBps,
    )
  );
  await multiAsset.deployed();

  const nestableMultiAssetSoulbound = <RMRKNestableMultiAssetPreMintSoulbound>(
    await nestableMultiAssetSoulboundFactory.deploy(
      'NestableMultiAssetSoulbound',
      'NMAS',
      collectionMeta,
      maxSupply,
      deployer.address,
      royaltyBps,
    )
  );
  await nestableMultiAssetSoulbound.deployed();

  const nestableMultiAsset = <RMRKNestableMultiAssetPreMint>(
    await nestableMultiAssetFactory.deploy(
      'NestableMultiAsset',
      'NMA',
      collectionMeta,
      maxSupply,
      deployer.address,
      royaltyBps,
    )
  );
  await nestableMultiAsset.deployed();

  const equip = <RMRKEquippablePreMint>(
    await equipFactory.deploy(
      'Equippable',
      'EQ',
      collectionMeta,
      maxSupply,
      deployer.address,
      royaltyBps,
    )
  );
  await equip.deployed();

  const collectionUtils = <RMRKCollectionUtils>await collectionUtilsFactory.deploy();
  await collectionUtils.deployed();

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
    await mintFromMockPremint(multiAsset, holder.address);
    await mintFromMockPremint(nestableMultiAsset, holder.address);
    await mintFromMockPremint(nestableMultiAssetSoulbound, holder.address);
    await mintFromMockPremint(equip, holder.address);

    expect(await collectionUtils.getCollectionData(multiAsset.address)).to.eql([
      BigNumber.from(1),
      maxSupply,
      royaltyBps,
      issuer.address,
      issuer.address,
      'MultiAsset',
      'MA',
      collectionMeta,
    ]);

    expect(await collectionUtils.getCollectionData(multiAsset.address)).to.eql([
      BigNumber.from(1),
      maxSupply,
      royaltyBps,
      issuer.address,
      issuer.address,
      'MultiAsset',
      'MA',
      collectionMeta,
    ]);

    expect(await collectionUtils.getCollectionData(nestableMultiAsset.address)).to.eql([
      BigNumber.from(1),
      maxSupply,
      royaltyBps,
      issuer.address,
      issuer.address,
      'NestableMultiAsset',
      'NMA',
      collectionMeta,
    ]);

    expect(await collectionUtils.getCollectionData(nestableMultiAssetSoulbound.address)).to.eql([
      BigNumber.from(1),
      maxSupply,
      royaltyBps,
      issuer.address,
      issuer.address,
      'NestableMultiAssetSoulbound',
      'NMAS',
      collectionMeta,
    ]);

    expect(await collectionUtils.getCollectionData(equip.address)).to.eql([
      BigNumber.from(1),
      maxSupply,
      royaltyBps,
      issuer.address,
      issuer.address,
      'Equippable',
      'EQ',
      collectionMeta,
    ]);
  });

  it('can get different interface supports for collection', async function () {
    expect(await collectionUtils.getInterfaceSupport(multiAsset.address)).to.eql([
      true,
      true,
      false,
      false,
      false,
      true,
    ]);
    expect(await collectionUtils.getInterfaceSupport(nestableMultiAsset.address)).to.eql([
      true,
      true,
      true,
      false,
      false,
      true,
    ]);
    expect(await collectionUtils.getInterfaceSupport(nestableMultiAssetSoulbound.address)).to.eql([
      true,
      true,
      true,
      false,
      true,
      true,
    ]);
    expect(await collectionUtils.getInterfaceSupport(equip.address)).to.eql([
      true,
      true,
      true,
      true,
      false,
      true,
    ]);
  });
});
