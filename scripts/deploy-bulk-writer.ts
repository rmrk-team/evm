import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, run } from 'hardhat';
import { sleep } from './utils';

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner = accounts[0];
  console.log(`Deployer address: ${owner.address}`);

  // We get the contract to deploy
  const factory = await ethers.getContractFactory('RMRKBulkWriter');
  const bulkwriter = await factory.deploy();
  await bulkwriter.waitForDeployment();
  const bulkwriterAddress = await bulkwriter.getAddress();

  console.log('RMRK Bulk Writer deployed to:', bulkwriterAddress);
  await sleep(1000);

  await run('verify:verify', {
    address: bulkwriterAddress,
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
