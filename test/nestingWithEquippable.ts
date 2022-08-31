import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { mintFromMock, nestMintFromMock, transfer, nestTransfer } from './utils';
import shouldBehaveLikeNesting from './behavior/nesting';
import shouldBehaveLikeERC721 from './behavior/erc721';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('NestingWithEquippableMock Nesting Behavior', function () {
  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  const name2 = 'petMonkey';
  const symbol2 = 'MONKE';

  async function nestingFixture() {
    const CHNKY = await ethers.getContractFactory('RMRKNestingWithEquippableMock');
    const ownerChunky = await CHNKY.deploy(name, symbol);
    await ownerChunky.deployed();

    const CHNKYEQUIPPABLE = await ethers.getContractFactory('RMRKEquippableWithNestingMock');
    const chunkyEquippable = await CHNKYEQUIPPABLE.deploy(ownerChunky.address);
    await chunkyEquippable.deployed();

    await ownerChunky.setEquippableAddress(chunkyEquippable.address);

    const MONKY = await ethers.getContractFactory('RMRKNestingWithEquippableMock');
    const petMonkey = await MONKY.deploy(name2, symbol2);
    await petMonkey.deployed();

    const MONKYEQUIPPABLE = await ethers.getContractFactory('RMRKEquippableWithNestingMock');
    const monkyEquippable = await MONKYEQUIPPABLE.deploy(petMonkey.address);
    await monkyEquippable.deployed();

    await petMonkey.setEquippableAddress(monkyEquippable.address);

    return { ownerChunky, petMonkey };
  }

  beforeEach(async function () {
    const { ownerChunky, petMonkey } = await loadFixture(nestingFixture);
    this.parentToken = ownerChunky;
    this.childToken = petMonkey;
  });

  shouldBehaveLikeNesting(mintFromMock, nestMintFromMock, transfer, nestTransfer);
});

describe('NestingWithEquippableMock ERC721 Behavior', function () {
  let token: Contract;

  const name = 'RmrkTest';
  const symbol = 'RMRKTST';

  async function nestingFixture() {
    const Token = await ethers.getContractFactory('RMRKNestingWithEquippableMock');
    const tokenContract = await Token.deploy(name, symbol);
    await tokenContract.deployed();

    const Equippable = await ethers.getContractFactory('RMRKEquippableWithNestingMock');
    const equippableContract = await Equippable.deploy(tokenContract.address);
    await equippableContract.deployed();

    await tokenContract.setEquippableAddress(equippableContract.address);
    return tokenContract;
  }

  beforeEach(async function () {
    token = await loadFixture(nestingFixture);
    this.token = token;
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
  });

  shouldBehaveLikeERC721(name, symbol);
});
