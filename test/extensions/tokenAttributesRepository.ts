// import { ethers } from 'hardhat';
// import { expect } from 'chai';
// import { loadFixture, mine } from '@nomicfoundation/hardhat-network-helpers';
// import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
// import { IERC165, IERC7508 } from '../interfaces';
// import { OwnableMintableERC721Mock, RMRKTokenAttributesRepository } from '../../typechain-types';
// import { bn } from '../utils';
// import { smock, FakeContract } from '@defi-wonderland/smock';

// // --------------- FIXTURES -----------------------

// async function tokenAttributesFixture() {
//   const factory = await ethers.getContractFactory('RMRKTokenAttributesRepository');
//   const tokenAttributes = await factory.deploy();
//   await tokenAttributes.waitForDeployment();

//   return { tokenAttributes };
// }

// async function ownedCollectionFixture() {
//   const ownedCollection = await smock.fake<OwnableMintableERC721Mock>('OwnableMintableERC721Mock');

//   return { ownedCollection };
// }

// // --------------- TESTS -----------------------

// describe('RMRKTokenAttributesRepository', async function () {
//   let tokenAttributes: RMRKTokenAttributesRepository;
//   let ownedCollection: FakeContract<OwnableMintableERC721Mock>;

//   beforeEach(async function () {
//     ({ tokenAttributes } = await loadFixture(tokenAttributesFixture));
//     ({ ownedCollection } = await loadFixture(ownedCollectionFixture));

//     this.tokenAttributes = tokenAttributes;
//     this.ownedCollection = ownedCollection;
//   });

//   shouldBehaveLikeTokenAttributesRepositoryInterface();

//   describe('RMRKTokenAttributesRepository', async function () {
//     let issuer: SignerWithAddress;
//     let owner: SignerWithAddress;
//     const tokenId = 1;
//     const tokenId2 = 2;

//     beforeEach(async function () {
//       ({ tokenAttributes } = await loadFixture(tokenAttributesFixture));
//       ({ ownedCollection } = await loadFixture(ownedCollectionFixture));

//       const signers = await ethers.getSigners();
//       issuer = signers[0];
//       owner = signers[1];

//       ownedCollection.owner.returns(await issuer.getAddress());

//       await tokenAttributes.registerAccessControl(
//         await ownedCollection.getAddress(),
//         await issuer.getAddress(),
//         false,
//       );
//     });

//     it('can set and get token attributes', async function () {
//       expect(
//         await tokenAttributes.setStringAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'description',
//           'test description',
//         ),
//       )
//         .to.emit(tokenAttributes, 'StringAttributeSet')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'description', 'test description');
//       expect(
//         await tokenAttributes.setStringAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'description1',
//           'test description',
//         ),
//       )
//         .to.emit(tokenAttributes, 'StringAttributeSet')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'description1', 'test description');
//       expect(
//         await tokenAttributes.setBoolAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'rare',
//           true,
//         ),
//       )
//         .to.emit(tokenAttributes, 'BoolAttributeSet')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'rare', true);
//       expect(
//         await tokenAttributes.setAddressAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'owner',
//           await owner.getAddress(),
//         ),
//       )
//         .to.emit(tokenAttributes, 'AddressAttributeSet')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'owner', await owner.getAddress());
//       expect(
//         await tokenAttributes.setUintAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'atk',
//           bn(100),
//         ),
//       )
//         .to.emit(tokenAttributes, 'UintAttributeSet')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'atk', bn(100));
//       expect(
//         await tokenAttributes.setUintAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'health',
//           bn(100),
//         ),
//       )
//         .to.emit(tokenAttributes, 'UintAttributeSet')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'health', bn(100));
//       expect(
//         await tokenAttributes.setUintAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'health',
//           bn(95),
//         ),
//       )
//         .to.emit(tokenAttributes, 'UintAttributeSet')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'health', bn(95));
//       expect(
//         await tokenAttributes.setUintAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'health',
//           bn(80),
//         ),
//       )
//         .to.emit(tokenAttributes, 'UintAttributeSet')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'health', bn(80));
//       expect(
//         await tokenAttributes.setBytesAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'data',
//           '0x1234',
//         ),
//       )
//         .to.emit(tokenAttributes, 'BytesAttributeSet')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'data', '0x1234');

//       expect(
//         await tokenAttributes.getStringAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'description',
//         ),
//       ).to.eql('test description');
//       expect(
//         await tokenAttributes.getStringAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'description1',
//         ),
//       ).to.eql('test description');
//       expect(
//         await tokenAttributes.getBoolAttribute(await ownedCollection.getAddress(), tokenId, 'rare'),
//       ).to.eql(true);
//       expect(
//         await tokenAttributes.getAddressAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'owner',
//         ),
//       ).to.eql(await owner.getAddress());
//       expect(
//         await tokenAttributes.getUintAttribute(await ownedCollection.getAddress(), tokenId, 'atk'),
//       ).to.eql(bn(100));
//       expect(
//         await tokenAttributes.getUintAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'health',
//         ),
//       ).to.eql(bn(80));
//       expect(
//         await tokenAttributes.getBytesAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'data',
//         ),
//       ).to.eql('0x1234');

//       await tokenAttributes.setStringAttribute(
//         await ownedCollection.getAddress(),
//         tokenId,
//         'description',
//         'test description update',
//       );
//       expect(
//         await tokenAttributes.getStringAttribute(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'description',
//         ),
//       ).to.eql('test description update');
//     });

