import { ethers, run } from 'hardhat';
import { sleep } from './utils';

async function main() {
  const catalogFactoryFactory = await ethers.getContractFactory('RMRKCatalogFactory');
  const catalogFactory = await catalogFactoryFactory.deploy();
  await catalogFactory.waitForDeployment();
  console.log('RMRK Catalog Factory deployed to:', await catalogFactory.getAddress());
  await sleep(1000);

  await run('verify:verify', {
    address: await catalogFactory.getAddress(),
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
