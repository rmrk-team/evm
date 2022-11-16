import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  addAssetEntryFromMock,
  addAssetToToken,
  parentChildFixtureWithArgs,
  singleFixtureWithArgs,
  mintFromMock,
  nestMintFromMock,
  nestTransfer,
  transfer,
} from './utils';
import shouldBehaveLikeNestable from './behavior/nestable';
import shouldBehaveLikeMultiAsset from './behavior/multiasset';
import shouldBehaveLikeERC721 from './behavior/erc721';

async function singleFixture(): Promise<{ token: Contract; renderUtils: Contract }> {
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');
  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  const token = await singleFixtureWithArgs('RMRKNestableMultiAssetMock', [
    'NestableMultiAsset',
    'NMR',
  ]);
  return { token, renderUtils };
}

async function parentChildFixture(): Promise<{ parent: Contract; child: Contract }> {
  return parentChildFixtureWithArgs(
    'RMRKNestableMultiAssetMock',
    ['Chunky', 'CHNK'],
    ['Monkey', 'MONK'],
  );
}

describe('NestableMultiAssetMock Nestable Behavior', function () {
  beforeEach(async function () {
    const { parent, child } = await loadFixture(parentChildFixture);
    this.parentToken = parent;
    this.childToken = child;
  });

  shouldBehaveLikeNestable(mintFromMock, nestMintFromMock, transfer, nestTransfer);
});

describe('NestableMultiAssetMock MR behavior', async () => {
  beforeEach(async function () {
    const { token, renderUtils } = await loadFixture(singleFixture);
    this.token = token;
    this.renderUtils = renderUtils;
  });

  shouldBehaveLikeMultiAsset(mintFromMock, addAssetEntryFromMock, addAssetToToken);
});

describe('NestableMultiAssetMock ERC721 behavior', function () {
  let token: Contract;

  beforeEach(async function () {
    ({ token } = await loadFixture(singleFixture));
    this.token = token;
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
  });

  shouldBehaveLikeERC721('NestableMultiAsset', 'NMR');
});

describe('NestableMultiAssetMock Other Behavior', function () {
  let addrs: SignerWithAddress[];
  let token: Contract;

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;

    ({ token } = await loadFixture(singleFixture));
    this.parentToken = token;
  });

  describe('Approval Cleaning', async function () {
    it('cleans token and assets approvals on transfer', async function () {
      const tokenId = 1;
      const tokenOwner = addrs[1];
      const newOwner = addrs[2];
      const approved = addrs[3];
      await token['mint(address,uint256)'](tokenOwner.address, tokenId);
      await token.connect(tokenOwner).approve(approved.address, tokenId);
      await token.connect(tokenOwner).approveForAssets(approved.address, tokenId);

      expect(await token.getApproved(tokenId)).to.eql(approved.address);
      expect(await token.getApprovedForAssets(tokenId)).to.eql(approved.address);

      await token.connect(tokenOwner).transferFrom(tokenOwner.address, newOwner.address, tokenId);

      expect(await token.getApproved(tokenId)).to.eql(ethers.constants.AddressZero);
      expect(await token.getApprovedForAssets(tokenId)).to.eql(ethers.constants.AddressZero);
    });

    it('cleans token and assets approvals on burn', async function () {
      const tokenId = 1;
      const tokenOwner = addrs[1];
      const approved = addrs[3];
      await token['mint(address,uint256)'](tokenOwner.address, tokenId);
      await token.connect(tokenOwner).approve(approved.address, tokenId);
      await token.connect(tokenOwner).approveForAssets(approved.address, tokenId);

      expect(await token.getApproved(tokenId)).to.eql(approved.address);
      expect(await token.getApprovedForAssets(tokenId)).to.eql(approved.address);

      await token.connect(tokenOwner)['burn(uint256)'](tokenId);

      await expect(token.getApproved(tokenId)).to.be.revertedWithCustomError(
        token,
        'ERC721InvalidTokenId',
      );
      await expect(token.getApprovedForAssets(tokenId)).to.be.revertedWithCustomError(
        token,
        'ERC721InvalidTokenId',
      );
    });
  });
});
