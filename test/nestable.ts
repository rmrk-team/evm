import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  bn,
  mintFromMock,
  nestMintFromMock,
  transfer,
  nestTransfer,
  singleFixtureWithArgs,
  parentChildFixtureWithArgs,
} from './utils';
import shouldBehaveLikeNestable from './behavior/nestable';
import shouldBehaveLikeERC721 from './behavior/erc721';

const parentName = 'ownerChunky';
const parentSymbol = 'CHNKY';

const childName = 'petMonkey';
const childSymbol = 'MONKE';

async function singleFixture(): Promise<Contract> {
  return singleFixtureWithArgs('RMRKNestableMock', [parentName, parentSymbol]);
}

async function parentChildFixture(): Promise<{ parent: Contract; child: Contract }> {
  return parentChildFixtureWithArgs(
    'RMRKNestableMock',
    [parentName, parentSymbol],
    [childName, childSymbol],
  );
}

describe('NestableMock', function () {
  let parent: Contract;
  let child: Contract;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    owner = (await ethers.getSigners())[0];

    ({ parent, child } = await loadFixture(parentChildFixture));
    this.parentToken = parent;
    this.childToken = child;
  });

  shouldBehaveLikeNestable(mintFromMock, nestMintFromMock, transfer, nestTransfer);

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
    it('cannot mint id 0', async function () {
      const tokenId = 0;
      await expect(
        child['mint(address,uint256)'](owner.address, tokenId),
      ).to.be.revertedWithCustomError(child, 'RMRKIdZeroForbidden');
    });

    it('cannot nest mint id 0', async function () {
      const parentId = await mintFromMock(child, owner.address);
      const childId = 0;
      await expect(
        child['nestMint(address,uint256,uint256)'](parent.address, childId, parentId),
      ).to.be.revertedWithCustomError(child, 'RMRKIdZeroForbidden');
    });

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

describe('NestableMock ERC721 behavior', function () {
  let token: Contract;

  beforeEach(async function () {
    token = await loadFixture(singleFixture);
    this.token = token;
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
  });

  shouldBehaveLikeERC721(parentName, parentSymbol);
});

describe('NestableMock transfer hooks', function () {
  let parent: Contract;
  let child: Contract;
  let owner: SignerWithAddress;
  let otherOwner: SignerWithAddress;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    otherOwner = signers[1];

    ({ parent, child } = await loadFixture(parentChildFixture));
    this.parentToken = parent;
    this.childToken = child;
  });

  it('keeps track of balances per NFTs', async function () {
    const parentId = await mintFromMock(parent, owner.address);
    const childId = await nestMintFromMock(child, parent.address, parentId);

    expect(await parent.balancePerNftOf(owner.address, 0)).to.eql(bn(1));
    expect(await child.balancePerNftOf(parent.address, parentId)).to.eql(bn(1));

    await parent.transferChild(
      parentId,
      otherOwner.address,
      0,
      0,
      child.address,
      childId,
      true,
      '0x',
    );
    expect(await child.balancePerNftOf(parent.address, parentId)).to.eql(bn(0));
    expect(await child.balancePerNftOf(otherOwner.address, 0)).to.eql(bn(1));

    // Nest again
    await child
      .connect(otherOwner)
      .nestTransferFrom(otherOwner.address, parent.address, childId, parentId, '0x');

    expect(await child.balancePerNftOf(parent.address, parentId)).to.eql(bn(1));
    expect(await child.balancePerNftOf(otherOwner.address, 0)).to.eql(bn(0));

    await parent.acceptChild(parentId, 0, child.address, childId);

    await parent['burn(uint256,uint256)'](parentId, 1);
    expect(await parent.balancePerNftOf(owner.address, 0)).to.eql(bn(0));
    expect(await child.balancePerNftOf(parent.address, parentId)).to.eql(bn(0));
    expect(await child.balancePerNftOf(otherOwner.address, 0)).to.eql(bn(0));
  });
});
