import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import shouldBehaveLikeNesting from './behavior/nesting'
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

describe('Nesting', function () {
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
