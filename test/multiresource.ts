import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import shouldBehaveLikeMultiResource from './behavior/multiresource';

describe('MultiResource', async () => {
  let token: Contract;

  const name = 'RmrkTest';
  const symbol = 'RMRKTST';

  beforeEach(async function () {
    const Token = await ethers.getContractFactory('RMRKMultiResourceMock');
    token = await Token.deploy(name, symbol);
    await token.deployed();
    this.token = token;
  });

  shouldBehaveLikeMultiResource(name, symbol);
});
