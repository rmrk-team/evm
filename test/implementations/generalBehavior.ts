import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  ERC20Mock,
  RMRKEquippableLazyMintErc20,
  RMRKEquippableLazyMintErc20Soulbound,
  RMRKEquippableLazyMintNative,
  RMRKEquippableLazyMintNativeSoulbound,
  RMRKEquippablePreMint,
  RMRKEquippablePreMintSoulbound,
  RMRKMultiAssetLazyMintErc20,
  RMRKMultiAssetLazyMintErc20Soulbound,
  RMRKMultiAssetLazyMintNative,
  RMRKMultiAssetLazyMintNativeSoulbound,
  RMRKMultiAssetPreMint,
  RMRKMultiAssetPreMintSoulbound,
  RMRKNestableLazyMintErc20,
  RMRKNestableLazyMintErc20Soulbound,
  RMRKNestableLazyMintNative,
  RMRKNestableLazyMintNativeSoulbound,
  RMRKNestableMultiAssetLazyMintErc20,
  RMRKNestableMultiAssetLazyMintErc20Soulbound,
  RMRKNestableMultiAssetLazyMintNative,
  RMRKNestableMultiAssetLazyMintNativeSoulbound,
  RMRKNestableMultiAssetPreMint,
  RMRKNestableMultiAssetPreMintSoulbound,
  RMRKNestablePreMint,
  RMRKNestablePreMintSoulbound,
} from '../../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import {
  IRMRKImplementation,
  IERC165,
  IERC721,
  IERC721Metadata,
  IERC2981,
  IERC5773,
  IERC7401,
  IERC6454,
  IERC6220,
} from '../interfaces';

export enum LegoCombination {
  None,
  MultiAsset,
  Nestable,
  NestableMultiAsset,
  Equippable,
  ERC721,
  ERC1155,
}

export enum MintingType {
  None,
  RMRKPreMint,
  RMRKLazyMintNativeToken,
  RMRKLazyMintERC20,
  Custom,
}

const pricePerMint = ethers.utils.parseEther('0.1');

