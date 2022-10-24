import { ethers } from 'hardhat';
import { expect } from 'chai';
import { mintFromMock, nestMintFromMock, transfer, nestTransfer } from './utils';
import { IOtherInterface, IRMRKNestingExternalEquip, IRMRKExternalEquip } from './interfaces';
import shouldBehaveLikeNesting from './behavior/nesting';
import shouldBehaveLikeERC721 from './behavior/erc721';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('NestingWithEquippableMock Nesting Behavior', function () {
  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  const name2 = 'petMonkey';
  const symbol2 = 'MONKE';

  async function nestingFixture() {
    const CHNKY = await ethers.getContractFactory('RMRKNestingExternalEquipMock');
    const ownerChunky = await CHNKY.deploy(name, symbol);
    await ownerChunky.deployed();

    const CHNKYEQUIPPABLE = await ethers.getContractFactory('RMRKExternalEquipMock');
    const chunkyEquippable = await CHNKYEQUIPPABLE.deploy(ownerChunky.address);
    await chunkyEquippable.deployed();

    await ownerChunky.setEquippableAddress(chunkyEquippable.address);

    const MONKY = await ethers.getContractFactory('RMRKNestingExternalEquipMock');
    const petMonkey = await MONKY.deploy(name2, symbol2);
    await petMonkey.deployed();

    const MONKYEQUIPPABLE = await ethers.getContractFactory('RMRKExternalEquipMock');
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
  const name = 'RmrkTest';
  const symbol = 'RMRKTST';

  async function nestingFixture() {
    const nestingFactory = await ethers.getContractFactory('RMRKNestingExternalEquipMock');
    const nesting = await nestingFactory.deploy(name, symbol);
    await nesting.deployed();

    const equipFactory = await ethers.getContractFactory('RMRKExternalEquipMock');
    const equip = await equipFactory.deploy(nesting.address);
    await equip.deployed();

    await nesting.setEquippableAddress(equip.address);
    return { equip, nesting };
  }

  beforeEach(async function () {
    const { nesting, equip } = await loadFixture(nestingFixture);
    this.token = nesting;
    this.equip = equip;
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
  });

  describe('Interface support', function () {
    it('can support INestingExternalEquip', async function () {
      expect(await this.token.supportsInterface(IRMRKNestingExternalEquip)).to.equal(true);
    });
    it('can support IExternalEquip', async function () {
      expect(await this.equip.supportsInterface(IRMRKExternalEquip)).to.equal(true);
    });

    it('cannot support other interfaceId', async function () {
      expect(await this.token.supportsInterface(IOtherInterface)).to.equal(false);
      expect(await this.equip.supportsInterface(IOtherInterface)).to.equal(false);
    });
  });

  shouldBehaveLikeERC721(name, symbol);
});
