import { Contract } from 'ethers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import shouldBehaveLikeMultiAsset from '../behavior/multiasset';
import shouldControlValidMinting from '../behavior/mintingImpl';
import shouldHaveMetadata from '../behavior/metadata';
import shouldHaveRoyalties from '../behavior/royalties';
import {
  addAssetEntryEquippablesFromImpl,
  addAssetToToken,
  ADDRESS_ZERO,
  mintFromImplNativeToken,
  ONE_ETH,
} from '../utils';
import { RMRKExternalEquipImpl, RMRKNestableExternalEquipImpl } from '../../typechain-types';

const isTokenUriEnumerated = false;

// --------------- FIXTURES -----------------------

async function equipFixture() {
  const nestableFactory = await ethers.getContractFactory('RMRKNestableExternalEquipImpl');
  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipImpl');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const nestable = <RMRKNestableExternalEquipImpl>(
    await nestableFactory.deploy(
      ADDRESS_ZERO,
      'NestableWithEquippable',
      'NWE',
      'ipfs://collection-meta',
      'ipfs://tokenURI',
      [ADDRESS_ZERO, isTokenUriEnumerated, ADDRESS_ZERO, 1000, 10000, ONE_ETH],
    )
  );
  await nestable.deployed();

  const equip = <RMRKExternalEquipImpl>await equipFactory.deploy(nestable.address);
  await equip.deployed();

  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  await nestable.setEquippableAddress(equip.address);

  return { nestable, equip, renderUtils };
}

// --------------- END FIXTURES -----------------------

// --------------- MULTI ASSET BEHAVIOR -----------------------

describe('ExternalEquippableImpl MR behavior', async () => {
  let nestable: RMRKNestableExternalEquipImpl;
  let equip: RMRKExternalEquipImpl;
  let renderUtils: Contract;

  beforeEach(async function () {
    ({ nestable, equip, renderUtils } = await loadFixture(equipFixture));
    this.token = equip;
    this.renderUtils = renderUtils;
  });

  // Mint needs to happen on the nestable contract, but the MR behavior happens on the equip one.
  async function mintToNestable(token: Contract, to: string): Promise<number> {
    await nestable.mint(to, 1, { value: ONE_ETH });
    return (await nestable.totalSupply()).toNumber();
  }

  shouldBehaveLikeMultiAsset(mintToNestable, addAssetEntryEquippablesFromImpl, addAssetToToken);
});

// --------------- MULTI ASSET BEHAVIOR END ------------------------

describe('ExternalEquippableImpl Other', async function () {
  let nestable: RMRKNestableExternalEquipImpl;
  let equip: RMRKExternalEquipImpl;
  let owner: SignerWithAddress;
  let contributor: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    ({ nestable, equip } = await loadFixture(equipFixture));
    this.token = nestable;
    [owner, contributor, ...addrs] = await ethers.getSigners();
    await equip.addContributor(contributor.address);
  });

  it('auto accepts resource if send is token owner', async function () {
    await nestable.connect(owner).mint(owner.address, 1, { value: ONE_ETH.mul(1) });
    await equip.connect(owner).addEquippableAssetEntry(0, ADDRESS_ZERO, 'ipfs://test', []);
    const assetId = await equip.totalAssets();
    const tokenId = await nestable.totalSupply();
    await equip.connect(owner).addAssetToToken(tokenId, assetId, 0);

    expect(await equip.getPendingAssets(tokenId)).to.be.eql([]);
    expect(await equip.getActiveAssets(tokenId)).to.be.eql([assetId]);
  });

  it('cannot set equippable or nestable address if not owner', async function () {
    const [, notOwner, otherAddress] = await ethers.getSigners();
    await expect(
      nestable.connect(notOwner).setEquippableAddress(otherAddress.address),
    ).to.be.revertedWithCustomError(nestable, 'RMRKNotOwner');

    await expect(
      equip.connect(notOwner).setNestableAddress(otherAddress.address),
    ).to.be.revertedWithCustomError(nestable, 'RMRKNotOwner');
  });

  it('can set equippable or nestable address if owner', async function () {
    const [, newContract] = await ethers.getSigners();
    await expect(nestable.connect(owner).setEquippableAddress(newContract.address)).to.emit(
      nestable,
      'EquippableAddressSet',
    );

    await expect(equip.connect(owner).setNestableAddress(newContract.address)).to.emit(
      equip,
      'NestableAddressSet',
    );
  });

  it('can add asset entry if owner or contributor', async function () {
    await expect(equip.connect(owner).addAssetEntry('ipfs://test')).to.emit(equip, 'AssetSet');
    await expect(equip.connect(contributor).addAssetEntry('ipfs://test2')).to.emit(
      equip,
      'AssetSet',
    );
  });

  it('can set valid parent for equippable group if owner or contributor', async function () {
    await expect(
      equip.connect(owner).setValidParentForEquippableGroup(1, addrs[0].address, 1),
    ).to.emit(equip, 'ValidParentEquippableGroupIdSet');
    await expect(
      equip.connect(contributor).setValidParentForEquippableGroup(1, addrs[0].address, 1),
    ).to.emit(equip, 'ValidParentEquippableGroupIdSet');
  });

  it('cannot do admin functions if not owner or contributor', async function () {
    const otherSigner = addrs[0];
    await nestable.mint(owner.address, 1, { value: ONE_ETH.mul(1) });
    await equip.addAssetEntry('ipfs://test');
    const assetId = await equip.totalAssets();
    const tokenId = await nestable.totalSupply();

    await expect(
      equip.connect(otherSigner).addAssetToToken(tokenId, assetId, 0),
    ).to.be.revertedWithCustomError(equip, 'RMRKNotOwnerOrContributor');
    await expect(
      equip.connect(otherSigner).addAssetEntry('ipfs://test'),
    ).to.be.revertedWithCustomError(equip, 'RMRKNotOwnerOrContributor');
    await expect(
      equip.connect(otherSigner).addEquippableAssetEntry(0, ADDRESS_ZERO, 'ipfs://test', []),
    ).to.be.revertedWithCustomError(equip, 'RMRKNotOwnerOrContributor');
    await expect(
      equip.connect(otherSigner).setValidParentForEquippableGroup(1, addrs[1].address, 1),
    ).to.be.revertedWithCustomError(equip, 'RMRKNotOwnerOrContributor');
  });

  shouldControlValidMinting();
  shouldHaveRoyalties(mintFromImplNativeToken);
  shouldHaveMetadata(mintFromImplNativeToken, isTokenUriEnumerated);
});
