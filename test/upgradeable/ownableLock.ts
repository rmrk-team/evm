import { ethers, upgrades } from 'hardhat';
import { Contract } from 'ethers';

import shouldBehaveLikeOwnableLock from './behavior/ownableLock';

describe('Ownable Lock', async () => {
  let token: Contract;

  const ismock = true;

  beforeEach(async function () {
    const OLOCK = await ethers.getContractFactory('OwnableLockMockUpgradeable');
    token = await upgrades.deployProxy(OLOCK, []);
    await token.deployed();
    this.token = token;
  });

  shouldBehaveLikeOwnableLock(ismock);
});
