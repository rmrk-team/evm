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

async function mintFromImplErc20Pay(token: Contract, to: string): Promise<number> {
  const erc20Address = token.erc20TokenAddress();
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = erc20Factory.attach(erc20Address);
  const owner = (await ethers.getSigners())[0];

  await erc20.mint(owner.address, ONE_ETH);
  await erc20.approve(token.address, ONE_ETH);

  await token.mint(to, 1);
  return await token.totalSupply();
}

async function mintFromImpl(token: Contract, to: string): Promise<number> {
  await token.mint(to, 1, { value: ONE_ETH });
  return await token.totalSupply();
}

async function nestMintFromImplErc20Pay(
  token: Contract,
  to: string,
  destinationId: number,
): Promise<number> {
  const erc20Address = token.erc20TokenAddress();
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = erc20Factory.attach(erc20Address);
  const owner = (await ethers.getSigners())[0];

  await erc20.mint(owner.address, ONE_ETH);
  await erc20.approve(token.address, ONE_ETH);

  await token.mintNesting(to, 1, destinationId);
  return await token.totalSupply();
}

async function nestMintFromImpl(
  token: Contract,
  to: string,
  destinationId: number,
): Promise<number> {
  await token.mintNesting(to, 1, destinationId, { value: ONE_ETH });
  return await token.totalSupply();
}

async function transfer(
  token: Contract,
  caller: SignerWithAddress,
  to: string,
  tokenId: number,
): Promise<void> {
  await token.connect(caller)['transfer(address,uint256)'](to, tokenId);
}

async function nestTransfer(
  token: Contract,
  caller: SignerWithAddress,
  to: string,
  tokenId: number,
  parentId: number,
): Promise<void> {
  await token.connect(caller)['nestTransfer(address,uint256,uint256)'](to, tokenId, parentId);
}

async function addAssetToToken(
  token: Contract,
  tokenId: number,
  resId: BigNumber,
  overwrites: BigNumber | number,
): Promise<void> {
  return await token.addAssetToToken(tokenId, resId, overwrites);
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
  await token.addAssetEntry(
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
  await token.addAssetEntry(
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
  mintFromImpl,
  mintFromImplErc20Pay,
  mintFromMock,
  nestMintFromImpl,
  nestMintFromImplErc20Pay,
  nestMintFromMock,
  nestTransfer,
  ONE_ETH,
  parentChildFixtureWithArgs,
  singleFixtureWithArgs,
  transfer,
};
