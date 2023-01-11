import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers, run } from 'hardhat';

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
  const renderUtilsFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');
  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();
  console.log('RMRK Equip Render Utils deployed to:', renderUtils.address);
  await sleep(1000);

  await run('verify:verify', {
    address: renderUtils.address,
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