describe('RMRKImplementations', async () => {
  const name = 'RmrkTest';
  const symbol = 'RMRKTST';
  const maxSupply = 10000;
  const collectionMetadataUri = 'ipfs://collection-meta';
  const baseTokenURI = 'ipfs://tokenURI/';

  let multiAssetPreMintImpl: RMRKMultiAssetPreMint;
  let multiAssetPreMintSoulboundImpl: RMRKMultiAssetPreMintSoulbound;
  let nestablePreMintImpl: RMRKNestablePreMint;
  let nestablePreMintSoulboundImpl: RMRKNestablePreMintSoulbound;
  let nestableMultiAssetPreMintImpl: RMRKNestableMultiAssetPreMint;
  let nestableMultiAssetPreMintSoulboundImpl: RMRKNestableMultiAssetPreMintSoulbound;
  let equippablePreMintImpl: RMRKEquippablePreMint;
  let equippablePreMintSoulboundImpl: RMRKEquippablePreMintSoulbound;
  let multiAssetLazyMintNativeImpl: RMRKMultiAssetLazyMintNative;
  let multiAssetLazyMintNativeSoulboundImpl: RMRKMultiAssetLazyMintNativeSoulbound;
  let nestableLazyMintNativeImpl: RMRKNestableLazyMintNative;
  let nestableLazyMintNativeSoulboundImpl: RMRKNestableLazyMintNativeSoulbound;
  let nestableMultiAssetLazyMintNativeImpl: RMRKNestableMultiAssetLazyMintNative;
  let nestableMultiAssetLazyMintNativeSoulboundImpl: RMRKNestableMultiAssetLazyMintNativeSoulbound;
  let equippableLazyMintNativeImpl: RMRKEquippableLazyMintNative;
  let equippableLazyMintNativeSoulboundImpl: RMRKEquippableLazyMintNativeSoulbound;
  let multiAssetLazyMintErc20Impl: RMRKMultiAssetLazyMintErc20;
  let multiAssetLazyMintErc20SoulboundImpl: RMRKMultiAssetLazyMintErc20Soulbound;
  let nestableLazyMintErc20Impl: RMRKNestableLazyMintErc20;
  let nestableLazyMintErc20SoulboundImpl: RMRKNestableLazyMintErc20Soulbound;
  let nestableMultiAssetLazyMintErc20Impl: RMRKNestableMultiAssetLazyMintErc20;
  let nestableMultiAssetLazyMintErc20SoulboundImpl: RMRKNestableMultiAssetLazyMintErc20Soulbound;
  let equippableLazyMintErc20Impl: RMRKEquippableLazyMintErc20;
  let equippableLazyMintErc20SoulboundImpl: RMRKEquippableLazyMintErc20Soulbound;
  let rmrkERC20: ERC20Mock;
  let owner: SignerWithAddress;
  let holder: SignerWithAddress;
  let royaltyRecipient: SignerWithAddress;

  async function deployImplementationsFixture() {
    const [owner, royaltyRecipient, holder, ...signersAddr] = await ethers.getSigners();

    const ERC20Factory = await ethers.getContractFactory('contracts/mocks/ERC20Mock.sol:ERC20Mock');
    const rmrkERC20 = <ERC20Mock>await ERC20Factory.deploy();
    await rmrkERC20.mint(owner.address, ethers.utils.parseEther('1000000'));

    // Pre Mint
    const multiAssetPreMintImplFactory = await ethers.getContractFactory('RMRKMultiAssetPreMint');
    const multiAssetPreMintSoulboundImplFactory = await ethers.getContractFactory(
      'RMRKMultiAssetPreMintSoulbound',
    );
    const nestablePreMintImplFactory = await ethers.getContractFactory('RMRKNestablePreMint');
    const nestablePreMintSoulboundImplFactory = await ethers.getContractFactory(
      'RMRKNestablePreMintSoulbound',
    );
    const nestableMultiAssetPreMintImplFactory = await ethers.getContractFactory(
      'RMRKNestableMultiAssetPreMint',
    );
    const nestableMultiAssetPreMintSoulboundImplFactory = await ethers.getContractFactory(
      'RMRKNestableMultiAssetPreMintSoulbound',
    );
    const equippablePreMintFactory = await ethers.getContractFactory('RMRKEquippablePreMint');
    const equippablePreMintSoulboundImplFactory = await ethers.getContractFactory(
      'RMRKEquippablePreMintSoulbound',
    );

    // Lazy Mint Native
    const multiAssetLazyMintNativeImplFactory = await ethers.getContractFactory(
      'RMRKMultiAssetLazyMintNative',
    );
    const multiAssetLazyMintNativeSoulboundImplFactory = await ethers.getContractFactory(
      'RMRKMultiAssetLazyMintNativeSoulbound',
    );
    const nestableLazyMintNativeImplFactory = await ethers.getContractFactory(
      'RMRKNestableLazyMintNative',
    );
    const nestableLazyMintNativeSoulboundImplFactory = await ethers.getContractFactory(
      'RMRKNestableLazyMintNativeSoulbound',
    );
    const nestableMultiAssetLazyMintNativeImplFactory = await ethers.getContractFactory(
      'RMRKNestableMultiAssetLazyMintNative',
    );
    const nestableMultiAssetLazyMintNativeSoulboundImplFactory = await ethers.getContractFactory(
      'RMRKNestableMultiAssetLazyMintNativeSoulbound',
    );
    const equippableLazyMintNativeImplFactory = await ethers.getContractFactory(
      'RMRKEquippableLazyMintNative',
    );
    const equippableLazyMintNativeSoulboundImplFactory = await ethers.getContractFactory(
      'RMRKEquippableLazyMintNativeSoulbound',
    );

    // Lazy Mint ERC20
    const multiAssetLazyMintErc20ImplFactory = await ethers.getContractFactory(
      'RMRKMultiAssetLazyMintErc20',
    );
    const multiAssetLazyMintErc20SoulboundImplFactory = await ethers.getContractFactory(
      'RMRKMultiAssetLazyMintErc20Soulbound',
    );
    const nestableLazyMintErc20ImplFactory = await ethers.getContractFactory(
      'RMRKNestableLazyMintErc20',
    );
    const nestableLazyMintErc20SoulboundImplFactory = await ethers.getContractFactory(
      'RMRKNestableLazyMintErc20Soulbound',
    );
    const nestableMultiAssetLazyMintErc20ImplFactory = await ethers.getContractFactory(
      'RMRKNestableMultiAssetLazyMintErc20',
    );
    const nestableMultiAssetLazyMintErc20SoulboundImplFactory = await ethers.getContractFactory(
      'RMRKNestableMultiAssetLazyMintErc20Soulbound',
    );
    const equippableLazyMintErc20ImplFactory = await ethers.getContractFactory(
      'RMRKEquippableLazyMintErc20',
    );
    const equippableLazyMintErc20SoulboundImplFactory = await ethers.getContractFactory(
      'RMRKEquippableLazyMintErc20Soulbound',
    );

    const deployArgsPreMint = [
      name,
      symbol,
      collectionMetadataUri,
      maxSupply,
      royaltyRecipient.address,
      500,
    ] as const;

    const deployArgsLazyMintERC20Pay = [
      name,
      symbol,
      collectionMetadataUri,
      baseTokenURI,
      {
        maxSupply,
        pricePerMint,
        royaltyPercentageBps: 500,
        royaltyRecipient: royaltyRecipient.address,
        erc20TokenAddress: ethers.constants.AddressZero,
      },
    ] as const;

    const deployArgsLazyMintNativePay = [
      name,
      symbol,
      collectionMetadataUri,
      baseTokenURI,
      {
        maxSupply,
        pricePerMint,
        royaltyPercentageBps: 500,
        royaltyRecipient: royaltyRecipient.address,
      },
    ] as const;

    const multiAssetPreMintImpl = <RMRKMultiAssetPreMint>(
      await multiAssetPreMintImplFactory.deploy(...deployArgsPreMint)
    );
    const multiAssetPreMintSoulboundImpl = <RMRKMultiAssetPreMintSoulbound>(
      await multiAssetPreMintSoulboundImplFactory.deploy(...deployArgsPreMint)
    );
    const nestablePreMintImpl = <RMRKNestablePreMint>(
      await nestablePreMintImplFactory.deploy(...deployArgsPreMint)
    );
    const nestablePreMintSoulboundImpl = <RMRKNestablePreMintSoulbound>(
      await nestablePreMintSoulboundImplFactory.deploy(...deployArgsPreMint)
    );
    const nestableMultiAssetPreMintImpl = <RMRKNestableMultiAssetPreMint>(
      await nestableMultiAssetPreMintImplFactory.deploy(...deployArgsPreMint)
    );
    const nestableMultiAssetPreMintSoulboundImpl = <RMRKNestableMultiAssetPreMintSoulbound>(
      await nestableMultiAssetPreMintSoulboundImplFactory.deploy(...deployArgsPreMint)
    );
    const equippablePreMintImpl = <RMRKEquippablePreMint>(
      await equippablePreMintFactory.deploy(...deployArgsPreMint)
    );
    const equippablePreMintSoulboundImpl = <RMRKEquippablePreMintSoulbound>(
      await equippablePreMintSoulboundImplFactory.deploy(...deployArgsPreMint)
    );

    const multiAssetLazyMintNativeImpl = <RMRKMultiAssetLazyMintNative>(
      await multiAssetLazyMintNativeImplFactory.deploy(...deployArgsLazyMintNativePay)
    );
    const multiAssetLazyMintNativeSoulboundImpl = <RMRKMultiAssetLazyMintNativeSoulbound>(
      await multiAssetLazyMintNativeSoulboundImplFactory.deploy(...deployArgsLazyMintNativePay)
    );
    const nestableLazyMintNativeImpl = <RMRKNestableMultiAssetLazyMintNative>(
      await nestableLazyMintNativeImplFactory.deploy(...deployArgsLazyMintNativePay)
    );
    const nestableLazyMintNativeSoulboundImpl = <RMRKNestableMultiAssetLazyMintNativeSoulbound>(
      await nestableLazyMintNativeSoulboundImplFactory.deploy(...deployArgsLazyMintNativePay)
    );
    const nestableMultiAssetLazyMintNativeImpl = <RMRKNestableMultiAssetLazyMintNative>(
      await nestableMultiAssetLazyMintNativeImplFactory.deploy(...deployArgsLazyMintNativePay)
    );
    const nestableMultiAssetLazyMintNativeSoulboundImpl = <
      RMRKNestableMultiAssetLazyMintNativeSoulbound
    >await nestableMultiAssetLazyMintNativeSoulboundImplFactory.deploy(
      ...deployArgsLazyMintNativePay,
    );
    const equippableLazyMintNativeImpl = <RMRKEquippableLazyMintNative>(
      await equippableLazyMintNativeImplFactory.deploy(...deployArgsLazyMintNativePay)
    );
    const equippableLazyMintNativeSoulboundImpl = <RMRKEquippableLazyMintNativeSoulbound>(
      await equippableLazyMintNativeSoulboundImplFactory.deploy(...deployArgsLazyMintNativePay)
    );

    // @ts-ignore
    deployArgsLazyMintERC20Pay[4].erc20TokenAddress = rmrkERC20.address;

    const multiAssetLazyMintErc20Impl = <RMRKMultiAssetLazyMintErc20>(
      await multiAssetLazyMintErc20ImplFactory.deploy(...deployArgsLazyMintERC20Pay)
    );
    const multiAssetLazyMintErc20SoulboundImpl = <RMRKMultiAssetLazyMintErc20Soulbound>(
      await multiAssetLazyMintErc20SoulboundImplFactory.deploy(...deployArgsLazyMintERC20Pay)
    );
    const nestableLazyMintErc20Impl = <RMRKNestableMultiAssetLazyMintErc20>(
      await nestableLazyMintErc20ImplFactory.deploy(...deployArgsLazyMintERC20Pay)
    );
    const nestableLazyMintErc20SoulboundImpl = <RMRKNestableMultiAssetLazyMintErc20Soulbound>(
      await nestableLazyMintErc20SoulboundImplFactory.deploy(...deployArgsLazyMintERC20Pay)
    );
    const nestableMultiAssetLazyMintErc20Impl = <RMRKNestableMultiAssetLazyMintErc20>(
      await nestableMultiAssetLazyMintErc20ImplFactory.deploy(...deployArgsLazyMintERC20Pay)
    );
    const nestableMultiAssetLazyMintErc20SoulboundImpl = <
      RMRKNestableMultiAssetLazyMintErc20Soulbound
    >await nestableMultiAssetLazyMintErc20SoulboundImplFactory.deploy(
      ...deployArgsLazyMintERC20Pay,
    );
    const equippableLazyMintErc20Impl = <RMRKEquippableLazyMintErc20>(
      await equippableLazyMintErc20ImplFactory.deploy(...deployArgsLazyMintERC20Pay)
    );
    const equippableLazyMintErc20SoulboundImpl = <RMRKEquippableLazyMintErc20Soulbound>(
      await equippableLazyMintErc20SoulboundImplFactory.deploy(...deployArgsLazyMintERC20Pay)
    );

    return {
      rmrkERC20,
      owner,
      holder,
      royaltyRecipient,
      equippableLazyMintErc20Impl,
      equippableLazyMintErc20SoulboundImpl,
      equippableLazyMintNativeImpl,
      equippableLazyMintNativeSoulboundImpl,
      equippablePreMintImpl,
      equippablePreMintSoulboundImpl,
      multiAssetLazyMintErc20Impl,
      multiAssetLazyMintErc20SoulboundImpl,
      multiAssetLazyMintNativeImpl,
      multiAssetLazyMintNativeSoulboundImpl,
      multiAssetPreMintImpl,
      multiAssetPreMintSoulboundImpl,
      nestableLazyMintErc20Impl,
      nestableLazyMintErc20SoulboundImpl,
      nestableLazyMintNativeImpl,
      nestableLazyMintNativeSoulboundImpl,
      nestablePreMintImpl,
      nestablePreMintSoulboundImpl,
      nestableMultiAssetLazyMintErc20Impl,
      nestableMultiAssetLazyMintErc20SoulboundImpl,
      nestableMultiAssetLazyMintNativeImpl,
      nestableMultiAssetLazyMintNativeSoulboundImpl,
      nestableMultiAssetPreMintImpl,
      nestableMultiAssetPreMintSoulboundImpl,
    };
  }

  beforeEach(async function () {
    ({
      owner,
      holder,
      royaltyRecipient,
      rmrkERC20,
      equippableLazyMintErc20Impl,
      equippableLazyMintErc20SoulboundImpl,
      equippableLazyMintNativeImpl,
      equippableLazyMintNativeSoulboundImpl,
      equippablePreMintImpl,
      equippablePreMintSoulboundImpl,
      multiAssetLazyMintErc20Impl,
      multiAssetLazyMintErc20SoulboundImpl,
      multiAssetLazyMintNativeImpl,
      multiAssetLazyMintNativeSoulboundImpl,
      multiAssetPreMintImpl,
      multiAssetPreMintSoulboundImpl,
      nestableLazyMintErc20Impl,
      nestableLazyMintErc20SoulboundImpl,
      nestableLazyMintNativeImpl,
      nestableLazyMintNativeSoulboundImpl,
      nestablePreMintImpl,
      nestablePreMintSoulboundImpl,
      nestableMultiAssetLazyMintErc20Impl,
      nestableMultiAssetLazyMintErc20SoulboundImpl,
      nestableMultiAssetLazyMintNativeImpl,
      nestableMultiAssetLazyMintNativeSoulboundImpl,
      nestableMultiAssetPreMintImpl,
      nestableMultiAssetPreMintSoulboundImpl,
    } = await loadFixture(deployImplementationsFixture));
    this.owner = owner;
    this.holder = holder;
    this.royaltyRecipient = royaltyRecipient;
    this.rmrkERC20 = rmrkERC20;
  });

  describe('RMRKMultiAssetPreMint', async () => {
    beforeEach(async function () {
      this.contract = multiAssetPreMintImpl;
    });

    testInterfaceSupport(LegoCombination.MultiAsset, false);
    testMultiAssetBehavior(MintingType.RMRKPreMint);
    testGeneralBehavior(MintingType.RMRKPreMint);
  });

  describe('RMRKMultiAssetPreMintSoulbound', async () => {
    beforeEach(async function () {
      this.contract = multiAssetPreMintSoulboundImpl;
    });

    testInterfaceSupport(LegoCombination.MultiAsset, true);
    testMultiAssetBehavior(MintingType.RMRKPreMint);
    testGeneralBehavior(MintingType.RMRKPreMint);
  });

  describe('RMRKNestableLazyMintErc20', async () => {
    beforeEach(async function () {
      this.contract = nestableLazyMintErc20Impl;
    });

    testInterfaceSupport(LegoCombination.Nestable, false);
    testGeneralBehavior(MintingType.RMRKLazyMintERC20);
  });

  describe('RMRKNestableLazyMintErc20Soulbound', async () => {
    beforeEach(async function () {
      this.contract = nestableLazyMintErc20SoulboundImpl;
    });

    testInterfaceSupport(LegoCombination.Nestable, true);
    testGeneralBehavior(MintingType.RMRKLazyMintERC20);
  });

  describe('RMRKNestableMultiAssetPreMint', async () => {
    beforeEach(async function () {
      this.contract = nestableMultiAssetPreMintImpl;
    });

    testInterfaceSupport(LegoCombination.NestableMultiAsset, false);
    testMultiAssetBehavior(MintingType.RMRKPreMint);
    testGeneralBehavior(MintingType.RMRKPreMint);
  });

  describe('RMRKNestableMultiAssetPreMintSoulbound', async () => {
    beforeEach(async function () {
      this.contract = nestableMultiAssetPreMintSoulboundImpl;
    });

    testInterfaceSupport(LegoCombination.NestableMultiAsset, true);
    testMultiAssetBehavior(MintingType.RMRKPreMint);
    testGeneralBehavior(MintingType.RMRKPreMint);
  });

  describe('RMRKEquippablePreMint', async () => {
    beforeEach(async function () {
      this.contract = equippablePreMintImpl;
    });

    testInterfaceSupport(LegoCombination.Equippable, false);
    testMultiAssetBehavior(MintingType.RMRKPreMint);
    testEquippableBehavior(MintingType.RMRKPreMint);
    testGeneralBehavior(MintingType.RMRKPreMint);
  });

  describe('RMRKEquippablePreMintSoulbound', async () => {
    beforeEach(async function () {
      this.contract = equippablePreMintSoulboundImpl;
    });

    testInterfaceSupport(LegoCombination.Equippable, true);
    testMultiAssetBehavior(MintingType.RMRKPreMint);
    testEquippableBehavior(MintingType.RMRKPreMint);
    testGeneralBehavior(MintingType.RMRKPreMint);
  });

  describe('RMRKMultiAssetLazyMintNative', async () => {
    beforeEach(async function () {
      this.contract = multiAssetLazyMintNativeImpl;
    });

    testInterfaceSupport(LegoCombination.MultiAsset, false);
    testMultiAssetBehavior(MintingType.RMRKLazyMintNativeToken);
    testGeneralBehavior(MintingType.RMRKLazyMintNativeToken);
  });

  describe('RMRKMultiAssetLazyMintNativeSoulbound', async () => {
    beforeEach(async function () {
      this.contract = multiAssetLazyMintNativeSoulboundImpl;
    });

    testInterfaceSupport(LegoCombination.MultiAsset, true);
    testMultiAssetBehavior(MintingType.RMRKLazyMintNativeToken);
    testGeneralBehavior(MintingType.RMRKLazyMintNativeToken);
  });

  describe('RMRKNestableLazyMintNative', async () => {
    beforeEach(async function () {
      this.contract = nestableLazyMintNativeImpl;
    });

    testInterfaceSupport(LegoCombination.Nestable, false);
    testGeneralBehavior(MintingType.RMRKLazyMintNativeToken);
  });

  describe('RMRKNestableLazyMintNativeSoulbound', async () => {
    beforeEach(async function () {
      this.contract = nestableLazyMintNativeSoulboundImpl;
    });

    testInterfaceSupport(LegoCombination.Nestable, true);
    testGeneralBehavior(MintingType.RMRKLazyMintNativeToken);
  });

  describe('RMRKNestableMultiAssetLazyMintNative', async () => {
    beforeEach(async function () {
      this.contract = nestableMultiAssetLazyMintNativeImpl;
    });

    testInterfaceSupport(LegoCombination.NestableMultiAsset, false);
    testMultiAssetBehavior(MintingType.RMRKLazyMintNativeToken);
    testGeneralBehavior(MintingType.RMRKLazyMintNativeToken);
  });

  describe('RMRKNestableMultiAssetLazyMintNativeSoulbound', async () => {
    beforeEach(async function () {
      this.contract = nestableMultiAssetLazyMintNativeSoulboundImpl;
    });

    testInterfaceSupport(LegoCombination.NestableMultiAsset, true);
    testMultiAssetBehavior(MintingType.RMRKLazyMintNativeToken);
    testGeneralBehavior(MintingType.RMRKLazyMintNativeToken);
  });

  describe('RMRKEquippableLazyMintNative', async () => {
    beforeEach(async function () {
      this.contract = equippableLazyMintNativeImpl;
    });

    testInterfaceSupport(LegoCombination.Equippable, false);
    testMultiAssetBehavior(MintingType.RMRKLazyMintNativeToken);
    testEquippableBehavior(MintingType.RMRKLazyMintNativeToken);
    testGeneralBehavior(MintingType.RMRKLazyMintNativeToken);
  });

  describe('RMRKEquippableLazyMintNativeSoulbound', async () => {
    beforeEach(async function () {
      this.contract = equippableLazyMintNativeSoulboundImpl;
    });

    testInterfaceSupport(LegoCombination.Equippable, true);
    testMultiAssetBehavior(MintingType.RMRKLazyMintNativeToken);
    testEquippableBehavior(MintingType.RMRKLazyMintNativeToken);
    testGeneralBehavior(MintingType.RMRKLazyMintNativeToken);
  });

  describe('RMRKNestableMultiAssetLazyMintErc20', async () => {
    beforeEach(async function () {
      this.contract = nestableMultiAssetLazyMintErc20Impl;
    });

    testInterfaceSupport(LegoCombination.NestableMultiAsset, false);
    testMultiAssetBehavior(MintingType.RMRKLazyMintERC20);
    testGeneralBehavior(MintingType.RMRKLazyMintERC20);
  });

  describe('RMRKMultiAssetLazyMintErc20', async () => {
    beforeEach(async function () {
      this.contract = multiAssetLazyMintErc20Impl;
    });

    testInterfaceSupport(LegoCombination.MultiAsset, false);
    testMultiAssetBehavior(MintingType.RMRKLazyMintERC20);
    testGeneralBehavior(MintingType.RMRKLazyMintERC20);
  });

  describe('RMRKMultiAssetLazyMintErc20Soulbound', async () => {
    beforeEach(async function () {
      this.contract = multiAssetLazyMintErc20SoulboundImpl;
    });

    testInterfaceSupport(LegoCombination.MultiAsset, true);
    testMultiAssetBehavior(MintingType.RMRKLazyMintERC20);
    testGeneralBehavior(MintingType.RMRKLazyMintERC20);
  });

  describe('RMRKNestablePreMint', async () => {
    beforeEach(async function () {
      this.contract = nestablePreMintImpl;
    });

    testInterfaceSupport(LegoCombination.Nestable, false);
    testGeneralBehavior(MintingType.RMRKPreMint);
  });

  describe('RMRKNestablePreMintSoulbound', async () => {
    beforeEach(async function () {
      this.contract = nestablePreMintSoulboundImpl;
    });

    testInterfaceSupport(LegoCombination.Nestable, true);
    testGeneralBehavior(MintingType.RMRKPreMint);
  });

  describe('RMRKNestableMultiAssetLazyMintErc20Soulbound', async () => {
    beforeEach(async function () {
      this.contract = nestableMultiAssetLazyMintErc20SoulboundImpl;
    });

    testInterfaceSupport(LegoCombination.NestableMultiAsset, true);
    testMultiAssetBehavior(MintingType.RMRKLazyMintERC20);
    testGeneralBehavior(MintingType.RMRKLazyMintERC20);
  });

  describe('RMRKEquippableLazyMintErc20', async () => {
    beforeEach(async function () {
      this.contract = equippableLazyMintErc20Impl;
    });

    testInterfaceSupport(LegoCombination.Equippable, false);
    testMultiAssetBehavior(MintingType.RMRKLazyMintERC20);
    testEquippableBehavior(MintingType.RMRKLazyMintERC20);
    testGeneralBehavior(MintingType.RMRKLazyMintERC20);
  });

  describe('RMRKEquippableLazyMintErc20Soulbound', async () => {
    beforeEach(async function () {
      this.contract = equippableLazyMintErc20SoulboundImpl;
    });

    testInterfaceSupport(LegoCombination.Equippable, true);
    testMultiAssetBehavior(MintingType.RMRKLazyMintERC20);
    testEquippableBehavior(MintingType.RMRKLazyMintERC20);
    testGeneralBehavior(MintingType.RMRKLazyMintERC20);
  });
});

