import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { Contract, ContractTransactionResponse, EventLog } from 'ethers';
import { ethers } from 'hardhat';
import {
  ERC20Mock,
  RMRKAbstractEquippable,
  RMRKAbstractMultiAsset,
  RMRKAbstractNestable,
  RMRKAbstractNestableMultiAsset,
  RMRKCatalogImpl,
  RMRKEquippableLazyMintErc20,
  RMRKEquippableLazyMintErc20Soulbound,
  RMRKEquippableLazyMintNative,
  RMRKEquippableLazyMintNativeSoulbound,
  RMRKEquippableMock,
  RMRKEquippablePreMint,
  RMRKEquippablePreMintSoulbound,
  RMRKMinifiedEquippableMock,
  RMRKMultiAssetLazyMintErc20,
  RMRKMultiAssetLazyMintErc20Soulbound,
  RMRKMultiAssetLazyMintNative,
  RMRKMultiAssetLazyMintNativeSoulbound,
  RMRKMultiAssetMock,
  RMRKMultiAssetPreMint,
  RMRKMultiAssetPreMintSoulbound,
  RMRKNestableLazyMintErc20,
  RMRKNestableLazyMintErc20Soulbound,
  RMRKNestableLazyMintNative,
  RMRKNestableLazyMintNativeSoulbound,
  RMRKNestableMock,
  RMRKNestableMultiAssetLazyMintErc20,
  RMRKNestableMultiAssetLazyMintErc20Soulbound,
  RMRKNestableMultiAssetLazyMintNative,
  RMRKNestableMultiAssetLazyMintNativeSoulbound,
  RMRKNestableMultiAssetMock,
  RMRKNestableMultiAssetPreMint,
  RMRKNestableMultiAssetPreMintSoulbound,
  RMRKNestablePreMint,
  RMRKNestablePreMintSoulbound,
  RMRKNestableTypedMultiAssetMock,
  RMRKTypedEquippableMock,
  RMRKTypedMultiAssetMock,
} from '../typechain-types';

let nextTokenId = 1;
let nextChildTokenId = 100;
const ONE_ETH = ethers.parseEther('1.0');
const ADDRESS_ZERO = ethers.ZeroAddress;

type GenericCatalog = RMRKCatalogImpl;
type GenericReadyToUse =
  | RMRKMultiAssetPreMint
  | RMRKMultiAssetPreMintSoulbound
  | RMRKNestablePreMint
  | RMRKNestablePreMintSoulbound
  | RMRKNestableMultiAssetPreMint
  | RMRKNestableMultiAssetPreMintSoulbound
  | RMRKEquippablePreMint
  | RMRKEquippablePreMintSoulbound
  | RMRKMultiAssetLazyMintNative
  | RMRKMultiAssetLazyMintNativeSoulbound
  | RMRKNestableLazyMintNative
  | RMRKNestableLazyMintNativeSoulbound
  | RMRKNestableMultiAssetLazyMintNative
  | RMRKNestableMultiAssetLazyMintNativeSoulbound
  | RMRKEquippableLazyMintNative
  | RMRKEquippableLazyMintNativeSoulbound
  | RMRKMultiAssetLazyMintErc20
  | RMRKMultiAssetLazyMintErc20Soulbound
  | RMRKNestableLazyMintErc20
  | RMRKNestableLazyMintErc20Soulbound
  | RMRKNestableMultiAssetLazyMintErc20
  | RMRKNestableMultiAssetLazyMintErc20Soulbound
  | RMRKEquippableLazyMintErc20
  | RMRKEquippableLazyMintErc20Soulbound;
type GenericMultiAsset =
  | RMRKMultiAssetPreMint
  | RMRKMultiAssetPreMintSoulbound
  | RMRKNestableMultiAssetPreMint
  | RMRKNestableMultiAssetPreMintSoulbound
  | RMRKEquippablePreMint
  | RMRKEquippablePreMintSoulbound
  | RMRKMultiAssetLazyMintNative
  | RMRKMultiAssetLazyMintNativeSoulbound
  | RMRKNestableMultiAssetLazyMintNative
  | RMRKNestableMultiAssetLazyMintNativeSoulbound
  | RMRKEquippableLazyMintNative
  | RMRKEquippableLazyMintNativeSoulbound
  | RMRKNestableMultiAssetLazyMintErc20
  | RMRKMultiAssetLazyMintErc20
  | RMRKMultiAssetLazyMintErc20Soulbound
  | RMRKNestableMultiAssetLazyMintErc20Soulbound
  | RMRKEquippableLazyMintErc20
  | RMRKEquippableLazyMintErc20Soulbound;
type GenericEquippable = RMRKEquippableMock | RMRKMinifiedEquippableMock;
type GenericNestMintable =
  | RMRKEquippableMock
  | RMRKMinifiedEquippableMock
  | RMRKNestableMock
  | RMRKNestableMultiAssetMock;
