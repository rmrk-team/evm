import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { mintFromMock, nestMintFromMock } from '../utils';

// --------------- FIXTURES -----------------------

async function soulboundMultiResourceFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundMultiResourceMock');
  const token = await factory.deploy('Chunky', 'CHNK');
  await token.deployed();

  return { token };
}

async function soulboundNestingFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundNestingMock');
  const token = await factory.deploy('Chunky', 'CHNK');
  await token.deployed();

  return { token };
}

async function soulboundNestingMultiResourceFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundNestingMultiResourceMock');
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

async function soulboundNestingExternalEquippableFixture() {
  const nestingFactory = await ethers.getContractFactory(
    'RMRKSoulboundNestingExternalEquippableMock',
  );
  const nesting = await nestingFactory.deploy('Chunky', 'CHNK');
  await nesting.deployed();

  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipMock');
  const equip = await equipFactory.deploy(nesting.address);
  await equip.deployed();

  await nesting.setEquippableAddress(equip.address);

  return { nesting, equip };
}

describe('RMRKSoulboundMultiResourceMock', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(soulboundMultiResourceFixture);
    this.token = token;
  });

  shouldBehaveLikeSoulboundBasic();
});

describe('RMRKSoulboundNestingMock', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(soulboundNestingFixture);
    this.token = token;
  });

  shouldBehaveLikeSoulboundBasic();
  shouldBehaveLikeSoulboundNesting();
});

describe('RMRKSoulboundNestingMultiResourceMock', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(soulboundNestingMultiResourceFixture);
    this.token = token;
  });

  shouldBehaveLikeSoulboundBasic();
  shouldBehaveLikeSoulboundNesting();
});

describe('RMRKSoulboundEquippableMock', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(soulboundEquippableFixture);
    this.token = token;
  });

  shouldBehaveLikeSoulboundBasic();
  shouldBehaveLikeSoulboundNesting();
});

describe('RMRKSoulboundNestingExternalEquippableMock', async function () {
  beforeEach(async function () {
    const { nesting } = await loadFixture(soulboundNestingExternalEquippableFixture);
    this.token = nesting;
  });

  shouldBehaveLikeSoulboundBasic();
  shouldBehaveLikeSoulboundNesting();
});

// describe('RMRKNestingSoulboundMultiResourceMock', async function () {
//   let soulboundNestingMultiResource: Contract;
//   let owner: SignerWithAddress;
//   let tokenId: number;

//   beforeEach(async function () {
//     ({ soulboundNestingMultiResource } = await loadFixture(nestingSoulboundMultiResourceFixture));

//     const signers = await ethers.getSigners();
//     owner = signers[0];

//     tokenId = await mintFromMock(soulboundNestingMultiResource, owner.address);
//   });

//   it('can support IERC165', async function () {
//     expect(await soulboundNestingMultiResource.supportsInterface('0x01ffc9a7')).to.equal(true);
//   });

//   it('can support IMultiResource', async function () {
//     expect(await soulboundNestingMultiResource.supportsInterface('0xc65a6425')).to.equal(true);
//   });

//   it('can support INesting', async function () {
//     expect(await soulboundNestingMultiResource.supportsInterface('0xf790390a')).to.equal(true);
//   });

//   it('can support IRMRKSoulboundMultiResource', async function () {
//     expect(await soulboundNestingMultiResource.supportsInterface('0xb6a3032e')).to.equal(true);
//   });

//   it('does not support other interfaces', async function () {
//     expect(await soulboundNestingMultiResource.supportsInterface('0xffffffff')).to.equal(false);
//   });

//   it('can add soulbound resources', async function () {
//     const resId = bn(1);
//     await soulboundNestingMultiResource.addSoulboundResourceEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
//     expect(await soulboundNestingMultiResource.getResourceType(resId)).to.eql('image/jpeg');
//   });

//   it('can add soulbound resources to tokens', async function () {
//     const resId = bn(1);
//     await soulboundNestingMultiResource.addSoulboundResourceEntry(resId, 'ipfs://res1.jpg', 'image/jpeg');
//     await soulboundNestingMultiResource.addResourceToToken(tokenId, resId, 0);

//     expect(await soulboundNestingMultiResource.getPendingResources(tokenId)).to.eql([resId]);
//   });
// });

// describe('RMRKSoulboundEquippableMock', async function () {
//   let soulboundEquippable: Contract;
//   let owner: SignerWithAddress;
//   let tokenId: number;

//   beforeEach(async function () {
//     ({ soulboundEquippable } = await loadFixture(soulboundEquippableFixture));

//     const signers = await ethers.getSigners();
//     owner = signers[0];

//     tokenId = await mintFromMock(soulboundEquippable, owner.address);
//   });

//   it('can support IERC165', async function () {
//     expect(await soulboundEquippable.supportsInterface('0x01ffc9a7')).to.equal(true);
//   });

//   it('can support IMultiResource', async function () {
//     expect(await soulboundEquippable.supportsInterface('0xc65a6425')).to.equal(true);
//   });

//   it('can support INesting', async function () {
//     expect(await soulboundEquippable.supportsInterface('0xf790390a')).to.equal(true);
//   });

//   it('can support IEquippable', async function () {
//     expect(await soulboundEquippable.supportsInterface('0xd3a28ca0')).to.equal(true);
//   });

