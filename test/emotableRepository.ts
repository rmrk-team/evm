import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ERC721Mock, EmotableRepository } from '../typechain-types';
import { IERC6381, IERC165, IOtherInterface } from './interfaces';

function bn(x: number): BigNumber {
  return BigNumber.from(x);
}

async function tokenFixture() {
  const factory = await ethers.getContractFactory('ERC721Mock');
  const token = await factory.deploy('Chunky', 'CHNK');
  await token.deployed();

  return token;
}

async function emotableRepositoryFixture() {
  const factory = await ethers.getContractFactory('EmotableRepository');
  const repository = await factory.deploy();
  await repository.deployed();

  return repository;
}

describe('EmotableRepository', async function () {
  let token: ERC721Mock;
  let repository: EmotableRepository;
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const tokenId = bn(1);
  const emoji1 = '👨‍👩‍👧';
  const emoji2 = '😁';

  beforeEach(async function () {
    [owner, ...addrs] = await ethers.getSigners();
    token = await loadFixture(tokenFixture);
    repository = await loadFixture(emotableRepositoryFixture);
  });

  it('can support IERC6381', async function () {
    expect(await repository.supportsInterface(IERC6381)).to.equal(true);
  });

  it('can support IERC165', async function () {
    expect(await repository.supportsInterface(IERC165)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await repository.supportsInterface(IOtherInterface)).to.equal(false);
  });

  describe('With minted tokens', async function () {
    beforeEach(async function () {
      await token.mint(owner.address, tokenId);
    });

    it('can emote', async function () {
      await expect(repository.connect(addrs[0]).emote(token.address, tokenId, emoji1, true))
        .to.emit(repository, 'Emoted')
        .withArgs(addrs[0].address, token.address, tokenId.toNumber(), emoji1, true);
      expect(await repository.emoteCountOf(token.address, tokenId, emoji1)).to.equal(bn(1));
      expect(
        await repository.hasEmoterUsedEmote(addrs[0].address, token.address, tokenId, emoji1),
      ).to.equal(true);
    });

    it('can undo emote', async function () {
      await repository.emote(token.address, tokenId, emoji1, true);

      await expect(repository.emote(token.address, tokenId, emoji1, false))
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji1, false);
      expect(await repository.emoteCountOf(token.address, tokenId, emoji1)).to.equal(bn(0));
    });

    it('can be emoted from different accounts', async function () {
      await repository.connect(addrs[0]).emote(token.address, tokenId, emoji1, true);
      await repository.connect(addrs[1]).emote(token.address, tokenId, emoji1, true);
      await repository.connect(addrs[2]).emote(token.address, tokenId, emoji2, true);
      expect(await repository.emoteCountOf(token.address, tokenId, emoji1)).to.equal(bn(2));
      expect(await repository.emoteCountOf(token.address, tokenId, emoji2)).to.equal(bn(1));
    });

    it('can add multiple emojis to same NFT', async function () {
      await repository.emote(token.address, tokenId, emoji1, true);
      await repository.emote(token.address, tokenId, emoji2, true);
      expect(await repository.emoteCountOf(token.address, tokenId, emoji1)).to.equal(bn(1));
      expect(await repository.emoteCountOf(token.address, tokenId, emoji2)).to.equal(bn(1));
    });

    it('does nothing if new state is the same as old state', async function () {
      await repository.emote(token.address, tokenId, emoji1, true);
      await repository.emote(token.address, tokenId, emoji1, true);
      expect(await repository.emoteCountOf(token.address, tokenId, emoji1)).to.equal(bn(1));

      await repository.emote(token.address, tokenId, emoji2, false);
      expect(await repository.emoteCountOf(token.address, tokenId, emoji2)).to.equal(bn(0));
    });

    it('does nothing if new state is the same as old state on bulk emote', async function () {
      await repository.emote(token.address, tokenId, emoji1, true);
      await repository.bulkEmote(
        [token.address, token.address],
        [tokenId, tokenId],
        [emoji1, emoji2],
        [true, false],
      );
      expect(await repository.emoteCountOf(token.address, tokenId, emoji1)).to.equal(bn(1));
      expect(await repository.emoteCountOf(token.address, tokenId, emoji2)).to.equal(bn(0));
    });

    it('can bulk emote', async function () {
      expect(
        await repository.bulkEmoteCountOf(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([bn(0), bn(0)]);

      expect(
        await repository.haveEmotersUsedEmotes(
          [owner.address, owner.address],
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([false, false]);

      await expect(
        repository.bulkEmote(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
        ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji1, true)
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji2, true);

      expect(
        await repository.bulkEmoteCountOf(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([bn(1), bn(1)]);

      expect(
        await repository.haveEmotersUsedEmotes(
          [owner.address, owner.address],
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([true, true]);
    });

    it('can bulk undo emote', async function () {
      await expect(
        repository.bulkEmote(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
        ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji1, true)
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji2, true);

      expect(
        await repository.bulkEmoteCountOf(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([bn(1), bn(1)]);

      expect(
        await repository.haveEmotersUsedEmotes(
          [owner.address, owner.address],
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([true, true]);

      await expect(
        repository.bulkEmote(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [false, false],
        ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji1, false)
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji2, false);

      expect(
        await repository.bulkEmoteCountOf(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([bn(0), bn(0)]);

      expect(
        await repository.haveEmotersUsedEmotes(
          [owner.address, owner.address],
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([false, false]);
    });

    it('can bulk emote and unemote at the same time', async function () {
      await repository.emote(token.address, tokenId, emoji2, true);

      expect(
        await repository.bulkEmoteCountOf(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([bn(0), bn(1)]);

      expect(
        await repository.haveEmotersUsedEmotes(
          [owner.address, owner.address],
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([false, true]);

      await expect(
        repository.bulkEmote(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, false],
        ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji1, true)
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji2, false);

      expect(
        await repository.bulkEmoteCountOf(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([bn(1), bn(0)]);

      expect(
        await repository.haveEmotersUsedEmotes(
          [owner.address, owner.address],
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([true, false]);
    });

    it('can not bulk emote if passing arrays of different length', async function () {
      await expect(
        repository.bulkEmote(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkEmote([token.address], [tokenId, tokenId], [emoji1, emoji2], [true, true]),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkEmote(
          [token.address, token.address],
          [tokenId],
          [emoji1, emoji2],
          [true, true],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkEmote(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1],
          [true, true],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');
    });

    it('can not bulk presign if passing arrays of different length', async function () {
      await expect(
        repository.bulkPrepareMessagesToPresignEmote(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true],
          [bn(9999999999), bn(9999999999)],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkPrepareMessagesToPresignEmote(
          [token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
          [bn(9999999999), bn(9999999999)],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkPrepareMessagesToPresignEmote(
          [token.address, token.address],
          [tokenId],
          [emoji1, emoji2],
          [true, true],
          [bn(9999999999), bn(9999999999)],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkPrepareMessagesToPresignEmote(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1],
          [true, true],
          [bn(9999999999), bn(9999999999)],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkPrepareMessagesToPresignEmote(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
          [bn(9999999999)],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');
    });

    it('can not bulk get emote count if passing arrays of different length', async function () {
      await expect(
        repository.bulkEmoteCountOf([token.address], [tokenId, tokenId], [emoji1, emoji2]),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkEmoteCountOf([token.address, token.address], [tokenId], [emoji1, emoji2]),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.bulkEmoteCountOf([token.address, token.address], [tokenId, tokenId], [emoji1]),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');
    });

    it('can not bulk check for emotes if passing arrays of different length', async function () {
      await expect(
        repository.haveEmotersUsedEmotes(
          [addrs[0].address],
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.haveEmotersUsedEmotes(
          [addrs[0].address, addrs[1].address],
          [token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.haveEmotersUsedEmotes(
          [addrs[0].address, addrs[1].address],
          [token.address, token.address],
          [tokenId],
          [emoji1, emoji2],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository.haveEmotersUsedEmotes(
          [addrs[0].address, addrs[1].address],
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1],
        ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');
    });

    it('can use presigned emote to react to token', async function () {
      const message = await repository.prepareMessageToPresignEmote(
        token.address,
        tokenId,
        emoji1,
        true,
        bn(9999999999),
      );

      const signature = await owner.signMessage(ethers.utils.arrayify(message));

      const r: string = signature.substring(0, 66);
      const s: string = '0x' + signature.substring(66, 130);
      const v: number = parseInt(signature.substring(130, 132), 16);

      await expect(
        repository
          .connect(addrs[0])
          .presignedEmote(
            owner.address,
            token.address,
            tokenId,
            emoji1,
            true,
            bn(9999999999),
            v,
            r,
            s,
          ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji1, true);
    });

    it('does nothing if new state is the same as old state on presigned emote', async function () {
      repository.connect(owner).emote(token.address, tokenId, emoji1, true);
      const message = await repository.prepareMessageToPresignEmote(
        token.address,
        tokenId,
        emoji1,
        true,
        bn(9999999999),
      );

      const signature = await owner.signMessage(ethers.utils.arrayify(message));

      const r: string = signature.substring(0, 66);
      const s: string = '0x' + signature.substring(66, 130);
      const v: number = parseInt(signature.substring(130, 132), 16);

      await repository
        .connect(addrs[0])
        .presignedEmote(
          owner.address,
          token.address,
          tokenId,
          emoji1,
          true,
          bn(9999999999),
          v,
          r,
          s,
        );
      expect(await repository.emoteCountOf(token.address, tokenId, emoji1)).to.equal(bn(1));
    });

    it('can use presigned emote to undo reaction to token', async function () {
      repository.connect(owner).emote(token.address, tokenId, emoji1, true);
      const message = await repository.prepareMessageToPresignEmote(
        token.address,
        tokenId,
        emoji1,
        false,
        bn(9999999999),
      );

      const signature = await owner.signMessage(ethers.utils.arrayify(message));

      const r: string = signature.substring(0, 66);
      const s: string = '0x' + signature.substring(66, 130);
      const v: number = parseInt(signature.substring(130, 132), 16);

      await expect(
        repository
          .connect(addrs[0])
          .presignedEmote(
            owner.address,
            token.address,
            tokenId,
            emoji1,
            false,
            bn(9999999999),
            v,
            r,
            s,
          ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji1, false);
    });

    it('cannot use expired presigned to emote', async function () {
      const block = await ethers.provider.getBlock('latest');
      const previousBlockTime = block.timestamp;
      const message = await repository.prepareMessageToPresignEmote(
        token.address,
        tokenId,
        emoji1,
        true,
        previousBlockTime,
      );

      const signature = await owner.signMessage(ethers.utils.arrayify(message));

      const r: string = signature.substring(0, 66);
      const s: string = '0x' + signature.substring(66, 130);
      const v: number = parseInt(signature.substring(130, 132), 16);

      await expect(
        repository
          .connect(addrs[0])
          .presignedEmote(
            owner.address,
            token.address,
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
        token.address,
        tokenId,
        emoji1,
        true,
        bn(9999999999),
      );

      const signature = await owner.signMessage(ethers.utils.arrayify(message));

      const r: string = signature.substring(0, 66);
      const s: string = '0x' + signature.substring(66, 130);
      const v: number = parseInt(signature.substring(130, 132), 16);

      await expect(
        repository.connect(addrs[0]).presignedEmote(
          addrs[2].address, // different signer
          token.address,
          tokenId,
          emoji1,
          true,
          bn(9999999999),
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).presignedEmote(
          owner.address,
          addrs[2].address, // different collection
          tokenId,
          emoji1,
          true,
          bn(9999999999),
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).presignedEmote(
          owner.address,
          token.address,
          tokenId.add(1), // different token
          emoji1,
          true,
          bn(9999999999),
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).presignedEmote(
          owner.address,
          token.address,
          tokenId,
          emoji2, // different emoji
          true,
          bn(9999999999),
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).presignedEmote(
          owner.address,
          token.address,
          tokenId,
          emoji1,
          false, // different state
          bn(9999999999),
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).presignedEmote(
          owner.address,
          token.address,
          tokenId,
          emoji1,
          true,
          bn(10000000000), // different deadline
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');
    });

    it('can use presigned emotes to bulk react to token', async function () {
      const messages = await repository.bulkPrepareMessagesToPresignEmote(
        [token.address, token.address],
        [tokenId, tokenId],
        [emoji1, emoji2],
        [true, true],
        [bn(9999999999), bn(9999999999)],
      );

      const signature1 = await owner.signMessage(ethers.utils.arrayify(messages[0]));
      const signature2 = await owner.signMessage(ethers.utils.arrayify(messages[1]));

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
            [owner.address, owner.address],
            [token.address, token.address],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [bn(9999999999), bn(9999999999)],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji1, true)
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji2, true);
    });

    it('can use presigned emotes to undo reaction to token', async function () {
      repository.connect(owner).emote(token.address, tokenId, emoji1, true);
      repository.connect(owner).emote(token.address, tokenId, emoji2, true);

      const messages = await repository.bulkPrepareMessagesToPresignEmote(
        [token.address, token.address],
        [tokenId, tokenId],
        [emoji1, emoji2],
        [false, false],
        [bn(9999999999), bn(9999999999)],
      );

      const signature1 = await owner.signMessage(ethers.utils.arrayify(messages[0]));
      const signature2 = await owner.signMessage(ethers.utils.arrayify(messages[1]));

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
            [owner.address, owner.address],
            [token.address, token.address],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [false, false],
            [bn(9999999999), bn(9999999999)],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      )
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji1, false)
        .to.emit(repository, 'Emoted')
        .withArgs(owner.address, token.address, tokenId.toNumber(), emoji2, false);
    });

    it('does nothing if new state is the same as old state on bulk presigned emote', async function () {
      repository.connect(owner).emote(token.address, tokenId, emoji1, true);

      const messages = await repository.bulkPrepareMessagesToPresignEmote(
        [token.address, token.address],
        [tokenId, tokenId],
        [emoji1, emoji2],
        [true, false],
        [bn(9999999999), bn(9999999999)],
      );

      const signature1 = await owner.signMessage(ethers.utils.arrayify(messages[0]));
      const signature2 = await owner.signMessage(ethers.utils.arrayify(messages[1]));

      const r1: string = signature1.substring(0, 66);
      const s1: string = '0x' + signature1.substring(66, 130);
      const v1: number = parseInt(signature1.substring(130, 132), 16);
      const r2: string = signature2.substring(0, 66);
      const s2: string = '0x' + signature2.substring(66, 130);
      const v2: number = parseInt(signature2.substring(130, 132), 16);

      await repository
        .connect(addrs[0])
        .bulkPresignedEmote(
          [owner.address, owner.address],
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, false],
          [bn(9999999999), bn(9999999999)],
          [v1, v2],
          [r1, r2],
          [s1, s2],
        );
      expect(
        await repository.bulkEmoteCountOf(
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
        ),
      ).to.eql([bn(1), bn(0)]);
    });

    it('can use bulk presigned emotes if passing arrays of different length', async function () {
      const messages = await repository.bulkPrepareMessagesToPresignEmote(
        [token.address, token.address],
        [tokenId, tokenId],
        [emoji1, emoji2],
        [true, true],
        [bn(9999999999), bn(9999999999)],
      );

      const signature1 = await owner.signMessage(ethers.utils.arrayify(messages[0]));
      const signature2 = await owner.signMessage(ethers.utils.arrayify(messages[1]));

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
            [owner.address],
            [token.address, token.address],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [bn(9999999999), bn(9999999999)],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [owner.address, owner.address],
            [token.address],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [bn(9999999999), bn(9999999999)],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [owner.address, owner.address],
            [token.address, token.address],
            [tokenId],
            [emoji1, emoji2],
            [true, true],
            [bn(9999999999), bn(9999999999)],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [owner.address, owner.address],
            [token.address, token.address],
            [tokenId, tokenId],
            [emoji1],
            [true, true],
            [bn(9999999999), bn(9999999999)],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [owner.address, owner.address],
            [token.address, token.address],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true],
            [bn(9999999999), bn(9999999999)],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [owner.address, owner.address],
            [token.address, token.address],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [bn(9999999999)],
            [v1, v2],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [owner.address, owner.address],
            [token.address, token.address],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [bn(9999999999), bn(9999999999)],
            [v1],
            [r1, r2],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [owner.address, owner.address],
            [token.address, token.address],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [bn(9999999999), bn(9999999999)],
            [v1, v2],
            [r1],
            [s1, s2],
          ),
      ).to.be.revertedWithCustomError(repository, 'BulkParametersOfUnequalLength');

      await expect(
        repository
          .connect(addrs[0])
          .bulkPresignedEmote(
            [owner.address, owner.address],
            [token.address, token.address],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [bn(9999999999), bn(9999999999)],
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
        [token.address, token.address],
        [tokenId, tokenId],
        [emoji1, emoji2],
        [true, true],
        [bn(9999999999), previousBlockTime],
      );

      const signature1 = await owner.signMessage(ethers.utils.arrayify(messages[0]));
      const signature2 = await owner.signMessage(ethers.utils.arrayify(messages[1]));

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
            [owner.address, owner.address],
            [token.address, token.address],
            [tokenId, tokenId],
            [emoji1, emoji2],
            [true, true],
            [bn(9999999999), previousBlockTime],
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
        [token.address, token.address],
        [tokenId, tokenId],
        [emoji1, emoji2],
        [true, true],
        [bn(9999999999), bn(9999999999)],
      );

      const signature1 = await owner.signMessage(ethers.utils.arrayify(messages[0]));
      const signature2 = await owner.signMessage(ethers.utils.arrayify(messages[1]));

      const r1: string = signature1.substring(0, 66);
      const s1: string = '0x' + signature1.substring(66, 130);
      const v1: number = parseInt(signature1.substring(130, 132), 16);
      const r2: string = signature2.substring(0, 66);
      const s2: string = '0x' + signature2.substring(66, 130);
      const v2: number = parseInt(signature2.substring(130, 132), 16);

      await expect(
        repository.connect(addrs[0]).bulkPresignedEmote(
          [owner.address, addrs[1].address], // different signer
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
          [bn(9999999999), bn(9999999999)],
          [v1, v2],
          [r1, r2],
          [s1, s2],
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).bulkPresignedEmote(
          [owner.address, owner.address],
          [token.address, addrs[2].address], // different collection
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
          [bn(9999999999), bn(9999999999)],
          [v1, v2],
          [r1, r2],
          [s1, s2],
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).bulkPresignedEmote(
          [owner.address, owner.address],
          [token.address, token.address],
          [tokenId, tokenId.add(1)], // different token
          [emoji1, emoji2],
          [true, true],
          [bn(9999999999), bn(9999999999)],
          [v1, v2],
          [r1, r2],
          [s1, s2],
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).bulkPresignedEmote(
          [owner.address, owner.address],
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, '😎'], // different emoji
          [true, true],
          [bn(9999999999), bn(9999999999)],
          [v1, v2],
          [r1, r2],
          [s1, s2],
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).bulkPresignedEmote(
          [owner.address, owner.address],
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, false], // different state
          [bn(9999999999), bn(9999999999)],
          [v1, v2],
          [r1, r2],
          [s1, s2],
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');

      await expect(
        repository.connect(addrs[0]).bulkPresignedEmote(
          [owner.address, owner.address],
          [token.address, token.address],
          [tokenId, tokenId],
          [emoji1, emoji2],
          [true, true],
          [bn(9999999999), bn(99999999999999)], // different deadline
          [v1, v2],
          [r1, r2],
          [s1, s2],
        ),
      ).to.be.revertedWithCustomError(repository, 'InvalidSignature');
    });
  });
});
