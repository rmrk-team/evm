import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { transfer, nestTransfer, addResourceToToken, addResourceEntryFromImpl } from '../utils';
import shouldBehaveLikeNesting from '../behavior/nesting';
import shouldBehaveLikeMultiResource from '../behavior/multiresource';
import {
  singleFixtureWithArgs,
  parentChildFixtureWithArgs,
  mintFromImpl,
  nestMintFromImpl,
  ONE_ETH,
} from '../utils';

async function singleFixture(): Promise<Contract> {
  return singleFixtureWithArgs('RMRKNestingMultiResourceImpl', [
    'NestingMultiResource',
    'NMR',
    10000,
    ONE_ETH,
  ]);
}

async function parentChildFixture(): Promise<{ parent: Contract; child: Contract }> {
  return parentChildFixtureWithArgs(
    'RMRKNestingMultiResourceImpl',
    ['Chunky', 'CHNK', 10000, ONE_ETH],
    ['Monkey', 'MONK', 10000, ONE_ETH],
  );
}

describe('NestingMultiResourceImpl Nesting Behavior', function () {
  beforeEach(async function () {
    const { parent, child } = await loadFixture(parentChildFixture);
    this.parentToken = parent;
    this.childToken = child;
  });

  shouldBehaveLikeNesting(mintFromImpl, nestMintFromImpl, transfer, nestTransfer);
});

describe('NestingMultiResourceImpl MR behavior', async () => {
  beforeEach(async function () {
    this.token = await loadFixture(singleFixture);
  });

  shouldBehaveLikeMultiResource(mintFromImpl, addResourceEntryFromImpl, addResourceToToken);
});

describe('NestingMultiResourceImpl Other Behavior', function () {
  let addrs: SignerWithAddress[];
  let chunky: Contract;

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;

    chunky = await loadFixture(singleFixture);
    this.parentToken = chunky;
  });

  describe('Approval Cleaning', async function () {
    it('cleans token and resources approvals on transfer', async function () {
      const tokenOwner = addrs[1];
      const newOwner = addrs[2];
      const approved = addrs[3];
      const tokenId = await mintFromImpl(chunky, tokenOwner.address);
      await chunky.connect(tokenOwner).approve(approved.address, tokenId);
      await chunky.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(approved.address);
      expect(await chunky.getApprovedForResources(tokenId)).to.eql(approved.address);

      await chunky.connect(tokenOwner).transfer(newOwner.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(ethers.constants.AddressZero);
      expect(await chunky.getApprovedForResources(tokenId)).to.eql(ethers.constants.AddressZero);
    });

    it('cleans token and resources approvals on burn', async function () {
      const tokenOwner = addrs[1];
      const approved = addrs[3];
      const tokenId = await mintFromImpl(chunky, tokenOwner.address);
      await chunky.connect(tokenOwner).approve(approved.address, tokenId);
      await chunky.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(approved.address);
      expect(await chunky.getApprovedForResources(tokenId)).to.eql(approved.address);

      await chunky.connect(tokenOwner).burn(tokenId);

      await expect(chunky.getApproved(tokenId)).to.be.revertedWithCustomError(
        chunky,
        'ERC721InvalidTokenId',
      );
      await expect(chunky.getApprovedForResources(tokenId)).to.be.revertedWithCustomError(
        chunky,
        'ERC721InvalidTokenId',
      );
    });
  });
});
