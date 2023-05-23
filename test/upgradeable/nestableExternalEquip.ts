import { ethers, upgrades } from 'hardhat';
import { expect } from 'chai';
import { mintFromMock, nestMintFromMock, transfer, nestTransfer } from '../utils';
import { IOtherInterface, IRMRKNestableExternalEquip, IRMRKExternalEquip } from '../interfaces';
import shouldBehaveLikeNestable from './behavior/nestable';
import shouldBehaveLikeERC721 from './behavior/erc721';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  RMRKExternalEquipMockUpgradeable,
  RMRKNestableExternalEquipMockUpgradeable,
} from '../../typechain-types';

describe('NestableWithEquippableMock Nestable Behavior', function () {
  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  const name2 = 'petMonkey';
  const symbol2 = 'MONKE';

  async function nestableFixture() {
    const CHNKY = await ethers.getContractFactory('RMRKNestableExternalEquipMockUpgradeable');
    const ownerChunky = <RMRKNestableExternalEquipMockUpgradeable>(
      await upgrades.deployProxy(CHNKY, [name, symbol])
    );
    await ownerChunky.deployed();

    const CHNKYEQUIPPABLE = await ethers.getContractFactory('RMRKExternalEquipMockUpgradeable');
    const chunkyEquippable = <RMRKExternalEquipMockUpgradeable>(
      await upgrades.deployProxy(CHNKYEQUIPPABLE, [ownerChunky.address])
    );
    await chunkyEquippable.deployed();

    await ownerChunky.setEquippableAddress(chunkyEquippable.address);

    const MONKY = await ethers.getContractFactory('RMRKNestableExternalEquipMockUpgradeable');
    const petMonkey = <RMRKNestableExternalEquipMockUpgradeable>(
      await upgrades.deployProxy(MONKY, [name2, symbol2])
    );
    await petMonkey.deployed();

    const MONKYEQUIPPABLE = await ethers.getContractFactory('RMRKExternalEquipMockUpgradeable');
    const monkyEquippable = <RMRKExternalEquipMockUpgradeable>(
      await upgrades.deployProxy(MONKYEQUIPPABLE, [petMonkey.address])
    );
    await monkyEquippable.deployed();

    await petMonkey.setEquippableAddress(monkyEquippable.address);

    return { ownerChunky, petMonkey };
  }

  beforeEach(async function () {
    const { ownerChunky, petMonkey } = await loadFixture(nestableFixture);
    this.parentToken = ownerChunky;
    this.childToken = petMonkey;
  });

  shouldBehaveLikeNestable(mintFromMock, nestMintFromMock, transfer, nestTransfer);
});

describe('NestableWithEquippableMock ERC721 Behavior', function () {
  const name = 'RmrkTest';
  const symbol = 'RMRKTST';

  async function nestableFixture() {
    const nestableFactory = await ethers.getContractFactory(
      'RMRKNestableExternalEquipMockUpgradeable',
    );
    const nestable = <RMRKNestableExternalEquipMockUpgradeable>(
      await upgrades.deployProxy(nestableFactory, [name, symbol])
    );
    await nestable.deployed();

    const equipFactory = await ethers.getContractFactory('RMRKExternalEquipMockUpgradeable');
    const equip = <RMRKExternalEquipMockUpgradeable>(
      await upgrades.deployProxy(equipFactory, [nestable.address])
    );
    await equip.deployed();

    await nestable.setEquippableAddress(equip.address);
    return { equip, nestable };
  }

  beforeEach(async function () {
    const { nestable, equip } = await loadFixture(nestableFixture);
    this.token = nestable;
    this.equip = equip;
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMockUpgradeable');
  });

  describe('Interface support', function () {
    it('can support INestableExternalEquip', async function () {
      expect(await this.token.supportsInterface(IRMRKNestableExternalEquip)).to.equal(true);
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
