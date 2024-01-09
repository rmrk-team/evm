import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ERC721Mock, RMRKEmotesRepository } from '../typechain-types';
import { IERC7409, IERC165, IOtherInterface } from './interfaces';

async function tokenFixture() {
  const factory = await ethers.getContractFactory('ERC721Mock');
  const token = await factory.deploy('Chunky', 'CHNK');
  await token.waitForDeployment();

  return token;
}

async function RMRKEmotesRepositoryFixture() {
  const factory = await ethers.getContractFactory('RMRKEmotesRepository');
  const repository = await factory.deploy();
  await repository.waitForDeployment();

  return repository;
}

describe('RMRKEmotesRepository', async function () {
  let token: ERC721Mock;
  let repository: RMRKEmotesRepository;
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const tokenId = 1n;
  const emoji1 = '👨‍👩‍👧';
  const emoji2 = '😁';

  beforeEach(async function () {
    [owner, ...addrs] = await ethers.getSigners();
    token = await loadFixture(tokenFixture);
    repository = await loadFixture(RMRKEmotesRepositoryFixture);
  });

  it('can support IERC7409', async function () {
    expect(await repository.supportsInterface(IERC7409)).to.equal(true);
  });

  it('can support IERC165', async function () {
    expect(await repository.supportsInterface(IERC165)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await repository.supportsInterface(IOtherInterface)).to.equal(false);
  });

  describe('With minted tokens', async function () {
    beforeEach(async function () {
      await token.mint(await owner.getAddress(), tokenId);
    });

    it('can emote', async function () {
      await expect(
        repository.connect(addrs[0]).emote(await token.getAddress(), tokenId, emoji1, true),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(addrs[0].address, await token.getAddress(), tokenId, emoji1, true);
      expect(await repository.emoteCountOf(await token.getAddress(), tokenId, emoji1)).to.equal(1n);
      expect(
        await repository.hasEmoterUsedEmote(
          addrs[0].address,
          await token.getAddress(),
          tokenId,
          emoji1,
        ),
      ).to.equal(true);
    });

    it('can undo emote', async function () {
      await repository.emote(await token.getAddress(), tokenId, emoji1, true);

      await expect(repository.emote(await token.getAddress(), tokenId, emoji1, false))
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji1, false);
      expect(await repository.emoteCountOf(await token.getAddress(), tokenId, emoji1)).to.equal(0n);
    });

    it('can be emoted from different accounts', async function () {
      await repository.connect(addrs[0]).emote(await token.getAddress(), tokenId, emoji1, true);
      await repository.connect(addrs[1]).emote(await token.getAddress(), tokenId, emoji1, true);
      await repository.connect(addrs[2]).emote(await token.getAddress(), tokenId, emoji2, true);
      expect(await repository.emoteCountOf(await token.getAddress(), tokenId, emoji1)).to.equal(2n);
      expect(await repository.emoteCountOf(await token.getAddress(), tokenId, emoji2)).to.equal(1n);
    });

    it('can add multiple emojis to same NFT', async function () {
      await repository.emote(await token.getAddress(), tokenId, emoji1, true);
      await repository.emote(await token.getAddress(), tokenId, emoji2, true);
      expect(await repository.emoteCountOf(await token.getAddress(), tokenId, emoji1)).to.equal(1n);
      expect(await repository.emoteCountOf(await token.getAddress(), tokenId, emoji2)).to.equal(1n);
    });

    it('does nothing if new state is the same as old state', async function () {
      await repository.emote(await token.getAddress(), tokenId, emoji1, true);
      await repository.emote(await token.getAddress(), tokenId, emoji1, true);
      expect(await repository.emoteCountOf(await token.getAddress(), tokenId, emoji1)).to.equal(1n);

      await repository.emote(await token.getAddress(), tokenId, emoji2, false);
      expect(await repository.emoteCountOf(await token.getAddress(), tokenId, emoji2)).to.equal(0n);
    });

    it('does nothing if new state is the same as old state on bulk emote', async function () {
      await repository.emote(await token.getAddress(), tokenId, emoji1, true);
      await repository.bulkEmote(
        [await token.getAddress(), await token.getAddress()],
        [tokenId, tokenId],
        [emoji1, emoji2],
        [true, false],
      );
      expect(await repository.emoteCountOf(await token.getAddress(), tokenId, emoji1)).to.equal(1n);
      expect(await repository.emoteCountOf(await token.getAddress(), tokenId, emoji2)).to.equal(0n);
    });

    it('can bulk emote', async function () {
      expect(
        await repository.bulkEmoteCountOf(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([0n, 0n]);

      expect(
        await repository.haveEmotersUsedEmotes(
          [await owner.getAddress(), await owner.getAddress()],
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([false, false]);

      await expect(
        repository.bulkEmote(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
        ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji1, true)
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji2, true);

      expect(
        await repository.bulkEmoteCountOf(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([1n, 1n]);

      expect(
        await repository.haveEmotersUsedEmotes(
          [await owner.getAddress(), await owner.getAddress()],
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([true, true]);
    });

    it('can bulk undo emote', async function () {
      await expect(
        repository.bulkEmote(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
        ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji1, true)
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji2, true);

      expect(
        await repository.bulkEmoteCountOf(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([1n, 1n]);

      expect(
        await repository.haveEmotersUsedEmotes(
          [await owner.getAddress(), await owner.getAddress()],
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([true, true]);

      await expect(
        repository.bulkEmote(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [false, false],
        ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji1, false)
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji2, false);

      expect(
        await repository.bulkEmoteCountOf(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([0n, 0n]);

      expect(
        await repository.haveEmotersUsedEmotes(
          [await owner.getAddress(), await owner.getAddress()],
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([false, false]);
    });

    it('can bulk emote and unemote at the same time', async function () {
      await repository.emote(await token.getAddress(), tokenId, emoji2, true);

      expect(
        await repository.bulkEmoteCountOf(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([0n, 1n]);

      expect(
        await repository.haveEmotersUsedEmotes(
          [await owner.getAddress(), await owner.getAddress()],
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([false, true]);

      await expect(
        repository.bulkEmote(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, false],
        ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji1, true)
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji2, false);

      expect(
        await repository.bulkEmoteCountOf(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([1n, 0n]);

      expect(
        await repository.haveEmotersUsedEmotes(
          [await owner.getAddress(), await owner.getAddress()],
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([true, false]);
    });

    it('can not bulk emote if passing arrays of different length', async function () {
      await expect(
        repository.bulkEmote(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkEmote(
          [await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkEmote(
          [await token.getAddress(), await token.getAddress()],
          [tokenId],
          [emoji1, emoji2],
          [true, true],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkEmote(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1],
          [true, true],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');
    });

    it('can not bulk presign if passing arrays of different length', async function () {
      await expect(
        repository.bulkPrepareMessagesToPresignEmote(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true],
          [9999999999n, 9999999999n],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkPrepareMessagesToPresignEmote(
          [await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
          [9999999999n, 9999999999n],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkPrepareMessagesToPresignEmote(
          [await token.getAddress(), await token.getAddress()],
          [tokenId],
          [emoji1, emoji2],
          [true, true],
          [9999999999n, 9999999999n],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkPrepareMessagesToPresignEmote(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1],
          [true, true],
          [9999999999n, 9999999999n],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkPrepareMessagesToPresignEmote(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
          [9999999999n],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');
    });

    it('can not bulk get emote count if passing arrays of different length', async function () {
      await expect(
        repository.bulkEmoteCountOf(
          [await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkEmoteCountOf(
          [await token.getAddress(), await token.getAddress()],
          [tokenId],
          [emoji1, emoji2],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkEmoteCountOf(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');
    });

    it('can not bulk check for emotes if passing arrays of different length', async function () {
      await expect(
        repository.haveEmotersUsedEmotes(
          [addrs[0].address],
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.haveEmotersUsedEmotes(
          [addrs[0].address, addrs[1].address],
          [await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.haveEmotersUsedEmotes(
          [addrs[0].address, addrs[1].address],
          [await token.getAddress(), await token.getAddress()],
          [tokenId],
          [emoji1, emoji2],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.haveEmotersUsedEmotes(
          [addrs[0].address, addrs[1].address],
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');
    });

    it('can use presigned emote to react to token', async function () {
      const message = await repository.prepareMessageToPresignEmote(
        await token.getAddress(),
        tokenId,
        emoji1,
        true,
        9999999999n,
      );

      const signature = await owner.signMessage(ethers.getBytes(message));

      const r: string = signature.substring(0, 66);
      const s: string = '0x' + signature.substring(66, 130);
      const v: number = parseInt(signature.substring(130, 132), 16);

      await expect(
        repository
          .connect(addrs[0])
          .presignedEmote(
            await owner.getAddress(),
            await token.getAddress(),
            tokenId,
            emoji1,
            true,
            9999999999n,
            v,
            r,
            s,
          ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji1, true);
    });

    it('does nothing if new state is the same as old state on presigned emote', async function () {
      repository.connect(owner).emote(await token.getAddress(), tokenId, emoji1, true);
      const message = await repository.prepareMessageToPresignEmote(
        await token.getAddress(),
        tokenId,
        emoji1,
        true,
        9999999999n,
      );

      const signature = await owner.signMessage(ethers.getBytes(message));

      const r: string = signature.substring(0, 66);
      const s: string = '0x' + signature.substring(66, 130);
      const v: number = parseInt(signature.substring(130, 132), 16);

      await repository
        .connect(addrs[0])
        .presignedEmote(
          await owner.getAddress(),
          await token.getAddress(),
          tokenId,
          emoji1,
          true,
          9999999999n,
          v,
          r,
          s,
        );
      expect(await repository.emoteCountOf(await token.getAddress(), tokenId, emoji1)).to.equal(1n);
    });

    it('can use presigned emote to undo reaction to token', async function () {
      repository.connect(owner).emote(await token.getAddress(), tokenId, emoji1, true);
      const message = await repository.prepareMessageToPresignEmote(
        await token.getAddress(),
        tokenId,
        emoji1,
        false,
        9999999999n,
      );

      const signature = await owner.signMessage(ethers.getBytes(message));

      const r: string = signature.substring(0, 66);
      const s: string = '0x' + signature.substring(66, 130);
      const v: number = parseInt(signature.substring(130, 132), 16);

      await expect(
        repository
          .connect(addrs[0])
          .presignedEmote(
            await owner.getAddress(),
            await token.getAddress(),
            tokenId,
            emoji1,
            false,
            9999999999n,
            v,
            r,
            s,
          ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji1, false);
    });

    it('cannot use expired presigned to emote', async function () {
      const block = await ethers.provider.getBlock('latest');
      const previousBlockTime = block.timestamp;
      const message = await repository.prepareMessageToPresignEmote(
        await token.getAddress(),
        tokenId,
        emoji1,
        true,
        previousBlockTime,
      );

      const signature = await owner.signMessage(ethers.getBytes(message));

      const r: string = signature.substring(0, 66);
      const s: string = '0x' + signature.substring(66, 130);
      const v: number = parseInt(signature.substring(130, 132), 16);

      await expect(
        repository
          .connect(addrs[0])
          .presignedEmote(
            await owner.getAddress(),
            await token.getAddress(),
            tokenId,
            emoji1,
            true,
            previousBlockTime,
            v,
            r,
            s,
          ),
      ).to.be.revertedWithCustomError(repository, 'ExpiredPresignedEmote');
    });

    it('cannot use presigned emote for a different signer, collection, token, emoji, state or deadline', async function () {
      const message = await repository.prepareMessageToPresignEmote(
        await token.getAddress(),
        tokenId,
        emoji1,
        true,
        9999999999n,
      );

      const signature = await owner.signMessage(ethers.getBytes(message));

      const r: string = signature.substring(0, 66);
      const s: string = '0x' + signature.substring(66, 130);
      const v: number = parseInt(signature.substring(130, 132), 16);

      await expect(
        repository.connect(addrs[0]).presignedEmote(
          addrs[2].address, // different signer
          await token.getAddress(),
          tokenId,
          emoji1,
          true,
          9999999999n,
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).presignedEmote(
          await owner.getAddress(),
          addrs[2].address, // different collection
          tokenId,
          emoji1,
          true,
          9999999999n,
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).presignedEmote(
          await owner.getAddress(),
          await token.getAddress(),
          tokenId + 1n, // different token
          emoji1,
          true,
          9999999999n,
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).presignedEmote(
          await owner.getAddress(),
          await token.getAddress(),
          tokenId,
          emoji2, // different emoji
          true,
          9999999999n,
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).presignedEmote(
          await owner.getAddress(),
          await token.getAddress(),
          tokenId,
          emoji1,
          false, // different state
          9999999999n,
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).presignedEmote(
          await owner.getAddress(),
          await token.getAddress(),
          tokenId,
          emoji1,
          true,
          10000000000n, // different deadline
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');
    });

    it('can use presigned emotes to bulk react to token', async function () {
      const messages = await repository.bulkPrepareMessagesToPresignEmote(
        [await token.getAddress(), await token.getAddress()],
        [tokenId, tokenId],
        [emoji1, emoji2],
        [true, true],
        [9999999999n, 9999999999n],
      );

      const signature1 = await owner.signMessage(ethers.getBytes(messages[0]));
      const signature2 = await owner.signMessage(ethers.getBytes(messages[1]));

      const r1: string = signature1.substring(0, 66);
      const s1: string = '0x' + signature1.substring(66, 130);
      const v1: number = parseInt(signature1.substring(130, 132), 16);
      const r2: string = signature2.substring(0, 66);
      const s2: string = '0x' + signature2.substring(66, 130);
      const v2: number = parseInt(signature2.substring(130, 132), 16);

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [await owner.getAddress(), await owner.getAddress()],
            [await token.getAddress(), await token.getAddress()],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [9999999999n, 9999999999n],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji1, true)
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji2, true);
    });

    it('can use presigned emotes to undo reaction to token', async function () {
      repository.connect(owner).emote(await token.getAddress(), tokenId, emoji1, true);
      repository.connect(owner).emote(await token.getAddress(), tokenId, emoji2, true);

      const messages = await repository.bulkPrepareMessagesToPresignEmote(
        [await token.getAddress(), await token.getAddress()],
        [tokenId, tokenId],
        [emoji1, emoji2],
        [false, false],
        [9999999999n, 9999999999n],
      );

      const signature1 = await owner.signMessage(ethers.getBytes(messages[0]));
      const signature2 = await owner.signMessage(ethers.getBytes(messages[1]));

      const r1: string = signature1.substring(0, 66);
      const s1: string = '0x' + signature1.substring(66, 130);
      const v1: number = parseInt(signature1.substring(130, 132), 16);
      const r2: string = signature2.substring(0, 66);
      const s2: string = '0x' + signature2.substring(66, 130);
      const v2: number = parseInt(signature2.substring(130, 132), 16);

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [await owner.getAddress(), await owner.getAddress()],
            [await token.getAddress(), await token.getAddress()],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [false, false],
            [9999999999n, 9999999999n],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji1, false)
        .to.emit(repository, 'Emoted')
        .withArgs(await owner.getAddress(), await token.getAddress(), tokenId, emoji2, false);
    });

    it('does nothing if new state is the same as old state on bulk presigned emote', async function () {
      repository.connect(owner).emote(await token.getAddress(), tokenId, emoji1, true);

      const messages = await repository.bulkPrepareMessagesToPresignEmote(
        [await token.getAddress(), await token.getAddress()],
        [tokenId, tokenId],
        [emoji1, emoji2],
        [true, false],
        [9999999999n, 9999999999n],
      );

      const signature1 = await owner.signMessage(ethers.getBytes(messages[0]));
      const signature2 = await owner.signMessage(ethers.getBytes(messages[1]));

      const r1: string = signature1.substring(0, 66);
      const s1: string = '0x' + signature1.substring(66, 130);
      const v1: number = parseInt(signature1.substring(130, 132), 16);
      const r2: string = signature2.substring(0, 66);
      const s2: string = '0x' + signature2.substring(66, 130);
      const v2: number = parseInt(signature2.substring(130, 132), 16);

      await repository
        .connect(addrs[0])
        .bulkPresignedEmote(
          [await owner.getAddress(), await owner.getAddress()],
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, false],
          [9999999999n, 9999999999n],
          [v1, v2],
          [r1, r2],
          [s1, s2],
        );
      expect(
        await repository.bulkEmoteCountOf(
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([1n, 0n]);
    });

    it('can use bulk presigned emotes if passing arrays of different length', async function () {
      const messages = await repository.bulkPrepareMessagesToPresignEmote(
        [await token.getAddress(), await token.getAddress()],
        [tokenId, tokenId],
        [emoji1, emoji2],
        [true, true],
        [9999999999n, 9999999999n],
      );

      const signature1 = await owner.signMessage(ethers.getBytes(messages[0]));
      const signature2 = await owner.signMessage(ethers.getBytes(messages[1]));

      const r1: string = signature1.substring(0, 66);
      const s1: string = '0x' + signature1.substring(66, 130);
      const v1: number = parseInt(signature1.substring(130, 132), 16);
      const r2: string = signature2.substring(0, 66);
      const s2: string = '0x' + signature2.substring(66, 130);
      const v2: number = parseInt(signature2.substring(130, 132), 16);

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [await owner.getAddress()],
            [await token.getAddress(), await token.getAddress()],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [9999999999n, 9999999999n],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [await owner.getAddress(), await owner.getAddress()],
            [await token.getAddress()],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [9999999999n, 9999999999n],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [await owner.getAddress(), await owner.getAddress()],
            [await token.getAddress(), await token.getAddress()],
            [tokenId],
            [emoji1, emoji2],
            [true, true],
            [9999999999n, 9999999999n],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [await owner.getAddress(), await owner.getAddress()],
            [await token.getAddress(), await token.getAddress()],
            [tokenId, tokenId],
            [emoji1],
            [true, true],
            [9999999999n, 9999999999n],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [await owner.getAddress(), await owner.getAddress()],
            [await token.getAddress(), await token.getAddress()],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true],
            [9999999999n, 9999999999n],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [await owner.getAddress(), await owner.getAddress()],
            [await token.getAddress(), await token.getAddress()],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [9999999999n],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [await owner.getAddress(), await owner.getAddress()],
            [await token.getAddress(), await token.getAddress()],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [9999999999n, 9999999999n],
            [v1],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [await owner.getAddress(), await owner.getAddress()],
            [await token.getAddress(), await token.getAddress()],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [9999999999n, 9999999999n],
            [v1, v2],
            [r1],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [await owner.getAddress(), await owner.getAddress()],
            [await token.getAddress(), await token.getAddress()],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [9999999999n, 9999999999n],
            [v1, v2],
            [r1, r2],
            [s1],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');
    });

    it('cannot use expired presigned to bulk emote', async function () {
      const block = await ethers.provider.getBlock('latest');
      const previousBlockTime = block.timestamp;

      const messages = await repository.bulkPrepareMessagesToPresignEmote(
        [await token.getAddress(), await token.getAddress()],
        [tokenId, tokenId],
        [emoji1, emoji2],
        [true, true],
        [9999999999n, previousBlockTime],
      );

      const signature1 = await owner.signMessage(ethers.getBytes(messages[0]));
      const signature2 = await owner.signMessage(ethers.getBytes(messages[1]));

      const r1: string = signature1.substring(0, 66);
      const s1: string = '0x' + signature1.substring(66, 130);
      const v1: number = parseInt(signature1.substring(130, 132), 16);
      const r2: string = signature2.substring(0, 66);
      const s2: string = '0x' + signature2.substring(66, 130);
      const v2: number = parseInt(signature2.substring(130, 132), 16);

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [await owner.getAddress(), await owner.getAddress()],
            [await token.getAddress(), await token.getAddress()],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [9999999999n, previousBlockTime],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'ExpiredPresignedEmote');
    });

    it('cannot use bulk presigned emote for a different signer, collection, token, emoji, state or deadline', async function () {
      const block = await ethers.provider.getBlock('latest');
      const previousBlockTime = block.timestamp;

      const messages = await repository.bulkPrepareMessagesToPresignEmote(
        [await token.getAddress(), await token.getAddress()],
        [tokenId, tokenId],
        [emoji1, emoji2],
        [true, true],
        [9999999999n, 9999999999n],
      );

      const signature1 = await owner.signMessage(ethers.getBytes(messages[0]));
      const signature2 = await owner.signMessage(ethers.getBytes(messages[1]));

      const r1: string = signature1.substring(0, 66);
      const s1: string = '0x' + signature1.substring(66, 130);
      const v1: number = parseInt(signature1.substring(130, 132), 16);
      const r2: string = signature2.substring(0, 66);
      const s2: string = '0x' + signature2.substring(66, 130);
      const v2: number = parseInt(signature2.substring(130, 132), 16);

      await expect(
        repository.connect(addrs[0]).bulkPresignedEmote(
          [await owner.getAddress(), addrs[1].address], // different signer
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
          [9999999999n, 9999999999n],
          [v1, v2],
          [r1, r2],
          [s1, s2],
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).bulkPresignedEmote(
          [await owner.getAddress(), await owner.getAddress()],
          [await token.getAddress(), addrs[2].address], // different collection
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
          [9999999999n, 9999999999n],
          [v1, v2],
          [r1, r2],
          [s1, s2],
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).bulkPresignedEmote(
          [await owner.getAddress(), await owner.getAddress()],
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId + 1n], // different token
          [emoji1, emoji2],
          [true, true],
          [9999999999n, 9999999999n],
          [v1, v2],
          [r1, r2],
          [s1, s2],
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).bulkPresignedEmote(
          [await owner.getAddress(), await owner.getAddress()],
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, '😎'], // different emoji
          [true, true],
          [9999999999n, 9999999999n],
          [v1, v2],
          [r1, r2],
          [s1, s2],
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).bulkPresignedEmote(
          [await owner.getAddress(), await owner.getAddress()],
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, false], // different state
          [9999999999n, 9999999999n],
          [v1, v2],
          [r1, r2],
          [s1, s2],
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).bulkPresignedEmote(
          [await owner.getAddress(), await owner.getAddress()],
          [await token.getAddress(), await token.getAddress()],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
          [9999999999n, 99999999999999n], // different deadline
          [v1, v2],
          [r1, r2],
          [s1, s2],
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');
    });
  });
});
