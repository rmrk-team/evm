import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import shouldBehaveLikeNesting from './behavior/nesting'
import shouldBehaveLikeERC721 from './behavior/erc721';

// TODO: Transfer - transfer now does double duty as removeChild

describe('Nesting', function () {
  let ownerChunky: Contract;
  let petMonkey: Contract;

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  const name2 = 'petMonkey';
  const symbol2 = 'MONKE';

  beforeEach(async function () {
    const CHNKY = await ethers.getContractFactory('RMRKNestingMockWithReceiver');
    ownerChunky = await CHNKY.deploy(name, symbol);
    await ownerChunky.deployed();
    this.parentToken = ownerChunky;

    const MONKY = await ethers.getContractFactory('RMRKNestingMockWithReceiver');
    petMonkey = await MONKY.deploy(name2, symbol2);
    await petMonkey.deployed();
    this.childToken = petMonkey;
  });

  shouldBehaveLikeNesting(name, symbol, name2, symbol2);
});

// FIXME: several tests are still failing, fixing isn't trivial
describe('ERC721', function () {
  let token: Contract;

  const name = 'RmrkTest';
  const symbol = 'RMRKTST';

  beforeEach(async function () {
    const Token = await ethers.getContractFactory('RMRKNestingMock');
    token = await Token.deploy(name, symbol);
    await token.deployed();
    this.token = token;
    this.ERC721Receiver = await ethers.getContractFactory(
      'ERC721ReceiverMockWithRMRKNestingReceiver',
    );
    this.RMRKNestingReceiver = await ethers.getContractFactory('RMRKNestingReceiverMock');
    this.commonERC721 = await ethers.getContractFactory('ERC721Mock');
  });

  shouldBehaveLikeERC721(name, symbol);
});
