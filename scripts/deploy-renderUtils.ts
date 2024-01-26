import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, run } from 'hardhat';
import { sleep } from './utils';

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner = accounts[0];
  console.log(`Deployer address: ${owner.address}`);
  // We get the contract to deploy
  const renderUtilsFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');
  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.waitForDeployment();
  console.log('RMRK Equip Render Utils deployed to:', await renderUtils.getAddress());
  await sleep(1000);

  await run('verify:verify', {
    address: await renderUtils.getAddress(),
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
