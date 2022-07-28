import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import shouldBehaveLikeNesting from './behavior/nesting';
import shouldBehaveLikeMultiResource from './behavior/multiresource';

// TODO: Transfer - transfer now does double duty as removeChild

describe('Nesting', function () {
  let ownerChunky: Contract;
  let petMonkey: Contract;

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  const name2 = 'petMonkey';
  const symbol2 = 'MONKE';

  beforeEach(async function () {
    const CHNKY = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
    ownerChunky = await CHNKY.deploy(name, symbol);
    await ownerChunky.deployed();
    this.parentToken = ownerChunky;

    const MONKY = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
    petMonkey = await MONKY.deploy(name2, symbol2);
    await petMonkey.deployed();
    this.childToken = petMonkey;
  });

  shouldBehaveLikeNesting(name, symbol, name2, symbol2);
});

describe('MultiResource', function () {
  let token: Contract;

  const name = 'RmrkTest';
  const symbol = 'RMRKTST';

  beforeEach(async function () {
    const Token = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
    token = await Token.deploy(name, symbol);
    await token.deployed();
    this.token = token;
  });

  shouldBehaveLikeMultiResource(name, symbol);
});

describe('Nesting MR', function () {
  let addrs: SignerWithAddress[];
  let chunky: Contract;

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;

    const CHNKY = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
    chunky = await CHNKY.deploy(name, symbol);
    await chunky.deployed();
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

describe('Issuer', function () {
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let ownerChunky: Contract;

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const CHNKY = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
    ownerChunky = await CHNKY.deploy(name, symbol);
    await ownerChunky.deployed();
    this.parentToken = ownerChunky;
  });

  describe('Issuer', async function () {
    it('can set and get issuer', async function () {
      const newIssuerAddr = addrs[1].address;
      expect(await ownerChunky.getIssuer()).to.equal(owner.address);

      await ownerChunky.setIssuer(newIssuerAddr);
      expect(await ownerChunky.getIssuer()).to.equal(newIssuerAddr);
    });

    it('cannot set issuer if not issuer', async function () {
      const newIssuer = addrs[1];
      await expect(
        ownerChunky.connect(newIssuer).setIssuer(newIssuer.address),
      ).to.be.revertedWithCustomError(ownerChunky, 'RMRKOnlyIssuer');
    });
  });
});
