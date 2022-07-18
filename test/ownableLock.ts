import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';

import shouldBehaveLikeOwnableLock from './behavior/ownableLock';

describe('Ownable Lock', async () => {
  let token: Contract;

  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const ismock = true;

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const OLOCK = await ethers.getContractFactory('OwnableLockMock');
    token = await OLOCK.deploy();
    await token.deployed();
    this.token = token;
  });

  shouldBehaveLikeOwnableLock(ismock);
});
