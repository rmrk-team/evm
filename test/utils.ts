import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { Contract, EventLog } from 'ethers';
import { ethers } from 'hardhat';
import {
  RMRKEquippableLazyMintNative,
  RMRKEquippableMock,
  RMRKEquippablePreMint,
  RMRKMultiAssetLazyMintNative,
  RMRKMultiAssetPreMint,
  RMRKNestableLazyMintNative,
  RMRKNestableMultiAssetLazyMintNative,
  RMRKNestableMultiAssetPreMint,
  RMRKNestableMultiAssetPreMintSoulbound,
} from '../typechain-types';

let nextTokenId = 1;
let nextChildTokenId = 100;
const ONE_ETH = ethers.parseEther('1.0');
const ADDRESS_ZERO = ethers.ZeroAddress;

function bn(x: number): bigint {
  return BigInt(x);
}

async function mintFromMock(token: RMRKEquippableMock, to: string): Promise<bigint> {
  const tokenId = nextTokenId;
  nextTokenId++;
  await token.mint(to, tokenId);

  return bn(tokenId);
}

async function mintFromMockPremint(
  token:
    | RMRKMultiAssetPreMint
    | RMRKNestableMultiAssetPreMintSoulbound
    | RMRKNestableMultiAssetPreMint
    | RMRKEquippablePreMint,
  to: string,
): Promise<bigint> {
  const tx = await token.mint(to, 1, `ipfs://tokenURI`);
  // Get the event from the tx
  const event = (await tx.wait()).logs.find((e) => e.eventName === 'Transfer');
  // Get the tokenId from the event
  // @ts-ignore
  return event.args[2];
}

async function nestMintFromMock(
  token: RMRKEquippableMock,
  to: string,
  parentId: bigint,
): Promise<bigint> {
  const childTokenId = nextChildTokenId;
  nextChildTokenId++;
  await token.nestMint(to, childTokenId, parentId);
  return bn(childTokenId);
}

async function nestMintFromMockPreMint(
  token: Contract,
  to: string,
  parentId: bigint,
): Promise<bigint> {
  const tx = await token['nestMint(address,uint256,uint256,string)'](
    to,
    1,
    parentId,
    `ipfs://tokenURI`,
  );
  // Get the event from the tx
  const event = (await tx.wait()).logs.find((e) => e.eventName === 'Transfer');
  // Get the tokenId from the event
  // @ts-ignore
  return event.args[2];
}

async function mintFromErc20Pay(token: Contract, to: string): Promise<bigint> {
  const erc20Address = await token.erc20TokenAddress();
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = erc20Factory.attach(erc20Address);
  const owner = (await ethers.getSigners())[0];

  await erc20.mint(await owner.getAddress(), ONE_ETH);
  await erc20.approve(await token.getAddress(), ONE_ETH);

  const tx = await token.mint(to, 1);
  // Get the event from the tx
  const event = (await tx.wait()).logs.find((e) => e.eventName === 'Transfer');
  // Get the tokenId from the event
  // @ts-ignore
  return event.args[2];
}

async function mintFromNativeToken(
  token:
    | RMRKMultiAssetLazyMintNative
    | RMRKNestableLazyMintNative
    | RMRKNestableMultiAssetLazyMintNative
    | RMRKEquippableLazyMintNative,
  to: string,
): Promise<bigint> {
  const tx = await token.mint(to, 1, { value: ONE_ETH });
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

async function nestMintFromErc20Pay(
  token: Contract,
  to: string,
  destinationId: bigint,
): Promise<bigint> {
  const erc20Address = await token.erc20TokenAddress();
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = erc20Factory.attach(erc20Address);
  const owner = (await ethers.getSigners())[0];

  await erc20.mint(await owner.getAddress(), ONE_ETH);
  await erc20.approve(await token.getAddress(), ONE_ETH);

  const tx = await token.nestMint(to, 1, destinationId);
  // Get the event from the tx
  const event = (await tx.wait()).logs.find((e) => e.eventName === 'Transfer');
  // Get the tokenId from the event
  // @ts-ignore
  return event.args[2];
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
  // Get the event from the tx
  const event = (await tx.wait()).logs.find((e) => e.eventName === 'Transfer');
  // Get the tokenId from the event
  // @ts-ignore
  return event.args[2];
}

async function transfer(
  token: Contract,
  caller: SignerWithAddress,
  to: string,
  tokenId: bigint,
): Promise<void> {
  await token
    .connect(caller)
    ['transferFrom(address,address,uint256)'](await caller.getAddress(), to, tokenId);
}

async function nestTransfer(
  token: Contract,
  caller: SignerWithAddress,
  to: string,
  tokenId: bigint,
  parentId: bigint,
): Promise<void> {
  await token
    .connect(caller)
    .nestTransferFrom(await caller.getAddress(), to, tokenId, parentId, '0x');
}

async function addAssetToToken(
  token: Contract,
  tokenId: bigint,
  resId: bigint,
  replaces: bigint | number,
): Promise<void> {
  return await token.addAssetToToken(tokenId, resId, replaces);
}

let nextAssetId = 1;

async function addAssetEntryFromMock(token: Contract, data?: string): Promise<bigint> {
  const assetId = bn(nextAssetId);
  nextAssetId++;
  await token.addAssetEntry(assetId, data !== undefined ? data : 'metaURI');
  return assetId;
}

async function addAssetEntryFromImpl(token: Contract, data?: string): Promise<bigint> {
  await token.addAssetEntry(data !== undefined ? data : 'metaURI');
  return await token.totalAssets();
}

async function addAssetEntryEquippablesFromMock(token: Contract, data?: string): Promise<bigint> {
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
  const token = await factory.deploy(...args);
  await token.waitForDeployment();
  return token;
}

async function parentChildFixtureWithArgs(
  contractName: string,
  parentArgs: any[],
  childArgs: any[],
): Promise<{ parent: Contract; child: Contract }> {
  const factory = await ethers.getContractFactory(contractName);

  const parent = await factory.deploy(...parentArgs);
  await parent.waitForDeployment();
  const child = await factory.deploy(...childArgs);
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
  mintFromNativeToken,
  mintFromErc20Pay,
  mintFromMock,
  mintFromMockPremint,
  nestMintFromNativeToken,
  nestMintFromErc20Pay,
  nestMintFromMock,
  nestMintFromMockPreMint,
  nestTransfer,
  ONE_ETH,
  parentChildFixtureWithArgs,
  singleFixtureWithArgs,
  transfer,
};