type GenericTypedMultiAsset =
  | RMRKTypedMultiAssetMock
  | RMRKNestableTypedMultiAssetMock
  | RMRKTypedEquippableMock;
type GenericMintable =
  | GenericMultiAsset
  | GenericEquippable
  | GenericNestMintable
  | RMRKMultiAssetMock
  | GenericTypedMultiAsset;
// Mock
type GenericNestMintableMock =
  | RMRKNestableMock
  | RMRKNestableMultiAssetMock
  | RMRKEquippableMock
  | RMRKMinifiedEquippableMock;
type GenericMintableMock = RMRKMultiAssetMock | GenericNestMintableMock;

// Pre-mint
type GenericNestMintablePreMint =
  | RMRKEquippablePreMint
  | RMRKNestableMultiAssetPreMint
  | RMRKNestableMultiAssetPreMintSoulbound;
type GenericMintablePreMint = GenericNestMintablePreMint | RMRKMultiAssetPreMint;
// ERC20 payment
type GenericNestMintableERC20Pay =
  | RMRKEquippableLazyMintErc20
  | RMRKNestableLazyMintErc20
  | RMRKNestableMultiAssetLazyMintErc20;
type GenericMintableERC20Pay = GenericNestMintableERC20Pay | RMRKMultiAssetLazyMintErc20;
// Native token payment
type GenericNestMintableNativeToken =
  | RMRKEquippableLazyMintNative
  | RMRKNestableLazyMintNative
  | RMRKNestableMultiAssetLazyMintNative;
type GenericMintableNativeToken = GenericNestMintableNativeToken | RMRKMultiAssetLazyMintNative;
// Transferable
type GenericSafeTransferable = RMRKMinifiedEquippableMock;
type GenericTransferable =
  | GenericMintable
  | GenericMintablePreMint
  | GenericMintableERC20Pay
  | GenericMintableNativeToken;
type GenericNestTransferable =
  | GenericNestMintable
  | GenericNestMintablePreMint
  | GenericNestMintableERC20Pay
  | GenericNestMintableNativeToken;

type GenericAbstractImplementation =
  | RMRKAbstractEquippable
  | RMRKAbstractMultiAsset
  | RMRKAbstractNestable
  | RMRKAbstractNestableMultiAsset;

function bn(x: number): bigint {
  return BigInt(x);
}

async function mintFromMock(token: GenericMintableMock, to: string): Promise<bigint> {
  const tokenId = nextTokenId;
  nextTokenId++;
  await token.mint(to, tokenId);

  return bn(tokenId);
}

async function mintFromMockPremint(token: GenericMintablePreMint, to: string): Promise<bigint> {
  const tx = await token.mint(to, 1, `ipfs://tokenURI`);
  return await getTokenIdFromTx(tx);
}

async function nestMintFromMock(
  token: GenericNestMintableMock,
  to: string,
  parentId: bigint,
): Promise<bigint> {
  const childTokenId = nextChildTokenId;
  nextChildTokenId++;
  await token.nestMint(to, childTokenId, parentId);
  return bn(childTokenId);
}

async function getTokenIdFromTx(tx: ContractTransactionResponse): Promise<bigint> {
  const receipt = await tx.wait();
  if (receipt === null || receipt === undefined) {
    throw new Error('No events in receipt');
  }
  // Get the event from the tx
  // @ts-ignore
  const event = receipt.logs.find((e) => e.eventName === 'Transfer');
  if (event === undefined) {
    throw new Error('No Transfer event in receipt');
  }
  // Get the tokenId from the event
  // @ts-ignore
  return event.args[2];
}

async function nestMintFromMockPreMint(
  token: GenericNestMintablePreMint,
  to: string,
  parentId: bigint,
): Promise<bigint> {
  const tx = await token.nestMint(to, 1, parentId, `ipfs://tokenURI`);
  return await getTokenIdFromTx(tx);
}

async function mintFromErc20Pay(token: GenericMintableERC20Pay, to: string): Promise<bigint> {
  const erc20Address = await token.erc20TokenAddress();
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = <ERC20Mock>erc20Factory.attach(erc20Address);
  const owner = (await ethers.getSigners())[0];

  await erc20.mint(owner.address, ONE_ETH);
  await erc20.approve(await token.getAddress(), ONE_ETH);

  const tx = await token.mint(to, 1);
  return await getTokenIdFromTx(tx);
}

async function mintFromNativeToken(token: GenericMintableNativeToken, to: string): Promise<bigint> {
  const tx = await token.mint(to, 1, { value: ONE_ETH });
  return await getTokenIdFromTx(tx);
}

async function nestMintFromErc20Pay(
  token: Contract,
  to: string,
  destinationId: bigint,
): Promise<bigint> {
  const erc20Address = await token.erc20TokenAddress();
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = <ERC20Mock>erc20Factory.attach(erc20Address);
  const owner = (await ethers.getSigners())[0];

  await erc20.mint(owner.address, ONE_ETH);
  await erc20.approve(await token.getAddress(), ONE_ETH);

  const tx = await token.nestMint(to, 1, destinationId);
  return await getTokenIdFromTx(tx);
}

