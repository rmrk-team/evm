import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { bn } from '../utils';
import { IERC165, IRMRKMultiAsset, IRMRKEmotable, IOtherInterface } from '../interfaces';
import { RMRKMultiAssetEmotableMock } from '../../typechain-types';

// --------------- FIXTURES -----------------------

async function multiAssetEmotableFixture() {
  const factory = await ethers.getContractFactory('RMRKMultiAssetEmotableMock');
  const token = await factory.deploy('Chunky', 'CHNK');
  await token.deployed();

  return token;
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

  it('can support IRMRKMultiAsset', async function () {
    expect(await token.supportsInterface(IRMRKMultiAsset)).to.equal(true);
  });

  it('can support IRMRKEmotable', async function () {
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
      expect(await token.getEmoteCount(tokenId, emoji1)).to.equal(bn(1));
    });

    it('can undo emote', async function () {
      await token.emote(tokenId, emoji1, true);

      await expect(token.emote(tokenId, emoji1, false))
        .to.emit(token, 'Emoted')
        .withArgs(owner.address, tokenId.toNumber(), emoji1, false);
      expect(await token.getEmoteCount(tokenId, emoji1)).to.equal(bn(0));
    });

    it('can be emoted from different accounts', async function () {
      await token.connect(addrs[0]).emote(tokenId, emoji1, true);
      await token.connect(addrs[1]).emote(tokenId, emoji1, true);
      await token.connect(addrs[2]).emote(tokenId, emoji2, true);
      expect(await token.getEmoteCount(tokenId, emoji1)).to.equal(bn(2));
      expect(await token.getEmoteCount(tokenId, emoji2)).to.equal(bn(1));
    });

    it('does nothing if new state is the same as old state', async function () {
      await token.emote(tokenId, emoji1, true);
      await token.emote(tokenId, emoji1, true);
      expect(await token.getEmoteCount(tokenId, emoji1)).to.equal(bn(1));

      await token.emote(tokenId, emoji2, false);
      expect(await token.getEmoteCount(tokenId, emoji2)).to.equal(bn(0));
    });

    it('cannot emote not existing token', async function () {
      await expect(token.emote(2, emoji1, true)).to.be.revertedWithCustomError(
        token,
        'ERC721InvalidTokenId',
      );
    });
  });
});
