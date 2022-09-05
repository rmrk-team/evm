import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { transfer, nestTransfer } from '../utils';
import shouldBehaveLikeNesting from '../behavior/nesting';
// import shouldBehaveLikeERC721 from '../behavior/erc721';
import {
  singleFixtureWithArgs,
  parentChildFixtureWithArgs,
  mintFromImpl,
  nestMintFromImpl,
  ONE_ETH,
} from '../utils';

async function singleFixture(): Promise<Contract> {
  return singleFixtureWithArgs('RMRKNestingImpl', ['RMRK Test', 'RMRKTST', 10000, ONE_ETH]);
}

async function parentChildFixture(): Promise<{ parent: Contract; child: Contract }> {
  return parentChildFixtureWithArgs(
    'RMRKNestingImpl',
    ['Chunky', 'CHNK', 10000, ONE_ETH],
    ['Monkey', 'MONK', 10000, ONE_ETH],
  );
}

describe.skip('NestingMultiResourceImpl Nesting Behavior', function () {
  beforeEach(async function () {
    const { parent, child } = await loadFixture(parentChildFixture);
    this.parentToken = parent;
    this.childToken = child;
  });

  shouldBehaveLikeNesting(mintFromImpl, nestMintFromImpl, transfer, nestTransfer);
});

// FIXME: This test don't fully pass due to difference in minting
describe.skip('NestingImpl ERC721 behavior', function () {
  let token: Contract;

  beforeEach(async function () {
    token = await loadFixture(singleFixture);
    this.token = token;
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
  });

  // shouldBehaveLikeERC721(name, symbol);
});
