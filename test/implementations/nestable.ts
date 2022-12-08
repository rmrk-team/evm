import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import shouldBehaveLikeNestable from '../behavior/nestable';
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

const isTokenUriEnumerated = true;

async function singleFixture(): Promise<Contract> {
  return singleFixtureWithArgs('RMRKNestableImpl', [
    'RMRK Test',
    'RMRKTST',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, isTokenUriEnumerated, ADDRESS_ZERO, 1000, 10000, ONE_ETH],
  ]);
}

async function parentChildFixture(): Promise<{ parent: Contract; child: Contract }> {
  return parentChildFixtureWithArgs(
    'RMRKNestableImpl',
    [
      'Chunky',
      'CHNK',
      'ipfs://collection-meta',
      'ipfs://tokenURI',
      [ADDRESS_ZERO, false, ADDRESS_ZERO, 1000, 10000, ONE_ETH],
    ],
    [
      'Monkey',
      'MONK',
      'ipfs://collection-meta',
      'ipfs://tokenURI',
      [ADDRESS_ZERO, false, ADDRESS_ZERO, 1000, 10000, ONE_ETH],
    ],
  );
}

describe('NestableImpl Nestable Behavior', function () {
  beforeEach(async function () {
    const { parent, child } = await loadFixture(parentChildFixture);
    this.parentToken = parent;
    this.childToken = child;
  });

  shouldBehaveLikeNestable(mintFromImpl, nestMintFromImpl, transfer, nestTransfer);
});

describe('NestableImpl Other', async function () {
  beforeEach(async function () {
    this.token = await loadFixture(singleFixture);
  });

  shouldControlValidMinting();
  shouldHaveRoyalties(mintFromImpl);
  shouldHaveMetadata(mintFromImpl, isTokenUriEnumerated);
});
