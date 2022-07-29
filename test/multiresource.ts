import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import shouldBehaveLikeMultiResource from './behavior/multiresource';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('MultiResource', async () => {
  let token: Contract;

  const name = 'RmrkTest';
  const symbol = 'RMRKTST';

  async function deployRmrkMultiResourceMockFixture() {
    const Token = await ethers.getContractFactory('RMRKMultiResourceMock');
    token = await Token.deploy(name, symbol);
    await token.deployed();
    return { token };
  }

  beforeEach(async function () {
    const { token } = await loadFixture(deployRmrkMultiResourceMockFixture);
    this.token = token;
  });

  shouldBehaveLikeMultiResource(name, symbol);
});