async function testInterfaceSupport(legoCombination: LegoCombination, isSoulbound: boolean) {
  let contract: Contract;

  beforeEach(async function () {
    contract = this.contract;
  });

  describe('Interface Support', async function () {
    it('supports basic interfaces', async function () {
      expect(await contract.supportsInterface(IERC165)).to.be.true;
      expect(await contract.supportsInterface(IERC721)).to.be.true;
      expect(await contract.supportsInterface(IERC721Metadata)).to.be.true;
    });

    it('supports RMRK interfaces', async function () {
      expect(await contract.supportsInterface(IRMRKImplementation)).to.be.true;
      expect(await contract.supportsInterface(IERC2981)).to.be.true;
      if (
        [
          LegoCombination.MultiAsset,
          LegoCombination.NestableMultiAsset,
          LegoCombination.Equippable,
        ].includes(legoCombination)
      ) {
        expect(await contract.supportsInterface(IERC5773)).to.be.true;
      } else {
        expect(await contract.supportsInterface(IERC5773)).to.be.false;
      }

      if (
        [
          LegoCombination.Equippable,
          LegoCombination.Nestable,
          LegoCombination.NestableMultiAsset,
        ].includes(legoCombination)
      ) {
        expect(await contract.supportsInterface(IERC7401)).to.be.true;
      } else {
        expect(await contract.supportsInterface(IERC7401)).to.be.false;
      }

      if (legoCombination == LegoCombination.Equippable) {
        expect(await contract.supportsInterface(IERC6220)).to.be.true;
      } else {
        expect(await contract.supportsInterface(IERC6220)).to.be.false;
      }

      if (isSoulbound) {
        expect(await contract.supportsInterface(IERC6454)).to.be.true;
      } else {
        expect(await contract.supportsInterface(IERC6454)).to.be.false;
      }
    });

    it('does not support a random interface', async function () {
      expect(await contract.supportsInterface('0xffffffff')).to.be.false;
    });
  });
}

