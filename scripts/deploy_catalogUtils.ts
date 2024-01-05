import { ethers, run } from 'hardhat';

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

async function main() {
  // We get the contract to deploy
  // // Send eth to this address:0xfbea1b97406c6945d07f50f588e54144ea8b684f
  // let tx = {
  //   to: '0xfbea1b97406c6945d07f50f588e54144ea8b684f',
  //   value: ethers.utils.parseEther('0.03'),
  //   nonce: 235,
  // };
  // const [signer] = await ethers.getSigners();
  // const txResponse = await signer.sendTransaction(tx);
  // await txResponse.wait();
  // return;

  const catalogUtilsFactory = await ethers.getContractFactory('RMRKCatalogUtils');
  const catalogUtils = await catalogUtilsFactory.deploy();
  await catalogUtils.deployed();
  console.log('RMRK Catalog Utils deployed to:', catalogUtils.address);
  await sleep(1000);

  await run('verify:verify', {
    address: catalogUtils.address,
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
