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

describe('Issuer', function () {
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let ownerChunky: Contract;

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  async function deployTokensFixture() {
    const CHNKY = await ethers.getContractFactory('RMRKNestingMultiResourceMock');
    ownerChunky = await CHNKY.deploy(name, symbol);
    await ownerChunky.deployed();
    return { ownerChunky };
  }

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const { ownerChunky } = await loadFixture(deployTokensFixture);
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
