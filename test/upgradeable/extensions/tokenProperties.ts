import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { IERC165, IRMRKTokenProperties } from '../../interfaces';
import { RMRKTokenPropertiesMockUpgradeable } from '../../../typechain-types';
import { bn } from '../../utils';

// --------------- FIXTURES -----------------------

async function tokenPropertiesFixture() {
  const factory = await ethers.getContractFactory('RMRKTokenPropertiesMockUpgradeable');
  const tokenProperties = await factory.deploy();
  await tokenProperties.deployed();

  return { tokenProperties };
}

// --------------- TESTS -----------------------

describe('RMRKTokenPropertiesMockUpgradeable', async function () {
  let tokenProperties: RMRKTokenPropertiesMockUpgradeable;

  beforeEach(async function () {
    ({ tokenProperties } = await loadFixture(tokenPropertiesFixture));

    this.tokenProperties = tokenProperties;
  });

  shouldBehaveLikeTokenPropertiesInterface();

  describe('RMRKTokenProperties', async function () {
    let owner: SignerWithAddress;
    const tokenId = 1;
    const tokenId2 = 2;

    beforeEach(async function () {
      ({ tokenProperties } = await loadFixture(tokenPropertiesFixture));

      const signers = await ethers.getSigners();
      owner = signers[1];
    });

    it('can set and get token properties', async function () {
      await tokenProperties.setStringProperty(tokenId, 'description', 'test description');
      await tokenProperties.setStringProperty(tokenId, 'description1', 'test description');
      await tokenProperties.setBoolProperty(tokenId, 'rare', true);
      await tokenProperties.setAddressProperty(tokenId, 'owner', owner.address);
      await tokenProperties.setUintProperty(tokenId, 'atk', bn(100));
      await tokenProperties.setUintProperty(tokenId, 'health', bn(100));
      await tokenProperties.setUintProperty(tokenId, 'health', bn(95));
      await tokenProperties.setUintProperty(tokenId, 'health', bn(80));
      await tokenProperties.setBytesProperty(tokenId, 'data', '0x1234');

      expect(await tokenProperties.getStringTokenProperty(tokenId, 'description')).to.eql(
        'test description',
      );
      expect(await tokenProperties.getStringTokenProperty(tokenId, 'description1')).to.eql(
        'test description',
      );
      expect(await tokenProperties.getBoolTokenProperty(tokenId, 'rare')).to.eql(true);
      expect(await tokenProperties.getAddressTokenProperty(tokenId, 'owner')).to.eql(owner.address);
      expect(await tokenProperties.getUintTokenProperty(tokenId, 'atk')).to.eql(bn(100));
      expect(await tokenProperties.getUintTokenProperty(tokenId, 'health')).to.eql(bn(80));
      expect(await tokenProperties.getBytesTokenProperty(tokenId, 'data')).to.eql('0x1234');

      await tokenProperties.setStringProperty(tokenId, 'description', 'test description update');
      expect(await tokenProperties.getStringTokenProperty(tokenId, 'description')).to.eql(
        'test description update',
      );
    });

    it('can reuse keys and values are fine', async function () {
      await tokenProperties.setStringProperty(tokenId, 'X', 'X1');
      await tokenProperties.setStringProperty(tokenId2, 'X', 'X2');

      expect(await tokenProperties.getStringTokenProperty(tokenId, 'X')).to.eql('X1');
      expect(await tokenProperties.getStringTokenProperty(tokenId2, 'X')).to.eql('X2');
    });

    it('can reuse keys among different properties and values are fine', async function () {
      await tokenProperties.setStringProperty(tokenId, 'X', 'test description');
      await tokenProperties.setBoolProperty(tokenId, 'X', true);
      await tokenProperties.setAddressProperty(tokenId, 'X', owner.address);
      await tokenProperties.setUintProperty(tokenId, 'X', bn(100));
      await tokenProperties.setBytesProperty(tokenId, 'X', '0x1234');

      expect(await tokenProperties.getStringTokenProperty(tokenId, 'X')).to.eql('test description');
      expect(await tokenProperties.getBoolTokenProperty(tokenId, 'X')).to.eql(true);
      expect(await tokenProperties.getAddressTokenProperty(tokenId, 'X')).to.eql(owner.address);
      expect(await tokenProperties.getUintTokenProperty(tokenId, 'X')).to.eql(bn(100));
      expect(await tokenProperties.getBytesTokenProperty(tokenId, 'X')).to.eql('0x1234');
    });

    it('can reuse string values and values are fine', async function () {
      await tokenProperties.setStringProperty(tokenId, 'X', 'common string');
      await tokenProperties.setStringProperty(tokenId2, 'X', 'common string');

      expect(await tokenProperties.getStringTokenProperty(tokenId, 'X')).to.eql('common string');
      expect(await tokenProperties.getStringTokenProperty(tokenId2, 'X')).to.eql('common string');
    });
  });
});

async function shouldBehaveLikeTokenPropertiesInterface() {
  it('can support IERC165', async function () {
    expect(await this.tokenProperties.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IRMRKTokenProperties', async function () {
    expect(await this.tokenProperties.supportsInterface(IRMRKTokenProperties)).to.equal(true);
  });
}
