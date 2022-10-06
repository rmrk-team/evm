import { ethers } from 'hardhat';

async function main() {
  const diamond = await ethers.getContractAt(
    'RMRKEquippableImpl',
    '0x356a0C8575998894ac6398C26E48971B99578a96',
  );

  const contractOwner = await diamond.isContractOwner();

  console.log(contractOwner);
}

main();