//   it('can support IRMRKSoulboundMultiResource', async function () {
//     expect(await soulboundEquippable.supportsInterface('0xb6a3032e')).to.equal(true);
//   });

//   it('does not support other interfaces', async function () {
//     expect(await soulboundEquippable.supportsInterface('0xffffffff')).to.equal(false);
//   });

//   it('can add soulbound resources', async function () {
//     const resId = bn(1);
//     await soulboundEquippable.addSoulboundResourceEntry(
//       {
//         id: resId,
//         equippableRefId: 0,
//         metadataURI: 'fallback.json',
//         baseAddress: ethers.constants.AddressZero,
//       },
//       [],
//       [],
//       'image/jpeg',
//     );
//     expect(await soulboundEquippable.getResourceType(resId)).to.eql('image/jpeg');
//   });

//   it('can add soulbound resources to tokens', async function () {
//     const resId = bn(1);
//     await soulboundEquippable.addSoulboundResourceEntry(
//       {
//         id: resId,
//         equippableRefId: 0,
//         metadataURI: 'fallback.json',
//         baseAddress: ethers.constants.AddressZero,
//       },
//       [],
//       [],
//       'image/jpeg',
//     );
//     await soulboundEquippable.addResourceToToken(tokenId, resId, 0);
//     expect(await soulboundEquippable.getPendingResources(tokenId)).to.eql([resId]);
//   });
// });

// describe('RMRKSoulboundExternalEquippableMock', async function () {
//   let soulboundExternalEquippable: Contract;
//   let nesting: Contract;
//   let owner: SignerWithAddress;
//   let tokenId: number;

//   beforeEach(async function () {
//     ({ nesting, soulboundExternalEquippable } = await loadFixture(soulboundExternalEquippableFixture));

//     const signers = await ethers.getSigners();
//     owner = signers[0];

//     tokenId = await mintFromMock(nesting, owner.address);
//   });

//   it('can support IERC165', async function () {
//     expect(await soulboundExternalEquippable.supportsInterface('0x01ffc9a7')).to.equal(true);
//   });

//   it('can support IMultiResource', async function () {
//     expect(await soulboundExternalEquippable.supportsInterface('0xc65a6425')).to.equal(true);
//   });

//   it('can support IEquippable', async function () {
//     expect(await soulboundExternalEquippable.supportsInterface('0xd3a28ca0')).to.equal(true);
//   });

//   it('can support IExternalEquip', async function () {
//     expect(await soulboundExternalEquippable.supportsInterface('0xe5383e6c')).to.equal(true);
//   });

//   it('can support IRMRKSoulboundMultiResource', async function () {
//     expect(await soulboundExternalEquippable.supportsInterface('0xb6a3032e')).to.equal(true);
//   });

//   it('does not support other interfaces', async function () {
//     expect(await soulboundExternalEquippable.supportsInterface('0xffffffff')).to.equal(false);
//   });

//   it('can add soulbound resources', async function () {
//     const resId = bn(1);
//     await soulboundExternalEquippable.addSoulboundResourceEntry(
//       {
//         id: resId,
//         equippableRefId: 0,
//         metadataURI: 'fallback.json',
//         baseAddress: ethers.constants.AddressZero,
//       },
//       [],
//       [],
//       'image/jpeg',
//     );
//     expect(await soulboundExternalEquippable.getResourceType(resId)).to.eql('image/jpeg');
//   });

//   it('can add soulbound resources to tokens', async function () {
//     const resId = bn(1);
//     await soulboundExternalEquippable.addSoulboundResourceEntry(
//       {
//         id: resId,
//         equippableRefId: 0,
//         metadataURI: 'fallback.json',
//         baseAddress: ethers.constants.AddressZero,
//       },
//       [],
//       [],
//       'image/jpeg',
//     );
//     await soulboundExternalEquippable.addResourceToToken(tokenId, resId, 0);
//     expect(await soulboundExternalEquippable.getPendingResources(tokenId)).to.eql([resId]);
//   });
// });

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
    expect(await soulbound.supportsInterface('0x01ffc9a7')).to.equal(true);
  });

  it('can support IRMRKSoulboundMultiResource', async function () {
    expect(await soulbound.supportsInterface('0x911ec470')).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await soulbound.supportsInterface('0xffffffff')).to.equal(false);
  });

  it('cannot transfer', async function () {
    expect(
      soulbound.connect(owner).transfer(otherOwner.address, tokenId),
    ).to.be.revertedWithCustomError(soulbound, 'RMRKCannotTransferSoulbound');
  });
}

async function shouldBehaveLikeSoulboundNesting() {
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

  it('cannot nest transfer', async function () {
    const otherTokenId = await mintFromMock(soulbound, owner.address);
    expect(
      soulbound.connect(owner).nestTransfer(otherOwner.address, tokenId, otherTokenId),
    ).to.be.revertedWithCustomError(soulbound, 'RMRKCannotTransferSoulbound');
  });

  it('cannot unnest transfer', async function () {
    await nestMintFromMock(soulbound, soulbound.address, tokenId);
    await soulbound.connect(owner).acceptChild(tokenId, 0);
    expect(
      soulbound.connect(owner).unnestChild(tokenId, 0, owner.address)
    ).to.be.revertedWithCustomError(soulbound, 'RMRKCannotTransferSoulbound');
  });
}
