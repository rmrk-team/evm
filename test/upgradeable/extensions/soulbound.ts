import { Contract } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import { expect } from 'chai';
import { loadFixture, mine } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { bn, mintFromMock, nestMintFromMock } from '../../utils';
import { IERC165, IERC6454beta, IOtherInterface } from '../../interfaces';
import {
  RMRKSoulboundAfterBlockNumberMockUpgradeable,
  RMRKSoulboundAfterTransactionsMockUpgradeable,
  RMRKSoulboundPerTokenMockUpgradeable,
} from '../../../typechain-types';

// --------------- FIXTURES -----------------------

async function soulboundMultiAssetFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundMultiAssetMockUpgradable');
  const token = await upgrades.deployProxy(factory, ['Chunky', 'CHNK']);
  await token.deployed();

  return { token };
}

async function soulboundNestableFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundNestableMockUpgradable');
  const token = await upgrades.deployProxy(factory, ['Chunky', 'CHNK']);
  await token.deployed();

  return { token };
}

async function soulboundNestableMultiAssetFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundNestableMultiAssetMockUpgradable');
  const token = await upgrades.deployProxy(factory, ['Chunky', 'CHNK']);
  await token.deployed();

  return { token };
}

async function soulboundEquippableFixture() {
  const factory = await ethers.getContractFactory('RMRKSoulboundEquippableMockUpgradable');
  const token = await upgrades.deployProxy(factory, ['Chunky', 'CHNK']);
  await token.deployed();

  return { token };
}

async function soulboundNestableExternalEquippableFixture() {
  const nestableFactory = await ethers.getContractFactory(
    'contracts/mocks/extensions/soulbound/RMRKSoulboundNestableExternalEquippableMock.sol:RMRKSoulboundNestableExternalEquippableMock',
  );
  const nestable = await upgrades.deployProxy(nestableFactory, ['Chunky', 'CHNK']);
  await nestable.deployed();

  const equipFactory = await ethers.getContractFactory('RMRKExternalEquipMock');
  const equip = await upgrades.deployProxy(equipFactory, [nestable.address]);
  await equip.deployed();

  await nestable.setEquippableAddress(equip.address);

  return { nestable, equip };
}

describe('RMRKSoulboundMultiAssetMockUpgradable', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(soulboundMultiAssetFixture);
    this.token = token;
  });

  shouldBehaveLikeSoulboundBasic();
});

describe('RMRKSoulboundNestableMockUpgradable', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(soulboundNestableFixture);
    this.token = token;
  });

  shouldBehaveLikeSoulboundBasic();
  shouldBehaveLikeSoulboundNestable();
});

describe('RMRKSoulboundNestableMultiAssetMockUpgradable', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(soulboundNestableMultiAssetFixture);
    this.token = token;
  });

  shouldBehaveLikeSoulboundBasic();
  shouldBehaveLikeSoulboundNestable();
});

describe('RMRKSoulboundEquippableMockUpgradable', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(soulboundEquippableFixture);
    this.token = token;
  });

  shouldBehaveLikeSoulboundBasic();
  shouldBehaveLikeSoulboundNestable();
});

