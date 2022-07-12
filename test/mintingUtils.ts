import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';

describe('Nesting', async () => {
  let mintingUtils: Contract;

  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const MINT = await ethers.getContractFactory('MintingUtilsMock');
    mintingUtils = await MINT.deploy(10, 100);
    await mintingUtils.deployed();
  });

  describe('Test', async function () {
    it('Test getters', async function () {
      expect(await mintingUtils.totalSupply()).to.equal(0);
      expect(await mintingUtils.maxSupply()).to.equal(10);
      expect(await mintingUtils.pricePerMint()).to.equal(100);
    });
    it('Test saleIsOpen', async function () {
      expect(await mintingUtils.testSaleIsOpen()).to.equal(true);
      await mintingUtils.connect(owner).setupTestSaleIsOpen();
      await expect(mintingUtils.connect(owner).testSaleIsOpen()).to.be.revertedWithCustomError(
        mintingUtils,
        'RMRKMintOverMax',
      );
    });
  });
});