//     it('can set multiple attributes of multiple types at the same time', async function () {
//       await expect(
//         tokenAttributes.setAttributes(
//           await ownedCollection.getAddress(),
//           tokenId,
//           [
//             { key: 'string1', value: 'value1' },
//             { key: 'string2', value: 'value2' },
//           ],
//           [
//             { key: 'uint1', value: bn(1) },
//             { key: 'uint2', value: bn(2) },
//           ],
//           [
//             { key: 'bool1', value: true },
//             { key: 'bool2', value: false },
//           ],
//           [
//             { key: 'address1', value: await owner.getAddress() },
//             { key: 'address2', value: await issuer.getAddress() },
//           ],
//           [
//             { key: 'bytes1', value: '0x1234' },
//             { key: 'bytes2', value: '0x5678' },
//           ],
//         ),
//       )
//         .to.emit(tokenAttributes, 'StringAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'string1', 'value1')
//         .to.emit(tokenAttributes, 'StringAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'string2', 'value2')
//         .to.emit(tokenAttributes, 'UintAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'uint1', bn(1))
//         .to.emit(tokenAttributes, 'UintAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'uint2', bn(2))
//         .to.emit(tokenAttributes, 'BoolAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bool1', true)
//         .to.emit(tokenAttributes, 'BoolAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bool2', false)
//         .to.emit(tokenAttributes, 'AddressAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'address1', await owner.getAddress())
//         .to.emit(tokenAttributes, 'AddressAttributeUpdated')
//         .withArgs(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'address2',
//           await issuer.getAddress(),
//         )
//         .to.emit(tokenAttributes, 'BytesAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bytes1', '0x1234')
//         .to.emit(tokenAttributes, 'BytesAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bytes2', '0x5678');
//     });

//     it('can update multiple attributes of multiple types at the same time', async function () {
//       await tokenAttributes.setAttributes(
//         await ownedCollection.getAddress(),
//         tokenId,
//         [
//           { key: 'string1', value: 'value0' },
//           { key: 'string2', value: 'value1' },
//         ],
//         [
//           { key: 'uint1', value: bn(0) },
//           { key: 'uint2', value: bn(1) },
//         ],
//         [
//           { key: 'bool1', value: false },
//           { key: 'bool2', value: true },
//         ],
//         [
//           { key: 'address1', value: await issuer.getAddress() },
//           { key: 'address2', value: await owner.getAddress() },
//         ],
//         [
//           { key: 'bytes1', value: '0x5678' },
//           { key: 'bytes2', value: '0x1234' },
//         ],
//       );

//       await expect(
//         tokenAttributes.setAttributes(
//           await ownedCollection.getAddress(),
//           tokenId,
//           [
//             { key: 'string1', value: 'value1' },
//             { key: 'string2', value: 'value2' },
//           ],
//           [
//             { key: 'uint1', value: bn(1) },
//             { key: 'uint2', value: bn(2) },
//           ],
//           [
//             { key: 'bool1', value: true },
//             { key: 'bool2', value: false },
//           ],
//           [
//             { key: 'address1', value: await owner.getAddress() },
//             { key: 'address2', value: await issuer.getAddress() },
//           ],
//           [
//             { key: 'bytes1', value: '0x1234' },
//             { key: 'bytes2', value: '0x5678' },
//           ],
//         ),
//       )
//         .to.emit(tokenAttributes, 'StringAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'string1', 'value1')
//         .to.emit(tokenAttributes, 'StringAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'string2', 'value2')
//         .to.emit(tokenAttributes, 'UintAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'uint1', bn(1))
//         .to.emit(tokenAttributes, 'UintAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'uint2', bn(2))
//         .to.emit(tokenAttributes, 'BoolAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bool1', true)
//         .to.emit(tokenAttributes, 'BoolAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bool2', false)
//         .to.emit(tokenAttributes, 'AddressAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'address1', await owner.getAddress())
//         .to.emit(tokenAttributes, 'AddressAttributeUpdated')
//         .withArgs(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'address2',
//           await issuer.getAddress(),
//         )
//         .to.emit(tokenAttributes, 'BytesAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bytes1', '0x1234')
//         .to.emit(tokenAttributes, 'BytesAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bytes2', '0x5678');
//     });

//     it('can set and update multiple attributes of multiple types at the same time even if not all types are updated at the same time', async function () {
//       await tokenAttributes.setAttributes(
//         await ownedCollection.getAddress(),
//         tokenId,
//         [{ key: 'string1', value: 'value0' }],
//         [
//           { key: 'uint1', value: bn(0) },
//           { key: 'uint2', value: bn(1) },
//         ],
//         [
//           { key: 'bool1', value: false },
//           { key: 'bool2', value: true },
//         ],
//         [
//           { key: 'address1', value: await issuer.getAddress() },
//           { key: 'address2', value: await owner.getAddress() },
//         ],
//         [],
//       );

//       await expect(
//         tokenAttributes.setAttributes(
//           await ownedCollection.getAddress(),
//           tokenId,
//           [],
//           [
//             { key: 'uint1', value: bn(1) },
//             { key: 'uint2', value: bn(2) },
//           ],
//           [
//             { key: 'bool1', value: true },
//             { key: 'bool2', value: false },
//           ],
//           [
//             { key: 'address1', value: await owner.getAddress() },
//             { key: 'address2', value: await issuer.getAddress() },
//           ],
//           [
//             { key: 'bytes1', value: '0x1234' },
//             { key: 'bytes2', value: '0x5678' },
//           ],
//         ),
//       )
//         .to.emit(tokenAttributes, 'UintAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'uint1', bn(1))
//         .to.emit(tokenAttributes, 'UintAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'uint2', bn(2))
//         .to.emit(tokenAttributes, 'BoolAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bool1', true)
//         .to.emit(tokenAttributes, 'BoolAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bool2', false)
//         .to.emit(tokenAttributes, 'AddressAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'address1', await owner.getAddress())
//         .to.emit(tokenAttributes, 'AddressAttributeUpdated')
//         .withArgs(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'address2',
//           await issuer.getAddress(),
//         )
//         .to.emit(tokenAttributes, 'BytesAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bytes1', '0x1234')
//         .to.emit(tokenAttributes, 'BytesAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bytes2', '0x5678');

//       await expect(
//         tokenAttributes.setAttributes(
//           await ownedCollection.getAddress(),
//           tokenId,
//           [],
//           [],
//           [
//             { key: 'bool1', value: false },
//             { key: 'bool2', value: true },
//           ],
//           [],
//           [],
//         ),
//       )
//         .to.emit(tokenAttributes, 'BoolAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bool1', false)
//         .to.emit(tokenAttributes, 'BoolAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bool2', true);
//     });

