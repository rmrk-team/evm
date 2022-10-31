import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  addResourceEntryFromMock,
  addResourceToToken,
  parentChildFixtureWithArgs,
  singleFixtureWithArgs,
  mintFromMock,
  nestMintFromMock,
  nestTransfer,
  transfer,
} from './utils';
import shouldBehaveLikeNesting from './behavior/nesting';
import shouldBehaveLikeMultiResource from './behavior/multiresource';
import shouldBehaveLikeERC721 from './behavior/erc721';

async function singleFixture(): Promise<{ token: Contract; renderUtils: Contract }> {
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiResourceRenderUtils');
  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  const token = await singleFixtureWithArgs('RMRKNestingMultiResourceMock', [
    'NestingMultiResource',
    'NMR',
  ]);
  return { token, renderUtils };
}

async function parentChildFixture(): Promise<{ parent: Contract; child: Contract }> {
  return parentChildFixtureWithArgs(
    'RMRKNestingMultiResourceMock',
    ['Chunky', 'CHNK'],
    ['Monkey', 'MONK'],
  );
}

describe('NestingMultiResourceMock Nesting Behavior', function () {
  beforeEach(async function () {
    const { parent, child } = await loadFixture(parentChildFixture);
    this.parentToken = parent;
    this.childToken = child;
  });

  shouldBehaveLikeNesting(mintFromMock, nestMintFromMock, transfer, nestTransfer);
});

describe('NestingMultiResourceMock MR behavior', async () => {
  beforeEach(async function () {
    const { token, renderUtils } = await loadFixture(singleFixture);
    this.token = token;
    this.renderUtils = renderUtils;
  });

  shouldBehaveLikeMultiResource(mintFromMock, addResourceEntryFromMock, addResourceToToken);
});

describe('NestingMultiResourceMock ERC721 behavior', function () {
  let token: Contract;

  beforeEach(async function () {
    ({ token } = await loadFixture(singleFixture));
    this.token = token;
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
  });

  shouldBehaveLikeERC721('NestingMultiResource', 'NMR');
});

describe('NestingMultiResourceMock Other Behavior', function () {
  let addrs: SignerWithAddress[];
  let token: Contract;

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;

    ({ token } = await loadFixture(singleFixture));
    this.parentToken = token;
  });

  describe('Approval Cleaning', async function () {
    it('cleans token and resources approvals on transfer', async function () {
      const tokenId = 1;
      const tokenOwner = addrs[1];
      const newOwner = addrs[2];
      const approved = addrs[3];
      await token['mint(address,uint256)'](tokenOwner.address, tokenId);
      await token.connect(tokenOwner).approve(approved.address, tokenId);
      await token.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await token.getApproved(tokenId)).to.eql(approved.address);
      expect(await token.getApprovedForResources(tokenId)).to.eql(approved.address);

      await token.connect(tokenOwner).transferFrom(tokenOwner.address, newOwner.address, tokenId);

      expect(await token.getApproved(tokenId)).to.eql(ethers.constants.AddressZero);
      expect(await token.getApprovedForResources(tokenId)).to.eql(ethers.constants.AddressZero);
    });

    it('cleans token and resources approvals on burn', async function () {
      const tokenId = 1;
      const tokenOwner = addrs[1];
      const approved = addrs[3];
      await token['mint(address,uint256)'](tokenOwner.address, tokenId);
      await token.connect(tokenOwner).approve(approved.address, tokenId);
      await token.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await token.getApproved(tokenId)).to.eql(approved.address);
      expect(await token.getApprovedForResources(tokenId)).to.eql(approved.address);

      await token.connect(tokenOwner)['burn(uint256)'](tokenId);

      await expect(token.getApproved(tokenId)).to.be.revertedWithCustomError(
        token,
        'ERC721InvalidTokenId',
      );
      await expect(token.getApprovedForResources(tokenId)).to.be.revertedWithCustomError(
        token,
        'ERC721InvalidTokenId',
      );
    });
  });
});
