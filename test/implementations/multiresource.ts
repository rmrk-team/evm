import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { addResourceToToken } from '../utils';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import shouldBehaveLikeOwnableLock from '../behavior/ownableLock';
import shouldBehaveLikeMultiResource from '../behavior/multiresource';
import { mintFromImpl, addResourceEntryFromImpl, ONE_ETH } from '../utils';

async function deployTokenFixture() {
  const Token = await ethers.getContractFactory('RMRKMultiResourceImpl');
  const token = await Token.deploy('MultiResource', 'MR', 10000, ONE_ETH);
  await token.deployed();
  return { token };
}

describe('MultiResourceImpl', async () => {
  let token: Contract;

  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const defaultResource1 = 'default1.ipfs';
  const defaultResource2 = 'default2.ipfs';

  const isOwnableLockMock = false;

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;
  });

  describe('Deployment', async function () {
    beforeEach(async function () {
      ({ token } = await loadFixture(deployTokenFixture));
      this.token = token;
    });

    it('can support IERC721', async function () {
      expect(await token.supportsInterface('0x80ac58cd')).to.equal(true);
    });

    shouldBehaveLikeOwnableLock(isOwnableLockMock);

    it('Can mint tokens through sale logic', async function () {
      await mintFromImpl(token, owner.address);
      expect(await token.ownerOf(1)).to.equal(owner.address);
      expect(await token.totalSupply()).to.equal(1);
      expect(await token.balanceOf(owner.address)).to.equal(1);

      await expect(
        token.connect(owner).mint(owner.address, 1, { value: ONE_ETH.div(2) }),
      ).to.be.revertedWithCustomError(token, 'RMRKMintUnderpriced');
      await expect(
        token.connect(owner).mint(owner.address, 1, { value: 0 }),
      ).to.be.revertedWithCustomError(token, 'RMRKMintUnderpriced');
    });

    it('Can mint multiple tokens through sale logic', async function () {
      await token.connect(owner).mint(owner.address, 10, { value: ONE_ETH.mul(10) });
      expect(await token.totalSupply()).to.equal(10);
      expect(await token.balanceOf(owner.address)).to.equal(10);
      await expect(
        token.connect(owner).mint(owner.address, 1, { value: ONE_ETH.div(2) }),
      ).to.be.revertedWithCustomError(token, 'RMRKMintUnderpriced');
      await expect(
        token.connect(owner).mint(owner.address, 1, { value: 0 }),
      ).to.be.revertedWithCustomError(token, 'RMRKMintUnderpriced');
    });

    it('Can autoincrement resources', async function () {
      await token.connect(owner).addResourceEntry(defaultResource1, []);
      await token.connect(owner).addResourceEntry(defaultResource2, []);

      expect(await token.getResource(1)).to.eql([ethers.BigNumber.from(1), defaultResource1]);
      expect(await token.getResource(2)).to.eql([ethers.BigNumber.from(2), defaultResource2]);
    });

    describe('token URI', async function () {
      it('can set fallback URI', async function () {
        await token.setFallbackURI('TestURI');
        expect(await token.getFallbackURI()).to.be.eql('TestURI');
      });

      it('cannot set fallback URI if not owner', async function () {
        const newFallbackURI = 'NewFallbackURI';
        await expect(token.connect(addrs[0]).setFallbackURI(newFallbackURI)).to.be.revertedWith(
          'Ownable: caller is not the owner',
        );
      });

      it('return empty string by default', async function () {
        const tokenId = await mintFromImpl(token, owner.address);
        expect(await token.tokenURI(tokenId)).to.be.equal('');
      });

      it('gets fallback URI if no active resources on token', async function () {
        const fallBackUri = 'fallback404';
        const tokenId = await mintFromImpl(token, owner.address);

        await token.setFallbackURI(fallBackUri);
        expect(await token.tokenURI(tokenId)).to.eql(fallBackUri);
      });

      it('can get token URI when resource is not enumerated', async function () {
        const resId = await addResourceEntryFromImpl(token, 'uri1');
        const resId2 = await addResourceEntryFromImpl(token, 'uri2');
        const tokenId = await mintFromImpl(token, owner.address);

        await token.addResourceToToken(tokenId, resId, 0);
        await token.addResourceToToken(tokenId, resId2, 0);
        await token.acceptResource(tokenId, 0);
        await token.acceptResource(tokenId, 0);
        expect(await token.tokenURI(tokenId)).to.eql('uri1');
      });

      it('can get token URI when resource is enumerated', async function () {
        const resId = await addResourceEntryFromImpl(token, 'uri1');
        const resId2 = await addResourceEntryFromImpl(token, 'uri2');
        const tokenId = await mintFromImpl(token, owner.address);

        await token.addResourceToToken(tokenId, resId, 0);
        await token.addResourceToToken(tokenId, resId2, 0);
        await token.acceptResource(tokenId, 0);
        await token.acceptResource(tokenId, 0);
        await token.setTokenEnumeratedResource(resId, true);
        expect(await token.isTokenEnumeratedResource(resId)).to.eql(true);
        expect(await token.tokenURI(tokenId)).to.eql(`uri1${tokenId}`);
      });
    });
  });
});

// --------------- MULTI RESOURCE BEHAVIOR -----------------------

describe('MultiResourceImpl MR behavior', async () => {
  beforeEach(async function () {
    const { token } = await loadFixture(deployTokenFixture);
    this.token = token;
  });

  shouldBehaveLikeMultiResource(mintFromImpl, addResourceEntryFromImpl, addResourceToToken);
});

// --------------- MULTI RESOURCE BEHAVIOR END ------------------------