//     it('can set and update multiple attributes of multiple types at the same time', async function () {
//       await expect(
//         tokenAttributes.setAttributes(
//           await ownedCollection.getAddress(),
//           tokenId,
//           [
//             { key: 'string1', value: 'value1' },
//             { key: 'string2', value: 'value2' },
//           ],
//           [
//             { key: 'uint1', value: bn(1) },
//             { key: 'uint2', value: bn(2) },
//           ],
//           [
//             { key: 'bool1', value: true },
//             { key: 'bool2', value: false },
//           ],
//           [
//             { key: 'address1', value: await owner.getAddress() },
//             { key: 'address2', value: await issuer.getAddress() },
//           ],
//           [
//             { key: 'bytes1', value: '0x1234' },
//             { key: 'bytes2', value: '0x5678' },
//           ],
//         ),
//       )
//         .to.emit(tokenAttributes, 'StringAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'string1', 'value1')
//         .to.emit(tokenAttributes, 'StringAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'string2', 'value2')
//         .to.emit(tokenAttributes, 'UintAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'uint1', bn(1))
//         .to.emit(tokenAttributes, 'UintAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'uint2', bn(2))
//         .to.emit(tokenAttributes, 'BoolAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bool1', true)
//         .to.emit(tokenAttributes, 'BoolAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bool2', false)
//         .to.emit(tokenAttributes, 'AddressAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'address1', await owner.getAddress())
//         .to.emit(tokenAttributes, 'AddressAttributeUpdated')
//         .withArgs(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'address2',
//           await issuer.getAddress(),
//         )
//         .to.emit(tokenAttributes, 'BytesAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bytes1', '0x1234')
//         .to.emit(tokenAttributes, 'BytesAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bytes2', '0x5678');
//     });

//     it('should allow to retrieve multiple attributes at once', async function () {
//       await tokenAttributes.setAttributes(
//         await ownedCollection.getAddress(),
//         tokenId,
//         [
//           { key: 'string1', value: 'value1' },
//           { key: 'string2', value: 'value2' },
//         ],
//         [
//           { key: 'uint1', value: bn(1) },
//           { key: 'uint2', value: bn(2) },
//         ],
//         [
//           { key: 'bool1', value: true },
//           { key: 'bool2', value: false },
//         ],
//         [
//           { key: 'address1', value: await owner.getAddress() },
//           { key: 'address2', value: await issuer.getAddress() },
//         ],
//         [
//           { key: 'bytes1', value: '0x1234' },
//           { key: 'bytes2', value: '0x5678' },
//         ],
//       );

//       expect(
//         await tokenAttributes.getAttributes(
//           await ownedCollection.getAddress(),
//           tokenId,
//           ['string1', 'string2'],
//           ['uint1', 'uint2'],
//           ['bool1', 'bool2'],
//           ['address1', 'address2'],
//           ['bytes1', 'bytes2'],
//         ),
//       ).to.eql([
//         [
//           ['string1', 'value1'],
//           ['string2', 'value2'],
//         ],
//         [
//           ['uint1', bn(1)],
//           ['uint2', bn(2)],
//         ],
//         [
//           ['bool1', true],
//           ['bool2', false],
//         ],
//         [
//           ['address1', await owner.getAddress()],
//           ['address2', await issuer.getAddress()],
//         ],
//         [
//           ['bytes1', '0x1234'],
//           ['bytes2', '0x5678'],
//         ],
//       ]);
//     });

//     it('can set multiple string attributes at the same time', async function () {
//       await expect(
//         tokenAttributes.setStringAttributes(await ownedCollection.getAddress(), tokenId, [
//           { key: 'string1', value: 'value1' },
//           { key: 'string2', value: 'value2' },
//         ]),
//       )
//         .to.emit(tokenAttributes, 'StringAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'string1', 'value1')
//         .to.emit(tokenAttributes, 'StringAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'string2', 'value2');

//       expect(
//         await tokenAttributes.getAttributes(
//           await ownedCollection.getAddress(),
//           tokenId,
//           ['string1', 'string2'],
//           [],
//           [],
//           [],
//           [],
//         ),
//       ).to.eql([
//         [
//           ['string1', 'value1'],
//           ['string2', 'value2'],
//         ],
//         [],
//         [],
//         [],
//         [],
//       ]);
//     });

//     it('can set multiple uint attributes at the same time', async function () {
//       await expect(
//         tokenAttributes.setUintAttributes(await ownedCollection.getAddress(), tokenId, [
//           { key: 'uint1', value: bn(1) },
//           { key: 'uint2', value: bn(2) },
//         ]),
//       )
//         .to.emit(tokenAttributes, 'UintAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'uint1', bn(1))
//         .to.emit(tokenAttributes, 'UintAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'uint2', bn(2));

//       expect(
//         await tokenAttributes.getAttributes(
//           await ownedCollection.getAddress(),
//           tokenId,
//           [],
//           ['uint1', 'uint2'],
//           [],
//           [],
//           [],
//         ),
//       ).to.eql([
//         [],
//         [
//           ['uint1', bn(1)],
//           ['uint2', bn(2)],
//         ],
//         [],
//         [],
//         [],
//       ]);
//     });

//     it('can set multiple bool attributes at the same time', async function () {
//       await expect(
//         tokenAttributes.setBoolAttributes(await ownedCollection.getAddress(), tokenId, [
//           { key: 'bool1', value: true },
//           { key: 'bool2', value: false },
//         ]),
//       )
//         .to.emit(tokenAttributes, 'BoolAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bool1', true)
//         .to.emit(tokenAttributes, 'BoolAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bool2', false);

//       expect(
//         await tokenAttributes.getAttributes(
//           await ownedCollection.getAddress(),
//           tokenId,
//           [],
//           [],
//           ['bool1', 'bool2'],
//           [],
//           [],
//         ),
//       ).to.eql([
//         [],
//         [],
//         [
//           ['bool1', true],
//           ['bool2', false],
//         ],
//         [],
//         [],
//       ]);
//     });

//     it('can set multiple address attributes at the same time', async function () {
//       await expect(
//         tokenAttributes.setAddressAttributes(await ownedCollection.getAddress(), tokenId, [
//           { key: 'address1', value: await owner.getAddress() },
//           { key: 'address2', value: await issuer.getAddress() },
//         ]),
//       )
//         .to.emit(tokenAttributes, 'AddressAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'address1', await owner.getAddress())
//         .to.emit(tokenAttributes, 'AddressAttributeUpdated')
//         .withArgs(
//           await ownedCollection.getAddress(),
//           tokenId,
//           'address2',
//           await issuer.getAddress(),
//         );

