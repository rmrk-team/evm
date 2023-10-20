import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
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
      beneficiaries.map((b) => b.address),
      SHARES_BPS,
    );
    await royaltiesSplitter.deployed();
  });

  it('should distribute native payment correctly', async () => {
    const amount = ethers.utils.parseEther('1');
    await expect(() => sender.sendTransaction({ to: royaltiesSplitter.address, value: amount }))
      .to.emit(royaltiesSplitter, 'NativePaymentDistributed')
      .withArgs(sender.address, amount)
      .to.changeEtherBalance(beneficiary1, amount.mul(2500).div(10000))
      .and.changeEtherBalance(beneficiary2, amount.mul(2500).div(10000))
      .and.changeEtherBalance(beneficiary3, amount.mul(5000).div(10000));
  });

  it('should distribute ERC20 payment correctly', async () => {
    const erc20MockFactory = await ethers.getContractFactory('ERC20Mock');
    const erc20Token = await erc20MockFactory.deploy();
    await erc20Token.deployed();

    const amount = ethers.utils.parseUnits('100', 18);
    await erc20Token.mint(sender.address, amount);
    await erc20Token.connect(sender).transfer(royaltiesSplitter.address, amount);

    expect(await royaltiesSplitter.distributeERC20(erc20Token.address, amount))
      .to.emit(royaltiesSplitter, 'ERCPaymentDistributed')
      .withArgs(sender.address, erc20Token.address, amount);
    expect(await erc20Token.balanceOf(beneficiary1.address)).to.equal(amount.mul(2500).div(10000));
    expect(await erc20Token.balanceOf(beneficiary2.address)).to.equal(amount.mul(2500).div(10000));
    expect(await erc20Token.balanceOf(beneficiary3.address)).to.equal(amount.mul(5000).div(10000));
  });

  it('cannot create with invalid configuration', async () => {
    const royaltiesSplitterFactory = await ethers.getContractFactory('RMRKRoyaltiesSplitter');
    // Missmatch in length
    await expect(
      royaltiesSplitterFactory.deploy(
        beneficiaries.map((b) => b.address),
        SHARES_BPS.slice(0, 2),
      ),
    ).to.be.reverted;
    // Missmatch in length
    await expect(
      royaltiesSplitterFactory.deploy(
        beneficiaries.slice(0, 2).map((b) => b.address),
        SHARES_BPS,
      ),
    ).to.be.reverted;
    // Shares below 10000
    await expect(
      royaltiesSplitterFactory.deploy(
        beneficiaries.map((b) => b.address),
        [2500, 2500, 2500],
      ),
    ).to.be.reverted;
    // Shares over 10000
    await expect(
      royaltiesSplitterFactory.deploy(
        beneficiaries.map((b) => b.address),
        [2500, 2500, 5001],
      ),
    ).to.be.reverted;
  });
});
