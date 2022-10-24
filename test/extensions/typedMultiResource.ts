import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { bn, mintFromMock } from '../utils';
import {
  IERC165,
  IRMRKEquippable,
  IRMRKMultiResource,
  IRMRKExternalEquip,
  IRMRKNesting,
  IRMRKTypedMultiResource,
  IOtherInterface,
} from '../interfaces';

// --------------- FIXTURES -----------------------

async function typeMultiResourceFixture() {
  const factory = await ethers.getContractFactory('RMRKTypedMultiResourceMock');
  const typedMultiResource = await factory.deploy('Chunky', 'CHNK');
  await typedMultiResource.deployed();

  return { typedMultiResource };
}

async function nestingTypedMultiResourceFixture() {
  const factory = await ethers.getContractFactory('RMRKNestingTypedMultiResourceMock');
  const typedNestingMultiResource = await factory.deploy('Chunky', 'CHNK');
  await typedNestingMultiResource.deployed();

  return { typedNestingMultiResource };
}

async function typedEquippableFixture() {
  const factory = await ethers.getContractFactory('RMRKTypedEquippableMock');
  const typedEquippable = await factory.deploy('Chunky', 'CHNK');
  await typedEquippable.deployed();

  return { typedEquippable };
}

async function typedExternalEquippableFixture() {
  const nestingFactory = await ethers.getContractFactory('RMRKNestingExternalEquipMock');
  const nesting = await nestingFactory.deploy('Chunky', 'CHNK');
  await nesting.deployed();

  const equipFactory = await ethers.getContractFactory('RMRKTypedExternalEquippableMock');
  const typedExternalEquippable = await equipFactory.deploy(nesting.address);
  await typedExternalEquippable.deployed();

  await nesting.setEquippableAddress(typedExternalEquippable.address);

  return { nesting, typedExternalEquippable };
}

