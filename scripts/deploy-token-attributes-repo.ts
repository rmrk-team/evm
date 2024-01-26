import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, run } from 'hardhat';
import { sleep } from './utils';

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner = accounts[0];
  console.log(`Deployer address: ${owner.address}`);
  // We get the contract to deploy
  const tokenAttributesRepoFactory = await ethers.getContractFactory(
    'RMRKTokenAttributesRepository',
  );
  const tokenAttributesRepo = await tokenAttributesRepoFactory.deploy();
  await tokenAttributesRepo.waitForDeployment();
  console.log('RMRKTokenAttributesRepository deployed to:', await tokenAttributesRepo.getAddress());
  await sleep(10000);

  await run('verify:verify', {
    address: await tokenAttributesRepo.getAddress(),
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
