import { ethers, run } from 'hardhat';
import { sleep } from './utils';

async function main() {
  // We get the contract to deploy
  // // Send eth to this address:0xfbea1b97406c6945d07f50f588e54144ea8b684f
  // let tx = {
  //   to: '0xfbea1b97406c6945d07f50f588e54144ea8b684f',
  //   value: ethers.parseEther('0.03'),
  //   nonce: 235,
  // };
  // const [signer] = await ethers.getSigners();
  // const txResponse = await signer.sendTransaction(tx);
  // await txResponse.wait();
  // return;

  const catalogUtilsFactory = await ethers.getContractFactory('RMRKCatalogUtils');
  const catalogUtils = await catalogUtilsFactory.deploy();
  await catalogUtils.waitForDeployment();
  console.log('RMRK Catalog Utils deployed to:', await catalogUtils.getAddress());
  await sleep(1000);

  await run('verify:verify', {
    address: await catalogUtils.getAddress(),
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
