import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';

let nextTokenId = 1;
let nextChildTokenId = 100;

async function mintTokenId(token: Contract, to: string): Promise<number> {
  const tokenId = nextTokenId;
  nextTokenId++;
  await token['mint(address,uint256)'](to, tokenId);
  return tokenId;
}

async function nestMinttokenId(token: Contract, to: string, parentId: number): Promise<number> {
  const childTokenId = nextChildTokenId;
  nextChildTokenId++;
  await token['mint(address,uint256,uint256)'](to, childTokenId, parentId);
  return childTokenId;
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
  await token.addResourceToToken(tokenId, resId, overwrites);
}

export { mintTokenId, nestMinttokenId, transfer, nestTransfer, addResourceToToken };