describe('RMRKTypedMultiResourceMock', async function () {
  let typedMultiResource: Contract;
  let owner: SignerWithAddress;
  let tokenId: number;

  const resId = bn(1);
  const resId2 = bn(2);
  const resId3 = bn(3);

  beforeEach(async function () {
    ({ typedMultiResource } = await loadFixture(typeMultiResourceFixture));

    const signers = await ethers.getSigners();
    owner = signers[0];

    tokenId = await mintFromMock(typedMultiResource, owner.address);
  });

  it('can support IERC165', async function () {
    expect(await typedMultiResource.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IMultiResource', async function () {
    expect(await typedMultiResource.supportsInterface(IRMRKMultiResource)).to.equal(true);
  });

  it('can support IRMRKTypedMultiResource', async function () {
    expect(await typedMultiResource.supportsInterface(IRMRKTypedMultiResource)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await typedMultiResource.supportsInterface(IOtherInterface)).to.equal(false);
  });

  it('can add typed resources', async function () {
    await typedMultiResource.addTypedResourceEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
    expect(await typedMultiResource.getResourceType(resId)).to.eql('image/jpeg');
  });

  it('can get top resource by priority and type', async function () {
    await typedMultiResource.addTypedResourceEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
    await typedMultiResource.addTypedResourceEntry(resId2, 'ipfs://res2.pdf', 'application/pdf');
    await typedMultiResource.addTypedResourceEntry(resId3, 'ipfs://res3.jpg', 'image/jpeg');
    await typedMultiResource.addResourceToToken(tokenId, resId, 0);
    await typedMultiResource.acceptResource(tokenId, 0);
    await typedMultiResource.addResourceToToken(tokenId, resId2, 0);
    await typedMultiResource.acceptResource(tokenId, 0);
    await typedMultiResource.addResourceToToken(tokenId, resId3, 0);
    await typedMultiResource.acceptResource(tokenId, 0);
    await typedMultiResource.setPriority(tokenId, [1, 0, 2]); // Pdf has higher priority but it's the wanted type

    expect(
      await typedMultiResource.getTopResourceMetaForTokenWithType(tokenId, 'image/jpeg'),
    ).to.eql('ipfs://res1.jpg');
  });

  it('cannot get top resource for if token has no resources with this type', async function () {
    await typedMultiResource.addTypedResourceEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
    await typedMultiResource.addResourceToToken(tokenId, resId, 0);
    await typedMultiResource.acceptResource(tokenId, 0);

    await expect(
      typedMultiResource.getTopResourceMetaForTokenWithType(tokenId, 'application/pdf'),
    ).to.be.revertedWithCustomError(typedMultiResource, 'RMRKTokenHasNoResourcesWithType');
  });
});

describe('RMRKNestingTypedMultiResourceMock', async function () {
  let typedNestingMultiResource: Contract;
  let owner: SignerWithAddress;
  let tokenId: number;

  beforeEach(async function () {
    ({ typedNestingMultiResource } = await loadFixture(nestingTypedMultiResourceFixture));

    const signers = await ethers.getSigners();
    owner = signers[0];

    tokenId = await mintFromMock(typedNestingMultiResource, owner.address);
  });

  it('can support IERC165', async function () {
    expect(await typedNestingMultiResource.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IMultiResource', async function () {
    expect(await typedNestingMultiResource.supportsInterface(IRMRKMultiResource)).to.equal(true);
  });

  it('can support INesting', async function () {
    expect(await typedNestingMultiResource.supportsInterface(IRMRKNesting)).to.equal(true);
  });

  it('can support IRMRKTypedMultiResource', async function () {
    expect(await typedNestingMultiResource.supportsInterface(IRMRKTypedMultiResource)).to.equal(
      true,
    );
  });

  it('does not support other interfaces', async function () {
    expect(await typedNestingMultiResource.supportsInterface(IOtherInterface)).to.equal(false);
  });

  it('can add typed resources', async function () {
    const resId = bn(1);
    await typedNestingMultiResource.addTypedResourceEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
    expect(await typedNestingMultiResource.getResourceType(resId)).to.eql('image/jpeg');
  });

  it('can add typed resources to tokens', async function () {
    const resId = bn(1);
    await typedNestingMultiResource.addTypedResourceEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
    await typedNestingMultiResource.addResourceToToken(tokenId, resId, 0);

    expect(await typedNestingMultiResource.getPendingResources(tokenId)).to.eql([resId]);
  });
});

describe('RMRKTypedEquippableMock', async function () {
  let typedEquippable: Contract;
  let owner: SignerWithAddress;
  let tokenId: number;

  beforeEach(async function () {
    ({ typedEquippable } = await loadFixture(typedEquippableFixture));

    const signers = await ethers.getSigners();
    owner = signers[0];

    tokenId = await mintFromMock(typedEquippable, owner.address);
  });

  it('can support IERC165', async function () {
    expect(await typedEquippable.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IMultiResource', async function () {
    expect(await typedEquippable.supportsInterface(IRMRKMultiResource)).to.equal(true);
  });

  it('can support INesting', async function () {
    expect(await typedEquippable.supportsInterface(IRMRKNesting)).to.equal(true);
  });

  it('can support IEquippable', async function () {
    expect(await typedEquippable.supportsInterface(IRMRKEquippable)).to.equal(true);
  });

  it('can support IRMRKTypedMultiResource', async function () {
    expect(await typedEquippable.supportsInterface(IRMRKTypedMultiResource)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await typedEquippable.supportsInterface(IOtherInterface)).to.equal(false);
  });

  it('can add typed resources', async function () {
    const resId = bn(1);
    await typedEquippable.addTypedResourceEntry(
      {
        id: resId,
        equippableGroupId: 0,
        metadataURI: 'fallback.json',
        baseAddress: ethers.constants.AddressZero,
      },
      [],
      [],
      'image/jpeg',
    );
    expect(await typedEquippable.getResourceType(resId)).to.eql('image/jpeg');
  });

  it('can add typed resources to tokens', async function () {
    const resId = bn(1);
    await typedEquippable.addTypedResourceEntry(
      {
        id: resId,
        equippableGroupId: 0,
        metadataURI: 'fallback.json',
        baseAddress: ethers.constants.AddressZero,
      },
      [],
      [],
      'image/jpeg',
    );
    await typedEquippable.addResourceToToken(tokenId, resId, 0);
    expect(await typedEquippable.getPendingResources(tokenId)).to.eql([resId]);
  });
});

describe('RMRKTypedExternalEquippableMock', async function () {
  let typedExternalEquippable: Contract;
  let nesting: Contract;
  let owner: SignerWithAddress;
  let tokenId: number;

  beforeEach(async function () {
    ({ nesting, typedExternalEquippable } = await loadFixture(typedExternalEquippableFixture));

    const signers = await ethers.getSigners();
    owner = signers[0];

    tokenId = await mintFromMock(nesting, owner.address);
  });

  it('can support IERC165', async function () {
    expect(await typedExternalEquippable.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IMultiResource', async function () {
    expect(await typedExternalEquippable.supportsInterface(IRMRKMultiResource)).to.equal(true);
  });

  it('can support IEquippable', async function () {
    expect(await typedExternalEquippable.supportsInterface(IRMRKEquippable)).to.equal(true);
  });

  it('can support IExternalEquip', async function () {
    expect(await typedExternalEquippable.supportsInterface(IRMRKExternalEquip)).to.equal(true);
  });

  it('can support IRMRKTypedMultiResource', async function () {
    expect(await typedExternalEquippable.supportsInterface(IRMRKTypedMultiResource)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await typedExternalEquippable.supportsInterface(IOtherInterface)).to.equal(false);
  });

  it('can add typed resources', async function () {
    const resId = bn(1);
    await typedExternalEquippable.addTypedResourceEntry(
      {
        id: resId,
        equippableGroupId: 0,
        metadataURI: 'fallback.json',
        baseAddress: ethers.constants.AddressZero,
      },
      [],
      [],
      'image/jpeg',
    );
    expect(await typedExternalEquippable.getResourceType(resId)).to.eql('image/jpeg');
  });

  it('can add typed resources to tokens', async function () {
    const resId = bn(1);
    await typedExternalEquippable.addTypedResourceEntry(
      {
        id: resId,
        equippableGroupId: 0,
        metadataURI: 'fallback.json',
        baseAddress: ethers.constants.AddressZero,
      },
      [],
      [],
      'image/jpeg',
    );
    await typedExternalEquippable.addResourceToToken(tokenId, resId, 0);
    expect(await typedExternalEquippable.getPendingResources(tokenId)).to.eql([resId]);
  });
});
