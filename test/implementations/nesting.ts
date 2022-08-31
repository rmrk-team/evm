import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { transfer, nestTransfer } from '../utils';
import shouldBehaveLikeNesting from '../behavior/nesting';
import shouldBehaveLikeERC721 from '../behavior/erc721';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { mintFromImpl, nestMintFromImpl, ONE_ETH } from '../utils';

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

  shouldBehaveLikeNesting(mintFromImpl, nestMintFromImpl, transfer, nestTransfer);
});

// describe('NestingImpl ERC721 behavior', function () {
//   let token: Contract;

//   const name = 'RmrkTest';
//   const symbol = 'RMRKTST';

//   async function erc721NestingFixture() {
//     const Token = await ethers.getContractFactory('RMRKNestingImpl');
//     const tokenContract = await Token.deploy(name, symbol, 10000, ONE_ETH);
//     await tokenContract.deployed();
//     return tokenContract;
//   }

//   beforeEach(async function () {
//     token = await loadFixture(erc721NestingFixture);
//     this.token = token;
//     this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
//   });

//   shouldBehaveLikeERC721(name, symbol);
// });
