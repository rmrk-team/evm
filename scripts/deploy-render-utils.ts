import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, run } from 'hardhat';
import { sleep } from './utils';

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner = accounts[0];
  console.log(`Deployer address: ${owner.address}`);

  // Calculate future address:
  const deployerNonce = await owner.getNonce();
  const futureAddress = ethers.getCreateAddress({ from: owner.address, nonce: deployerNonce });
  console.log(`Render utils will be deployed to: ${futureAddress}`);

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
