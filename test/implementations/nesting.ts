import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import shouldBehaveLikeNesting from '../behavior/nesting';
import shouldControlValidMinting from '../behavior/mintingImpl';
import shouldHaveMetadata from '../behavior/metadata';
import shouldHaveRoyalties from '../behavior/royalties';
import {
  ADDRESS_ZERO,
  mintFromImpl,
  nestMintFromImpl,
  nestTransfer,
  ONE_ETH,
  parentChildFixtureWithArgs,
  singleFixtureWithArgs,
  transfer,
} from '../utils';

async function singleFixture(): Promise<Contract> {
  return singleFixtureWithArgs('RMRKNestingImpl', [
    'RMRK Test',
    'RMRKTST',
    10000,
    ONE_ETH,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    1000, // 10%
  ]);
}

async function parentChildFixture(): Promise<{ parent: Contract; child: Contract }> {
  return parentChildFixtureWithArgs(
    'RMRKNestingImpl',
    [
      'Chunky',
      'CHNK',
      10000,
      ONE_ETH,
      'ipfs://collection-meta',
      'ipfs://tokenURI',
      ADDRESS_ZERO,
      0,
    ],
    [
      'Monkey',
      'MONK',
      10000,
      ONE_ETH,
      'ipfs://collection-meta',
      'ipfs://tokenURI',
      ADDRESS_ZERO,
      0,
    ],
  );
}

describe('NestingImpl Nesting Behavior', function () {
  beforeEach(async function () {
    const { parent, child } = await loadFixture(parentChildFixture);
    this.parentToken = parent;
    this.childToken = child;
  });

  shouldBehaveLikeNesting(mintFromImpl, nestMintFromImpl, transfer, nestTransfer);
});

describe('NestingImpl Other', async function () {
  beforeEach(async function () {
    this.token = await loadFixture(singleFixture);
  });

  shouldControlValidMinting();
  shouldHaveRoyalties(mintFromImpl);
  shouldHaveMetadata(mintFromImpl);
});
