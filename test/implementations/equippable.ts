import { BigNumber, Contract } from 'ethers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
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
import { RMRKEquippableImpl, RMRKMultiAssetRenderUtils } from '../../typechain-types';
import {
  IERC5773,
  IERC6059,
  IERC6220,
  IERC721,
  IERC721Metadata,
  IRMRKImplementation,
} from '../interfaces';

const isTokenUriEnumerated = false;

// --------------- FIXTURES -----------------------

async function equipFixture() {
  const equipFactory = await ethers.getContractFactory('RMRKEquippableImpl');
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');

  const equip = <RMRKEquippableImpl>(
    await equipFactory.deploy(
      'equipWithEquippable',
      'NWE',
      'ipfs://collection-meta',
      'ipfs://tokenURI',
      [ADDRESS_ZERO, isTokenUriEnumerated, ADDRESS_ZERO, 1000, 10000, ONE_ETH],
    )
  );
  await equip.deployed();

  const renderUtils = <RMRKMultiAssetRenderUtils>await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  return { equip, renderUtils };
}

// --------------- END FIXTURES -----------------------

// --------------- MULTI ASSET BEHAVIOR -----------------------

describe('RMRKEquippableImpl MR behavior', async () => {
  let equip: RMRKEquippableImpl;
  let renderUtils: RMRKMultiAssetRenderUtils;

  beforeEach(async function () {
    ({ equip, renderUtils } = await loadFixture(equipFixture));
    this.token = equip;
    this.renderUtils = renderUtils;
  });

  async function mintToNestable(token: Contract, to: string): Promise<BigNumber> {
    await equip.mint(to, 1, { value: ONE_ETH });
    return await equip.totalSupply();
  }

  shouldBehaveLikeMultiAsset(mintToNestable, addAssetEntryEquippablesFromImpl, addAssetToToken);
});

// --------------- MULTI ASSET BEHAVIOR END ------------------------

describe('RMRKEquippableImpl Other', async function () {
  let equip: RMRKEquippableImpl;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    ({ equip } = await loadFixture(equipFixture));
    this.token = equip;
    owner = (await ethers.getSigners())[0];
  });

  describe('Init', async function () {
    it('can get names and symbols', async function () {
      expect(await equip.name()).to.equal('equipWithEquippable');
      expect(await equip.symbol()).to.equal('NWE');
    });
  });

  it('can support expected interfaces', async function () {
    expect(await equip.supportsInterface(IERC721)).to.equal(true);
    expect(await equip.supportsInterface(IERC721Metadata)).to.equal(true);
    expect(await equip.supportsInterface(IERC5773)).to.equal(true);
    expect(await equip.supportsInterface(IERC6059)).to.equal(true);
    expect(await equip.supportsInterface(IERC6220)).to.equal(true);
    expect(await equip.supportsInterface(IRMRKImplementation)).to.equal(true);
  });

  it('auto accepts resource if send is token owner', async function () {
    await equip.connect(owner).mint(owner.address, 1, { value: ONE_ETH.mul(1) });
    await equip.connect(owner).addEquippableAssetEntry(0, ADDRESS_ZERO, 'ipfs://test', []);
    const assetId = await equip.totalAssets();
    const tokenId = await equip.totalSupply();
    await equip.connect(owner).addAssetToToken(tokenId, assetId, 0);

    expect(await equip.getPendingAssets(tokenId)).to.be.eql([]);
    expect(await equip.getActiveAssets(tokenId)).to.be.eql([assetId]);
  });

  shouldControlValidMinting();
  shouldHaveRoyalties(mintFromImplNativeToken);
  shouldHaveMetadata(mintFromImplNativeToken, isTokenUriEnumerated);
});
