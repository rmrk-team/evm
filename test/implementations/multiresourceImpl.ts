import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumberish, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import shouldBehaveLikeOwnableLock from '../behavior/ownableLock';

describe('MultiResource', async () => {
  let token: Contract;

  let owner: SignerWithAddress;
  let addrs: any[];

  const name = 'RmrkTest';
  const symbol = 'RMRKTST';

  const defaultResource1 = 'default1.ipfs'
  const defaultResource2 = 'default2.ipfs'

  const ONE_ETH = ethers.utils.parseEther('1.0');

  const isOwnableLockMock = false;

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;
  });
  
  describe('Deployment', async function () {
    beforeEach(async function () {
      token = await deployMultiresource(
        name,
        symbol,
        10000,
        ONE_ETH,
      )
      this.token = token;
    });

    shouldBehaveLikeOwnableLock(isOwnableLockMock);

    it('Set fallback URI', async function () {
      const newFallbackURI = "NewFallbackURI";
      await this.token.connect(owner).setFallbackURI(newFallbackURI);
      expect(await this.token.getFallbackURI()).to.equal(newFallbackURI)
      await expect(this.token.connect(addrs[0]).setFallbackURI(newFallbackURI)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
    it('Can mint tokens through sale logic', async function () {
      await this.token.connect(owner).mint(owner.address, 1, {value: ONE_ETH});
      expect(await this.token.ownerOf(1)).to.equal(owner.address);
      expect(await this.token.totalSupply()).to.equal(1);
      expect(await this.token.balanceOf(owner.address)).to.equal(1);

      await expect(this.token.connect(owner).mint(owner.address, 1, {value: ONE_ETH.div(2)})).to.be.revertedWithCustomError(
        this.token,
        "RMRKMintUnderpriced"
      );
      await expect(this.token.connect(owner).mint(owner.address, 1, {value: 0})).to.be.revertedWithCustomError(
        this.token,
        "RMRKMintUnderpriced"
      );
    })

    it('Can mint multiple tokens through sale logic', async function () {
      await this.token.connect(owner).mint(owner.address, 10, {value: ONE_ETH.mul(10)});
      expect(await this.token.totalSupply()).to.equal(10);
      expect(await this.token.balanceOf(owner.address)).to.equal(10);
      await expect(this.token.connect(owner).mint(owner.address, 1, {value: ONE_ETH.div(2)})).to.be.revertedWithCustomError(
        this.token,
        "RMRKMintUnderpriced"
      );
      await expect(this.token.connect(owner).mint(owner.address, 1, {value: 0})).to.be.revertedWithCustomError(
        this.token,
        "RMRKMintUnderpriced"
      );
    })

    it('Can autoincrement resources', async function () {
      await this.token.connect(owner).addResourceEntry(defaultResource1, []);
      await this.token.connect(owner).addResourceEntry(defaultResource2, []);

      expect(await this.token.getResource(1)).to.eql([
        ethers.BigNumber.from(1),
        defaultResource1,
        []
      ]);
      expect(await this.token.getResource(2)).to.eql([
        ethers.BigNumber.from(2),
        defaultResource2,
        []
      ]);
    })
    
  });

  async function deployMultiresource(
    this: any,
    name: string,
    symbol: string,
    maxSupply: BigNumberish,
    pricePerMint: BigNumberish
    ) {
      const Token = await ethers.getContractFactory('RMRKMultiResourceImpl');
      token = await Token.deploy(
        name, 
        symbol,
        maxSupply,
        pricePerMint
      );
      await token.deployed();
      return token;
  }

});