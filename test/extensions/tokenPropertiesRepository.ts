import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture, mine } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { IERC165, IRMRKTokenPropertiesRepository } from '../interfaces';
import { OwnableMintableERC721Mock, RMRKTokenPropertiesRepository } from '../../typechain-types';
import { bn } from '../utils';
import { smock, FakeContract } from '@defi-wonderland/smock';

// --------------- FIXTURES -----------------------

async function tokenPropertiesFixture() {
  const factory = await ethers.getContractFactory('RMRKTokenPropertiesRepository');
  const tokenProperties = await factory.deploy();
  await tokenProperties.deployed();

  return { tokenProperties };
}

async function ownedCollectionFixture() {
  const ownedCollection = await smock.fake<OwnableMintableERC721Mock>('OwnableMintableERC721Mock');

  return { ownedCollection };
}

// --------------- TESTS -----------------------

describe('RMRKTokenPropertiesRepository', async function () {
  let tokenProperties: RMRKTokenPropertiesRepository;
  let ownedCollection: FakeContract<OwnableMintableERC721Mock>;

  beforeEach(async function () {
    ({ tokenProperties } = await loadFixture(tokenPropertiesFixture));
    ({ ownedCollection } = await loadFixture(ownedCollectionFixture));

    this.tokenProperties = tokenProperties;
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
      ({ ownedCollection } = await loadFixture(ownedCollectionFixture));

      const signers = await ethers.getSigners();
      issuer = signers[0];
      owner = signers[1];

      ownedCollection.owner.returns(issuer.address);

      await tokenProperties.registerAccessControl(ownedCollection.address, issuer.address, false);
    });

    it('can set and get token properties', async function () {
      expect(
        await tokenProperties.setStringProperty(
          ownedCollection.address,
          tokenId,
          'description',
          'test description',
        ),
      )
        .to.emit(tokenProperties, 'StringPropertySet')
        .withArgs(ownedCollection.address, tokenId, 'description', 'test description');
      expect(
        await tokenProperties.setStringProperty(
          ownedCollection.address,
          tokenId,
          'description1',
          'test description',
        ),
      )
        .to.emit(tokenProperties, 'StringPropertySet')
        .withArgs(ownedCollection.address, tokenId, 'description1', 'test description');
      expect(await tokenProperties.setBoolProperty(ownedCollection.address, tokenId, 'rare', true))
        .to.emit(tokenProperties, 'BoolPropertySet')
        .withArgs(ownedCollection.address, tokenId, 'rare', true);
      expect(
        await tokenProperties.setAddressProperty(
          ownedCollection.address,
          tokenId,
          'owner',
          owner.address,
        ),
      )
        .to.emit(tokenProperties, 'AddressPropertySet')
        .withArgs(ownedCollection.address, tokenId, 'owner', owner.address);
      expect(
        await tokenProperties.setUintProperty(ownedCollection.address, tokenId, 'atk', bn(100)),
      )
        .to.emit(tokenProperties, 'UintPropertySet')
        .withArgs(ownedCollection.address, tokenId, 'atk', bn(100));
      expect(
        await tokenProperties.setUintProperty(ownedCollection.address, tokenId, 'health', bn(100)),
      )
        .to.emit(tokenProperties, 'UintPropertySet')
        .withArgs(ownedCollection.address, tokenId, 'health', bn(100));
      expect(
        await tokenProperties.setUintProperty(ownedCollection.address, tokenId, 'health', bn(95)),
      )
        .to.emit(tokenProperties, 'UintPropertySet')
        .withArgs(ownedCollection.address, tokenId, 'health', bn(95));
      expect(
        await tokenProperties.setUintProperty(ownedCollection.address, tokenId, 'health', bn(80)),
      )
        .to.emit(tokenProperties, 'UintPropertySet')
        .withArgs(ownedCollection.address, tokenId, 'health', bn(80));
      expect(
        await tokenProperties.setBytesProperty(ownedCollection.address, tokenId, 'data', '0x1234'),
      )
        .to.emit(tokenProperties, 'BytesPropertySet')
        .withArgs(ownedCollection.address, tokenId, 'data', '0x1234');

      expect(
        await tokenProperties.getStringTokenProperty(
          ownedCollection.address,
          tokenId,
          'description',
        ),
      ).to.eql('test description');
      expect(
        await tokenProperties.getStringTokenProperty(
          ownedCollection.address,
          tokenId,
          'description1',
        ),
      ).to.eql('test description');
      expect(
        await tokenProperties.getBoolTokenProperty(ownedCollection.address, tokenId, 'rare'),
      ).to.eql(true);
      expect(
        await tokenProperties.getAddressTokenProperty(ownedCollection.address, tokenId, 'owner'),
      ).to.eql(owner.address);
      expect(
        await tokenProperties.getUintTokenProperty(ownedCollection.address, tokenId, 'atk'),
      ).to.eql(bn(100));
      expect(
        await tokenProperties.getUintTokenProperty(ownedCollection.address, tokenId, 'health'),
      ).to.eql(bn(80));
      expect(
        await tokenProperties.getBytesTokenProperty(ownedCollection.address, tokenId, 'data'),
      ).to.eql('0x1234');

      await tokenProperties.setStringProperty(
        ownedCollection.address,
        tokenId,
        'description',
        'test description update',
      );
      expect(
        await tokenProperties.getStringTokenProperty(
          ownedCollection.address,
          tokenId,
          'description',
        ),
      ).to.eql('test description update');
    });

    it('can set multiple properties of multiple types at the same time', async function () {
      await expect(
        tokenProperties.setTokenProperties(
          ownedCollection.address,
          tokenId,
          [
            { key: 'string1', value: 'value1' },
            { key: 'string2', value: 'value2' },
          ],
          [
            { key: 'uint1', value: bn(1) },
            { key: 'uint2', value: bn(2) },
          ],
          [
            { key: 'bool1', value: true },
            { key: 'bool2', value: false },
          ],
          [
            { key: 'address1', value: owner.address },
            { key: 'address2', value: issuer.address },
          ],
          [
            { key: 'bytes1', value: '0x1234' },
            { key: 'bytes2', value: '0x5678' },
          ],
        ),
      )
        .to.emit(tokenProperties, 'StringPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'string1', 'value1')
        .to.emit(tokenProperties, 'StringPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'string2', 'value2')
        .to.emit(tokenProperties, 'UintPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'uint1', bn(1))
        .to.emit(tokenProperties, 'UintPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'uint2', bn(2))
        .to.emit(tokenProperties, 'BoolPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bool1', true)
        .to.emit(tokenProperties, 'BoolPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bool2', false)
        .to.emit(tokenProperties, 'AddressPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'address1', owner.address)
        .to.emit(tokenProperties, 'AddressPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'address2', issuer.address)
        .to.emit(tokenProperties, 'BytesPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bytes1', '0x1234')
        .to.emit(tokenProperties, 'BytesPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bytes2', '0x5678');
    });

    it('can update multiple properties of multiple types at the same time', async function () {
      await tokenProperties.setTokenProperties(
        ownedCollection.address,
        tokenId,
        [
          { key: 'string1', value: 'value0' },
          { key: 'string2', value: 'value1' },
        ],
        [
          { key: 'uint1', value: bn(0) },
          { key: 'uint2', value: bn(1) },
        ],
        [
          { key: 'bool1', value: false },
          { key: 'bool2', value: true },
        ],
        [
          { key: 'address1', value: issuer.address },
          { key: 'address2', value: owner.address },
        ],
        [
          { key: 'bytes1', value: '0x5678' },
          { key: 'bytes2', value: '0x1234' },
        ],
      );

      await expect(
        tokenProperties.setTokenProperties(
          ownedCollection.address,
          tokenId,
          [
            { key: 'string1', value: 'value1' },
            { key: 'string2', value: 'value2' },
          ],
          [
            { key: 'uint1', value: bn(1) },
            { key: 'uint2', value: bn(2) },
          ],
          [
            { key: 'bool1', value: true },
            { key: 'bool2', value: false },
          ],
          [
            { key: 'address1', value: owner.address },
            { key: 'address2', value: issuer.address },
          ],
          [
            { key: 'bytes1', value: '0x1234' },
            { key: 'bytes2', value: '0x5678' },
          ],
        ),
      )
        .to.emit(tokenProperties, 'StringPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'string1', 'value1')
        .to.emit(tokenProperties, 'StringPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'string2', 'value2')
        .to.emit(tokenProperties, 'UintPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'uint1', bn(1))
        .to.emit(tokenProperties, 'UintPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'uint2', bn(2))
        .to.emit(tokenProperties, 'BoolPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bool1', true)
        .to.emit(tokenProperties, 'BoolPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bool2', false)
        .to.emit(tokenProperties, 'AddressPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'address1', owner.address)
        .to.emit(tokenProperties, 'AddressPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'address2', issuer.address)
        .to.emit(tokenProperties, 'BytesPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bytes1', '0x1234')
        .to.emit(tokenProperties, 'BytesPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bytes2', '0x5678');
    });

    it('can set and update multiple properties of multiple types at the same time even if not all types are updated at the same time', async function () {
      await tokenProperties.setTokenProperties(
        ownedCollection.address,
        tokenId,
        [{ key: 'string1', value: 'value0' }],
        [
          { key: 'uint1', value: bn(0) },
          { key: 'uint2', value: bn(1) },
        ],
        [
          { key: 'bool1', value: false },
          { key: 'bool2', value: true },
        ],
        [
          { key: 'address1', value: issuer.address },
          { key: 'address2', value: owner.address },
        ],
        [],
      );

      await expect(
        tokenProperties.setTokenProperties(
          ownedCollection.address,
          tokenId,
          [],
          [
            { key: 'uint1', value: bn(1) },
            { key: 'uint2', value: bn(2) },
          ],
          [
            { key: 'bool1', value: true },
            { key: 'bool2', value: false },
          ],
          [
            { key: 'address1', value: owner.address },
            { key: 'address2', value: issuer.address },
          ],
          [
            { key: 'bytes1', value: '0x1234' },
            { key: 'bytes2', value: '0x5678' },
          ],
        ),
      )
        .to.emit(tokenProperties, 'UintPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'uint1', bn(1))
        .to.emit(tokenProperties, 'UintPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'uint2', bn(2))
        .to.emit(tokenProperties, 'BoolPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bool1', true)
        .to.emit(tokenProperties, 'BoolPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bool2', false)
        .to.emit(tokenProperties, 'AddressPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'address1', owner.address)
        .to.emit(tokenProperties, 'AddressPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'address2', issuer.address)
        .to.emit(tokenProperties, 'BytesPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bytes1', '0x1234')
        .to.emit(tokenProperties, 'BytesPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bytes2', '0x5678');

      await expect(
        tokenProperties.setTokenProperties(
          ownedCollection.address,
          tokenId,
          [],
          [],
          [
            { key: 'bool1', value: false },
            { key: 'bool2', value: true },
          ],
          [],
          [],
        ),
      )
        .to.emit(tokenProperties, 'BoolPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bool1', false)
        .to.emit(tokenProperties, 'BoolPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bool2', true);
    });

    it('can set and update multiple properties of multiple types at the same time', async function () {
      await expect(
        tokenProperties.setTokenProperties(
          ownedCollection.address,
          tokenId,
          [
            { key: 'string1', value: 'value1' },
            { key: 'string2', value: 'value2' },
          ],
          [
            { key: 'uint1', value: bn(1) },
            { key: 'uint2', value: bn(2) },
          ],
          [
            { key: 'bool1', value: true },
            { key: 'bool2', value: false },
          ],
          [
            { key: 'address1', value: owner.address },
            { key: 'address2', value: issuer.address },
          ],
          [
            { key: 'bytes1', value: '0x1234' },
            { key: 'bytes2', value: '0x5678' },
          ],
        ),
      )
        .to.emit(tokenProperties, 'StringPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'string1', 'value1')
        .to.emit(tokenProperties, 'StringPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'string2', 'value2')
        .to.emit(tokenProperties, 'UintPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'uint1', bn(1))
        .to.emit(tokenProperties, 'UintPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'uint2', bn(2))
        .to.emit(tokenProperties, 'BoolPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bool1', true)
        .to.emit(tokenProperties, 'BoolPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bool2', false)
        .to.emit(tokenProperties, 'AddressPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'address1', owner.address)
        .to.emit(tokenProperties, 'AddressPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'address2', issuer.address)
        .to.emit(tokenProperties, 'BytesPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bytes1', '0x1234')
        .to.emit(tokenProperties, 'BytesPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bytes2', '0x5678');
    });

    it('should allow to retrieve multiple properties at once', async function () {
      await tokenProperties.setTokenProperties(
        ownedCollection.address,
        tokenId,
        [
          { key: 'string1', value: 'value1' },
          { key: 'string2', value: 'value2' },
        ],
        [
          { key: 'uint1', value: bn(1) },
          { key: 'uint2', value: bn(2) },
        ],
        [
          { key: 'bool1', value: true },
          { key: 'bool2', value: false },
        ],
        [
          { key: 'address1', value: owner.address },
          { key: 'address2', value: issuer.address },
        ],
        [
          { key: 'bytes1', value: '0x1234' },
          { key: 'bytes2', value: '0x5678' },
        ],
      );

      expect(
        await tokenProperties.getTokenProperties(
          ownedCollection.address,
          tokenId,
          ['string1', 'string2'],
          ['uint1', 'uint2'],
          ['bool1', 'bool2'],
          ['address1', 'address2'],
          ['bytes1', 'bytes2'],
        ),
      ).to.eql([
        [
          ['string1', 'value1'],
          ['string2', 'value2'],
        ],
        [
          ['uint1', bn(1)],
          ['uint2', bn(2)],
        ],
        [
          ['bool1', true],
          ['bool2', false],
        ],
        [
          ['address1', owner.address],
          ['address2', issuer.address],
        ],
        [
          ['bytes1', '0x1234'],
          ['bytes2', '0x5678'],
        ],
      ]);
    });

    it('can set multiple string properties at the same time', async function () {
      await expect(
        tokenProperties.setStringProperties(ownedCollection.address, tokenId, [
          { key: 'string1', value: 'value1' },
          { key: 'string2', value: 'value2' },
        ]),
      )
        .to.emit(tokenProperties, 'StringPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'string1', 'value1')
        .to.emit(tokenProperties, 'StringPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'string2', 'value2');

      expect(
        await tokenProperties.getTokenProperties(
          ownedCollection.address,
          tokenId,
          ['string1', 'string2'],
          [],
          [],
          [],
          [],
        ),
      ).to.eql([
        [
          ['string1', 'value1'],
          ['string2', 'value2'],
        ],
        [],
        [],
        [],
        [],
      ]);
    });

    it('can set multiple uint properties at the same time', async function () {
      await expect(
        tokenProperties.setUintProperties(ownedCollection.address, tokenId, [
          { key: 'uint1', value: bn(1) },
          { key: 'uint2', value: bn(2) },
        ]),
      )
        .to.emit(tokenProperties, 'UintPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'uint1', bn(1))
        .to.emit(tokenProperties, 'UintPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'uint2', bn(2));

      expect(
        await tokenProperties.getTokenProperties(
          ownedCollection.address,
          tokenId,
          [],
          ['uint1', 'uint2'],
          [],
          [],
          [],
        ),
      ).to.eql([
        [],
        [
          ['uint1', bn(1)],
          ['uint2', bn(2)],
        ],
        [],
        [],
        [],
      ]);
    });

    it('can set multiple bool properties at the same time', async function () {
      await expect(
        tokenProperties.setBoolProperties(ownedCollection.address, tokenId, [
          { key: 'bool1', value: true },
          { key: 'bool2', value: false },
        ]),
      )
        .to.emit(tokenProperties, 'BoolPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bool1', true)
        .to.emit(tokenProperties, 'BoolPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bool2', false);

      expect(
        await tokenProperties.getTokenProperties(
          ownedCollection.address,
          tokenId,
          [],
          [],
          ['bool1', 'bool2'],
          [],
          [],
        ),
      ).to.eql([
        [],
        [],
        [
          ['bool1', true],
          ['bool2', false],
        ],
        [],
        [],
      ]);
    });

    it('can set multiple address properties at the same time', async function () {
      await expect(
        tokenProperties.setAddressProperties(ownedCollection.address, tokenId, [
          { key: 'address1', value: owner.address },
          { key: 'address2', value: issuer.address },
        ]),
      )
        .to.emit(tokenProperties, 'AddressPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'address1', owner.address)
        .to.emit(tokenProperties, 'AddressPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'address2', issuer.address);

      expect(
        await tokenProperties.getTokenProperties(
          ownedCollection.address,
          tokenId,
          [],
          [],
          [],
          ['address1', 'address2'],
          [],
        ),
      ).to.eql([
        [],
        [],
        [],
        [
          ['address1', owner.address],
          ['address2', issuer.address],
        ],
        [],
      ]);
    });

    it('can set multiple bytes properties at the same time', async function () {
      await expect(
        tokenProperties.setBytesProperties(ownedCollection.address, tokenId, [
          { key: 'bytes1', value: '0x1234' },
          { key: 'bytes2', value: '0x5678' },
        ]),
      )
        .to.emit(tokenProperties, 'BytesPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bytes1', '0x1234')
        .to.emit(tokenProperties, 'BytesPropertyUpdated')
        .withArgs(ownedCollection.address, tokenId, 'bytes2', '0x5678');

      expect(
        await tokenProperties.getTokenProperties(
          ownedCollection.address,
          tokenId,
          [],
          [],
          [],
          [],
          ['bytes1', 'bytes2'],
        ),
      ).to.eql([
        [],
        [],
        [],
        [],
        [
          ['bytes1', '0x1234'],
          ['bytes2', '0x5678'],
        ],
      ]);
    });

    it('can reuse keys and values are fine', async function () {
      await tokenProperties.setStringProperty(ownedCollection.address, tokenId, 'X', 'X1');
      await tokenProperties.setStringProperty(ownedCollection.address, tokenId2, 'X', 'X2');

      expect(
        await tokenProperties.getStringTokenProperty(ownedCollection.address, tokenId, 'X'),
      ).to.eql('X1');
      expect(
        await tokenProperties.getStringTokenProperty(ownedCollection.address, tokenId2, 'X'),
      ).to.eql('X2');
    });

    it('can reuse keys among different properties and values are fine', async function () {
      await tokenProperties.setStringProperty(
        ownedCollection.address,
        tokenId,
        'X',
        'test description',
      );
      await tokenProperties.setBoolProperty(ownedCollection.address, tokenId, 'X', true);
      await tokenProperties.setAddressProperty(
        ownedCollection.address,
        tokenId,
        'X',
        owner.address,
      );
      await tokenProperties.setUintProperty(ownedCollection.address, tokenId, 'X', bn(100));
      await tokenProperties.setBytesProperty(ownedCollection.address, tokenId, 'X', '0x1234');

      expect(
        await tokenProperties.getStringTokenProperty(ownedCollection.address, tokenId, 'X'),
      ).to.eql('test description');
      expect(
        await tokenProperties.getBoolTokenProperty(ownedCollection.address, tokenId, 'X'),
      ).to.eql(true);
      expect(
        await tokenProperties.getAddressTokenProperty(ownedCollection.address, tokenId, 'X'),
      ).to.eql(owner.address);
      expect(
        await tokenProperties.getUintTokenProperty(ownedCollection.address, tokenId, 'X'),
      ).to.eql(bn(100));
      expect(
        await tokenProperties.getBytesTokenProperty(ownedCollection.address, tokenId, 'X'),
      ).to.eql('0x1234');
    });

    it('can reuse string values and values are fine', async function () {
      await tokenProperties.setStringProperty(
        ownedCollection.address,
        tokenId,
        'X',
        'common string',
      );
      await tokenProperties.setStringProperty(
        ownedCollection.address,
        tokenId2,
        'X',
        'common string',
      );

      expect(
        await tokenProperties.getStringTokenProperty(ownedCollection.address, tokenId, 'X'),
      ).to.eql('common string');
      expect(
        await tokenProperties.getStringTokenProperty(ownedCollection.address, tokenId2, 'X'),
      ).to.eql('common string');
    });

    it('should not allow to set string values to unauthorized caller', async function () {
      await expect(
        tokenProperties
          .connect(owner)
          .setStringProperty(ownedCollection.address, tokenId, 'X', 'test description'),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should not allow to set uint values to unauthorized caller', async function () {
      await expect(
        tokenProperties
          .connect(owner)
          .setUintProperty(ownedCollection.address, tokenId, 'X', bn(42)),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should not allow to set boolean values to unauthorized caller', async function () {
      await expect(
        tokenProperties.connect(owner).setBoolProperty(ownedCollection.address, tokenId, 'X', true),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should not allow to set address values to unauthorized caller', async function () {
      await expect(
        tokenProperties
          .connect(owner)
          .setAddressProperty(ownedCollection.address, tokenId, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should not allow to set bytes values to unauthorized caller', async function () {
      await expect(
        tokenProperties
          .connect(owner)
          .setBytesProperty(ownedCollection.address, tokenId, 'X', '0x1234'),
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
      ({ ownedCollection } = await loadFixture(ownedCollectionFixture));

      const signers = await ethers.getSigners();
      issuer = signers[0];
      owner = signers[1];

      ownedCollection.owner.returns(issuer.address);
    });

    it('should not allow registering an already registered collection', async function () {
      await tokenProperties.registerAccessControl(ownedCollection.address, issuer.address, false);

      await expect(
        tokenProperties.registerAccessControl(ownedCollection.address, issuer.address, false),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKCollectionAlreadyRegistered');
    });

    it('should not allow to register a collection if caller is not the owner of the collection', async function () {
      await expect(
        tokenProperties
          .connect(owner)
          .registerAccessControl(ownedCollection.address, issuer.address, true),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should not allow to register a collection without Ownable implemented', async function () {
      ownedCollection.owner.reset();

      await expect(
        tokenProperties.registerAccessControl(ownedCollection.address, issuer.address, false),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKOwnableNotImplemented');
    });

    it('should allow to manage access control for registered collections', async function () {
      await tokenProperties.registerAccessControl(ownedCollection.address, issuer.address, false);

      expect(
        await tokenProperties
          .connect(issuer)
          .manageAccessControl(ownedCollection.address, 'X', 2, owner.address),
      )
        .to.emit(tokenProperties, 'AccessControlUpdate')
        .withArgs(ownedCollection.address, 'X', 2, owner);
    });

    it('should allow issuer to manage collaborators', async function () {
      await tokenProperties.registerAccessControl(ownedCollection.address, issuer.address, false);

      expect(
        await tokenProperties
          .connect(issuer)
          .manageCollaborators(ownedCollection.address, [owner.address], [true]),
      )
        .to.emit(tokenProperties, 'CollaboratorUpdate')
        .withArgs(ownedCollection.address, [owner.address], [true]);
    });

    it('should not allow to manage collaborators of an unregistered collection', async function () {
      await expect(
        tokenProperties
          .connect(issuer)
          .manageCollaborators(ownedCollection.address, [owner.address], [true]),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKCollectionNotRegistered');
    });

    it('should not allow to manage collaborators if the caller is not the issuer', async function () {
      await tokenProperties.registerAccessControl(ownedCollection.address, issuer.address, false);

      await expect(
        tokenProperties
          .connect(owner)
          .manageCollaborators(ownedCollection.address, [owner.address], [true]),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should not allow to manage collaborators for registered collections if collaborator arrays are not of equal length', async function () {
      await tokenProperties.registerAccessControl(ownedCollection.address, issuer.address, false);

      await expect(
        tokenProperties
          .connect(issuer)
          .manageCollaborators(ownedCollection.address, [owner.address, issuer.address], [true]),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKCollaboratorArraysNotEqualLength');
    });

    it('should not allow to manage access control for unregistered collections', async function () {
      await expect(
        tokenProperties
          .connect(issuer)
          .manageAccessControl(ownedCollection.address, 'X', 2, owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKCollectionNotRegistered');
    });

    it('should not allow to manage access control if the caller is not issuer', async function () {
      await tokenProperties.registerAccessControl(ownedCollection.address, issuer.address, false);

      await expect(
        tokenProperties
          .connect(owner)
          .manageAccessControl(ownedCollection.address, 'X', 2, owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should not allow to manage access control if the caller is not returned as collection owner when using ownable', async function () {
      await tokenProperties.registerAccessControl(ownedCollection.address, issuer.address, true);

      await expect(
        tokenProperties
          .connect(owner)
          .manageAccessControl(ownedCollection.address, 'X', 2, owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should return the expected value when checking for collaborators', async function () {
      await tokenProperties.registerAccessControl(ownedCollection.address, issuer.address, false);

      expect(await tokenProperties.isCollaborator(owner.address, ownedCollection.address)).to.be
        .false;

      await tokenProperties
        .connect(issuer)
        .manageCollaborators(ownedCollection.address, [owner.address], [true]);

      expect(await tokenProperties.isCollaborator(owner.address, ownedCollection.address)).to.be
        .true;
    });

    it('should return the expected value when checking for specific addresses', async function () {
      await tokenProperties.registerAccessControl(ownedCollection.address, issuer.address, false);

      expect(await tokenProperties.isSpecificAddress(owner.address, ownedCollection.address, 'X'))
        .to.be.false;

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(ownedCollection.address, 'X', 2, owner.address);

      expect(await tokenProperties.isSpecificAddress(owner.address, ownedCollection.address, 'X'))
        .to.be.true;
    });

    it('should use the issuer returned from the collection when using only issuer when only issuer is allowed to manage parameter', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(ownedCollection.address, issuer.address, true);

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(ownedCollection.address, 'X', 0, ethers.constants.AddressZero);

      await expect(
        tokenProperties
          .connect(owner)
          .setAddressProperty(ownedCollection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');

      ownedCollection.owner.returns(owner.address);

      await expect(
        tokenProperties
          .connect(issuer)
          .setAddressProperty(ownedCollection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
    });

    it('should only allow collaborator to modify the parameters if only collaborator is allowed to modify them', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(ownedCollection.address, issuer.address, false);

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(ownedCollection.address, 'X', 1, ethers.constants.AddressZero);

      await tokenProperties
        .connect(issuer)
        .manageCollaborators(ownedCollection.address, [owner.address], [true]);

      await tokenProperties
        .connect(owner)
        .setAddressProperty(ownedCollection.address, 1, 'X', owner.address);

      await expect(
        tokenProperties
          .connect(issuer)
          .setAddressProperty(ownedCollection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionCollaborator');
    });

    it('should only allow issuer and collaborator to modify the parameters if only issuer and collaborator is allowed to modify them', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(ownedCollection.address, issuer.address, false);

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(ownedCollection.address, 'X', 2, ethers.constants.AddressZero);

      await tokenProperties
        .connect(issuer)
        .setAddressProperty(ownedCollection.address, 1, 'X', owner.address);

      await expect(
        tokenProperties
          .connect(owner)
          .setAddressProperty(ownedCollection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuerOrCollaborator');

      await tokenProperties
        .connect(issuer)
        .manageCollaborators(ownedCollection.address, [owner.address], [true]);

      await tokenProperties
        .connect(owner)
        .setAddressProperty(ownedCollection.address, 1, 'X', owner.address);
    });

    it('should only allow issuer and collaborator to modify the parameters if only issuer and collaborator is allowed to modify them even when using the ownable', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(ownedCollection.address, issuer.address, true);

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(ownedCollection.address, 'X', 2, ethers.constants.AddressZero);

      ownedCollection.owner.returns(owner.address);

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
        .manageCollaborators(ownedCollection.address, [issuer.address], [true]);

      await tokenProperties
        .connect(issuer)
        .setAddressProperty(ownedCollection.address, 1, 'X', owner.address);
    });

    it('should only allow token owner to modify the parameters if only token owner is allowed to modify them', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(ownedCollection.address, issuer.address, false);

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(ownedCollection.address, 'X', 3, ethers.constants.AddressZero);

      await expect(
        tokenProperties
          .connect(owner)
          .setAddressProperty(ownedCollection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotTokenOwner');

      ownedCollection.ownerOf.returns(owner.address);

      await tokenProperties
        .connect(owner)
        .setAddressProperty(ownedCollection.address, 1, 'X', owner.address);

      await expect(
        tokenProperties
          .connect(issuer)
          .setAddressProperty(ownedCollection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotTokenOwner');
    });

    it('should only allow specific address to modify the parameters if only specific address is allowed to modify them', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(ownedCollection.address, issuer.address, false);

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(ownedCollection.address, 'X', 4, ethers.constants.AddressZero);

      await expect(
        tokenProperties
          .connect(owner)
          .setAddressProperty(ownedCollection.address, 1, 'X', owner.address),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotSpecificAddress');

      await tokenProperties
        .connect(issuer)
        .manageAccessControl(ownedCollection.address, 'X', 4, owner.address);

      await tokenProperties
        .connect(owner)
        .setAddressProperty(ownedCollection.address, 1, 'X', owner.address);
    });

    it('should allow to use presigned message to modify the parameters', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(ownedCollection.address, issuer.address, false);

      const uintMessage = await tokenProperties.prepareMessageToPresignUintProperty(
        ownedCollection.address,
        1,
        'X',
        1,
        bn(9999999999),
      );
      const stringMessage = await tokenProperties.prepareMessageToPresignStringProperty(
        ownedCollection.address,
        1,
        'X',
        'test',
        bn(9999999999),
      );
      const boolMessage = await tokenProperties.prepareMessageToPresignBoolProperty(
        ownedCollection.address,
        1,
        'X',
        true,
        bn(9999999999),
      );
      const bytesMessage = await tokenProperties.prepareMessageToPresignBytesProperty(
        ownedCollection.address,
        1,
        'X',
        '0x1234',
        bn(9999999999),
      );
      const addressMessage = await tokenProperties.prepareMessageToPresignAddressProperty(
        ownedCollection.address,
        1,
        'X',
        owner.address,
        bn(9999999999),
      );

      const uintSignature = await issuer.signMessage(ethers.utils.arrayify(uintMessage));
      const stringSignature = await issuer.signMessage(ethers.utils.arrayify(stringMessage));
      const boolSignature = await issuer.signMessage(ethers.utils.arrayify(boolMessage));
      const bytesSignature = await issuer.signMessage(ethers.utils.arrayify(bytesMessage));
      const addressSignature = await issuer.signMessage(ethers.utils.arrayify(addressMessage));

      const uintR: string = uintSignature.substring(0, 66);
      const uintS: string = '0x' + uintSignature.substring(66, 130);
      const uintV: string = parseInt(uintSignature.substring(130, 132), 16);

      const stringR: string = stringSignature.substring(0, 66);
      const stringS: string = '0x' + stringSignature.substring(66, 130);
      const stringV: string = parseInt(stringSignature.substring(130, 132), 16);

      const boolR: string = boolSignature.substring(0, 66);
      const boolS: string = '0x' + boolSignature.substring(66, 130);
      const boolV: string = parseInt(boolSignature.substring(130, 132), 16);

      const bytesR: string = bytesSignature.substring(0, 66);
      const bytesS: string = '0x' + bytesSignature.substring(66, 130);
      const bytesV: string = parseInt(bytesSignature.substring(130, 132), 16);

      const addressR: string = addressSignature.substring(0, 66);
      const addressS: string = '0x' + addressSignature.substring(66, 130);
      const addressV: string = parseInt(addressSignature.substring(130, 132), 16);

      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetUintProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            1,
            bn(9999999999),
            uintV,
            uintR,
            uintS,
          ),
      )
        .to.emit(tokenProperties, 'UintPropertyUpdated')
        .withArgs(ownedCollection.address, 1, 'X', 1);
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetStringProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            'test',
            bn(9999999999),
            stringV,
            stringR,
            stringS,
          ),
      )
        .to.emit(tokenProperties, 'StringPropertyUpdated')
        .withArgs(ownedCollection.address, 1, 'X', 'test');
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetBoolProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            true,
            bn(9999999999),
            boolV,
            boolR,
            boolS,
          ),
      )
        .to.emit(tokenProperties, 'BoolPropertyUpdated')
        .withArgs(ownedCollection.address, 1, 'X', true);
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetBytesProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            '0x1234',
            bn(9999999999),
            bytesV,
            bytesR,
            bytesS,
          ),
      )
        .to.emit(tokenProperties, 'BytesPropertyUpdated')
        .withArgs(ownedCollection.address, 1, 'X', '0x1234');
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetAddressProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            owner.address,
            bn(9999999999),
            addressV,
            addressR,
            addressS,
          ),
      )
        .to.emit(tokenProperties, 'AddressPropertyUpdated')
        .withArgs(ownedCollection.address, 1, 'X', owner.address);
    });

    it('should not allow to use presigned message to modify the parameters if the deadline has elapsed', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(ownedCollection.address, issuer.address, false);

      await mine(1000, { interval: 15 });

      const uintMessage = await tokenProperties.prepareMessageToPresignUintProperty(
        ownedCollection.address,
        1,
        'X',
        1,
        bn(10),
      );
      const stringMessage = await tokenProperties.prepareMessageToPresignStringProperty(
        ownedCollection.address,
        1,
        'X',
        'test',
        bn(10),
      );
      const boolMessage = await tokenProperties.prepareMessageToPresignBoolProperty(
        ownedCollection.address,
        1,
        'X',
        true,
        bn(10),
      );
      const bytesMessage = await tokenProperties.prepareMessageToPresignBytesProperty(
        ownedCollection.address,
        1,
        'X',
        '0x1234',
        bn(10),
      );
      const addressMessage = await tokenProperties.prepareMessageToPresignAddressProperty(
        ownedCollection.address,
        1,
        'X',
        owner.address,
        bn(10),
      );

      const uintSignature = await issuer.signMessage(ethers.utils.arrayify(uintMessage));
      const stringSignature = await issuer.signMessage(ethers.utils.arrayify(stringMessage));
      const boolSignature = await issuer.signMessage(ethers.utils.arrayify(boolMessage));
      const bytesSignature = await issuer.signMessage(ethers.utils.arrayify(bytesMessage));
      const addressSignature = await issuer.signMessage(ethers.utils.arrayify(addressMessage));

      const uintR: string = uintSignature.substring(0, 66);
      const uintS: string = '0x' + uintSignature.substring(66, 130);
      const uintV: string = parseInt(uintSignature.substring(130, 132), 16);

      const stringR: string = stringSignature.substring(0, 66);
      const stringS: string = '0x' + stringSignature.substring(66, 130);
      const stringV: string = parseInt(stringSignature.substring(130, 132), 16);

      const boolR: string = boolSignature.substring(0, 66);
      const boolS: string = '0x' + boolSignature.substring(66, 130);
      const boolV: string = parseInt(boolSignature.substring(130, 132), 16);

      const bytesR: string = bytesSignature.substring(0, 66);
      const bytesS: string = '0x' + bytesSignature.substring(66, 130);
      const bytesV: string = parseInt(bytesSignature.substring(130, 132), 16);

      const addressR: string = addressSignature.substring(0, 66);
      const addressS: string = '0x' + addressSignature.substring(66, 130);
      const addressV: string = parseInt(addressSignature.substring(130, 132), 16);

      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetUintProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            1,
            bn(10),
            uintV,
            uintR,
            uintS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKExpiredDeadline');
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetStringProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            'test',
            bn(10),
            stringV,
            stringR,
            stringS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKExpiredDeadline');
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetBoolProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            true,
            bn(10),
            boolV,
            boolR,
            boolS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKExpiredDeadline');
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetBytesProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            '0x1234',
            bn(10),
            bytesV,
            bytesR,
            bytesS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKExpiredDeadline');
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetAddressProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            owner.address,
            bn(10),
            addressV,
            addressR,
            addressS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKExpiredDeadline');
    });

    it('should not allow to use presigned message to modify the parameters if the setter does not match the actual signer', async function () {
      await tokenProperties
        .connect(issuer)
        .registerAccessControl(ownedCollection.address, issuer.address, false);

      const uintMessage = await tokenProperties.prepareMessageToPresignUintProperty(
        ownedCollection.address,
        1,
        'X',
        1,
        bn(9999999999),
      );
      const stringMessage = await tokenProperties.prepareMessageToPresignStringProperty(
        ownedCollection.address,
        1,
        'X',
        'test',
        bn(9999999999),
      );
      const boolMessage = await tokenProperties.prepareMessageToPresignBoolProperty(
        ownedCollection.address,
        1,
        'X',
        true,
        bn(9999999999),
      );
      const bytesMessage = await tokenProperties.prepareMessageToPresignBytesProperty(
        ownedCollection.address,
        1,
        'X',
        '0x1234',
        bn(9999999999),
      );
      const addressMessage = await tokenProperties.prepareMessageToPresignAddressProperty(
        ownedCollection.address,
        1,
        'X',
        owner.address,
        bn(9999999999),
      );

      const uintSignature = await owner.signMessage(ethers.utils.arrayify(uintMessage));
      const stringSignature = await owner.signMessage(ethers.utils.arrayify(stringMessage));
      const boolSignature = await owner.signMessage(ethers.utils.arrayify(boolMessage));
      const bytesSignature = await owner.signMessage(ethers.utils.arrayify(bytesMessage));
      const addressSignature = await owner.signMessage(ethers.utils.arrayify(addressMessage));

      const uintR: string = uintSignature.substring(0, 66);
      const uintS: string = '0x' + uintSignature.substring(66, 130);
      const uintV: string = parseInt(uintSignature.substring(130, 132), 16);

      const stringR: string = stringSignature.substring(0, 66);
      const stringS: string = '0x' + stringSignature.substring(66, 130);
      const stringV: string = parseInt(stringSignature.substring(130, 132), 16);

      const boolR: string = boolSignature.substring(0, 66);
      const boolS: string = '0x' + boolSignature.substring(66, 130);
      const boolV: string = parseInt(boolSignature.substring(130, 132), 16);

      const bytesR: string = bytesSignature.substring(0, 66);
      const bytesS: string = '0x' + bytesSignature.substring(66, 130);
      const bytesV: string = parseInt(bytesSignature.substring(130, 132), 16);

      const addressR: string = addressSignature.substring(0, 66);
      const addressS: string = '0x' + addressSignature.substring(66, 130);
      const addressV: string = parseInt(addressSignature.substring(130, 132), 16);

      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetUintProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            1,
            bn(9999999999),
            uintV,
            uintR,
            uintS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKInvalidSignature');
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetStringProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            'test',
            bn(9999999999),
            stringV,
            stringR,
            stringS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKInvalidSignature');
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetBoolProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            true,
            bn(9999999999),
            boolV,
            boolR,
            boolS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKInvalidSignature');
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetBytesProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            '0x1234',
            bn(9999999999),
            bytesV,
            bytesR,
            bytesS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKInvalidSignature');
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetAddressProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            owner.address,
            bn(9999999999),
            addressV,
            addressR,
            addressS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKInvalidSignature');
    });

    it('should not allow to use presigned message to modify the parameters if the signer is not authorized to modify them', async function () {
      const uintMessage = await tokenProperties.prepareMessageToPresignUintProperty(
        ownedCollection.address,
        1,
        'X',
        1,
        bn(9999999999),
      );
      const stringMessage = await tokenProperties.prepareMessageToPresignStringProperty(
        ownedCollection.address,
        1,
        'X',
        'test',
        bn(9999999999),
      );
      const boolMessage = await tokenProperties.prepareMessageToPresignBoolProperty(
        ownedCollection.address,
        1,
        'X',
        true,
        bn(9999999999),
      );
      const bytesMessage = await tokenProperties.prepareMessageToPresignBytesProperty(
        ownedCollection.address,
        1,
        'X',
        '0x1234',
        bn(9999999999),
      );
      const addressMessage = await tokenProperties.prepareMessageToPresignAddressProperty(
        ownedCollection.address,
        1,
        'X',
        owner.address,
        bn(9999999999),
      );

      const uintSignature = await issuer.signMessage(ethers.utils.arrayify(uintMessage));
      const stringSignature = await issuer.signMessage(ethers.utils.arrayify(stringMessage));
      const boolSignature = await issuer.signMessage(ethers.utils.arrayify(boolMessage));
      const bytesSignature = await issuer.signMessage(ethers.utils.arrayify(bytesMessage));
      const addressSignature = await issuer.signMessage(ethers.utils.arrayify(addressMessage));

      const uintR: string = uintSignature.substring(0, 66);
      const uintS: string = '0x' + uintSignature.substring(66, 130);
      const uintV: string = parseInt(uintSignature.substring(130, 132), 16);

      const stringR: string = stringSignature.substring(0, 66);
      const stringS: string = '0x' + stringSignature.substring(66, 130);
      const stringV: string = parseInt(stringSignature.substring(130, 132), 16);

      const boolR: string = boolSignature.substring(0, 66);
      const boolS: string = '0x' + boolSignature.substring(66, 130);
      const boolV: string = parseInt(boolSignature.substring(130, 132), 16);

      const bytesR: string = bytesSignature.substring(0, 66);
      const bytesS: string = '0x' + bytesSignature.substring(66, 130);
      const bytesV: string = parseInt(bytesSignature.substring(130, 132), 16);

      const addressR: string = addressSignature.substring(0, 66);
      const addressS: string = '0x' + addressSignature.substring(66, 130);
      const addressV: string = parseInt(addressSignature.substring(130, 132), 16);

      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetUintProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            1,
            bn(9999999999),
            uintV,
            uintR,
            uintS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetStringProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            'test',
            bn(9999999999),
            stringV,
            stringR,
            stringS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetBoolProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            true,
            bn(9999999999),
            boolV,
            boolR,
            boolS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetBytesProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            '0x1234',
            bn(9999999999),
            bytesV,
            bytesR,
            bytesS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
      await expect(
        tokenProperties
          .connect(owner)
          .presignedSetAddressProperty(
            issuer.address,
            ownedCollection.address,
            1,
            'X',
            owner.address,
            bn(9999999999),
            addressV,
            addressR,
            addressS,
          ),
      ).to.be.revertedWithCustomError(tokenProperties, 'RMRKNotCollectionIssuer');
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
}
