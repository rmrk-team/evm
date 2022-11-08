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

  beforeEach(async function () {
    ({ typedMultiResource } = await loadFixture(typeMultiResourceFixture));

    this.resources = typedMultiResource;
  });

  shouldBehaveLikeTypedMultiResourceInterface();
  shouldBehaveLikeTypedMultiResource(mintFromMock);

  describe('RMRKTypedMultiResourceMock get top resources', async function () {
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

    it('can get top resource by priority and type', async function () {
      await typedMultiResource.addTypedResourceEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
      await typedMultiResource.addTypedResourceEntry(resId2, 'ipfs://res2.pdf', 'application/pdf');
      await typedMultiResource.addTypedResourceEntry(resId3, 'ipfs://res3.jpg', 'image/jpeg');
      await typedMultiResource.addResourceToToken(tokenId, resId, 0);
      await typedMultiResource.acceptResource(tokenId, 0, resId);
      await typedMultiResource.addResourceToToken(tokenId, resId2, 0);
      await typedMultiResource.acceptResource(tokenId, 0, resId2);
      await typedMultiResource.addResourceToToken(tokenId, resId3, 0);
      await typedMultiResource.acceptResource(tokenId, 0, resId3);
      await typedMultiResource.setPriority(tokenId, [1, 0, 2]); // Pdf has higher priority but it's the wanted type

      expect(
        await typedMultiResource.getTopResourceMetaForTokenWithType(tokenId, 'image/jpeg'),
      ).to.eql('ipfs://res1.jpg');
    });

    it('cannot get top resource for if token has no resources with this type', async function () {
      await typedMultiResource.addTypedResourceEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
      await typedMultiResource.addResourceToToken(tokenId, resId, 0);
      await typedMultiResource.acceptResource(tokenId, 0, resId);

      await expect(
        typedMultiResource.getTopResourceMetaForTokenWithType(tokenId, 'application/pdf'),
      ).to.be.revertedWithCustomError(typedMultiResource, 'RMRKTokenHasNoResourcesWithType');
    });
  });
});

describe('RMRKNestingTypedMultiResourceMock', async function () {
  let typedNestingMultiResource: Contract;

  beforeEach(async function () {
    ({ typedNestingMultiResource } = await loadFixture(nestingTypedMultiResourceFixture));

    this.resources = typedNestingMultiResource;
  });

  it('can support INesting', async function () {
    expect(await this.resources.supportsInterface(IRMRKNesting)).to.equal(true);
  });

  shouldBehaveLikeTypedMultiResourceInterface();
  shouldBehaveLikeTypedMultiResource(mintFromMock);
});

describe('RMRKTypedEquippableMock', async function () {
  let typedEquippable: Contract;

  beforeEach(async function () {
    ({ typedEquippable } = await loadFixture(typedEquippableFixture));

    this.resources = typedEquippable;
    this.nesting = typedEquippable;
  });

  it('can support IEquippable', async function () {
    expect(await this.resources.supportsInterface(IRMRKEquippable)).to.equal(true);
  });

  shouldBehaveLikeTypedMultiResourceInterface();
  shouldBehaveLikeTypedEquippable(mintFromMock);
});

describe('RMRKTypedExternalEquippableMock', async function () {
  let typedExternalEquippable: Contract;
  let nesting: Contract;

  beforeEach(async function () {
    ({ nesting, typedExternalEquippable } = await loadFixture(typedExternalEquippableFixture));

    this.resources = typedExternalEquippable;
    this.nesting = nesting;
  });

  it('can support IEquippable', async function () {
    expect(await this.resources.supportsInterface(IRMRKEquippable)).to.equal(true);
  });

  it('can support IExternalEquip', async function () {
    expect(await this.resources.supportsInterface(IRMRKExternalEquip)).to.equal(true);
  });

  shouldBehaveLikeTypedMultiResourceInterface();
  shouldBehaveLikeTypedEquippable(mintFromMock);
});

async function shouldBehaveLikeTypedMultiResourceInterface() {
  it('can support IERC165', async function () {
    expect(await this.resources.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IMultiResource', async function () {
    expect(await this.resources.supportsInterface(IRMRKMultiResource)).to.equal(true);
  });

  it('can support IRMRKTypedMultiResource', async function () {
    expect(await this.resources.supportsInterface(IRMRKTypedMultiResource)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await this.resources.supportsInterface(IOtherInterface)).to.equal(false);
  });
}

async function shouldBehaveLikeTypedMultiResource(
  mint: (token: Contract, to: string) => Promise<number>,
) {
  let owner: SignerWithAddress;
  let tokenId: number;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];

    tokenId = await mint(this.resources, owner.address);
  });

  it('can add typed resources', async function () {
    const resId = bn(1);
    await this.resources.addTypedResourceEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
    expect(await this.resources.getResourceType(resId)).to.eql('image/jpeg');
  });

  it('can add typed resources to tokens', async function () {
    const resId = bn(1);
    await this.resources.addTypedResourceEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
    await this.resources.addResourceToToken(tokenId, resId, 0);

    expect(await this.resources.getPendingResources(tokenId)).to.eql([resId]);
  });
}

async function shouldBehaveLikeTypedEquippable(
  mint: (token: Contract, to: string) => Promise<number>,
) {
  let owner: SignerWithAddress;
  let tokenId: number;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];

    tokenId = await mint(this.nesting, owner.address);
  });

  it('can add typed resources', async function () {
    const resId = bn(1);
    await this.resources.addTypedResourceEntry(
      resId,
      0,
      ethers.constants.AddressZero,
      'fallback.json',
      [],
      [],
      'image/jpeg',
    );
    expect(await this.resources.getResourceType(resId)).to.eql('image/jpeg');
  });

  it('can add typed resources to tokens', async function () {
    const resId = bn(1);
    await this.resources.addTypedResourceEntry(
      resId,
      0,
      ethers.constants.AddressZero,
      'fallback.json',
      [],
      [],
      'image/jpeg',
    );
    await this.resources.addResourceToToken(tokenId, resId, 0);
    expect(await this.resources.getPendingResources(tokenId)).to.eql([resId]);
  });
}
