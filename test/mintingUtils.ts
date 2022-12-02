import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { MintingUtilsMock } from "../typechain-types";

describe('Minting Utils', async () => {
  let mintingUtils: MintingUtilsMock;

  let owner: SignerWithAddress;

  async function deployMintingUtilsFixture() {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    const MINT = await ethers.getContractFactory('MintingUtilsMock');
    const mintingUtilsContract = <MintingUtilsMock> await MINT.deploy(10, 100);
    await mintingUtilsContract.deployed();

    return { mintingUtilsContract, signersOwner, signersAddr };
  }

  beforeEach(async function () {
    const { mintingUtilsContract, signersOwner } = await loadFixture(deployMintingUtilsFixture);
    owner = signersOwner;
    mintingUtils = mintingUtilsContract;
  });

  describe('Test', async function () {
    it('can get total supply, max supply and price', async function () {
      expect(await mintingUtils.totalSupply()).to.equal(0);
      expect(await mintingUtils.maxSupply()).to.equal(10);
      expect(await mintingUtils.pricePerMint()).to.equal(100);
    });
    it('fails if sale is not open', async function () {
      expect(await mintingUtils.testSaleIsOpen()).to.equal(true);
      await mintingUtils.connect(owner).setupTestSaleIsOpen();
      await expect(mintingUtils.connect(owner).testSaleIsOpen()).to.be.revertedWithCustomError(
        mintingUtils,
        'RMRKMintOverMax',
      );
    });
  });
});
