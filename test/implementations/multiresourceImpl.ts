import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumberish, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import shouldBehaveLikeOwnableLock from '../behavior/ownableLock';

describe.only('MultiResource', async () => {
  let token: Contract;

  let owner: SignerWithAddress;
  let addrs: any[];

  const name = 'RmrkTest';
  const symbol = 'RMRKTST';

  const ONE_ETH = ethers.utils.parseEther('1.0');

  const isOwnableLockMock = false;

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;
  });

  // shouldBehaveLikeOwnableLock(isOwnableLockMock);
  
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