async function nestMintFromNativeToken(
  token:
    | RMRKNestableLazyMintNative
    | RMRKNestableMultiAssetLazyMintNative
    | RMRKEquippableLazyMintNative,
  to: string,
  destinationId: bigint,
): Promise<bigint> {
  const tx = await token.nestMint(to, 1, destinationId, { value: ONE_ETH });
  return await getTokenIdFromTx(tx);
}

async function transfer(
  token: GenericTransferable,
  caller: SignerWithAddress,
  to: string,
  tokenId: bigint,
): Promise<void> {
  await token.connect(caller).transferFrom(caller.address, to, tokenId);
}

async function nestTransfer(
  token: GenericNestTransferable,
  caller: SignerWithAddress,
  to: string,
  tokenId: bigint,
  parentId: bigint,
): Promise<void> {
  await token.connect(caller).nestTransferFrom(caller.address, to, tokenId, parentId, '0x');
}

async function addAssetToToken(
  token: GenericMultiAsset,
  tokenId: bigint,
  resId: bigint,
  replaces: bigint | number,
): Promise<ContractTransactionResponse> {
  return await token.addAssetToToken(tokenId, resId, replaces);
}

let nextAssetId = 1;

async function addAssetEntryFromMock(
  token: RMRKMultiAssetMock | RMRKNestableMultiAssetMock,
  data?: string,
): Promise<bigint> {
  const assetId = bn(nextAssetId);
  nextAssetId++;
  await token.addAssetEntry(assetId, data !== undefined ? data : 'metaURI');
  return assetId;
}

async function addAssetEntryFromImpl(token: Contract, data?: string): Promise<bigint> {
  await token.addAssetEntry(data !== undefined ? data : 'metaURI');
  return await token.totalAssets();
}

async function addAssetEntryEquippablesFromMock(
  token: RMRKEquippableMock | RMRKMinifiedEquippableMock,
  data?: string,
): Promise<bigint> {
  const assetId = bn(nextAssetId);
  const equippableGroupId = bn(1);
  nextAssetId++;
  await token.addEquippableAssetEntry(
    assetId,
    equippableGroupId,
    ADDRESS_ZERO,
    data !== undefined ? data : 'metaURI',
    [],
  );
  return assetId;
}

async function addAssetEntryEquippablesFromImpl(token: Contract, data?: string): Promise<bigint> {
  const equippableGroupId = bn(1);
  await token.addEquippableAssetEntry(
    equippableGroupId,
    ADDRESS_ZERO,
    data !== undefined ? data : 'metaURI',
    [],
  );
  return await token.totalAssets();
}

async function singleFixtureWithArgs(contractName: string, args: any[]): Promise<Contract> {
  const factory = await ethers.getContractFactory(contractName);
  const token = <Contract>await factory.deploy(...args);
  await token.waitForDeployment();
  return token;
}

async function parentChildFixtureWithArgs(
  contractName: string,
  parentArgs: any[],
  childArgs: any[],
): Promise<{ parent: GenericNestMintable; child: GenericNestMintable }> {
  const factory = await ethers.getContractFactory(contractName);

  const parent = <GenericNestMintable>await factory.deploy(...parentArgs);
  await parent.waitForDeployment();
  const child = <GenericNestMintable>await factory.deploy(...childArgs);
  await child.waitForDeployment();

  return { parent, child };
}

export {
  addAssetEntryEquippablesFromImpl,
  addAssetEntryEquippablesFromMock,
  addAssetEntryFromImpl,
  addAssetEntryFromMock,
  addAssetToToken,
  ADDRESS_ZERO,
  bn,
  getTokenIdFromTx,
  mintFromErc20Pay,
  mintFromMock,
  mintFromMockPremint,
  mintFromNativeToken,
  nestMintFromErc20Pay,
  nestMintFromMock,
  nestMintFromMockPreMint,
  nestMintFromNativeToken,
  nestTransfer,
  ONE_ETH,
  parentChildFixtureWithArgs,
  singleFixtureWithArgs,
  transfer,
  GenericAbstractImplementation,
  GenericReadyToUse,
  GenericCatalog,
  GenericEquippable,
  GenericMintable,
  GenericMintableERC20Pay,
  GenericMintableNativeToken,
  GenericMintablePreMint,
  GenericMultiAsset,
  GenericNestMintable,
  GenericNestMintableERC20Pay,
  GenericNestMintableNativeToken,
  GenericNestMintablePreMint,
  GenericNestTransferable,
  GenericSafeTransferable,
  GenericTransferable,
  GenericTypedMultiAsset,
  GenericMintableMock,
  GenericNestMintableMock,
};
