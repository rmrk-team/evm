import { ethers } from 'hardhat';
import { Contract } from 'ethers';

import shouldBehaveLikeOwnableLock from './behavior/ownableLock';

describe('Ownable Lock', async () => {
  let token: Contract;

  const ismock = true;

  beforeEach(async function () {
    const OLOCK = await ethers.getContractFactory('OwnableLockMock');
    token = await OLOCK.deploy();
    await token.waitForDeployment();
    this.token = token;
  });

  shouldBehaveLikeOwnableLock(ismock);
});