async function testMultiAssetBehavior(mintingType: MintingType) {
  let contract: Contract;
  let owner: SignerWithAddress;
  let holder: SignerWithAddress;
  let rmrkERC20: ERC20Mock;

  beforeEach(async function () {
    contract = this.contract;
    owner = this.owner;
    holder = this.holder;
    rmrkERC20 = this.rmrkERC20;
  });

  describe('Add assets Behavior', async function () {
    it('cannot add assets if not owner or contributor', async function () {
      await expect(
        contract.connect(holder).addAssetEntry('metadata'),
      ).to.be.revertedWithCustomError(contract, 'RMRKNotOwnerOrContributor');
    });

    it('cannot add asset to token if not owner or contributor', async function () {
      await mint(holder.address, contract, owner, rmrkERC20, mintingType);
      await contract.connect(owner).addAssetEntry('metadata');
      const assetId = await contract.totalAssets();
      const tokenId = await contract.totalSupply();
      await expect(
        contract.connect(holder).addAssetToToken(tokenId, assetId, 0),
      ).to.be.revertedWithCustomError(contract, 'RMRKNotOwnerOrContributor');
    });
  });

  describe('Auto Accept Behavior', async function () {
    it('auto accepts the first asset', async function () {
      await mint(holder.address, contract, owner, rmrkERC20, mintingType);
      await contract.addAssetEntry('metadata');
      await contract.connect(owner).addAssetToToken(1, 1, 0);

      expect(await contract.getActiveAssets(1)).to.eql([ethers.BigNumber.from(1)]);
    });

    it('auto accepts the other assets if sender is the holder', async function () {
      await mint(owner.address, contract, owner, rmrkERC20, mintingType);
      await contract.addAssetEntry('metadata');
      await contract.addAssetEntry('metadata2');
      await contract.connect(owner).addAssetToToken(1, 1, 0);
      await contract.connect(owner).addAssetToToken(1, 2, 0);
      expect(await contract.getActiveAssets(1)).to.eql([
        ethers.BigNumber.from(1),
        ethers.BigNumber.from(2),
      ]);
    });

    it('does not auto accept the second asset', async function () {
      await mint(holder.address, contract, owner, rmrkERC20, mintingType);
      await contract.addAssetEntry('metadata');
      await contract.addAssetEntry('metadata');
      await contract.connect(owner).addAssetToToken(1, 1, 0);
      await contract.connect(owner).addAssetToToken(1, 2, 0);

      expect(await contract.getActiveAssets(1)).to.eql([ethers.BigNumber.from(1)]);
    });
  });
}