describe('contracts/mocks/extensions/soulbound/RMRKSoulboundNestableExternalEquippableMock.sol:RMRKSoulboundNestableExternalEquippableMock', async function () {
  beforeEach(async function () {
    const { nestable } = await loadFixture(soulboundNestableExternalEquippableFixture);
    this.token = nestable;
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
    let token: RMRKSoulboundAfterBlockNumberMockUpgradeable;
    let initBlock: number;

    beforeEach(async function () {
      const factory = await ethers.getContractFactory(
        'RMRKSoulboundAfterBlockNumberMockUpgradeable',
      );
      initBlock = (await ethers.provider.getBlock('latest')).number;
      token = <RMRKSoulboundAfterBlockNumberMockUpgradeable>(
        await upgrades.deployProxy(factory, ['Chunky', 'CHNK', initBlock + blocksToTransfer])
      );
      await token.deployed();
    });

    it('can support IERC6454', async function () {
      expect(await token.supportsInterface(IERC6454beta)).to.equal(true);
    });

    it('can get last block to transfer', async function () {
      expect(await token.getLastBlockToTransfer()).to.equal(initBlock + blocksToTransfer);
    });

    it('can transfer before max block', async function () {
      await token.mint(owner.address, 1);
      await token.transferFrom(owner.address, otherOwner.address, 1);
      expect(await token.ownerOf(1)).to.equal(otherOwner.address);
    });

    it('cannot transfer after max block', async function () {
      await token.mint(owner.address, 1);
      await mine(blocksToTransfer + 1);
      await expect(
        token.transferFrom(owner.address, otherOwner.address, 1),
      ).to.be.revertedWithCustomError(token, 'RMRKCannotTransferSoulbound');
    });
  });

  describe('RMRKSoulboundAfterTransactions', async function () {
    const maxTransactions = 2;
    let token: RMRKSoulboundAfterTransactionsMockUpgradeable;

    beforeEach(async function () {
      const factory = await ethers.getContractFactory(
        'RMRKSoulboundAfterTransactionsMockUpgradeable',
      );
      token = <RMRKSoulboundAfterTransactionsMockUpgradeable>(
        await upgrades.deployProxy(factory, ['Chunky', 'CHNK', maxTransactions])
      );
      await token.deployed();
    });

    it('can support IERC6454', async function () {
      expect(await token.supportsInterface(IERC6454beta)).to.equal(true);
    });

    it('does not support other interfaces', async function () {
      expect(await token.supportsInterface(IOtherInterface)).to.equal(false);
    });

    it('can transfer token only 2 times', async function () {
      await token.mint(owner.address, 1);
      await token.transferFrom(owner.address, otherOwner.address, 1);
      await expect(token.connect(otherOwner).transferFrom(otherOwner.address, owner.address, 1))
        .to.emit(token, 'Soulbound')
        .withArgs(1);
      expect(await token.getTransfersPerToken(1)).to.equal(bn(2));
      expect(await token.getMaxNumberOfTransfers()).to.equal(bn(2));

      await expect(
        token.transferFrom(owner.address, otherOwner.address, 1),
      ).to.be.revertedWithCustomError(token, 'RMRKCannotTransferSoulbound');
    });
  });

  describe('RMRKSoulboundPerToken', async function () {
    let token: RMRKSoulboundPerTokenMockUpgradeable;

    beforeEach(async function () {
      const factory = await ethers.getContractFactory('RMRKSoulboundPerTokenMockUpgradeable');
      token = <RMRKSoulboundPerTokenMockUpgradeable>(
        await upgrades.deployProxy(factory, ['Chunky', 'CHNK'])
      );
      await token.deployed();
    });

    it('can support IERC6454', async function () {
      expect(await token.supportsInterface(IERC6454beta)).to.equal(true);
    });

    it('does not support other interfaces', async function () {
      expect(await token.supportsInterface(IOtherInterface)).to.equal(false);
    });

    it('can transfer token if not soulbound', async function () {
      await expect(token.setSoulbound(1, false)).to.emit(token, 'Soulbound').withArgs(1, false);
      await token.mint(owner.address, 1);
      await token.transferFrom(owner.address, otherOwner.address, 1);
      expect(await token.ownerOf(1)).to.equal(otherOwner.address);
    });

    it('cannot transfer token if soulbound', async function () {
      await expect(token.setSoulbound(1, true)).to.emit(token, 'Soulbound').withArgs(1, true);
      await token.mint(owner.address, 1);
      await expect(
        token.transferFrom(owner.address, otherOwner.address, 1),
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

  it('can support IERC6454', async function () {
    expect(await soulbound.supportsInterface(IERC6454beta)).to.equal(true);
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
