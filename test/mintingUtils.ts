import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('Nesting', async () => {
  let mintingUtils: Contract;

  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  async function deployMintingUtilsFixture() {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    const MINT = await ethers.getContractFactory('MintingUtilsMock');
    const mintingUtilsContract = await MINT.deploy(10, 100);
    await mintingUtilsContract.deployed();

    return { mintingUtilsContract, signersOwner, signersAddr };
  }

  beforeEach(async function () {
    const { mintingUtilsContract, signersOwner, signersAddr } = await loadFixture(
      deployMintingUtilsFixture,
    );
    owner = signersOwner;
    addrs = signersAddr;
    mintingUtils = mintingUtilsContract;
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