async function testEquippableBehavior(mintingType: MintingType) {
  let contract: Contract;
  let owner: SignerWithAddress;
  let holder: SignerWithAddress;
  let rmrkERC20: ERC20Mock;

  beforeEach(async function () {
    contract = this.contract;
    owner = this.owner;
    holder = this.holder;
    rmrkERC20 = this.rmrkERC20;
  });

  describe('Equippable Behavior', async function () {
    it('can add equippable assets', async function () {
      await mint(holder.address, contract, owner, rmrkERC20, mintingType);
      const equippableGroupId = 1;
      const catalogAddress = rmrkERC20.address; // Could be any address
      const metadataURI = 'ipfs://asset-metadata';
      const partIds = [1, 2, 3];
      await contract.addEquippableAssetEntry(
        equippableGroupId,
        catalogAddress,
        metadataURI,
        partIds,
      );
      const assetId = await contract.totalAssets();
      const tokenId = await contract.totalSupply();

      await contract.connect(owner).addAssetToToken(tokenId, assetId, 0);
      expect(await contract.getAssetAndEquippableData(tokenId, assetId)).to.eql([
        metadataURI,
        BigNumber.from(equippableGroupId),
        catalogAddress,
        partIds.map(BigNumber.from),
      ]);
    });

    it('can set valid parent for equippable group', async function () {
      const equippableGroupId = 1;
      const partId = 10;
      await expect(
        contract.setValidParentForEquippableGroup(equippableGroupId, contract.address, partId),
      )
        .to.emit(contract, 'ValidParentEquippableGroupIdSet')
        .withArgs(equippableGroupId, partId, contract.address);
    });

    it('cannot add equippable assets if not owner or contributor', async function () {
      await expect(
        contract
          .connect(holder)
          .addEquippableAssetEntry(1, rmrkERC20.address, 'ipfs://asset-metadata', [1, 2, 3]),
      ).to.be.revertedWithCustomError(contract, 'RMRKNotOwnerOrContributor');
    });

    it('cannot set valid parent for equippable group if not owner or contributor', async function () {
      const equippableGroupId = 1;
      const partId = 10;
      await expect(
        contract
          .connect(holder)
          .setValidParentForEquippableGroup(equippableGroupId, contract.address, partId),
      ).to.be.revertedWithCustomError(contract, 'RMRKNotOwnerOrContributor');
    });
  });
}

