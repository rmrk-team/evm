import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture, mine } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { bn, mintFromMock, nestMintFromMock } from '../utils';
import { IERC165, IERC6454, IOtherInterface } from '../interfaces';
import {
  RMRKSoulboundAfterBlockNumberMock,
  RMRKSoulboundAfterTransactionsMock,
  RMRKSoulboundEquippableMock,
  RMRKSoulboundMultiAssetMock,
  RMRKSoulboundNestableMock,
  RMRKSoulboundNestableMultiAssetMock,
  RMRKSoulboundPerTokenMock,
} from '../../typechain-types';

type GenericSoulboundNestable =
  | RMRKSoulboundNestableMock
  | RMRKSoulboundNestableMultiAssetMock
  | RMRKSoulboundEquippableMock;
type GenericSoulbound = GenericSoulboundNestable | RMRKSoulboundMultiAssetMock;

// --------------- FIXTURES -----------------------

async function soulboundMultiAssetFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundMultiAssetMock');
  const token = await factory.deploy();
  await token.waitForDeployment();

  return { token };
}

async function soulboundNestableFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundNestableMock');
  const token = await factory.deploy();
  await token.waitForDeployment();

  return { token };
}

async function soulboundNestableMultiAssetFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundNestableMultiAssetMock');
  const token = await factory.deploy();
  await token.waitForDeployment();

  return { token };
}

async function soulboundEquippableFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundEquippableMock');
  const token = await factory.deploy();
  await token.waitForDeployment();

  return { token };
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

describe('RMRKSoulbound variants', async function () {
  let owner: SignerWithAddress;
  let otherOwner: SignerWithAddress;

  beforeEach(async function () {
    [owner, otherOwner] = await ethers.getSigners();
  });

  describe('RMRKSoulboundAfterBlockNumber', async function () {
    const blocksToTransfer = 100;
    let token: RMRKSoulboundAfterBlockNumberMock;
    let initBlock: number;

    beforeEach(async function () {
      const factory = await ethers.getContractFactory('RMRKSoulboundAfterBlockNumberMock');
      initBlock = (await ethers.provider.getBlock('latest')).number;
      token = <RMRKSoulboundAfterBlockNumberMock>await factory.deploy(initBlock + blocksToTransfer);
      await token.waitForDeployment();
    });

    it('can support IERC6454', async function () {
      expect(await token.supportsInterface(IERC6454)).to.equal(true);
    });

    it('can get last block to transfer', async function () {
      expect(await token.getLastBlockToTransfer()).to.equal(initBlock + blocksToTransfer);
    });

    it('can transfer before max block', async function () {
      await token.mint(await owner.getAddress(), 1);
      await token.transferFrom(await owner.getAddress(), await otherOwner.getAddress(), 1);
      expect(await token.ownerOf(1)).to.equal(await otherOwner.getAddress());
    });

    it('cannot transfer after max block', async function () {
      await token.mint(await owner.getAddress(), 1);
      await mine(blocksToTransfer + 1);
      await expect(
        token.transferFrom(await owner.getAddress(), await otherOwner.getAddress(), 1),
      ).to.be.revertedWithCustomError(token, 'RMRKCannotTransferSoulbound');
    });
  });

  describe('RMRKSoulboundAfterTransactions', async function () {
    const maxTransactions = 2;
    let token: RMRKSoulboundAfterTransactionsMock;

    beforeEach(async function () {
      const factory = await ethers.getContractFactory('RMRKSoulboundAfterTransactionsMock');
      token = <RMRKSoulboundAfterTransactionsMock>await factory.deploy(maxTransactions);
      await token.waitForDeployment();
    });

    it('can support IERC6454', async function () {
      expect(await token.supportsInterface(IERC6454)).to.equal(true);
    });

    it('does not support other interfaces', async function () {
      expect(await token.supportsInterface(IOtherInterface)).to.equal(false);
    });

    it('can transfer token only 2 times', async function () {
      await token.mint(await owner.getAddress(), 1);
      await token.transferFrom(await owner.getAddress(), await otherOwner.getAddress(), 1);
      await expect(
        token
          .connect(otherOwner)
          .transferFrom(await otherOwner.getAddress(), await owner.getAddress(), 1),
      )
        .to.emit(token, 'Soulbound')
        .withArgs(1);
      expect(await token.getTransfersPerToken(1)).to.equal(bn(2));
      expect(await token.getMaxNumberOfTransfers()).to.equal(bn(2));

      await expect(
        token.transferFrom(await owner.getAddress(), await otherOwner.getAddress(), 1),
      ).to.be.revertedWithCustomError(token, 'RMRKCannotTransferSoulbound');
    });
  });

  describe('RMRKSoulboundPerToken', async function () {
    let token: RMRKSoulboundPerTokenMock;

    beforeEach(async function () {
      const factory = await ethers.getContractFactory('RMRKSoulboundPerTokenMock');
      token = <RMRKSoulboundPerTokenMock>await factory.deploy();
      await token.waitForDeployment();
    });

    it('can support IERC6454', async function () {
      expect(await token.supportsInterface(IERC6454)).to.equal(true);
    });

    it('does not support other interfaces', async function () {
      expect(await token.supportsInterface(IOtherInterface)).to.equal(false);
    });

    it('can transfer token if not soulbound', async function () {
      await expect(token.setSoulbound(1, false)).to.emit(token, 'Soulbound').withArgs(1, false);
      await token.mint(await owner.getAddress(), 1);
      await token.transferFrom(await owner.getAddress(), await otherOwner.getAddress(), 1);
      expect(await token.ownerOf(1)).to.equal(await otherOwner.getAddress());
    });

    it('cannot transfer token if soulbound', async function () {
      await expect(token.setSoulbound(1, true)).to.emit(token, 'Soulbound').withArgs(1, true);
      await token.mint(await owner.getAddress(), 1);
      await expect(
        token.transferFrom(await owner.getAddress(), await otherOwner.getAddress(), 1),
      ).to.be.revertedWithCustomError(token, 'RMRKCannotTransferSoulbound');
    });

    it('cannot set soulbound if not collection owner', async function () {
      await expect(token.connect(otherOwner).setSoulbound(1, true)).to.be.revertedWithCustomError(
        token,
        'RMRKNotOwner',
      );
    });
  });
});

