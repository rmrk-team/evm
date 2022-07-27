import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import shouldBehaveLikeMultiResource from './behavior/multiresource';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('MultiResource', async () => {
  let token: Contract;

  let owner: SignerWithAddress;
  let addrs: any[];

  const name = 'RmrkTest';
  const symbol = 'RMRKTST';

  async function deployRmrkMultiResourceMock() {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    const Token = await ethers.getContractFactory('RMRKMultiResourceMock');
    token = await Token.deploy(name, symbol);
    await token.deployed();
    return { token, signersOwner, signersAddr };
  }

  beforeEach(async function () {
    const { token, signersOwner, signersAddr } = await loadFixture(deployRmrkMultiResourceMock);
    owner = signersOwner;
    addrs = signersAddr;
    this.token = token;
  });

  describe('Issuer', async function () {
    it('can set and get issuer', async function () {
      const newIssuerAddr = addrs[1].address;
      expect(await this.token.getIssuer()).to.equal(owner.address);

      await this.token.setIssuer(newIssuerAddr);
      expect(await this.token.getIssuer()).to.equal(newIssuerAddr);
    });

    it('cannot set issuer if not issuer', async function () {
      const newIssuer = addrs[1];
      await expect(
        this.token.connect(newIssuer).setIssuer(newIssuer.address),
      ).to.be.revertedWithCustomError(this.token, 'RMRKOnlyIssuer');
    });
  });

  shouldBehaveLikeMultiResource(name, symbol);
});
