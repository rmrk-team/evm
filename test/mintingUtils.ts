import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { MintingUtilsMock } from '../typechain-types';
import { bn } from './utils';

const ONE_ETH = ethers.utils.parseEther('3.0');

describe('Minting Utils', async () => {
  let mintingUtils: MintingUtilsMock;

  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  async function deployMintingUtilsFixture() {
    const [signersOwner, ...signersAddrs] = await ethers.getSigners();
    const MINT = await ethers.getContractFactory('MintingUtilsMock');
    const mintingUtilsContract = <MintingUtilsMock>await MINT.deploy(10, 100);
    await mintingUtilsContract.deployed();

    return { mintingUtilsContract, signersOwner, signersAddrs };
  }

  beforeEach(async function () {
    const { mintingUtilsContract, signersOwner, signersAddrs } = await loadFixture(
      deployMintingUtilsFixture,
    );
    mintingUtils = mintingUtilsContract;
    owner = signersOwner;
    addrs = signersAddrs;
  });

  describe('MintingUtilsMock', async function () {
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

    it('can transfer ownership', async function () {
      const newOwner = addrs[1];
      await mintingUtils.connect(owner).transferOwnership(newOwner.address);
      expect(await mintingUtils.owner()).to.eql(newOwner.address);
    });

    it('emits OwnershipTransferred event when transferring ownership', async function () {
      const newOwner = addrs[1];
      await expect(mintingUtils.connect(owner).transferOwnership(newOwner.address))
        .to.emit(mintingUtils, 'OwnershipTransferred')
        .withArgs(owner.address, newOwner.address);
    });

    it('cannot transfer ownership to address 0', async function () {
      await expect(
        mintingUtils.connect(owner).transferOwnership(ethers.constants.AddressZero),
      ).to.be.revertedWithCustomError(mintingUtils, 'RMRKNewOwnerIsZeroAddress');
    });

    it('can renounce ownership', async function () {
      await mintingUtils.connect(owner).renounceOwnership();
      expect(await mintingUtils.owner()).to.eql(ethers.constants.AddressZero);
    });

    it('can add and revoke contributor', async function () {
      const contributor = addrs[1];
      await mintingUtils.connect(owner).addContributor(contributor.address);
      expect(await mintingUtils.connect(owner).isContributor(contributor.address)).to.eql(true);
      await mintingUtils.connect(owner).revokeContributor(contributor.address);
      expect(await mintingUtils.connect(owner).isContributor(contributor.address)).to.eql(false);
    });

    it('emits ContributorUpdate when adding a contributor', async function () {
      const contributor = addrs[1];
      await expect(mintingUtils.connect(owner).addContributor(contributor.address))
        .to.emit(mintingUtils, 'ContributorUpdate')
        .withArgs(contributor.address, true);
    });

    it('emits ContributorUpdate when removing a contributor', async function () {
      const contributor = addrs[1];
      await mintingUtils.connect(owner).addContributor(contributor.address);
      await expect(mintingUtils.connect(owner).revokeContributor(contributor.address))
        .to.emit(mintingUtils, 'ContributorUpdate')
        .withArgs(contributor.address, false);
    });

    it('cannot add zero address as contributor', async function () {
      await expect(
        mintingUtils.connect(owner).addContributor(ethers.constants.AddressZero),
      ).to.be.revertedWithCustomError(mintingUtils, 'RMRKNewContributorIsZeroAddress');
    });

    it('cannot do owner operations if not owner', async function () {
      const notOwner = addrs[1];
      const otherUser = addrs[2];
      await expect(
        mintingUtils.connect(notOwner).transferOwnership(otherUser.address),
      ).to.be.revertedWithCustomError(mintingUtils, 'RMRKNotOwner');
      await expect(
        mintingUtils.connect(notOwner).renounceOwnership(),
      ).to.be.revertedWithCustomError(mintingUtils, 'RMRKNotOwner');
      await expect(
        mintingUtils.connect(notOwner).addContributor(otherUser.address),
      ).to.be.revertedWithCustomError(mintingUtils, 'RMRKNotOwner');
      await expect(
        mintingUtils.connect(notOwner).revokeContributor(otherUser.address),
      ).to.be.revertedWithCustomError(mintingUtils, 'RMRKNotOwner');
    });

    it('freezes max supply when contract is locked', async function () {
      await mintingUtils.mockMint(5);
      await mintingUtils.setLock();
      expect(await mintingUtils.maxSupply()).to.eql(bn(5));
    });

    describe('With value raised', async function () {
      let beneficiary: SignerWithAddress;

      beforeEach(async function () {
        beneficiary = addrs[0];
        await mintingUtils.mockMint(5, { value: ONE_ETH.mul(3) });
        await mintingUtils.mockMint(10, { value: ONE_ETH.mul(6) });
      });

      it('can withdraw raised', async function () {
        const initBalance = await ethers.provider.getBalance(beneficiary.address);
        await mintingUtils.withdrawRaised(beneficiary.address, ONE_ETH.mul(9));
        const expectedBalance = initBalance.add(ONE_ETH.mul(9));
        expect(await ethers.provider.getBalance(beneficiary.address)).to.eql(expectedBalance);
      });

      it('cannot withdraw raised if not owner', async function () {
        await expect(
          mintingUtils.connect(beneficiary).withdrawRaised(beneficiary.address, ONE_ETH.mul(9)),
        ).to.be.revertedWithCustomError(mintingUtils, 'RMRKNotOwner');
      });
    });
  });
});