//       expect(
//         await tokenAttributes.getAttributes(
//           await ownedCollection.getAddress(),
//           tokenId,
//           [],
//           [],
//           [],
//           ['address1', 'address2'],
//           [],
//         ),
//       ).to.eql([
//         [],
//         [],
//         [],
//         [
//           ['address1', await owner.getAddress()],
//           ['address2', await issuer.getAddress()],
//         ],
//         [],
//       ]);
//     });

//     it('can set multiple bytes attributes at the same time', async function () {
//       await expect(
//         tokenAttributes.setBytesAttributes(await ownedCollection.getAddress(), tokenId, [
//           { key: 'bytes1', value: '0x1234' },
//           { key: 'bytes2', value: '0x5678' },
//         ]),
//       )
//         .to.emit(tokenAttributes, 'BytesAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bytes1', '0x1234')
//         .to.emit(tokenAttributes, 'BytesAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), tokenId, 'bytes2', '0x5678');

//       expect(
//         await tokenAttributes.getAttributes(
//           await ownedCollection.getAddress(),
//           tokenId,
//           [],
//           [],
//           [],
//           [],
//           ['bytes1', 'bytes2'],
//         ),
//       ).to.eql([
//         [],
//         [],
//         [],
//         [],
//         [
//           ['bytes1', '0x1234'],
//           ['bytes2', '0x5678'],
//         ],
//       ]);
//     });

//     it('can reuse keys and values are fine', async function () {
//       await tokenAttributes.setStringAttribute(
//         await ownedCollection.getAddress(),
//         tokenId,
//         'X',
//         'X1',
//       );
//       await tokenAttributes.setStringAttribute(
//         await ownedCollection.getAddress(),
//         tokenId2,
//         'X',
//         'X2',
//       );

//       expect(
//         await tokenAttributes.getStringAttribute(await ownedCollection.getAddress(), tokenId, 'X'),
//       ).to.eql('X1');
//       expect(
//         await tokenAttributes.getStringAttribute(await ownedCollection.getAddress(), tokenId2, 'X'),
//       ).to.eql('X2');
//     });

//     it('can reuse keys among different attributes and values are fine', async function () {
//       await tokenAttributes.setStringAttribute(
//         await ownedCollection.getAddress(),
//         tokenId,
//         'X',
//         'test description',
//       );
//       await tokenAttributes.setBoolAttribute(
//         await ownedCollection.getAddress(),
//         tokenId,
//         'X',
//         true,
//       );
//       await tokenAttributes.setAddressAttribute(
//         await ownedCollection.getAddress(),
//         tokenId,
//         'X',
//         await owner.getAddress(),
//       );
//       await tokenAttributes.setUintAttribute(
//         await ownedCollection.getAddress(),
//         tokenId,
//         'X',
//         bn(100),
//       );
//       await tokenAttributes.setBytesAttribute(
//         await ownedCollection.getAddress(),
//         tokenId,
//         'X',
//         '0x1234',
//       );

//       expect(
//         await tokenAttributes.getStringAttribute(await ownedCollection.getAddress(), tokenId, 'X'),
//       ).to.eql('test description');
//       expect(
//         await tokenAttributes.getBoolAttribute(await ownedCollection.getAddress(), tokenId, 'X'),
//       ).to.eql(true);
//       expect(
//         await tokenAttributes.getAddressAttribute(await ownedCollection.getAddress(), tokenId, 'X'),
//       ).to.eql(await owner.getAddress());
//       expect(
//         await tokenAttributes.getUintAttribute(await ownedCollection.getAddress(), tokenId, 'X'),
//       ).to.eql(bn(100));
//       expect(
//         await tokenAttributes.getBytesAttribute(await ownedCollection.getAddress(), tokenId, 'X'),
//       ).to.eql('0x1234');
//     });

//     it('can reuse string values and values are fine', async function () {
//       await tokenAttributes.setStringAttribute(
//         await ownedCollection.getAddress(),
//         tokenId,
//         'X',
//         'common string',
//       );
//       await tokenAttributes.setStringAttribute(
//         await ownedCollection.getAddress(),
//         tokenId2,
//         'X',
//         'common string',
//       );

//       expect(
//         await tokenAttributes.getStringAttribute(await ownedCollection.getAddress(), tokenId, 'X'),
//       ).to.eql('common string');
//       expect(
//         await tokenAttributes.getStringAttribute(await ownedCollection.getAddress(), tokenId2, 'X'),
//       ).to.eql('common string');
//     });

//     it('should not allow to set string values to unauthorized caller', async function () {
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .setStringAttribute(await ownedCollection.getAddress(), tokenId, 'X', 'test description'),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//     });

//     it('should not allow to set uint values to unauthorized caller', async function () {
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .setUintAttribute(await ownedCollection.getAddress(), tokenId, 'X', bn(42)),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//     });

//     it('should not allow to set boolean values to unauthorized caller', async function () {
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .setBoolAttribute(await ownedCollection.getAddress(), tokenId, 'X', true),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//     });

