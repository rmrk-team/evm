import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { bn, mintFromMock } from '../utils';
import {
  IERC165,
  IERC6220,
  IERC5773,
  IRMRKExternalEquip,
  IERC6059,
  IRMRKTypedMultiAsset,
  IOtherInterface,
} from '../interfaces';

// --------------- FIXTURES -----------------------

async function typeMultiAssetFixture() {
  const factory = await ethers.getContractFactory('RMRKTypedMultiAssetMock');
  const typedMultiAsset = await factory.deploy('Chunky', 'CHNK');
  await typedMultiAsset.deployed();

  return { typedMultiAsset };
}

async function nestableTypedMultiAssetFixture() {
  const factory = await ethers.getContractFactory('RMRKNestableTypedMultiAssetMock');
  const typedNestableMultiAsset = await factory.deploy('Chunky', 'CHNK');
  await typedNestableMultiAsset.deployed();

  return { typedNestableMultiAsset };
}

async function typedEquippableFixture() {
  const factory = await ethers.getContractFactory('RMRKTypedEquippableMock');
  const typedEquippable = await factory.deploy('Chunky', 'CHNK');
  await typedEquippable.deployed();

  return { typedEquippable };
}

async function typedExternalEquippableFixture() {
  const nestableFactory = await ethers.getContractFactory('RMRKNestableExternalEquipMock');
  const nestable = await nestableFactory.deploy('Chunky', 'CHNK');
  await nestable.deployed();

  const equipFactory = await ethers.getContractFactory('RMRKTypedExternalEquippableMock');
  const typedExternalEquippable = await equipFactory.deploy(nestable.address);
  await typedExternalEquippable.deployed();

  await nestable.setEquippableAddress(typedExternalEquippable.address);

  return { nestable, typedExternalEquippable };
}

describe('RMRKTypedMultiAssetMock', async function () {
  let typedMultiAsset: Contract;

  beforeEach(async function () {
    ({ typedMultiAsset } = await loadFixture(typeMultiAssetFixture));

    this.assets = typedMultiAsset;
  });

  shouldBehaveLikeTypedMultiAssetInterface();
  shouldBehaveLikeTypedMultiAsset(mintFromMock);

  describe('RMRKTypedMultiAssetMock get top assets', async function () {
    let owner: SignerWithAddress;
    let tokenId: number;

    const resId = bn(1);
    const resId2 = bn(2);
    const resId3 = bn(3);

    beforeEach(async function () {
      ({ typedMultiAsset } = await loadFixture(typeMultiAssetFixture));

      const signers = await ethers.getSigners();
      owner = signers[0];

      tokenId = await mintFromMock(typedMultiAsset, owner.address);
    });

    it('can get top asset by priority and type', async function () {
      await typedMultiAsset.addTypedAssetEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
      await typedMultiAsset.addTypedAssetEntry(resId2, 'ipfs://res2.pdf', 'application/pdf');
      await typedMultiAsset.addTypedAssetEntry(resId3, 'ipfs://res3.jpg', 'image/jpeg');
      await typedMultiAsset.addAssetToToken(tokenId, resId, 0);
      await typedMultiAsset.acceptAsset(tokenId, 0, resId);
      await typedMultiAsset.addAssetToToken(tokenId, resId2, 0);
      await typedMultiAsset.acceptAsset(tokenId, 0, resId2);
      await typedMultiAsset.addAssetToToken(tokenId, resId3, 0);
      await typedMultiAsset.acceptAsset(tokenId, 0, resId3);
      await typedMultiAsset.setPriority(tokenId, [1, 0, 2]); // Pdf has higher priority but it's the wanted type

      expect(await typedMultiAsset.getTopAssetMetaForTokenWithType(tokenId, 'image/jpeg')).to.eql(
        'ipfs://res1.jpg',
      );
    });

    it('cannot get top asset for if token has no assets with this type', async function () {
      await typedMultiAsset.addTypedAssetEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
      await typedMultiAsset.addAssetToToken(tokenId, resId, 0);
      await typedMultiAsset.acceptAsset(tokenId, 0, resId);

      await expect(
        typedMultiAsset.getTopAssetMetaForTokenWithType(tokenId, 'application/pdf'),
      ).to.be.revertedWithCustomError(typedMultiAsset, 'RMRKTokenHasNoAssetsWithType');
    });
  });
});