async function shouldBehaveLikeSoulboundBasic() {
  let soulbound: GenericSoulbound;
  let owner: SignerWithAddress;
  let otherOwner: SignerWithAddress;
  let tokenId: bigint;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    otherOwner = signers[1];
    soulbound = this.token;

    tokenId = await mintFromMock(soulbound, await owner.getAddress());
  });

  it('can support IERC165', async function () {
    expect(await soulbound.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IERC6454', async function () {
    expect(await soulbound.supportsInterface(IERC6454)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await soulbound.supportsInterface(IOtherInterface)).to.equal(false);
  });

  it('cannot transfer', async function () {
    expect(
      soulbound.connect(owner).transfer(await otherOwner.getAddress(), tokenId),
    ).to.be.revertedWithCustomError(soulbound, 'RMRKCannotTransferSoulbound');
  });

  it('can burn', async function () {
    await (<GenericSoulboundNestable>soulbound).connect(owner)['burn(uint256)'](tokenId);
    await expect(soulbound.ownerOf(tokenId)).to.be.revertedWithCustomError(
      soulbound,
      'ERC721InvalidTokenId',
    );
  });
}

async function shouldBehaveLikeSoulboundNestable() {
  let soulbound: GenericSoulboundNestable;
  let owner: SignerWithAddress;
  let tokenId: bigint;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    soulbound = this.token;

    tokenId = await mintFromMock(soulbound, await owner.getAddress());
  });

  it('cannot nest transfer', async function () {
    const otherTokenId = await mintFromMock(soulbound, await owner.getAddress());
    expect(
      soulbound.connect(owner).nestTransfer(await soulbound.getAddress(), tokenId, otherTokenId),
    ).to.be.revertedWithCustomError(soulbound, 'RMRKCannotTransferSoulbound');
  });

  it('cannot transfer child', async function () {
    const childId = await nestMintFromMock(soulbound, await soulbound.getAddress(), tokenId);
    await soulbound.connect(owner).acceptChild(tokenId, 0, await soulbound.getAddress(), childId);
    expect(
      soulbound
        .connect(owner)
        .transferChild(
          tokenId,
          await owner.getAddress(),
          0,
          0,
          await soulbound.getAddress(),
          childId,
          false,
          '0x',
        ),
    ).to.be.revertedWithCustomError(soulbound, 'RMRKCannotTransferSoulbound');
  });
}
