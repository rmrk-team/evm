import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  ADDRESS_ZERO,
  transfer,
  nestTransfer,
  singleFixtureWithArgs,
  parentChildFixtureWithArgs,
  mintFromImpl,
  nestMintFromImpl,
  ONE_ETH,
} from '../utils';
import shouldBehaveLikeNesting from '../behavior/nesting';
import shouldControlValidMinting from '../behavior/mintingImpl';

async function singleFixture(): Promise<Contract> {
  return singleFixtureWithArgs('RMRKNestingImpl', [
    'RMRK Test',
    'RMRKTST',
    10000,
    ONE_ETH,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    ADDRESS_ZERO,
    0,
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

  it('can get tokenURI', async function () {
    const owner = (await ethers.getSigners())[0];
    const tokenId = await mintFromImpl(this.token, owner.address);
    expect(await this.token.tokenURI(tokenId)).to.eql('ipfs://tokenURI');
  });

  it('can get collection meta', async function () {
    expect(await this.token.collectionMetadata()).to.eql('ipfs://collection-meta');
  });
});
