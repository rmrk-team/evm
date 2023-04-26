import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';

let nextTokenId = 1;
let nextChildTokenId = 100;
const ONE_ETH = ethers.utils.parseEther('1.0');
const ADDRESS_ZERO = ethers.constants.AddressZero;

function bn(x: number): BigNumber {
  return BigNumber.from(x);
}

async function mintFromMock(token: Contract, to: string): Promise<number> {
  const tokenId = nextTokenId;
  nextTokenId++;
  await token['mint(address,uint256)'](to, tokenId);

  return tokenId;
}

async function nestMintFromMock(token: Contract, to: string, parentId: number): Promise<number> {
  const childTokenId = nextChildTokenId;
  nextChildTokenId++;
  await token['nestMint(address,uint256,uint256)'](to, childTokenId, parentId);
  return childTokenId;
}

async function mintFromImplErc20Pay(token: Contract, to: string): Promise<BigNumber> {
  const erc20Address = token.erc20TokenAddress();
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = erc20Factory.attach(erc20Address);
  const owner = (await ethers.getSigners())[0];

  await erc20.mint(owner.address, ONE_ETH);
  await erc20.approve(token.address, ONE_ETH);

  const tx = await token.mint(to, 1);
  // Get the event from the tx
  const event = (await tx.wait()).events?.find((e) => e.event === 'Transfer');
  // Get the tokenId from the event
  return event?.args?.tokenId;
}

async function mintFromImplNativeToken(token: Contract, to: string): Promise<BigNumber> {
  const tx = await token.mint(to, 1, { value: ONE_ETH });
  // Get the event from the tx
  const event = (await tx.wait()).events?.find((e) => e.event === 'Transfer');
  // Get the tokenId from the event
  return event?.args?.tokenId;
}

async function nestMintFromImplErc20Pay(
  token: Contract,
  to: string,
  destinationId: number,
): Promise<BigNumber> {
  const erc20Address = token.erc20TokenAddress();
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = erc20Factory.attach(erc20Address);
  const owner = (await ethers.getSigners())[0];

  await erc20.mint(owner.address, ONE_ETH);
  await erc20.approve(token.address, ONE_ETH);

  const tx = await token.nestMint(to, 1, destinationId);
  // Get the event from the tx
  const event = (await tx.wait()).events?.find((e) => e.event === 'Transfer');
  // Get the tokenId from the event
  return event?.args?.tokenId;
}

async function nestMintFromImplNativeToken(
  token: Contract,
  to: string,
  destinationId: number,
): Promise<BigNumber> {
  const tx = await token.nestMint(to, 1, destinationId, { value: ONE_ETH });
  // Get the event from the tx
  const event = (await tx.wait()).events?.find((e) => e.event === 'Transfer');
  // Get the tokenId from the event
  return event?.args?.tokenId;
}

async function transfer(
  token: Contract,
  caller: SignerWithAddress,
  to: string,
  tokenId: number,
): Promise<void> {
  await token.connect(caller)['transferFrom(address,address,uint256)'](caller.address, to, tokenId);
}

async function nestTransfer(
  token: Contract,
  caller: SignerWithAddress,
  to: string,
  tokenId: number,
  parentId: number,
): Promise<void> {
  await token.connect(caller).nestTransferFrom(caller.address, to, tokenId, parentId, '0x');
}

async function addAssetToToken(
  token: Contract,
  tokenId: number,
  resId: BigNumber,
  replaces: BigNumber | number,
): Promise<void> {
  return await token.addAssetToToken(tokenId, resId, replaces);
}

let nextAssetId = 1;

async function addAssetEntryFromMock(token: Contract, data?: string): Promise<BigNumber> {
  const assetId = bn(nextAssetId);
  nextAssetId++;
  await token.addAssetEntry(assetId, data !== undefined ? data : 'metaURI');
  return assetId;
}

async function addAssetEntryFromImpl(token: Contract, data?: string): Promise<BigNumber> {
  await token.addAssetEntry(data !== undefined ? data : 'metaURI');
  return await token.totalAssets();
}

async function addAssetEntryEquippablesFromMock(
  token: Contract,
  data?: string,
): Promise<BigNumber> {
  const assetId = bn(nextAssetId);
  const equippableGroupId = bn(1);
  nextAssetId++;
  await token.addEquippableAssetEntry(
    assetId,
    equippableGroupId,
    ADDRESS_ZERO,
    data !== undefined ? data : 'metaURI',
    [],
    [],
  );
  return assetId;
}

async function addAssetEntryEquippablesFromImpl(
  token: Contract,
  data?: string,
): Promise<BigNumber> {
  const equippableGroupId = bn(1);
  await token.addEquippableAssetEntry(
    equippableGroupId,
    ADDRESS_ZERO,
    data !== undefined ? data : 'metaURI',
    [],
    [],
  );
  return await token.totalAssets();
}

async function singleFixtureWithArgs(contractName: string, args: any[]): Promise<Contract> {
  const factory = await ethers.getContractFactory(contractName);
  const token = await factory.deploy(...args);
  await token.deployed();
  return token;
}

async function parentChildFixtureWithArgs(
  contractName: string,
  parentArgs: any[],
  childArgs: any[],
): Promise<{ parent: Contract; child: Contract }> {
  const factory = await ethers.getContractFactory(contractName);

  const parent = await factory.deploy(...parentArgs);
  await parent.deployed();
  const child = await factory.deploy(...childArgs);
  await child.deployed();

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
  mintFromImplNativeToken,
  mintFromImplErc20Pay,
  mintFromMock,
  nestMintFromImplNativeToken,
  nestMintFromImplErc20Pay,
  nestMintFromMock,
  nestTransfer,
  ONE_ETH,
  parentChildFixtureWithArgs,
  singleFixtureWithArgs,
  transfer,
};
