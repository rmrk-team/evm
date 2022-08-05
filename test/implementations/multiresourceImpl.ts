import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import shouldBehaveLikeOwnableLock from '../behavior/ownableLock';
import {
  shouldHandleAcceptsForResources,
  shouldHandleApprovalsForResources,
  shouldHandleOverwritesForResources,
  shouldHandleRejectsForResources,
  shouldHandleSetPriorities,
  shouldSupportInterfacesForResources,
} from '../behavior/multiresource';

const ONE_ETH = ethers.utils.parseEther('1.0');

describe('MultiResourceImpl', async () => {
  let token: Contract;

  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const name = 'RmrkTest';
  const symbol = 'RMRKTST';

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
      const { token } = await loadFixture(deployMultiResourceFixture);
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
      await this.token.connect(owner).mint(owner.address, 1, { value: ONE_ETH });
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

  async function deployMultiResourceFixture() {
    const Token = await ethers.getContractFactory('RMRKMultiResourceImpl');
    token = await Token.deploy(name, symbol, 10000, ONE_ETH);
    await token.deployed();
    return { token };
  }
});

// --------------- MULTI RESOURCE BEHAVIOR -----------------------

async function deployTokenFixture() {
  const Token = await ethers.getContractFactory('RMRKMultiResourceImpl');
  const token = await Token.deploy('MultiResource', 'MR', 10000, ONE_ETH);
  await token.deployed();
  return { token };
}

async function addResourceEntry(token: Contract, data?: string): Promise<BigNumber> {
  await token.addResourceEntry(data !== undefined ? data : 'metaURI');
  return await token.totalResources();
}

async function addResourceToToken(
  token: Contract,
  tokenId: number,
  resId: BigNumber,
  overwrites: BigNumber | number,
): Promise<void> {
  await token.addResourceToToken(tokenId, resId, overwrites);
}

describe('MultiResourceImpl MR behavior with minted token', async () => {
  const tokenId = 1;

  beforeEach(async function () {
    const tokenOwner = (await ethers.getSigners())[1];
    const { token } = await loadFixture(deployTokenFixture);
    await token.mint(tokenOwner.address, 1, { value: ONE_ETH });
    this.token = token;
  });

  shouldSupportInterfacesForResources();
  shouldHandleApprovalsForResources(tokenId);
  shouldHandleOverwritesForResources(tokenId, addResourceEntry, addResourceToToken);
});

describe('MultiResourceImpl MR behavior with minted token and pending resources', async () => {
  const tokenId = 1;
  const resId1 = BigNumber.from(1);
  const resData1 = 'data1';
  const resId2 = BigNumber.from(2);
  const resData2 = 'data2';

  beforeEach(async function () {
    const tokenOwner = (await ethers.getSigners())[1];
    const { token } = await loadFixture(deployTokenFixture);

    // Mint and add 2 resources to token
    await token.mint(tokenOwner.address, 1, { value: ONE_ETH });
    await token.addResourceEntry(resData1);
    await token.addResourceEntry(resData2);
    await token.addResourceToToken(tokenId, resId1, 0);
    await token.addResourceToToken(tokenId, resId2, 0);

    this.token = token;
  });

  shouldHandleAcceptsForResources(tokenId, resId1, resData1, resId2, resData2);
  shouldHandleRejectsForResources(tokenId, resId1, resData1, resId2, resData2);
  shouldHandleSetPriorities(tokenId);
});

// --------------- MULTI RESOURCE BEHAVIOR END ------------------------
