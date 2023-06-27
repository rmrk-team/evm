import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { bn } from '../utils';
import { IERC165, IERC5773, IRMRKEmotable, IERC6381, IOtherInterface } from '../interfaces';
import {
  RMRKMultiAssetEmotableMock,
  ERC721Mock,
  RMRKEmoteTrackerMock,
} from '../../typechain-types';

// --------------- FIXTURES -----------------------

async function multiAssetEmotableFixture() {
  const factory = await ethers.getContractFactory('RMRKMultiAssetEmotableMock');
  const token = await factory.deploy('Chunky', 'CHNK');
  await token.deployed();

  return token;
}

async function emoteTrackerFixture() {
  const factory = await ethers.getContractFactory('RMRKEmoteTrackerMock');
  const erc721Factory = await ethers.getContractFactory('ERC721Mock');
  const emoteTracker = await factory.deploy();
  const tokenA = await erc721Factory.deploy('Token A', 'TKA');
  const tokenB = await erc721Factory.deploy('Token B', 'TKB');
  await emoteTracker.deployed();
  await tokenA.deployed();
  await tokenB.deployed();

  return { emoteTracker, tokenA, tokenB };
}

describe('RMRKMultiAssetEmotableMock', async function () {
  let token: RMRKMultiAssetEmotableMock;
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const tokenId = bn(1);
  const emoji1 = Buffer.from('😎');
  const emoji2 = Buffer.from('😁');

  beforeEach(async function () {
    [owner, ...addrs] = await ethers.getSigners();
    token = await loadFixture(multiAssetEmotableFixture);
  });

  it('can support IERC165', async function () {
    expect(await token.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IERC5773', async function () {
    expect(await token.supportsInterface(IERC5773)).to.equal(true);
  });

  it('can support IERC6381', async function () {
    expect(await token.supportsInterface(IRMRKEmotable)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await token.supportsInterface(IOtherInterface)).to.equal(false);
  });

  describe('With minted tokens', async function () {
    beforeEach(async function () {
      await token.mint(owner.address, tokenId);
    });

    it('can emote', async function () {
      await expect(token.emote(tokenId, emoji1, true))
        .to.emit(token, 'Emoted')
        .withArgs(owner.address, tokenId.toNumber(), emoji1, true);
      expect(await token.emoteCountOf(tokenId, emoji1)).to.equal(bn(1));
    });

    it('can undo emote', async function () {
      await token.emote(tokenId, emoji1, true);

      await expect(token.emote(tokenId, emoji1, false))
        .to.emit(token, 'Emoted')
        .withArgs(owner.address, tokenId.toNumber(), emoji1, false);
      expect(await token.emoteCountOf(tokenId, emoji1)).to.equal(bn(0));
    });

    it('can be emoted from different accounts', async function () {
      await token.connect(addrs[0]).emote(tokenId, emoji1, true);
      await token.connect(addrs[1]).emote(tokenId, emoji1, true);
      await token.connect(addrs[2]).emote(tokenId, emoji2, true);
      expect(await token.emoteCountOf(tokenId, emoji1)).to.equal(bn(2));
      expect(await token.emoteCountOf(tokenId, emoji2)).to.equal(bn(1));
    });

    it('can add multiple emojis to same NFT', async function () {
      await token.emote(tokenId, emoji1, true);
      await token.emote(tokenId, emoji2, true);
      expect(await token.emoteCountOf(tokenId, emoji1)).to.equal(bn(1));
      expect(await token.emoteCountOf(tokenId, emoji2)).to.equal(bn(1));
    });

    it('does nothing if new state is the same as old state', async function () {
      await token.emote(tokenId, emoji1, true);
      await token.emote(tokenId, emoji1, true);
      expect(await token.emoteCountOf(tokenId, emoji1)).to.equal(bn(1));

      await token.emote(tokenId, emoji2, false);
      expect(await token.emoteCountOf(tokenId, emoji2)).to.equal(bn(0));
    });

    it('cannot emote not existing token', async function () {
      await expect(token.emote(2, emoji1, true)).to.be.revertedWithCustomError(
        token,
        'ERC721InvalidTokenId',
      );
    });
  });
});

describe('RMRKEmoteTrackerMock', async function () {
  let emoteTracker: RMRKEmoteTrackerMock;
  let tokenA: ERC721Mock;
  let tokenB: ERC721Mock;
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const tokenId = bn(1);
  const emoji1 = Buffer.from('😎');
  const emoji2 = Buffer.from('😁');

  beforeEach(async function () {
    [owner, ...addrs] = await ethers.getSigners();
    ({ emoteTracker, tokenA, tokenB } = await loadFixture(emoteTrackerFixture));
  });

  it('can support IERC165', async function () {
    expect(await emoteTracker.supportsInterface(IERC165)).to.equal(true);
  });
  it('can support IERC6381', async function () {
    expect(await emoteTracker.supportsInterface(IERC6381)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await emoteTracker.supportsInterface(IOtherInterface)).to.equal(false);
  });

  describe('With minted tokens', async function () {
    beforeEach(async function () {
      await tokenA.mint(owner.address, 1);
      await tokenA.mint(owner.address, 2);
      await tokenB.mint(owner.address, 1);
      await tokenB.mint(owner.address, 2);
    });

    it('can emote', async function () {
      await expect(emoteTracker.emote(tokenA.address, tokenId, emoji1, true))
        .to.emit(emoteTracker, 'Emoted')
        .withArgs(owner.address, tokenA.address, tokenId.toNumber(), emoji1, true);
      expect(await emoteTracker.emoteCountOf(tokenA.address, tokenId, emoji1)).to.equal(bn(1));
    });

    it('can undo emote', async function () {
      await emoteTracker.emote(tokenA.address, tokenId, emoji1, true);

      await expect(emoteTracker.emote(tokenA.address, tokenId, emoji1, false))
        .to.emit(emoteTracker, 'Emoted')
        .withArgs(owner.address, tokenA.address, tokenId.toNumber(), emoji1, false);
      expect(await emoteTracker.emoteCountOf(tokenA.address, tokenId, emoji1)).to.equal(bn(0));
    });

    it('can be emoted from different accounts', async function () {
      await emoteTracker.connect(addrs[0]).emote(tokenA.address, tokenId, emoji1, true);
      await emoteTracker.connect(addrs[1]).emote(tokenA.address, tokenId, emoji1, true);
      await emoteTracker.connect(addrs[2]).emote(tokenA.address, tokenId, emoji2, true);
      expect(await emoteTracker.emoteCountOf(tokenA.address, tokenId, emoji1)).to.equal(bn(2));
      expect(await emoteTracker.emoteCountOf(tokenA.address, tokenId, emoji2)).to.equal(bn(1));
    });

    it('can add multiple emojis to same NFT', async function () {
      await emoteTracker.emote(tokenA.address, tokenId, emoji1, true);
      await emoteTracker.emote(tokenA.address, tokenId, emoji2, true);
      expect(await emoteTracker.emoteCountOf(tokenA.address, tokenId, emoji1)).to.equal(bn(1));
      expect(await emoteTracker.emoteCountOf(tokenA.address, tokenId, emoji2)).to.equal(bn(1));
    });

    it('can emote different collections', async function () {
      await emoteTracker.connect(addrs[0]).emote(tokenA.address, tokenId, emoji1, true);
      await emoteTracker.connect(addrs[1]).emote(tokenB.address, tokenId, emoji1, true);
      await emoteTracker.connect(addrs[2]).emote(tokenB.address, tokenId, emoji1, true);
      expect(await emoteTracker.emoteCountOf(tokenA.address, tokenId, emoji1)).to.equal(bn(1));
      expect(await emoteTracker.emoteCountOf(tokenB.address, tokenId, emoji1)).to.equal(bn(2));
    });

    it('tracks the right emoji when reacting to the token', async function () {
      await emoteTracker.connect(addrs[0]).emote(tokenA.address, tokenId, emoji1, true);
      expect(
        await emoteTracker.hasEmoterUsedEmote(addrs[0].address, tokenA.address, tokenId, emoji1),
      ).to.be.true;
      expect(
        await emoteTracker.hasEmoterUsedEmote(addrs[0].address, tokenA.address, tokenId, emoji2),
      ).to.be.false;
    });

    it('does nothing if new state is the same as old state', async function () {
      await emoteTracker.emote(tokenA.address, tokenId, emoji1, true);
      await emoteTracker.emote(tokenA.address, tokenId, emoji1, true);
      expect(await emoteTracker.emoteCountOf(tokenA.address, tokenId, emoji1)).to.equal(bn(1));

      await emoteTracker.emote(tokenA.address, tokenId, emoji2, false);
      expect(await emoteTracker.emoteCountOf(tokenA.address, tokenId, emoji2)).to.equal(bn(0));
    });
  });
});
