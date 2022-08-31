import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';

let nextTokenId = 1;
let nextChildTokenId = 100;
const ONE_ETH = ethers.utils.parseEther('1.0');

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

async function mintFromImpl(token: Contract, to: string): Promise<number> {
  await token.mint(to, 1, { value: ONE_ETH });
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

async function addResourceToToken(
  token: Contract,
  tokenId: number,
  resId: BigNumber,
  overwrites: BigNumber | number,
): Promise<void> {
  return await token.addResourceToToken(tokenId, resId, overwrites);
}

let nextResourceId = 1;

async function addResourceEntryFromMock(token: Contract, data?: string): Promise<BigNumber> {
  const resourceId = bn(nextResourceId);
  nextResourceId++;
  await token.addResourceEntry(resourceId, data !== undefined ? data : 'metaURI');
  return resourceId;
}

async function addResourceEntryFromImpl(token: Contract, data?: string): Promise<BigNumber> {
  await token.addResourceEntry(data !== undefined ? data : 'metaURI');
  return await token.totalResources();
}

async function addResourceEntryEquippables(token: Contract, data?: string): Promise<BigNumber> {
  const resourceId = bn(nextResourceId);
  const refId = bn(1);
  const extendedResource = [
    resourceId,
    refId,
    ethers.constants.AddressZero,
    data !== undefined ? data : 'metaURI',
  ];
  nextResourceId++;
  await token.addResourceEntry(extendedResource, [], []);
  return resourceId;
}

export {
  addResourceEntryEquippables,
  addResourceEntryFromImpl,
  addResourceEntryFromMock,
  addResourceToToken,
  bn,
  mintFromImpl,
  mintFromMock,
  nestMintFromImpl,
  nestMintFromMock,
  nestTransfer,
  ONE_ETH,
  transfer,
};
