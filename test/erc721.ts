import { ethers } from 'hardhat';
import shouldBehaveLikeERC721 from './behavior/erc721'

// Based on https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/test/token/ERC721/ERC721.behavior.js

describe('ERC721', function () {
  const name = 'Non Fungible Token';
  const symbol = 'NFT';

  beforeEach(async function () {
    const Erc721 = await ethers.getContractFactory('ERC721Mock');
    const token = await Erc721.deploy(name, symbol);
    await token.deployed();
    this.token = token;
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
  });

  shouldBehaveLikeERC721(name, symbol);
});
