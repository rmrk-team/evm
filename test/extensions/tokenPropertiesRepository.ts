import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  IERC165,
  IRMRKTokenPropertiesRepository,
  IRMRKPropertiesAccessControl,
} from '../interfaces';
import {
  RMRKMultiAssetMock,
  OwnableLockMock,
  RMRKTokenPropertiesRepositoryMock,
} from '../../typechain-types';
import { bn } from '../utils';

// --------------- FIXTURES -----------------------

async function tokenPropertiesFixture() {
  const factory = await ethers.getContractFactory('RMRKTokenPropertiesRepositoryMock');
  const tokenProperties = await factory.deploy();
  await tokenProperties.deployed();

  return { tokenProperties };
}

async function collectionFixture() {
  const factory = await ethers.getContractFactory('RMRKMultiAssetMock');
  const collection = await factory.deploy('Collection', 'COLL');
  await collection.deployed();

  return { collection };
}

async function ownedCollectionFixture() {
  const factory = await ethers.getContractFactory('OwnableLockMock');
  const ownedCollection = await factory.deploy();
  await ownedCollection.deployed();

  return { ownedCollection };
}

// --------------- TESTS -----------------------

describe('RMRKTokenPropertiesRepositoryMock', async function () {
  let tokenProperties: RMRKTokenPropertiesRepositoryMock;
  let collection: RMRKMultiAssetMock;
  let ownedCollection: OwnableLockMock;

  beforeEach(async function () {
    ({ tokenProperties } = await loadFixture(tokenPropertiesFixture));
    ({ collection } = await loadFixture(collectionFixture));
    ({ ownedCollection } = await loadFixture(ownedCollectionFixture));

    this.tokenProperties = tokenProperties;
    this.collection = collection;
    this.ownedCollection = ownedCollection;
  });

  shouldBehaveLikeTokenPropertiesRepositoryInterface();

  describe('RMRKTokenPropertiesRepository', async function () {
    let issuer: SignerWithAddress;
    let owner: SignerWithAddress;
    const tokenId = 1;
    const tokenId2 = 2;

    beforeEach(async function () {
      ({ tokenProperties } = await loadFixture(tokenPropertiesFixture));

      const signers = await ethers.getSigners();
      issuer = signers[0];
      owner = signers[1];

      await tokenProperties.registerAccessControl(collection.address, issuer.address, false);
    });

    it('can set and get token properties', async function () {
      expect(
        await tokenProperties.setStringProperty(
          collection.address,
          tokenId,
          'description',
          'test description',
        ),
      )
        .to.emit(tokenProperties, 'StringPropertySet')
        .withArgs(collection.address, tokenId, 'description', 'test description');
      expect(
        await tokenProperties.setStringProperty(
          collection.address,
          tokenId,
          'description1',
          'test description',
        ),
      )
        .to.emit(tokenProperties, 'StringPropertySet')
        .withArgs(collection.address, tokenId, 'description1', 'test description');
      expect(await tokenProperties.setBoolProperty(collection.address, tokenId, 'rare', true))
        .to.emit(tokenProperties, 'BoolPropertySet')
        .withArgs(collection.address, tokenId, 'rare', true);
      expect(
        await tokenProperties.setAddressProperty(
          collection.address,
          tokenId,
          'owner',
          owner.address,
        ),
      )
        .to.emit(tokenProperties, 'AddressPropertySet')
        .withArgs(collection.address, tokenId, 'owner', owner.address);
      expect(await tokenProperties.setUintProperty(collection.address, tokenId, 'atk', bn(100)))
        .to.emit(tokenProperties, 'UintPropertySet')
        .withArgs(collection.address, tokenId, 'atk', bn(100));
      expect(await tokenProperties.setUintProperty(collection.address, tokenId, 'health', bn(100)))
        .to.emit(tokenProperties, 'UintPropertySet')
        .withArgs(collection.address, tokenId, 'health', bn(100));
      expect(await tokenProperties.setUintProperty(collection.address, tokenId, 'health', bn(95)))
        .to.emit(tokenProperties, 'UintPropertySet')
        .withArgs(collection.address, tokenId, 'health', bn(95));
      expect(await tokenProperties.setUintProperty(collection.address, tokenId, 'health', bn(80)))
        .to.emit(tokenProperties, 'UintPropertySet')
        .withArgs(collection.address, tokenId, 'health', bn(80));
      expect(await tokenProperties.setBytesProperty(collection.address, tokenId, 'data', '0x1234'))
        .to.emit(tokenProperties, 'BytesPropertySet')
        .withArgs(collection.address, tokenId, 'data', '0x1234');

      expect(
        await tokenProperties.getStringTokenProperty(collection.address, tokenId, 'description'),
      ).to.eql('test description');
      expect(
        await tokenProperties.getStringTokenProperty(collection.address, tokenId, 'description1'),
      ).to.eql('test description');
      expect(
        await tokenProperties.getBoolTokenProperty(collection.address, tokenId, 'rare'),
      ).to.eql(true);
      expect(
        await tokenProperties.getAddressTokenProperty(collection.address, tokenId, 'owner'),
      ).to.eql(owner.address);
      expect(await tokenProperties.getUintTokenProperty(collection.address, tokenId, 'atk')).to.eql(
        bn(100),
      );
      expect(
        await tokenProperties.getUintTokenProperty(collection.address, tokenId, 'health'),
      ).to.eql(bn(80));
      expect(
        await tokenProperties.getBytesTokenProperty(collection.address, tokenId, 'data'),
      ).to.eql('0x1234');

      await tokenProperties.setStringProperty(
        collection.address,
        tokenId,
        'description',
        'test description update',
      );
      expect(
        await tokenProperties.getStringTokenProperty(collection.address, tokenId, 'description'),
      ).to.eql('test description update');
    });

    it('can reuse keys and values are fine', async function () {
      await tokenProperties.setStringProperty(collection.address, tokenId, 'X', 'X1');
      await tokenProperties.setStringProperty(collection.address, tokenId2, 'X', 'X2');

      expect(await tokenProperties.getStringTokenProperty(collection.address, tokenId, 'X')).to.eql(
        'X1',
      );
      expect(
        await tokenProperties.getStringTokenProperty(collection.address, tokenId2, 'X'),
      ).to.eql('X2');
    });

    it('can reuse keys among different properties and values are fine', async function () {
      await tokenProperties.setStringProperty(collection.address, tokenId, 'X', 'test description');
      await tokenProperties.setBoolProperty(collection.address, tokenId, 'X', true);
      await tokenProperties.setAddressProperty(collection.address, tokenId, 'X', owner.address);
      await tokenProperties.setUintProperty(collection.address, tokenId, 'X', bn(100));
      await tokenProperties.setBytesProperty(collection.address, tokenId, 'X', '0x1234');

      expect(await tokenProperties.getStringTokenProperty(collection.address, tokenId, 'X')).to.eql(
        'test description',
      );
      expect(await tokenProperties.getBoolTokenProperty(collection.address, tokenId, 'X')).to.eql(
        true,
      );
      expect(
        await tokenProperties.getAddressTokenProperty(collection.address, tokenId, 'X'),
      ).to.eql(owner.address);
      expect(await tokenProperties.getUintTokenProperty(collection.address, tokenId, 'X')).to.eql(
        bn(100),
      );
      expect(await tokenProperties.getBytesTokenProperty(collection.address, tokenId, 'X')).to.eql(
        '0x1234',
      );
    });

    it('can reuse string values and values are fine', async function () {
      await tokenProperties.setStringProperty(collection.address, tokenId, 'X', 'common string');
      await tokenProperties.setStringProperty(collection.address, tokenId2, 'X', 'common string');

      expect(await tokenProperties.getStringTokenProperty(collection.address, tokenId, 'X')).to.eql(
        'common string',
      );
      expect(
        await tokenProperties.getStringTokenProperty(collection.address, tokenId2, 'X'),
      ).to.eql('common string');
    });

    it('should not allow to set string values to unauthorized caller', async function () {
      await expect(
        tokenProperties
          .connect(owner)
          .setStringProperty(collection.address, tokenId, 'X', 'test description'),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should not allow to set uint values to unauthorized caller', async function () {
      await expect(
        tokenProperties.connect(owner).setUintProperty(collection.address, tokenId, 'X', bn(42)),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should not allow to set boolean values to unauthorized caller', async function () {
      await expect(
        tokenProperties.connect(owner).setBoolProperty(collection.address, tokenId, 'X', true),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should not allow to set address values to unauthorized caller', async function () {
      await expect(
        tokenProperties
          .connect(owner)
          .setAddressProperty(collection.address, tokenId, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should not allow to set bytes values to unauthorized caller', async function () {
      await expect(
        tokenProperties.connect(owner).setBytesProperty(collection.address, tokenId, 'X', '0x1234'),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });
  });

  describe('Token properties access control', async function () {
    let issuer: SignerWithAddress;
    let owner: SignerWithAddress;
    const tokenId = 1;
    const tokenId2 = 2;

    beforeEach(async function () {
      ({ tokenProperties } = await loadFixture(tokenPropertiesFixture));
      ({ collection } = await loadFixture(collectionFixture));
      ({ ownedCollection } = await loadFixture(ownedCollectionFixture));

      const signers = await ethers.getSigners();
      issuer = signers[0];
      owner = signers[1];
    });

    it('should not allow registering an already registered collection', async function () {
      await tokenProperties.registerAccessControl(collection.address, issuer.address, false);

      await expect(
        tokenProperties.registerAccessControl(collection.address, issuer.address, false),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKCollectionAlreadyRegistered');
    });

    it('should not allow using Ownable when registering a collection, if the collection does not support it', async function () {
      await expect(
        tokenProperties.registerAccessControl(collection.address, issuer.address, true),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKOwnableNotImplemented');
    });

    it('should not allow to register a collection if Ownable is implemented and caller is not the owner', async function () {
      await expect(
        tokenProperties
          .connect(owner)
          .registerAccessControl(ownedCollection.address, issuer.address, true),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should allow to manage access control for registered collections', async function () {
      await tokenProperties.registerAccessControl(collection.address, issuer.address, false);

      expect(
        await tokenProperties
          .connect(issuer)
          .manageAccessControl(
            collection.address,
            1,
            0,
            2,
            [owner.address],
            [true],
            [owner.address],
            [true],
          ),
      )
        .to.emit(tokenProperties, 'AccessControlUpdated')
        .withArgs(collection.address, 1, 0, 2, [owner.address], [true], [owner.address], [true]);
    });

    it('should not allow to manage access control for registered collections if collaborator arrays are not of equal length', async function () {
      await tokenProperties.registerAccessControl(collection.address, issuer.address, false);

      await expect(
        tokenProperties
          .connect(issuer)
          .manageAccessControl(
            collection.address,
            1,
            0,
            2,
            [owner.address],
            [],
            [owner.address],
            [true],
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKCollaboratorArraysNotEqualLength');
    });

    it('should not allow to manage access control for registered collections if specific address arrays are not of equal length', async function () {
      await tokenProperties.registerAccessControl(collection.address, issuer.address, false);

      await expect(
        tokenProperties
          .connect(issuer)
          .manageAccessControl(
            collection.address,
            1,
            0,
            2,
            [owner.address],
            [true],
            [owner.address],
            [],
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKSpecificAddressArraysNotEqualLength');
    });

    it('should not allow to manage access control for unregistered collections', async function () {
      await expect(
        tokenProperties
          .connect(issuer)
          .manageAccessControl(collection.address, 1, 0, 2, [owner.address], [true], [], []),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKCollectionNotRegistered');
    });

    it('should not allow to manage access control if the caller is not issuer', async function () {
      await tokenProperties.registerAccessControl(collection.address, issuer.address, false);

      await expect(
        tokenProperties
          .connect(owner)
          .manageAccessControl(collection.address, 1, 0, 2, [owner.address], [true], [], []),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should not allow to manage access control if the caller is not returned as collection owner when using ownable', async function () {
      await tokenProperties.registerAccessControl(ownedCollection.address, issuer.address, true);

      await expect(
        tokenProperties
          .connect(owner)
          .manageAccessControl(ownedCollection.address, 1, 0, 2, [owner.address], [true], [], []),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should return the expected value when checking for collaborators', async function () {
      await tokenProperties.registerAccessControl(collection.address, issuer.address, false);

      expect(await tokenProperties.isCollaborator(owner.address, collection.address, 1, 0)).to.be
        .false;

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(collection.address, 1, 0, 2, [owner.address], [true], [], []);

      expect(await tokenProperties.isCollaborator(owner.address, collection.address, 1, 0)).to.be
        .true;
    });

    it('should return the expected value when checking for specific addresses', async function () {
      await tokenProperties.registerAccessControl(collection.address, issuer.address, false);

      expect(await tokenProperties.isSpecificAddress(owner.address, collection.address, 1, 0)).to.be
        .false;

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(collection.address, 1, 0, 2, [], [], [owner.address], [true]);

      expect(await tokenProperties.isSpecificAddress(owner.address, collection.address, 1, 0)).to.be
        .true;
    });

    it('should use the issuer returned from the collection when using only issuer when only issuer is allowed to manage parameter', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(ownedCollection.address, issuer.address, true);

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(ownedCollection.address, 1, 0, 0, [], [], [], []);

      await expect(
        tokenProperties
          .connect(owner)
          .setAddressProperty(ownedCollection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');

      await ownedCollection.connect(issuer).transferOwnership(owner.address);

      await expect(
        tokenProperties
          .connect(issuer)
          .setAddressProperty(ownedCollection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should only allow collaborator to modify the parameters if only collaborator is allowed to modify them', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(collection.address, issuer.address, false);

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(collection.address, 1, 1, 1, [owner.address], [true], [], []);

      await tokenProperties
        .connect(owner)
        .setAddressProperty(collection.address, 1, 'X', owner.address);

      await expect(
        tokenProperties
          .connect(issuer)
          .setAddressProperty(collection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionCollaborator');
    });

    it('should only allow issuer and collaborator to modify the parameters if only issuer and collaborator is allowed to modify them', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(collection.address, issuer.address, false);

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(collection.address, 1, 1, 2, [], [], [], []);

      await tokenProperties
        .connect(issuer)
        .setAddressProperty(collection.address, 1, 'X', owner.address);

      await expect(
        tokenProperties
          .connect(owner)
          .setAddressProperty(collection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuerOrCollaborator');

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(collection.address, 1, 1, 2, [owner.address], [true], [], []);

      await tokenProperties
        .connect(owner)
        .setAddressProperty(collection.address, 1, 'X', owner.address);
    });

    it('should only allow issuer and collaborator to modify the parameters if only issuer and collaborator is allowed to modify them even when using the ownable', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(ownedCollection.address, issuer.address, true);

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(ownedCollection.address, 1, 1, 2, [], [], [], []);

      await ownedCollection.connect(issuer).transferOwnership(owner.address);

      await tokenProperties
        .connect(owner)
        .setAddressProperty(ownedCollection.address, 1, 'X', owner.address);

      await expect(
        tokenProperties
          .connect(issuer)
          .setAddressProperty(ownedCollection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuerOrCollaborator');

      await tokenProperties
        .connect(owner)
        .manageAccessControl(ownedCollection.address, 1, 1, 2, [issuer.address], [true], [], []);

      await tokenProperties
        .connect(issuer)
        .setAddressProperty(ownedCollection.address, 1, 'X', owner.address);
    });

    it('should only allow token owner to modify the parameters if only token owner is allowed to modify them', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(collection.address, issuer.address, false);

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(collection.address, 1, 1, 3, [], [], [], []);

      await expect(
        tokenProperties
          .connect(owner)
          .setAddressProperty(collection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(collection, 'ERC721InvalidTokenId');

      await collection.connect(issuer).mint(owner.address, 1);

      await tokenProperties
        .connect(owner)
        .setAddressProperty(collection.address, 1, 'X', owner.address);

      await expect(
        tokenProperties
          .connect(issuer)
          .setAddressProperty(collection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotTokenOwner');
    });

    it('should only allow specific address to modify the parameters if only specific address is allowed to modify them', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(collection.address, issuer.address, false);

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(collection.address, 1, 1, 4, [], [], [], []);

      await expect(
        tokenProperties
          .connect(owner)
          .setAddressProperty(collection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotSpecificAddress');

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(collection.address, 1, 1, 4, [], [], [owner.address], [true]);

      await tokenProperties
        .connect(owner)
        .setAddressProperty(collection.address, 1, 'X', owner.address);
    });
  });
});

async function shouldBehaveLikeTokenPropertiesRepositoryInterface() {
  it('can support IERC165', async function () {
    expect(await this.tokenProperties.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IRMRKTokenPropertiesRepository', async function () {
    expect(await this.tokenProperties.supportsInterface(IRMRKTokenPropertiesRepository)).to.equal(
      true,
    );
  });

  it('can support IRMRKPropertiesAccessControl', async function () {
    expect(await this.tokenProperties.supportsInterface(IRMRKPropertiesAccessControl)).to.equal(
      true,
    );
  });
}
