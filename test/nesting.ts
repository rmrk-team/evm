import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';
import { mintTokenId, nestMinttokenId, transfer, nestTransfer } from './utils';
import shouldBehaveLikeNesting from './behavior/nesting';
import shouldBehaveLikeERC721 from './behavior/erc721';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('Nesting', function () {
  let parent: Contract;
  let child: Contract;
  let owner: SignerWithAddress;

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  const name2 = 'petMonkey';
  const symbol2 = 'MONKE';

  async function nestingFixture() {
    const NestingFactory = await ethers.getContractFactory('RMRKNestingMockWithReceiver');
    parent = await NestingFactory.deploy(name, symbol);
    await parent.deployed();

    child = await NestingFactory.deploy(name2, symbol2);
    await child.deployed();

    return { parent, child };
  }

  beforeEach(async function () {
    owner = (await ethers.getSigners())[0];

    const { parent, child } = await loadFixture(nestingFixture);
    this.parentToken = parent;
    this.childToken = child;
  });

  shouldBehaveLikeNesting(mintTokenId, nestMinttokenId, transfer, nestTransfer);

  describe('Init', async function () {
    it('Name', async function () {
      expect(await parent.name()).to.equal(name);
      expect(await child.name()).to.equal(name2);
    });

    it('Symbol', async function () {
      expect(await parent.symbol()).to.equal(symbol);
      expect(await child.symbol()).to.equal(symbol2);
    });
  });

  describe('Minting', async function () {
    it('cannot mint already minted token', async function () {
      const tokenId = await mintTokenId(child, owner.address);
      await expect(
        child['mint(address,uint256)'](owner.address, tokenId),
      ).to.be.revertedWithCustomError(child, 'ERC721TokenAlreadyMinted');
    });

    it('cannot nest mint already minted token', async function () {
      const parentId = await mintTokenId(parent, owner.address);
      const childId = await nestMinttokenId(child, parent.address, parentId);

      await expect(
        child['mint(address,uint256,uint256)'](parent.address, childId, parentId),
      ).to.be.revertedWithCustomError(child, 'ERC721TokenAlreadyMinted');
    });
  });
});

describe('ERC721', function () {
  let token: Contract;

  const name = 'RmrkTest';
  const symbol = 'RMRKTST';

  async function erc721NestingFixture() {
    const Token = await ethers.getContractFactory('RMRKNestingMock');
    const tokenContract = await Token.deploy(name, symbol);
    await tokenContract.deployed();
    return tokenContract;
  }

  beforeEach(async function () {
    token = await loadFixture(erc721NestingFixture);
    this.token = token;
    this.ERC721Receiver = await ethers.getContractFactory(
      'ERC721ReceiverMockWithRMRKNestingReceiver',
    );
    this.RMRKNestingReceiver = await ethers.getContractFactory('RMRKNestingReceiverMock');
    this.commonERC721 = await ethers.getContractFactory('ERC721Mock');
  });

  shouldBehaveLikeERC721(name, symbol);
});
