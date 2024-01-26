import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { IOtherInterface, IRMRKRevealable, IRMRKRevealer, IERC5773 } from '../interfaces';
import { RMRKMultiAssetRevealableMock, RMRKRevealerMock } from '../../typechain-types';
import { bn } from '../utils';

const UNREVEALED_ASSET_ID = 1;
const REVEALED_ASSET_ID = 2;

async function revealableFixture(): Promise<{
  revealable: RMRKMultiAssetRevealableMock;
  revealer: RMRKRevealerMock;
  deployer: SignerWithAddress;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
}> {
  const [deployer, user1, user2] = await ethers.getSigners();
  const revealableFactory = await ethers.getContractFactory('RMRKMultiAssetRevealableMock');
  const revealerFactory = await ethers.getContractFactory('RMRKRevealerMock');
  const revealable = await revealableFactory.deploy();
  await revealable.waitForDeployment();

  const revealer = await revealerFactory.deploy(REVEALED_ASSET_ID, await revealable.getAddress());
  await revealer.waitForDeployment();

  await revealable.setRevealer(await revealer.getAddress());

  await revealable.mint(user1.address, 1);
  await revealable.mint(user1.address, 2);
  await revealable.mint(user2.address, 3);

  await revealable.addAssetEntry(UNREVEALED_ASSET_ID, 'ipfs://unrevealed');
  await revealable.addAssetEntry(REVEALED_ASSET_ID, 'ipfs://revealed');

  await revealable.addAssetToToken(1, UNREVEALED_ASSET_ID, 0);
  await revealable.addAssetToToken(2, UNREVEALED_ASSET_ID, 0);
  await revealable.addAssetToToken(3, REVEALED_ASSET_ID, 0);

  await revealable.connect(user1).acceptAsset(1, 0, UNREVEALED_ASSET_ID);
  await revealable.connect(user1).acceptAsset(2, 0, UNREVEALED_ASSET_ID);
  await revealable.connect(user2).acceptAsset(3, 0, REVEALED_ASSET_ID);

  return { revealable, revealer, deployer, user1, user2 };
}

// --------------- TESTS -----------------------

describe('RMRKRevealables', async function () {
  let revealable: RMRKMultiAssetRevealableMock;
  let revealer: RMRKRevealerMock;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    ({ revealable, revealer, user1, user2 } = await loadFixture(revealableFixture));
  });

  it('can reveal an asset if it holds it', async function () {
    expect(await revealable.getActiveAssets(1)).to.eql([bn(UNREVEALED_ASSET_ID)]);
    await revealable.connect(user1).reveal([1, 2]);
    expect(await revealable.getActiveAssets(1)).to.eql([bn(REVEALED_ASSET_ID)]);
    expect(await revealable.getActiveAssets(2)).to.eql([bn(REVEALED_ASSET_ID)]);
    expect(await revealer.getRevealableTokens([1, 2, 3])).to.eql([false, false, true]);
  });

  it('cannot reveal an asset from another user', async function () {
    await expect(revealable.connect(user2).reveal([1, 2])).to.be.revertedWithCustomError(
      revealable,
      'RMRKNotApprovedForAssetsOrOwner',
    );
  });

  it('cannot reveal an already revealed token', async function () {
    await revealable.connect(user1).reveal([1, 2]);
    await expect(revealable.connect(user1).reveal([1, 2])).to.be.revertedWithCustomError(
      revealer,
      'AlreadyRevealed',
    );
  });

  it('cannot reveal direclty on revealer', async function () {
    await expect(revealer.reveal([1, 2])).to.be.revertedWithCustomError(
      revealer,
      'CallerIsNotRevealable',
    );
  });

  it('can get revealer address', async function () {
    expect(await revealable.getRevealer()).to.eql(await revealer.getAddress());
  });

  it('supports revealable interface', async function () {
    expect(await revealable.supportsInterface(IRMRKRevealable)).to.be.true;
  });

  it('supports multiasset interface', async function () {
    expect(await revealable.supportsInterface(IERC5773)).to.be.true;
  });

  it('does not support random interfaces', async function () {
    expect(await revealable.supportsInterface(IOtherInterface)).to.be.false;
  });

  it('supports revealer interface', async function () {
    expect(await revealer.supportsInterface(IRMRKRevealer)).to.be.true;
  });

  it('does not support random interfaces', async function () {
    expect(await revealer.supportsInterface(IOtherInterface)).to.be.false;
  });
});
