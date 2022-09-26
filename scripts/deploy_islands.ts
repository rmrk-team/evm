import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';

const resourcesIslands = {
  '1': [
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/FloatingIslands(0)_0.png',
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/FloatingIslands(0)_1.png',
  ],
  '2': [
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/FloatingIslands(1)_0.png',
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/FloatingIslands(1)_1.png',
  ],
  '3': [
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/FloatingIslands(2)_0.png',
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/FloatingIslands(2)_1.png',
  ],
  '4': [
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/FloatingIslands(3)_0.png',
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/FloatingIslands(3)_1.png',
  ],
  '5': [
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/FloatingIslands(3)_2.png',
  ],
  '6': [
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/FloatingIslands(3)_3.png',
  ],
  '7': [
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/FloatingIslands(3)_4.png',
  ],
  '8': [
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/FloatingIslands(3)_5.png',
  ],
  '9': [
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/FloatingIslands(3)_6.png',
  ],
  '10': [
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/FloatingIslands(3)_7.png',
  ],
};
const resourcesTime = {
  '1': [
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/TimeToAnim(0)_0.png',
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/TimeToAnim(0)_1.png',
  ],
  '2': [
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/TimeToAnim(1)_0.png',
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/TimeToAnim(1)_1.png',
  ],
  '3': [
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/TimeToAnim(2)_0.png',
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/TimeToAnim(2)_1.png',
  ],
  '4': [
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/TimeToAnim(3)_0.png',
    'https://rmrk.mypinata.cloud/ipfs/QmU6kDauEkhfenxNUDHMM52JXXuCSxAM5cwhdPgb43KP98/TimeToAnim(3)_1.png',
  ],
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner = accounts[0];
  console.log('Deployer address: ' + owner.address);
  // We get the contract to deploy
  const RMRKNestingMR = await ethers.getContractFactory('RMRKNestingMultiResourceImpl');
  const args = {
    name: 'FloatingIslands',
    symbol: 'FI',
    maxSupply: 20, // supply
    pricePerMint: 1, // in WEI
    tokenURI: 'ipfs://tokenURI',
  };

  const floatingIslands = await RMRKNestingMR.deploy(
    args.name,
    args.symbol,
    args.maxSupply,
    args.pricePerMint,
    args.tokenURI,
  );

  await floatingIslands.deployed();
  console.log('RMRK Nesting Implementation deployed to:', floatingIslands.address);
  await sleep(1000);

  const islandsIds = Object.keys(resourcesIslands);
  let nextResourceId = 1;
  let nextTokenId = 1;
  const value = islandsIds.length * args.pricePerMint;
  console.log('Minting %s tokens with total value of %s.', islandsIds.length, value);
  let tx = await floatingIslands.mint(owner.address, islandsIds.length, {
    value: value,
  });
  await tx.wait();
  for (let i = 0; i < islandsIds.length; i++) {
    console.log('Adding resources for token with id: %s', islandsIds[i]);
    // @ts-ignore
    const resources = resourcesIslands[islandsIds[i]];
    for (let j = 0; j < resources.length; j++) {
      console.log('Adding resource entry');
      tx = await floatingIslands.addResourceEntry(nextResourceId, resources[j], []);
      await tx.wait();
      console.log('Adding resource to token');
      tx = await floatingIslands.addResourceToToken(nextTokenId, nextResourceId, 0); // overwrites is 0
      await tx.wait();
      console.log('Accepting resource');
      tx = await floatingIslands.acceptResource(nextTokenId, 0); // We always accept the first so index is 0
      await tx.wait();
      nextResourceId++;
    }
    nextTokenId++;
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