//     it('should not allow to set address values to unauthorized caller', async function () {
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .setAddressAttribute(
//             await ownedCollection.getAddress(),
//             tokenId,
//             'X',
//             await owner.getAddress(),
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//     });

//     it('should not allow to set bytes values to unauthorized caller', async function () {
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .setBytesAttribute(await ownedCollection.getAddress(), tokenId, 'X', '0x1234'),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//     });
//   });

//   describe('Token attributes access control', async function () {
//     let issuer: SignerWithAddress;
//     let owner: SignerWithAddress;
//     const tokenId = 1;
//     const tokenId2 = 2;

//     beforeEach(async function () {
//       ({ tokenAttributes } = await loadFixture(tokenAttributesFixture));
//       ({ ownedCollection } = await loadFixture(ownedCollectionFixture));

//       const signers = await ethers.getSigners();
//       issuer = signers[0];
//       owner = signers[1];

//       ownedCollection.owner.returns(await issuer.getAddress());
//     });

//     it('should not allow registering an already registered collection', async function () {
//       await tokenAttributes.registerAccessControl(
//         await ownedCollection.getAddress(),
//         await issuer.getAddress(),
//         false,
//       );

//       await expect(
//         tokenAttributes.registerAccessControl(
//           await ownedCollection.getAddress(),
//           await issuer.getAddress(),
//           false,
//         ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'CollectionAlreadyRegistered');
//     });

//     it('should not allow to register a collection if caller is not the owner of the collection', async function () {
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .registerAccessControl(
//             await ownedCollection.getAddress(),
//             await issuer.getAddress(),
//             true,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//     });

//     it('should not allow to register a collection without Ownable implemented', async function () {
//       ownedCollection.owner.reset();

//       await expect(
//         tokenAttributes.registerAccessControl(
//           await ownedCollection.getAddress(),
//           await issuer.getAddress(),
//           false,
//         ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'OwnableNotImplemented');
//     });

//     it('should allow to manage access control for registered collections', async function () {
//       await tokenAttributes.registerAccessControl(
//         await ownedCollection.getAddress(),
//         await issuer.getAddress(),
//         false,
//       );

//       expect(
//         await tokenAttributes
//           .connect(issuer)
//           .manageAccessControl(
//             await ownedCollection.getAddress(),
//             'X',
//             2,
//             await owner.getAddress(),
//           ),
//       )
//         .to.emit(tokenAttributes, 'AccessControlUpdate')
//         .withArgs(await ownedCollection.getAddress(), 'X', 2, owner);
//     });

//     it('should allow issuer to manage collaborators', async function () {
//       await tokenAttributes.registerAccessControl(
//         await ownedCollection.getAddress(),
//         await issuer.getAddress(),
//         false,
//       );

//       expect(
//         await tokenAttributes
//           .connect(issuer)
//           .manageCollaborators(
//             await ownedCollection.getAddress(),
//             [await owner.getAddress()],
//             [true],
//           ),
//       )
//         .to.emit(tokenAttributes, 'CollaboratorUpdate')
//         .withArgs(await ownedCollection.getAddress(), [await owner.getAddress()], [true]);
//     });

//     it('should not allow to manage collaborators of an unregistered collection', async function () {
//       await expect(
//         tokenAttributes
//           .connect(issuer)
//           .manageCollaborators(
//             await ownedCollection.getAddress(),
//             [await owner.getAddress()],
//             [true],
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'CollectionNotRegistered');
//     });

//     it('should not allow to manage collaborators if the caller is not the issuer', async function () {
//       await tokenAttributes.registerAccessControl(
//         await ownedCollection.getAddress(),
//         await issuer.getAddress(),
//         false,
//       );

//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .manageCollaborators(
//             await ownedCollection.getAddress(),
//             [await owner.getAddress()],
//             [true],
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//     });

//     it('should not allow to manage collaborators for registered collections if collaborator arrays are not of equal length', async function () {
//       await tokenAttributes.registerAccessControl(
//         await ownedCollection.getAddress(),
//         await issuer.getAddress(),
//         false,
//       );

//       await expect(
//         tokenAttributes
//           .connect(issuer)
//           .manageCollaborators(
//             await ownedCollection.getAddress(),
//             [await owner.getAddress(), await issuer.getAddress()],
//             [true],
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'CollaboratorArraysNotEqualLength');
//     });

//     it('should not allow to manage access control for unregistered collections', async function () {
//       await expect(
//         tokenAttributes
//           .connect(issuer)
//           .manageAccessControl(
//             await ownedCollection.getAddress(),
//             'X',
//             2,
//             await owner.getAddress(),
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'CollectionNotRegistered');
//     });

//     it('should not allow to manage access control if the caller is not issuer', async function () {
//       await tokenAttributes.registerAccessControl(
//         await ownedCollection.getAddress(),
//         await issuer.getAddress(),
//         false,
//       );

//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .manageAccessControl(
//             await ownedCollection.getAddress(),
//             'X',
//             2,
//             await owner.getAddress(),
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//     });

//     it('should not allow to manage access control if the caller is not returned as collection owner when using ownable', async function () {
//       await tokenAttributes.registerAccessControl(
//         await ownedCollection.getAddress(),
//         await issuer.getAddress(),
//         true,
//       );

//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .manageAccessControl(
//             await ownedCollection.getAddress(),
//             'X',
//             2,
//             await owner.getAddress(),
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//     });

//     it('should return the expected value when checking for collaborators', async function () {
//       await tokenAttributes.registerAccessControl(
//         await ownedCollection.getAddress(),
//         await issuer.getAddress(),
//         false,
//       );

//       expect(
//         await tokenAttributes.isCollaborator(
//           await owner.getAddress(),
//           await ownedCollection.getAddress(),
//         ),
//       ).to.be.false;

//       await tokenAttributes
//         .connect(issuer)
//         .manageCollaborators(
//           await ownedCollection.getAddress(),
//           [await owner.getAddress()],
//           [true],
//         );

//       expect(
//         await tokenAttributes.isCollaborator(
//           await owner.getAddress(),
//           await ownedCollection.getAddress(),
//         ),
//       ).to.be.true;
//     });

//     it('should return the expected value when checking for specific addresses', async function () {
//       await tokenAttributes.registerAccessControl(
//         await ownedCollection.getAddress(),
//         await issuer.getAddress(),
//         false,
//       );

//       expect(
//         await tokenAttributes.isSpecificAddress(
//           await owner.getAddress(),
//           await ownedCollection.getAddress(),
//           'X',
//         ),
//       ).to.be.false;

//       await tokenAttributes
//         .connect(issuer)
//         .manageAccessControl(await ownedCollection.getAddress(), 'X', 2, await owner.getAddress());

//       expect(
//         await tokenAttributes.isSpecificAddress(
//           await owner.getAddress(),
//           await ownedCollection.getAddress(),
//           'X',
//         ),
//       ).to.be.true;
//     });

//     it('should use the issuer returned from the collection when using only issuer when only issuer is allowed to manage parameter', async function () {
//       await tokenAttributes
//         .connect(issuer)
//         .registerAccessControl(await ownedCollection.getAddress(), await issuer.getAddress(), true);

//       await tokenAttributes
//         .connect(issuer)
//         .manageAccessControl(await ownedCollection.getAddress(), 'X', 0, ethers.ZeroAddress);

//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .setAddressAttribute(
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             await owner.getAddress(),
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');

//       ownedCollection.owner.returns(await owner.getAddress());

//       await expect(
//         tokenAttributes
//           .connect(issuer)
//           .setAddressAttribute(
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             await owner.getAddress(),
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//     });

