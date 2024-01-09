import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, run } from 'hardhat';

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner = accounts[0];
  console.log('Deployer address: ' + (await owner.getAddress()));
  // We get the contract to deploy
  const royaltiesSplitterFactory = await ethers.getContractFactory('RMRKRoyaltiesSplitter');
  const royaltiesSplitter = await royaltiesSplitterFactory.deploy(
    ['0x147d79f1c9244b85cba959262fb71ad38069febb', '0xacD3d4b7b0706d39e6cA6E8c75dDdD446b8cdB1D'],
    [7000, 3000],
  );
  await royaltiesSplitter.waitForDeployment();
  console.log('RMRK Royalties Splitter deployed to:', await royaltiesSplitter.getAddress());
  await sleep(10000);

  await run('verify:verify', {
    address: await royaltiesSplitter.getAddress(),
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
