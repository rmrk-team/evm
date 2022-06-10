import { ethers } from 'hardhat';
import { expect } from 'chai';
import { RMRKBaseStorageMock } from '../typechain';
import { RMRKEquippableMock } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('MultiResource', async () => {
  let base: RMRKBaseStorageMock;
  let token1: RMRKEquippableMock;
  let token2: RMRKEquippableMock;

  let owner: SignerWithAddress;
  let addrs: any[];

  const emptyOverwrite = ethers.utils.hexZeroPad('0x0', 8);
  const baseName = 'RmrkBaseStorageTest';

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  const name2 = 'petMonkey';
  const symbol2 = 'MONKE';

  // const name2 = '2_RmrkEquippableTest';
  // const symbol2 = '2_RMRKEQUPTST';

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

    const CHNKY = await ethers.getContractFactory('RMRKEquippableMock');
    token1 = await CHNKY.deploy(name, symbol);
    await token1.deployed();

    const MONKE = await ethers.getContractFactory('RMRKEquippableMock');
    token2 = await MONKE.deploy(name2, symbol2);
    await token2.deployed();

    // Mint 20 ownerChunkys.
    let i = 1;
    while (i <= 10) {
      await ownerChunky.doMint(addrs[0].address, i);
      i++;
    }
    i = 11;
    while (i <= 20) {
      await ownerChunky.doMint(addrs[1].address, i);
      i++;
    }

    // Mint 10 petMonkeys into ownerChunky

  });

  describe('Init Base Storage', async function () {
    it('Name', async function () {
      expect(await base.name()).to.equal(baseName);
    });
  });

  describe('Init Equippable token Chunky', async function () {
    it('Name', async function () {
      expect(await token1.name()).to.equal(name);
    });
  });

  describe('Init Equippable token Monkey', async function () {
    it('Name2', async function () {
      expect(await token2.name()).to.equal(name2);
    });
  });

  describe('Test set and get equippable resource', async function () {
    it('Set and get res', async function () {
      expect(await base.name()).to.equal(baseName);
    });
  });

});
