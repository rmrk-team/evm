import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { transfer, nestTransfer } from '../utils';
import shouldBehaveLikeNesting from '../behavior/nesting';
import shouldBehaveLikeERC721 from '../behavior/erc721';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

const ONE_ETH = ethers.utils.parseEther('1.0');

async function mint(token: Contract, to: string): Promise<number> {
  await token.mint(to, 1, { value: ONE_ETH });
  return await token.totalSupply();
}

async function nestMint(token: Contract, to: string, destinationId: number): Promise<number> {
  await token.mintNesting(to, 1, destinationId, { value: ONE_ETH });
  return await token.totalSupply();
}

describe('NestingMultiResourceImpl Nesting Behavior', function () {
  async function deployTokensFixture() {
    const NestingMRFactory = await ethers.getContractFactory('RMRKNestingImpl');
    const ownerChunky = await NestingMRFactory.deploy('Chunky', 'CHNK', 10000, ONE_ETH);
    await ownerChunky.deployed();

    const petMonkey = await NestingMRFactory.deploy('Monkey', 'MONK', 10000, ONE_ETH);
    await petMonkey.deployed();

    return { ownerChunky, petMonkey };
  }

  beforeEach(async function () {
    const { ownerChunky, petMonkey } = await loadFixture(deployTokensFixture);
    this.parentToken = ownerChunky;
    this.childToken = petMonkey;
  });

  shouldBehaveLikeNesting(mint, nestMint, transfer, nestTransfer);
});

// describe('NestingImpl ERC721 behavior', function () {
//   let token: Contract;

//   const name = 'RmrkTest';
//   const symbol = 'RMRKTST';

//   async function erc721NestingFixture() {
//     const Token = await ethers.getContractFactory('RMRKNestingImpl');
//     const tokenContract = await Token.deploy(name, symbol);
//     await tokenContract.deployed();
//     return tokenContract;
//   }

//   beforeEach(async function () {
//     token = await loadFixture(erc721NestingFixture);
//     this.token = token;
//     this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
//     this.commonERC721 = await ethers.getContractFactory('ERC721Mock');
//   });

//   shouldBehaveLikeERC721(name, symbol);
// });
