
import { ethers, run } from 'hardhat';
import { Signer } from 'ethers';
import { delay } from "@nomiclabs/hardhat-etherscan/dist/src/etherscan/EtherscanService"

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
  const RMRKEquippableFactory = await ethers.getContractFactory('RMRKEquippableFactory');
  const rmrkFactory = await RMRKEquippableFactory.deploy();
  await rmrkFactory.deployed();

  const tx = await rmrkFactory.deployRMRKEquippable(
    'Test Collection',
    'TEST',
    10000,
    0,
  );
  await tx.wait(10);
  const equippableCollection = await rmrkFactory.equippableCollections(0);

  console.log('RMRK Equippable Factory deployed to:', rmrkFactory.address);
  console.log('RMRK Equippable Collection deployed to:', equippableCollection);

  console.log('Etherscan contract verification starting now.');

  await delay(15000);

  await run('verify:verify', {
    address: rmrkFactory.address,
    constructorArguments: [],
  });

  await run('verify:verify', {
    address: equippableCollection,
    constructorArguments: ['Test Collection', 'TEST', 10000, 0],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
