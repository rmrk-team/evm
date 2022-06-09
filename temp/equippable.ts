import { ethers } from 'hardhat';
import { expect } from 'chai';
import { RMRKBaseStorageMock } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('MultiResource', async () => {
  let base: RMRKBaseStorageMock;

  let owner: SignerWithAddress;
  let addrs: any[];

  const emptyOverwrite = ethers.utils.hexZeroPad('0x0', 8);
  const baseName = 'RmrkBaseStorageTest';
  const name = 'RmrkEquippableTest';
  const symbol = 'RMRKEQUPTST';

  const srcDefault = 'src';
  const thumbDefault = 'thumb';
  const metaURIDefault = 'metaURI';
  const customDefault: string[] = [];

  beforeEach(async () => {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const Base = await ethers.getContractFactory('RMRKBaseStorage');
    base = await Base.deploy(baseName);
    await base.deployed();

    // const Token = await ethers.getContractFactory('MultiResourceToken721Mock');
    // token = await Token.deploy(name, symbol);
    // await token.deployed();
  });

  describe('Init Base Storage', async function () {
    it('Name', async function () {
      expect(await base.name()).to.equal(baseName);
    });
  });
  describe('Base storage set', async function () {
    it('Name', async function () {
      expect(await base.name()).to.equal(baseName);
    });
  });
});