//     it('should only allow collaborator to modify the parameters if only collaborator is allowed to modify them', async function () {
//       await tokenAttributes
//         .connect(issuer)
//         .registerAccessControl(
//           await ownedCollection.getAddress(),
//           await issuer.getAddress(),
//           false,
//         );

//       await tokenAttributes
//         .connect(issuer)
//         .manageAccessControl(await ownedCollection.getAddress(), 'X', 1, ethers.ZeroAddress);

//       await tokenAttributes
//         .connect(issuer)
//         .manageCollaborators(
//           await ownedCollection.getAddress(),
//           [await owner.getAddress()],
//           [true],
//         );

//       await tokenAttributes
//         .connect(owner)
//         .setAddressAttribute(await ownedCollection.getAddress(), 1, 'X', await owner.getAddress());

//       await expect(
//         tokenAttributes
//           .connect(issuer)
//           .setAddressAttribute(
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             await owner.getAddress(),
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionCollaborator');
//     });

//     it('should only allow issuer and collaborator to modify the parameters if only issuer and collaborator is allowed to modify them', async function () {
//       await tokenAttributes
//         .connect(issuer)
//         .registerAccessControl(
//           await ownedCollection.getAddress(),
//           await issuer.getAddress(),
//           false,
//         );

//       await tokenAttributes
//         .connect(issuer)
//         .manageAccessControl(await ownedCollection.getAddress(), 'X', 2, ethers.ZeroAddress);

//       await tokenAttributes
//         .connect(issuer)
//         .setAddressAttribute(await ownedCollection.getAddress(), 1, 'X', await owner.getAddress());

//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .setAddressAttribute(
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             await owner.getAddress(),
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuerOrCollaborator');

//       await tokenAttributes
//         .connect(issuer)
//         .manageCollaborators(
//           await ownedCollection.getAddress(),
//           [await owner.getAddress()],
//           [true],
//         );

//       await tokenAttributes
//         .connect(owner)
//         .setAddressAttribute(await ownedCollection.getAddress(), 1, 'X', await owner.getAddress());
//     });

//     it('should only allow issuer and collaborator to modify the parameters if only issuer and collaborator is allowed to modify them even when using the ownable', async function () {
//       await tokenAttributes
//         .connect(issuer)
//         .registerAccessControl(await ownedCollection.getAddress(), await issuer.getAddress(), true);

//       await tokenAttributes
//         .connect(issuer)
//         .manageAccessControl(await ownedCollection.getAddress(), 'X', 2, ethers.ZeroAddress);

//       ownedCollection.owner.returns(await owner.getAddress());

//       await tokenAttributes
//         .connect(owner)
//         .setAddressAttribute(await ownedCollection.getAddress(), 1, 'X', await owner.getAddress());

//       await expect(
//         tokenAttributes
//           .connect(issuer)
//           .setAddressAttribute(
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             await owner.getAddress(),
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuerOrCollaborator');

//       await tokenAttributes
//         .connect(owner)
//         .manageCollaborators(
//           await ownedCollection.getAddress(),
//           [await issuer.getAddress()],
//           [true],
//         );

//       await tokenAttributes
//         .connect(issuer)
//         .setAddressAttribute(await ownedCollection.getAddress(), 1, 'X', await owner.getAddress());
//     });

//     it('should only allow token owner to modify the parameters if only token owner is allowed to modify them', async function () {
//       await tokenAttributes
//         .connect(issuer)
//         .registerAccessControl(
//           await ownedCollection.getAddress(),
//           await issuer.getAddress(),
//           false,
//         );

//       await tokenAttributes
//         .connect(issuer)
//         .manageAccessControl(await ownedCollection.getAddress(), 'X', 3, ethers.ZeroAddress);

//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .setAddressAttribute(
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             await owner.getAddress(),
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotTokenOwner');

//       ownedCollection.ownerOf.returns(await owner.getAddress());

//       await tokenAttributes
//         .connect(owner)
//         .setAddressAttribute(await ownedCollection.getAddress(), 1, 'X', await owner.getAddress());

//       await expect(
//         tokenAttributes
//           .connect(issuer)
//           .setAddressAttribute(
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             await owner.getAddress(),
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotTokenOwner');
//     });

//     it('should only allow specific address to modify the parameters if only specific address is allowed to modify them', async function () {
//       await tokenAttributes
//         .connect(issuer)
//         .registerAccessControl(
//           await ownedCollection.getAddress(),
//           await issuer.getAddress(),
//           false,
//         );

//       await tokenAttributes
//         .connect(issuer)
//         .manageAccessControl(await ownedCollection.getAddress(), 'X', 4, ethers.ZeroAddress);

//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .setAddressAttribute(
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             await owner.getAddress(),
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotSpecificAddress');

//       await tokenAttributes
//         .connect(issuer)
//         .manageAccessControl(await ownedCollection.getAddress(), 'X', 4, await owner.getAddress());

//       await tokenAttributes
//         .connect(owner)
//         .setAddressAttribute(await ownedCollection.getAddress(), 1, 'X', await owner.getAddress());
//     });

//     it('should allow to use presigned message to modify the parameters', async function () {
//       await tokenAttributes
//         .connect(issuer)
//         .registerAccessControl(
//           await ownedCollection.getAddress(),
//           await issuer.getAddress(),
//           false,
//         );

//       const uintMessage = await tokenAttributes.prepareMessageToPresignUintAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         1,
//         bn(9999999999),
//       );
//       const stringMessage = await tokenAttributes.prepareMessageToPresignStringAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         'test',
//         bn(9999999999),
//       );
//       const boolMessage = await tokenAttributes.prepareMessageToPresignBoolAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         true,
//         bn(9999999999),
//       );
//       const bytesMessage = await tokenAttributes.prepareMessageToPresignBytesAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         '0x1234',
//         bn(9999999999),
//       );
//       const addressMessage = await tokenAttributes.prepareMessageToPresignAddressAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         await owner.getAddress(),
//         bn(9999999999),
//       );

