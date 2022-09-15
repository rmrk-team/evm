import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  mintFromMock,
  nestMintFromMock,
  transfer,
  nestTransfer,
  singleFixtureWithArgs,
  parentChildFixtureWithArgs,
} from './utils';
import shouldBehaveLikeNesting from './behavior/nesting';
import shouldBehaveLikeERC721 from './behavior/erc721';

const parentName = 'ownerChunky';
const parentSymbol = 'CHNKY';

const childName = 'petMonkey';
const childSymbol = 'MONKE';

async function singleFixture(): Promise<Contract> {
  return singleFixtureWithArgs('RMRKNestingMock', [parentName, parentSymbol]);
}

async function parentChildFixture(): Promise<{ parent: Contract; child: Contract }> {
  return parentChildFixtureWithArgs(
    'RMRKNestingMock',
    [parentName, parentSymbol],
    [childName, childSymbol],
  );
}

describe('NestingMock', function () {
  let parent: Contract;
  let child: Contract;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    owner = (await ethers.getSigners())[0];

    ({ parent, child } = await loadFixture(parentChildFixture));
    this.parentToken = parent;
    this.childToken = child;
  });

  shouldBehaveLikeNesting(mintFromMock, nestMintFromMock, transfer, nestTransfer);

  describe('Init', async function () {
    it('Name', async function () {
      expect(await parent.name()).to.equal(parentName);
      expect(await child.name()).to.equal(childName);
    });

    it('Symbol', async function () {
      expect(await parent.symbol()).to.equal(parentSymbol);
      expect(await child.symbol()).to.equal(childSymbol);
    });
  });

  describe('Minting', async function () {
    it('cannot mint already minted token', async function () {
      const tokenId = await mintFromMock(child, owner.address);
      await expect(
        child['mint(address,uint256)'](owner.address, tokenId),
      ).to.be.revertedWithCustomError(child, 'ERC721TokenAlreadyMinted');
    });

    it('cannot nest mint already minted token', async function () {
      const parentId = await mintFromMock(parent, owner.address);
      const childId = await nestMintFromMock(child, parent.address, parentId);

      await expect(
        child['nestMint(address,uint256,uint256)'](parent.address, childId, parentId),
      ).to.be.revertedWithCustomError(child, 'ERC721TokenAlreadyMinted');
    });

    it('cannot nest mint already minted token', async function () {
      const parentId = await mintFromMock(parent, owner.address);
      const childId = await nestMintFromMock(child, parent.address, parentId);

      await expect(
        child['nestMint(address,uint256,uint256)'](parent.address, childId, parentId),
      ).to.be.revertedWithCustomError(child, 'ERC721TokenAlreadyMinted');
    });
  });
});

describe('NestingMock ERC721 behavior', function () {
  let token: Contract;

  beforeEach(async function () {
    token = await loadFixture(singleFixture);
    this.token = token;
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
  });

  shouldBehaveLikeERC721(parentName, parentSymbol);
});
