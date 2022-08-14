import { ethers } from 'hardhat';
import shouldBehaveLikeERC721 from './behavior/erc721';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

// Based on https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/test/token/ERC721/ERC721.behavior.js

describe.skip('ERC721', function () {
  const name = 'Non Fungible Token';
  const symbol = 'NFT';

  async function deployErc721TokenFixture() {
    const Erc721 = await ethers.getContractFactory('ERC721Mock');
    const erc721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
    const token = await Erc721.deploy(name, symbol);
    await token.deployed();

    return { token, erc721Receiver };
  }

  beforeEach(async function () {
    const { token, erc721Receiver } = await loadFixture(deployErc721TokenFixture);
    this.token = token;
    this.ERC721Receiver = erc721Receiver;
  });

  shouldBehaveLikeERC721(name, symbol);
});