//       const uintSignature = await issuer.signMessage(ethers.getBytes(uintMessage));
//       const stringSignature = await issuer.signMessage(ethers.getBytes(stringMessage));
//       const boolSignature = await issuer.signMessage(ethers.getBytes(boolMessage));
//       const bytesSignature = await issuer.signMessage(ethers.getBytes(bytesMessage));
//       const addressSignature = await issuer.signMessage(ethers.getBytes(addressMessage));

//       const uintR: string = uintSignature.substring(0, 66);
//       const uintS: string = '0x' + uintSignature.substring(66, 130);
//       const uintV: string = parseInt(uintSignature.substring(130, 132), 16);

//       const stringR: string = stringSignature.substring(0, 66);
//       const stringS: string = '0x' + stringSignature.substring(66, 130);
//       const stringV: string = parseInt(stringSignature.substring(130, 132), 16);

//       const boolR: string = boolSignature.substring(0, 66);
//       const boolS: string = '0x' + boolSignature.substring(66, 130);
//       const boolV: string = parseInt(boolSignature.substring(130, 132), 16);

//       const bytesR: string = bytesSignature.substring(0, 66);
//       const bytesS: string = '0x' + bytesSignature.substring(66, 130);
//       const bytesV: string = parseInt(bytesSignature.substring(130, 132), 16);

//       const addressR: string = addressSignature.substring(0, 66);
//       const addressS: string = '0x' + addressSignature.substring(66, 130);
//       const addressV: string = parseInt(addressSignature.substring(130, 132), 16);

//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetUintAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             1,
//             bn(9999999999),
//             uintV,
//             uintR,
//             uintS,
//           ),
//       )
//         .to.emit(tokenAttributes, 'UintAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), 1, 'X', 1);
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetStringAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             'test',
//             bn(9999999999),
//             stringV,
//             stringR,
//             stringS,
//           ),
//       )
//         .to.emit(tokenAttributes, 'StringAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), 1, 'X', 'test');
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetBoolAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             true,
//             bn(9999999999),
//             boolV,
//             boolR,
//             boolS,
//           ),
//       )
//         .to.emit(tokenAttributes, 'BoolAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), 1, 'X', true);
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetBytesAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             '0x1234',
//             bn(9999999999),
//             bytesV,
//             bytesR,
//             bytesS,
//           ),
//       )
//         .to.emit(tokenAttributes, 'BytesAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), 1, 'X', '0x1234');
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetAddressAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             await owner.getAddress(),
//             bn(9999999999),
//             addressV,
//             addressR,
//             addressS,
//           ),
//       )
//         .to.emit(tokenAttributes, 'AddressAttributeUpdated')
//         .withArgs(await ownedCollection.getAddress(), 1, 'X', await owner.getAddress());
//     });

//     it('should not allow to use presigned message to modify the parameters if the deadline has elapsed', async function () {
//       await tokenAttributes
//         .connect(issuer)
//         .registerAccessControl(
//           await ownedCollection.getAddress(),
//           await issuer.getAddress(),
//           false,
//         );

//       await mine(1000, { interval: 15 });

//       const uintMessage = await tokenAttributes.prepareMessageToPresignUintAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         1,
//         bn(10),
//       );
//       const stringMessage = await tokenAttributes.prepareMessageToPresignStringAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         'test',
//         bn(10),
//       );
//       const boolMessage = await tokenAttributes.prepareMessageToPresignBoolAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         true,
//         bn(10),
//       );
//       const bytesMessage = await tokenAttributes.prepareMessageToPresignBytesAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         '0x1234',
//         bn(10),
//       );
//       const addressMessage = await tokenAttributes.prepareMessageToPresignAddressAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         await owner.getAddress(),
//         bn(10),
//       );

//       const uintSignature = await issuer.signMessage(ethers.getBytes(uintMessage));
//       const stringSignature = await issuer.signMessage(ethers.getBytes(stringMessage));
//       const boolSignature = await issuer.signMessage(ethers.getBytes(boolMessage));
//       const bytesSignature = await issuer.signMessage(ethers.getBytes(bytesMessage));
//       const addressSignature = await issuer.signMessage(ethers.getBytes(addressMessage));

//       const uintR: string = uintSignature.substring(0, 66);
//       const uintS: string = '0x' + uintSignature.substring(66, 130);
//       const uintV: string = parseInt(uintSignature.substring(130, 132), 16);

//       const stringR: string = stringSignature.substring(0, 66);
//       const stringS: string = '0x' + stringSignature.substring(66, 130);
//       const stringV: string = parseInt(stringSignature.substring(130, 132), 16);

//       const boolR: string = boolSignature.substring(0, 66);
//       const boolS: string = '0x' + boolSignature.substring(66, 130);
//       const boolV: string = parseInt(boolSignature.substring(130, 132), 16);

//       const bytesR: string = bytesSignature.substring(0, 66);
//       const bytesS: string = '0x' + bytesSignature.substring(66, 130);
//       const bytesV: string = parseInt(bytesSignature.substring(130, 132), 16);

//       const addressR: string = addressSignature.substring(0, 66);
//       const addressS: string = '0x' + addressSignature.substring(66, 130);
//       const addressV: string = parseInt(addressSignature.substring(130, 132), 16);

//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetUintAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             1,
//             bn(10),
//             uintV,
//             uintR,
//             uintS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'ExpiredDeadline');
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetStringAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             'test',
//             bn(10),
//             stringV,
//             stringR,
//             stringS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'ExpiredDeadline');
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetBoolAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             true,
//             bn(10),
//             boolV,
//             boolR,
//             boolS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'ExpiredDeadline');
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetBytesAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             '0x1234',
//             bn(10),
//             bytesV,
//             bytesR,
//             bytesS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'ExpiredDeadline');
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetAddressAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             await owner.getAddress(),
//             bn(10),
//             addressV,
//             addressR,
//             addressS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'ExpiredDeadline');
//     });

//     it('should not allow to use presigned message to modify the parameters if the setter does not match the actual signer', async function () {
//       await tokenAttributes
//         .connect(issuer)
//         .registerAccessControl(
//           await ownedCollection.getAddress(),
//           await issuer.getAddress(),
//           false,
//         );

