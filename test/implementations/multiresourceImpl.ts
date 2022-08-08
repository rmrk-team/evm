import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { addResourceToToken } from '../utils';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import shouldBehaveLikeOwnableLock from '../behavior/ownableLock';
import shouldBehaveLikeMultiResource from '../behavior/multiresource';

const ONE_ETH = ethers.utils.parseEther('1.0');

async function deployTokenFixture() {
  const Token = await ethers.getContractFactory('RMRKMultiResourceImpl');
  const token = await Token.deploy('MultiResource', 'MR', 10000, ONE_ETH);
  await token.deployed();
  return { token };
}

async function mint(token: Contract, to: string): Promise<number> {
  await token.mint(to, 1, { value: ONE_ETH });
  return await token.totalSupply();
}

async function addResourceEntry(token: Contract, data?: string): Promise<BigNumber> {
  await token.addResourceEntry(data !== undefined ? data : 'metaURI');
  return await token.totalResources();
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

    it('Set fallback URI', async function () {
      const newFallbackURI = 'NewFallbackURI';
      await this.token.connect(owner).setFallbackURI(newFallbackURI);
      expect(await this.token.getFallbackURI()).to.equal(newFallbackURI);
      await expect(this.token.connect(addrs[0]).setFallbackURI(newFallbackURI)).to.be.revertedWith(
        'Ownable: caller is not the owner',
      );
    });
    it('Can mint tokens through sale logic', async function () {
      await mint(this.token, owner.address);
      expect(await this.token.ownerOf(1)).to.equal(owner.address);
      expect(await this.token.totalSupply()).to.equal(1);
      expect(await this.token.balanceOf(owner.address)).to.equal(1);

      await expect(
        this.token.connect(owner).mint(owner.address, 1, { value: ONE_ETH.div(2) }),
      ).to.be.revertedWithCustomError(this.token, 'RMRKMintUnderpriced');
      await expect(
        this.token.connect(owner).mint(owner.address, 1, { value: 0 }),
      ).to.be.revertedWithCustomError(this.token, 'RMRKMintUnderpriced');
    });

    it('Can mint multiple tokens through sale logic', async function () {
      await this.token.connect(owner).mint(owner.address, 10, { value: ONE_ETH.mul(10) });
      expect(await this.token.totalSupply()).to.equal(10);
      expect(await this.token.balanceOf(owner.address)).to.equal(10);
      await expect(
        this.token.connect(owner).mint(owner.address, 1, { value: ONE_ETH.div(2) }),
      ).to.be.revertedWithCustomError(this.token, 'RMRKMintUnderpriced');
      await expect(
        this.token.connect(owner).mint(owner.address, 1, { value: 0 }),
      ).to.be.revertedWithCustomError(this.token, 'RMRKMintUnderpriced');
    });

    it('Can autoincrement resources', async function () {
      await this.token.connect(owner).addResourceEntry(defaultResource1, []);
      await this.token.connect(owner).addResourceEntry(defaultResource2, []);

      expect(await this.token.getResource(1)).to.eql([ethers.BigNumber.from(1), defaultResource1]);
      expect(await this.token.getResource(2)).to.eql([ethers.BigNumber.from(2), defaultResource2]);
    });
  });
});

// --------------- MULTI RESOURCE BEHAVIOR -----------------------

describe('MultiResourceImpl MR behavior', async () => {
  beforeEach(async function () {
    const { token } = await loadFixture(deployTokenFixture);
    this.token = token;
  });

  shouldBehaveLikeMultiResource(mint, addResourceEntry, addResourceToToken);
});

// --------------- MULTI RESOURCE BEHAVIOR END ------------------------
