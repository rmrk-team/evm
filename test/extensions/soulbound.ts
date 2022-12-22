import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { bn, mintFromMock, nestMintFromMock } from '../utils';
import { IERC165, IRMRKSoulbound, IOtherInterface } from '../interfaces';
import { RMRKSemiSoulboundNestableMock } from '../../typechain-types';

// --------------- FIXTURES -----------------------

async function soulboundMultiAssetFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundMultiAssetMock');
  const token = await factory.deploy('Chunky', 'CHNK');
  await token.deployed();

  return { token };
}

async function soulboundNestableFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundNestableMock');
  const token = await factory.deploy('Chunky', 'CHNK');
  await token.deployed();

  return { token };
}

async function soulboundNestableMultiAssetFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundNestableMultiAssetMock');
  const token = await factory.deploy('Chunky', 'CHNK');
  await token.deployed();

  return { token };
}

async function soulboundEquippableFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundEquippableMock');
  const token = await factory.deploy('Chunky', 'CHNK');
  await token.deployed();

  return { token };
}

async function soulboundNestableExternalEquippableFixture() {
  const nestableFactory = await ethers.getContractFactory(
    'RMRKSoulboundNestableExternalEquippableMock',
  );
  const nestable = await nestableFactory.deploy('Chunky', 'CHNK');
  await nestable.deployed();

  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipMock');
  const equip = await equipFactory.deploy(nestable.address);
  await equip.deployed();

  await nestable.setEquippableAddress(equip.address);

  return { nestable, equip };
}

describe('RMRKSoulboundMultiAssetMock', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(soulboundMultiAssetFixture);
    this.token = token;
  });

  shouldBehaveLikeSoulboundBasic();
});

describe('RMRKSoulboundNestableMock', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(soulboundNestableFixture);
    this.token = token;
  });

  shouldBehaveLikeSoulboundBasic();
  shouldBehaveLikeSoulboundNestable();
});

describe('RMRKSoulboundNestableMultiAssetMock', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(soulboundNestableMultiAssetFixture);
    this.token = token;
  });

  shouldBehaveLikeSoulboundBasic();
  shouldBehaveLikeSoulboundNestable();
});

describe('RMRKSoulboundEquippableMock', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(soulboundEquippableFixture);
    this.token = token;
  });

  shouldBehaveLikeSoulboundBasic();
  shouldBehaveLikeSoulboundNestable();
});

describe('RMRKSoulboundNestableExternalEquippableMock', async function () {
  beforeEach(async function () {
    const { nestable } = await loadFixture(soulboundNestableExternalEquippableFixture);
    this.token = nestable;
  });

  shouldBehaveLikeSoulboundBasic();
  shouldBehaveLikeSoulboundNestable();
});

describe('RMRKSoulbound exempt', async function () {
  let token: RMRKSemiSoulboundNestableMock;
  let owner: SignerWithAddress;
  let otherOwner: SignerWithAddress;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    otherOwner = signers[1];
    const factory = await ethers.getContractFactory('RMRKSemiSoulboundNestableMock');
    token = <RMRKSemiSoulboundNestableMock>await factory.deploy('Chunky', 'CHNK');
    await token.deployed();
  });

  it('can support IRMRKSoulbound', async function () {
    expect(await token.supportsInterface(IRMRKSoulbound)).to.equal(true);
  });

  it('can transfer if soulbound exempt', async function () {
    const tokenId = await mintFromMock(token, owner.address);
    await token.setSoulboundExempt(tokenId);

    await token.transfer(otherOwner.address, tokenId);
    expect(await token.ownerOf(tokenId)).eql(otherOwner.address);
  });

  it('can nest transfer if soulbound exempt', async function () {
    const tokenId = await mintFromMock(token, owner.address);
    const otherTokenId = await mintFromMock(token, owner.address);
    await token.setSoulboundExempt(tokenId);

    await token.connect(owner).nestTransfer(token.address, tokenId, otherTokenId);
    expect(await token.directOwnerOf(tokenId)).eql([token.address, bn(otherTokenId), true]);
  });

  it('can transfer child if soulbound exempt', async function () {
    const tokenId = await mintFromMock(token, owner.address);
    const otherTokenId = await nestMintFromMock(token, token.address, tokenId);
    await token.connect(owner).acceptChild(tokenId, 0, token.address, otherTokenId);
    await token.setSoulboundExempt(otherTokenId);

    await token
      .connect(owner)
      .transferChild(tokenId, owner.address, 0, 0, token.address, otherTokenId, false, '0x');
    expect(await token.directOwnerOf(otherTokenId)).eql([owner.address, bn(0), false]);
  });
});

async function shouldBehaveLikeSoulboundBasic() {
  let soulbound: Contract;
  let owner: SignerWithAddress;
  let otherOwner: SignerWithAddress;
  let tokenId: number;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    otherOwner = signers[1];
    soulbound = this.token;

    tokenId = await mintFromMock(soulbound, owner.address);
  });

  it('can support IERC165', async function () {
    expect(await soulbound.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IRMRKSoulbound', async function () {
    expect(await soulbound.supportsInterface(IRMRKSoulbound)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await soulbound.supportsInterface(IOtherInterface)).to.equal(false);
  });

  it('cannot transfer', async function () {
    expect(
      soulbound.connect(owner).transfer(otherOwner.address, tokenId),
    ).to.be.revertedWithCustomError(soulbound, 'RMRKCannotTransferSoulbound');
  });

  it('can burn', async function () {
    await soulbound.connect(owner)['burn(uint256)'](tokenId);
    await expect(soulbound.ownerOf(tokenId)).to.be.revertedWithCustomError(
      soulbound,
      'ERC721InvalidTokenId',
    );
  });
}

async function shouldBehaveLikeSoulboundNestable() {
  let soulbound: Contract;
  let owner: SignerWithAddress;
  let tokenId: number;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    soulbound = this.token;

    tokenId = await mintFromMock(soulbound, owner.address);
  });

  it('cannot nest transfer', async function () {
    const otherTokenId = await mintFromMock(soulbound, owner.address);
    expect(
      soulbound.connect(owner).nestTransfer(soulbound.address, tokenId, otherTokenId),
    ).to.be.revertedWithCustomError(soulbound, 'RMRKCannotTransferSoulbound');
  });

  it('cannot transfer child', async function () {
    const childId = await nestMintFromMock(soulbound, soulbound.address, tokenId);
    await soulbound.connect(owner).acceptChild(tokenId, 0, soulbound.address, childId);
    expect(
      soulbound
        .connect(owner)
        .transferChild(tokenId, owner.address, 0, 0, soulbound.address, childId, false, '0x'),
    ).to.be.revertedWithCustomError(soulbound, 'RMRKCannotTransferSoulbound');
  });
}
