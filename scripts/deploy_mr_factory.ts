// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, run } from 'hardhat';
import { Signer } from 'ethers';

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const accounts: Signer[] = await ethers.getSigners();
  console.log('Deployer address: ' + (await accounts[0].getAddress()));

  // We get the contract to deploy
  const RMRKMultiResourceFactory = await ethers.getContractFactory('RMRKMultiResourceFactory');
  const rmrkFactory = await RMRKMultiResourceFactory.deploy();
  await rmrkFactory.deployed();

  const tx = await rmrkFactory.deployRMRKMultiResource('Test Collection', 'TEST', 10000, 0);
  await tx.wait(10);
  const multiResourceCollection = await rmrkFactory.multiResourceCollections(0);

  console.log('RMRK MR Factory deployed to:', rmrkFactory.address);
  console.log('RMRK MR Collection deployed to:', multiResourceCollection);

  console.log('Etherscan contract verification starting now.');
  await run('verify:verify', {
    address: rmrkFactory.address,
    constructorArguments: [],
  });

  await run('verify:verify', {
    address: multiResourceCollection,
    constructorArguments: ['Test Collection', 'TEST', 10000, 0],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