//       const uintMessage = await tokenAttributes.prepareMessageToPresignUintAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         1,
//         bn(9999999999),
//       );
//       const stringMessage = await tokenAttributes.prepareMessageToPresignStringAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         'test',
//         bn(9999999999),
//       );
//       const boolMessage = await tokenAttributes.prepareMessageToPresignBoolAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         true,
//         bn(9999999999),
//       );
//       const bytesMessage = await tokenAttributes.prepareMessageToPresignBytesAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         '0x1234',
//         bn(9999999999),
//       );
//       const addressMessage = await tokenAttributes.prepareMessageToPresignAddressAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         await owner.getAddress(),
//         bn(9999999999),
//       );

//       const uintSignature = await owner.signMessage(ethers.getBytes(uintMessage));
//       const stringSignature = await owner.signMessage(ethers.getBytes(stringMessage));
//       const boolSignature = await owner.signMessage(ethers.getBytes(boolMessage));
//       const bytesSignature = await owner.signMessage(ethers.getBytes(bytesMessage));
//       const addressSignature = await owner.signMessage(ethers.getBytes(addressMessage));

//       const uintR: string = uintSignature.substring(0, 66);
//       const uintS: string = '0x' + uintSignature.substring(66, 130);
//       const uintV: string = parseInt(uintSignature.substring(130, 132), 16);

//       const stringR: string = stringSignature.substring(0, 66);
//       const stringS: string = '0x' + stringSignature.substring(66, 130);
//       const stringV: string = parseInt(stringSignature.substring(130, 132), 16);

//       const boolR: string = boolSignature.substring(0, 66);
//       const boolS: string = '0x' + boolSignature.substring(66, 130);
//       const boolV: string = parseInt(boolSignature.substring(130, 132), 16);

//       const bytesR: string = bytesSignature.substring(0, 66);
//       const bytesS: string = '0x' + bytesSignature.substring(66, 130);
//       const bytesV: string = parseInt(bytesSignature.substring(130, 132), 16);

//       const addressR: string = addressSignature.substring(0, 66);
//       const addressS: string = '0x' + addressSignature.substring(66, 130);
//       const addressV: string = parseInt(addressSignature.substring(130, 132), 16);

//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetUintAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             1,
//             bn(9999999999),
//             uintV,
//             uintR,
//             uintS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'InvalidSignature');
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetStringAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             'test',
//             bn(9999999999),
//             stringV,
//             stringR,
//             stringS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'InvalidSignature');
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetBoolAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             true,
//             bn(9999999999),
//             boolV,
//             boolR,
//             boolS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'InvalidSignature');
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetBytesAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             '0x1234',
//             bn(9999999999),
//             bytesV,
//             bytesR,
//             bytesS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'InvalidSignature');
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetAddressAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             await owner.getAddress(),
//             bn(9999999999),
//             addressV,
//             addressR,
//             addressS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'InvalidSignature');
//     });

//     it('should not allow to use presigned message to modify the parameters if the signer is not authorized to modify them', async function () {
//       const uintMessage = await tokenAttributes.prepareMessageToPresignUintAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         1,
//         bn(9999999999),
//       );
//       const stringMessage = await tokenAttributes.prepareMessageToPresignStringAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         'test',
//         bn(9999999999),
//       );
//       const boolMessage = await tokenAttributes.prepareMessageToPresignBoolAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         true,
//         bn(9999999999),
//       );
//       const bytesMessage = await tokenAttributes.prepareMessageToPresignBytesAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         '0x1234',
//         bn(9999999999),
//       );
//       const addressMessage = await tokenAttributes.prepareMessageToPresignAddressAttribute(
//         await ownedCollection.getAddress(),
//         1,
//         'X',
//         await owner.getAddress(),
//         bn(9999999999),
//       );

//       const uintSignature = await issuer.signMessage(ethers.getBytes(uintMessage));
//       const stringSignature = await issuer.signMessage(ethers.getBytes(stringMessage));
//       const boolSignature = await issuer.signMessage(ethers.getBytes(boolMessage));
//       const bytesSignature = await issuer.signMessage(ethers.getBytes(bytesMessage));
//       const addressSignature = await issuer.signMessage(ethers.getBytes(addressMessage));

//       const uintR: string = uintSignature.substring(0, 66);
//       const uintS: string = '0x' + uintSignature.substring(66, 130);
//       const uintV: string = parseInt(uintSignature.substring(130, 132), 16);

//       const stringR: string = stringSignature.substring(0, 66);
//       const stringS: string = '0x' + stringSignature.substring(66, 130);
//       const stringV: string = parseInt(stringSignature.substring(130, 132), 16);

//       const boolR: string = boolSignature.substring(0, 66);
//       const boolS: string = '0x' + boolSignature.substring(66, 130);
//       const boolV: string = parseInt(boolSignature.substring(130, 132), 16);

//       const bytesR: string = bytesSignature.substring(0, 66);
//       const bytesS: string = '0x' + bytesSignature.substring(66, 130);
//       const bytesV: string = parseInt(bytesSignature.substring(130, 132), 16);

//       const addressR: string = addressSignature.substring(0, 66);
//       const addressS: string = '0x' + addressSignature.substring(66, 130);
//       const addressV: string = parseInt(addressSignature.substring(130, 132), 16);

//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetUintAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             1,
//             bn(9999999999),
//             uintV,
//             uintR,
//             uintS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetStringAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             'test',
//             bn(9999999999),
//             stringV,
//             stringR,
//             stringS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetBoolAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             true,
//             bn(9999999999),
//             boolV,
//             boolR,
//             boolS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetBytesAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             '0x1234',
//             bn(9999999999),
//             bytesV,
//             bytesR,
//             bytesS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//       await expect(
//         tokenAttributes
//           .connect(owner)
//           .presignedSetAddressAttribute(
//             await issuer.getAddress(),
//             await ownedCollection.getAddress(),
//             1,
//             'X',
//             await owner.getAddress(),
//             bn(9999999999),
//             addressV,
//             addressR,
//             addressS,
//           ),
//       ).to.be.revertedWithCustomError(tokenAttributes, 'NotCollectionIssuer');
//     });
//   });
// });

// async function shouldBehaveLikeTokenAttributesRepositoryInterface() {
//   it('can support IERC165', async function () {
//     expect(await this.tokenAttributes.supportsInterface(IERC165)).to.equal(true);
//   });

//   it('can support IERC7508', async function () {
//     expect(await this.tokenAttributes.supportsInterface(IERC7508)).to.equal(true);
//   });
// }
