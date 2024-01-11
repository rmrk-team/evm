import { ethers } from 'hardhat';

import shouldBehaveLikeOwnableLock from './behavior/ownableLock';
import { OwnableLockMock } from '../typechain-types';

describe('Ownable Lock', async () => {
  let token: OwnableLockMock;

  const ismock = true;

  beforeEach(async function () {
    const OLOCK = await ethers.getContractFactory('OwnableLockMock');
    token = await OLOCK.deploy();
    await token.waitForDeployment();
    this.token = token;
  });

  shouldBehaveLikeOwnableLock(ismock);
});
