import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { RMRKRoyaltiesSplitter } from '../typechain-types';

describe('RMRKRoyaltiesSplitter', () => {
  let royaltiesSplitter: RMRKRoyaltiesSplitter;
  let sender: SignerWithAddress;
  let beneficiary1: SignerWithAddress;
  let beneficiary2: SignerWithAddress;
  let beneficiary3: SignerWithAddress;

  let beneficiaries: SignerWithAddress[];

  const SHARES_BPS = [2500, 2500, 5000]; // 50% for each beneficiary

  beforeEach(async () => {
    [sender, beneficiary1, beneficiary2, beneficiary3] = await ethers.getSigners();
    beneficiaries = [beneficiary1, beneficiary2, beneficiary3];

    const royaltiesSplitterFactory = await ethers.getContractFactory('RMRKRoyaltiesSplitter');
    royaltiesSplitter = await royaltiesSplitterFactory.deploy(
      beneficiaries.map(async (b) => await b.getAddress()),
      SHARES_BPS,
    );
    await royaltiesSplitter.waitForDeployment();
  });

  it('can get beneficiaries and shares', async () => {
    const beneficiariesAddresses = await Promise.all(
      beneficiaries.map(async (b) => await b.getAddress()),
    );
    expect(await royaltiesSplitter.getBenefiariesAndShares()).to.deep.equal([
      beneficiariesAddresses,
      SHARES_BPS,
    ]);
  });

  it('should distribute native payment correctly', async () => {
    const amount = ethers.parseEther('1');
    await expect(async () =>
      sender.sendTransaction({ to: await royaltiesSplitter.getAddress(), value: amount }),
    ).to.changeEtherBalances(
      [beneficiary1, beneficiary2, beneficiary3],
      [(amount * 2500n) / 10000n, (amount * 2500n) / 10000n, (amount * 5000n) / 10000n],
    );
  });

  it('should emit event on payments distributed', async () => {
    const amount = ethers.parseEther('1');
    expect(
      await sender.sendTransaction({ to: await royaltiesSplitter.getAddress(), value: amount }),
    )
      .to.emit(royaltiesSplitter, 'NativePaymentDistributed')
      .withArgs(sender.address, amount);
  });

  it('should distribute ERC20 payment correctly', async () => {
    const erc20MockFactory = await ethers.getContractFactory('ERC20Mock');
    const erc20Token = await erc20MockFactory.deploy();
    await erc20Token.waitForDeployment();

    const amount = ethers.parseUnits('100', 18);
    await erc20Token.mint(await sender.getAddress(), amount);
    await erc20Token.connect(sender).transfer(await royaltiesSplitter.getAddress(), amount);

    expect(
      await royaltiesSplitter
        .connect(beneficiary2)
        .distributeERC20(await erc20Token.getAddress(), amount),
    )
      .to.emit(royaltiesSplitter, 'ERCPaymentDistributed')
      .withArgs(await sender.getAddress(), await erc20Token.getAddress(), amount);
    expect(await erc20Token.balanceOf(await beneficiary1.getAddress())).to.equal(
      (amount * 2500n) / 10000n,
    );
    expect(await erc20Token.balanceOf(await beneficiary2.getAddress())).to.equal(
      (amount * 2500n) / 10000n,
    );
    expect(await erc20Token.balanceOf(await beneficiary3.getAddress())).to.equal(
      (amount * 5000n) / 10000n,
    );
  });

  it('cannot distribute ERC20 if not beneficary', async () => {
    const erc20MockFactory = await ethers.getContractFactory('ERC20Mock');
    const erc20Token = await erc20MockFactory.deploy();
    await erc20Token.waitForDeployment();

    const amount = ethers.parseUnits('100', 18);
    await erc20Token.mint(await sender.getAddress(), amount);
    await erc20Token.connect(sender).transfer(await royaltiesSplitter.getAddress(), amount);

    await expect(
      royaltiesSplitter.connect(sender).distributeERC20(await erc20Token.getAddress(), amount),
    ).to.be.revertedWithCustomError(royaltiesSplitter, 'OnlyBeneficiary');
  });

  it('cannot create with invalid configuration', async () => {
    const royaltiesSplitterFactory = await ethers.getContractFactory('RMRKRoyaltiesSplitter');
    // Missmatch in length
    await expect(
      royaltiesSplitterFactory.deploy(
        beneficiaries.map(async (b) => await b.getAddress()),
        SHARES_BPS.slice(0, 2),
      ),
    ).to.be.reverted;
    // Missmatch in length
    await expect(
      royaltiesSplitterFactory.deploy(
        beneficiaries.slice(0, 2).map(async (b) => await b.getAddress()),
        SHARES_BPS,
      ),
    ).to.be.reverted;
    // Shares below 10000
    await expect(
      royaltiesSplitterFactory.deploy(
        beneficiaries.map(async (b) => await b.getAddress()),
        [2500, 2500, 2500],
      ),
    ).to.be.reverted;
    // Shares over 10000
    await expect(
      royaltiesSplitterFactory.deploy(
        beneficiaries.map(async (b) => await b.getAddress()),
        [2500, 2500, 5001],
      ),
    ).to.be.reverted;
  });
});
