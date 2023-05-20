import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { ADDRESS_ZERO, bn, ONE_ETH } from '../../utils';

async function shouldHaveRoyalties(
  mint: (token: Contract, to: string) => Promise<BigNumber>,
): Promise<void> {
  it('can get royalty data', async function () {
    const owner = (await ethers.getSigners())[0];
    const tokenId = await mint(this.token, owner.address);
    expect(await this.token.royaltyInfo(tokenId, ONE_ETH.mul(10))).to.eql([ADDRESS_ZERO, ONE_ETH]);
  });

  it('can get royalty receipient and % in base points', async function () {
    // These 2 values are used on all implementation deploys:
    expect(await this.token.getRoyaltyRecipient()).to.eql(ADDRESS_ZERO);
    expect(await this.token.getRoyaltyPercentage()).to.eql(bn(1000));
  });

  it('can get and update royalty receipient', async function () {
    const newRecipient = (await ethers.getSigners())[5];
    await this.token.updateRoyaltyRecipient(newRecipient.address);
    expect(await this.token.getRoyaltyRecipient()).to.eql(newRecipient.address);
  });

  it('cannot update royalty receipient if not owner', async function () {
    const newRecipient = (await ethers.getSigners())[5];
    await expect(
      this.token.connect(newRecipient).updateRoyaltyRecipient(newRecipient.address),
    ).to.be.revertedWithCustomError(this.token, 'RMRKNotOwner');
  });
}

export default shouldHaveRoyalties;