describe('RMRKNestableTypedMultiAssetMock', async function () {
  let typedNestableMultiAsset: Contract;

  beforeEach(async function () {
    ({ typedNestableMultiAsset } = await loadFixture(nestableTypedMultiAssetFixture));

    this.assets = typedNestableMultiAsset;
  });

  it('can support INestable', async function () {
    expect(await this.assets.supportsInterface(IERC6059)).to.equal(true);
  });

  shouldBehaveLikeTypedMultiAssetInterface();
  shouldBehaveLikeTypedMultiAsset(mintFromMock);
});

describe('RMRKTypedEquippableMock', async function () {
  let typedEquippable: Contract;

  beforeEach(async function () {
    ({ typedEquippable } = await loadFixture(typedEquippableFixture));

    this.assets = typedEquippable;
    this.nestable = typedEquippable;
  });

  it('can support IEquippable', async function () {
    expect(await this.assets.supportsInterface(IERC6220)).to.equal(true);
  });

  shouldBehaveLikeTypedMultiAssetInterface();
  shouldBehaveLikeTypedEquippable(mintFromMock);
});

describe('RMRKTypedExternalEquippableMock', async function () {
  let typedExternalEquippable: Contract;
  let nestable: Contract;

  beforeEach(async function () {
    ({ nestable, typedExternalEquippable } = await loadFixture(typedExternalEquippableFixture));

    this.assets = typedExternalEquippable;
    this.nestable = nestable;
  });

  it('can support IEquippable', async function () {
    expect(await this.assets.supportsInterface(IERC6220)).to.equal(true);
  });

  it('can support IExternalEquip', async function () {
    expect(await this.assets.supportsInterface(IRMRKExternalEquip)).to.equal(true);
  });

  shouldBehaveLikeTypedMultiAssetInterface();
  shouldBehaveLikeTypedEquippable(mintFromMock);
});

async function shouldBehaveLikeTypedMultiAssetInterface() {
  it('can support IERC165', async function () {
    expect(await this.assets.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IMultiAsset', async function () {
    expect(await this.assets.supportsInterface(IERC5773)).to.equal(true);
  });

  it('can support IRMRKTypedMultiAsset', async function () {
    expect(await this.assets.supportsInterface(IRMRKTypedMultiAsset)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await this.assets.supportsInterface(IOtherInterface)).to.equal(false);
  });
}

async function shouldBehaveLikeTypedMultiAsset(
  mint: (token: Contract, to: string) => Promise<number>,
) {
  let owner: SignerWithAddress;
  let tokenId: number;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];

    tokenId = await mint(this.assets, owner.address);
  });

  it('can add typed assets', async function () {
    const resId = bn(1);
    await this.assets.addTypedAssetEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
    expect(await this.assets.getAssetType(resId)).to.eql('image/jpeg');
  });

  it('can add typed assets to tokens', async function () {
    const resId = bn(1);
    await this.assets.addTypedAssetEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
    await this.assets.addAssetToToken(tokenId, resId, 0);

    expect(await this.assets.getPendingAssets(tokenId)).to.eql([resId]);
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

    tokenId = await mint(this.nestable, owner.address);
  });

  it('can add typed assets', async function () {
    const resId = bn(1);
    await this.assets.addTypedAssetEntry(
      resId,
      0,
      ethers.constants.AddressZero,
      'fallback.json',
      [],
      'image/jpeg',
    );
    expect(await this.assets.getAssetType(resId)).to.eql('image/jpeg');
  });

  it('can add typed assets to tokens', async function () {
    const resId = bn(1);
    await this.assets.addTypedAssetEntry(
      resId,
      0,
      ethers.constants.AddressZero,
      'fallback.json',
      [],
      'image/jpeg',
    );
    await this.assets.addAssetToToken(tokenId, resId, 0);
    expect(await this.assets.getPendingAssets(tokenId)).to.eql([resId]);
  });
}
