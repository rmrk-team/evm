import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, run } from 'hardhat';
import { sleep } from './utils';

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner = accounts[0];
  console.log(`Deployer address: ${owner.address}`);
  // We get the contract to deploy

  const beneficiaries: string[] = []; // TODO: Set beneficiaries
  const sharesBPS: number[] = []; // TODO: Set sharesBPS

  const royaltiesSplitterFactory = await ethers.getContractFactory('RMRKRoyaltiesSplitter');
  const royaltiesSplitter = await royaltiesSplitterFactory.deploy(beneficiaries, sharesBPS);
  await royaltiesSplitter.waitForDeployment();
  console.log('RMRK Royalties Splitter deployed to:', await royaltiesSplitter.getAddress());
  await sleep(10000);

  await run('verify:verify', {
    address: await royaltiesSplitter.getAddress(),
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