async function testGeneralBehavior(mintingType: MintingType) {
  let contract: Contract;
  let owner: SignerWithAddress;
  let holder: SignerWithAddress;
  let royaltyRecipient: SignerWithAddress;
  let rmrkERC20: ERC20Mock;

  beforeEach(async function () {
    contract = this.contract;
    owner = this.owner;
    holder = this.holder;
    royaltyRecipient = this.royaltyRecipient;
    rmrkERC20 = this.rmrkERC20;
  });

  describe('General Behavior', async function () {
    it('can update royalties recepient if owner or owner', async function () {
      await contract.connect(owner).updateRoyaltyRecipient(holder.address);
      expect(await contract.getRoyaltyRecipient()).to.eql(holder.address);
    });

    it('cannot update royalties recepient if owner or owner', async function () {
      await expect(
        contract.connect(holder).updateRoyaltyRecipient(holder.address),
      ).to.be.revertedWithCustomError(contract, 'RMRKNotOwner');
    });

    it('reduces total supply on burn and id not reduced', async function () {
      await mint(holder.address, contract, owner, rmrkERC20, mintingType);
      await contract.connect(holder)['burn(uint256)'](1);
      expect(await contract.totalSupply()).to.eql(BigNumber.from(0));

      await mint(holder.address, contract, owner, rmrkERC20, mintingType);
      expect(await contract.ownerOf(2)).to.eql(holder.address);
    });

    it('cannot burn if not token owner', async function () {
      await mint(holder.address, contract, owner, rmrkERC20, mintingType);
      const expectedError = (await contract.supportsInterface(IERC7401))
        ? 'RMRKNotApprovedOrDirectOwner'
        : 'ERC721NotApprovedOrOwner';
      await expect(contract.connect(owner)['burn(uint256)'](1)).to.be.revertedWithCustomError(
        contract,
        expectedError,
      );
    });

    it('cannot mint 0 tokens', async function () {
      if (mintingType == MintingType.RMRKPreMint) {
        await expect(
          contract.connect(owner).mint(holder.address, 0, 'ipfs://tokenURI'),
        ).to.be.revertedWithCustomError(contract, 'RMRKMintZero');
      } else if (mintingType == MintingType.RMRKLazyMintNativeToken) {
        await expect(
          contract.connect(owner).mint(holder.address, 0, { value: pricePerMint }),
        ).to.be.revertedWithCustomError(contract, 'RMRKMintZero');
      } else if (mintingType == MintingType.RMRKLazyMintERC20) {
        await rmrkERC20.connect(owner).approve(contract.address, pricePerMint);
        await expect(contract.connect(owner).mint(holder.address, 0)).to.be.revertedWithCustomError(
          contract,
          'RMRKMintZero',
        );
      }
    });

    it('has expected tokenURI', async function () {
      await mint(holder.address, contract, owner, rmrkERC20, mintingType);
      if (mintingType == MintingType.RMRKPreMint) {
        expect(await contract.tokenURI(1)).to.eql('ipfs://tokenURI');
      } else {
        expect(await contract.tokenURI(1)).to.eql('ipfs://tokenURI/1');
      }
    });

    it('can get price per mint', async function () {
      if (
        mintingType == MintingType.RMRKLazyMintERC20 ||
        mintingType == MintingType.RMRKLazyMintNativeToken
      ) {
        expect(await contract.pricePerMint()).to.eql(pricePerMint);
      }
    });

    it('can withdraw raised', async function () {
      await mint(holder.address, contract, owner, rmrkERC20, mintingType);
      await mint(holder.address, contract, owner, rmrkERC20, mintingType);
      if (mintingType == MintingType.RMRKLazyMintNativeToken) {
        const balanceBefore = await holder.getBalance();
        await contract.connect(owner).withdrawRaised(holder.address, pricePerMint.mul(2));
        const balanceAfter = await holder.getBalance();
        expect(balanceAfter).to.eql(balanceBefore.add(pricePerMint.mul(2)));
      } else if (mintingType == MintingType.RMRKLazyMintERC20) {
        const balanceBefore = await rmrkERC20.balanceOf(holder.address);
        await contract
          .connect(owner)
          .withdrawRaisedERC20(rmrkERC20.address, holder.address, pricePerMint.mul(2));
        const balanceAfter = await rmrkERC20.balanceOf(holder.address);
        expect(balanceAfter).to.eql(balanceBefore.add(pricePerMint.mul(2)));
      } else {
        // premint collects nothing
      }
    });

    it('cannot withdraw raised if not owner', async function () {
      await mint(holder.address, contract, owner, rmrkERC20, mintingType);
      if (mintingType == MintingType.RMRKLazyMintNativeToken) {
        await expect(
          contract.connect(holder).withdrawRaised(holder.address, pricePerMint),
        ).to.be.revertedWithCustomError(contract, 'RMRKNotOwner');
      } else if (mintingType == MintingType.RMRKLazyMintERC20) {
        await expect(
          contract
            .connect(holder)
            .withdrawRaisedERC20(rmrkERC20.address, holder.address, pricePerMint),
        ).to.be.revertedWithCustomError(contract, 'RMRKNotOwner');
      } else {
        // premint collects nothing
      }
    });
  });

  describe('Royalties', async function () {
    it('can get royalty recipient and percentage', async function () {
      expect(await contract.getRoyaltyRecipient()).to.eql(royaltyRecipient.address);
      expect(await contract.getRoyaltyPercentage()).to.eql(BigNumber.from(500));
    });

    it('can get royalty info for token', async function () {
      await mint(holder.address, contract, owner, rmrkERC20, mintingType);
      expect(await contract.royaltyInfo(1, BigNumber.from(100))).to.eql([
        royaltyRecipient.address,
        BigNumber.from(5),
      ]);
    });
  });
}

async function mint(
  to: string,
  contract: Contract,
  owner: SignerWithAddress,
  rmrkERC20: ERC20Mock,
  mintingType: MintingType,
) {
  if (mintingType == MintingType.RMRKPreMint) {
    await contract.connect(owner).mint(to, 1, 'ipfs://tokenURI');
  } else if (mintingType == MintingType.RMRKLazyMintNativeToken) {
    await contract.connect(owner).mint(to, 1, { value: pricePerMint });
  } else if (mintingType == MintingType.RMRKLazyMintERC20) {
    await rmrkERC20.connect(owner).approve(contract.address, pricePerMint);
    await contract.connect(owner).mint(to, 1);
  }
}
