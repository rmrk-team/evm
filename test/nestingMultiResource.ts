import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import shouldBehaveLikeNesting from './behavior/nesting';
import shouldBehaveLikeMultiResource from './behavior/multiresource';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

// TODO: Transfer - transfer now does double duty as removeChild

describe('Nesting', function () {
  let ownerChunky: Contract;
  let petMonkey: Contract;

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  const name2 = 'petMonkey';
  const symbol2 = 'MONKE';

  async function deployTokensFixture() {
    const CHNKY = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
    ownerChunky = await CHNKY.deploy(name, symbol);
    await ownerChunky.deployed();

    const MONKY = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
    petMonkey = await MONKY.deploy(name2, symbol2);
    await petMonkey.deployed();

    return { ownerChunky, petMonkey };
  }

  beforeEach(async function () {
    const { ownerChunky, petMonkey } = await loadFixture(deployTokensFixture);
    this.parentToken = ownerChunky;
    this.childToken = petMonkey;
  });

  shouldBehaveLikeNesting(name, symbol, name2, symbol2);
});

describe('MultiResource', function () {
  let token: Contract;

  const name = 'RmrkTest';
  const symbol = 'RMRKTST';

  async function deployTokensFixture() {
    const Token = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
    const testToken = await Token.deploy(name, symbol);
    await testToken.deployed();
    return { testToken };
  }

  beforeEach(async function () {
    const { testToken } = await loadFixture(deployTokensFixture);
    this.token = testToken;
  });

  shouldBehaveLikeMultiResource(name, symbol);
});

describe('Nesting MR', function () {
  let addrs: SignerWithAddress[];
  let chunky: Contract;

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  async function deployTokensFixture() {
    const CHNKY = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
    chunky = await CHNKY.deploy(name, symbol);
    await chunky.deployed();
    return { chunky };
  }

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;

    const { chunky } = await loadFixture(deployTokensFixture);
    this.parentToken = chunky;
  });

  describe('Approval Cleaning', async function () {
    it('cleans token and resources approvals on transfer', async function () {
      const tokenId = 1;
      const tokenOwner = addrs[1];
      const newOwner = addrs[2];
      const approved = addrs[3];
      await chunky['mint(address,uint256)'](tokenOwner.address, tokenId);
      await chunky.connect(tokenOwner).approve(approved.address, tokenId);
      await chunky.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(approved.address);
      expect(await chunky.getApprovedForResources(tokenId)).to.eql(approved.address);

      await chunky.connect(tokenOwner).transfer(newOwner.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(ethers.constants.AddressZero);
      expect(await chunky.getApprovedForResources(tokenId)).to.eql(ethers.constants.AddressZero);
    });

    it('cleans token and resources approvals on burn', async function () {
      const tokenId = 1;
      const tokenOwner = addrs[1];
      const approved = addrs[3];
      await chunky['mint(address,uint256)'](tokenOwner.address, tokenId);
      await chunky.connect(tokenOwner).approve(approved.address, tokenId);
      await chunky.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(approved.address);
      expect(await chunky.getApprovedForResources(tokenId)).to.eql(approved.address);

      await chunky.connect(tokenOwner).burn(tokenId);

      await expect(chunky.getApproved(tokenId)).to.be.revertedWithCustomError(
        chunky,
        'ERC721InvalidTokenId',
      );
      await expect(chunky.getApprovedForResources(tokenId)).to.be.revertedWithCustomError(
        chunky,
        'ERC721InvalidTokenId',
      );
    });
  });
});