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
  const factory = await ethers.getContractFactory('RMRKBulkWriter');
  const bulkwriter = await factory.deploy();
  await bulkwriter.waitForDeployment();
  console.log('RMRK Bulk Writer deployed to:', await bulkwriter.getAddress());
  await sleep(1000);

  await run('verify:verify', {
    address: await bulkwriter.getAddress(),
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
