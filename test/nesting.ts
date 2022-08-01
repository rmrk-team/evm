import { ethers } from "hardhat"
import { Contract } from "ethers"
import shouldBehaveLikeNesting from "./behavior/nesting"
import shouldBehaveLikeERC721 from "./behavior/erc721"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"

describe('Nesting', function () {
  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  const name2 = 'petMonkey';
  const symbol2 = 'MONKE';

  async function nestingFixture() {
    const CHNKY = await ethers.getContractFactory('RMRKNestingMockWithReceiver');
    const ownerChunky = await CHNKY.deploy(name, symbol);
    await ownerChunky.deployed();

    const MONKY = await ethers.getContractFactory('RMRKNestingMockWithReceiver');
    const petMonkey = await MONKY.deploy(name2, symbol2);
    await petMonkey.deployed();

    return { ownerChunky, petMonkey };
  }

  beforeEach(async function () {
    const { ownerChunky, petMonkey } = await loadFixture(nestingFixture);
    this.parentToken = ownerChunky;
    this.childToken = petMonkey;
  });

  shouldBehaveLikeNesting(name, symbol, name2, symbol2);
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
