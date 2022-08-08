import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';
import shouldBehaveLikeNesting from './behavior/nesting';
import shouldBehaveLikeERC721 from './behavior/erc721';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

let nextTokenId = 1;
let nextChildTokenId = 100;

async function mint(token: Contract, to: string): Promise<number> {
  const tokenId = nextTokenId;
  nextTokenId++;
  await token['mint(address,uint256)'](to, tokenId);
  return tokenId;
}

async function nestMint(token: Contract, to: string, parentId: number): Promise<number> {
  const childTokenId = nextChildTokenId;
  nextChildTokenId++;
  await token['mint(address,uint256,uint256)'](to, childTokenId, parentId);
  return childTokenId;
}

async function transfer(
  token: Contract,
  caller: SignerWithAddress,
  to: string,
  tokenId: number,
): Promise<void> {
  await token.connect(caller)['transfer(address,uint256)'](to, tokenId);
}

async function nestTransfer(
  token: Contract,
  caller: SignerWithAddress,
  to: string,
  tokenId: number,
  parentId: number,
): Promise<void> {
  await token.connect(caller)['nestTransfer(address,uint256,uint256)'](to, tokenId, parentId);
}

describe('Nesting', function () {
  let parent: Contract;
  let child: Contract;
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

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
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const { parent, child } = await loadFixture(nestingFixture);
    this.parentToken = parent;
    this.childToken = child;
  });

  shouldBehaveLikeNesting(mint, nestMint, transfer, nestTransfer);

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
      const tokenId = await mint(child, owner.address);
      await expect(
        child['mint(address,uint256)'](owner.address, tokenId),
      ).to.be.revertedWithCustomError(child, 'ERC721TokenAlreadyMinted');
    });

    it('cannot nest mint already minted token', async function () {
      const parentId = await mint(parent, owner.address);
      const childId = await nestMint(child, parent.address, parentId);

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
