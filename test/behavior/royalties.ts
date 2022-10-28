import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ADDRESS_ZERO, ONE_ETH } from '../utils';

async function shouldHaveRoyalties(
  mint: (token: Contract, to: string) => Promise<number>,
): Promise<void> {
  it('can get royalty data', async function () {
    const owner = (await ethers.getSigners())[0];
    const tokenId = await mint(this.token, owner.address);
    expect(await this.token.royaltyInfo(tokenId, ONE_ETH.mul(10))).to.eql([ADDRESS_ZERO, ONE_ETH]);
  });

  it('can get and update royalty receipient', async function () {
    expect(await this.token.getRoyaltyRecipient()).to.eql(ADDRESS_ZERO);

    const newRecipient = (await ethers.getSigners())[5];
    await this.token.updateRoyaltyRecipient(newRecipient.address);
    expect(await this.token.getRoyaltyRecipient()).to.eql(newRecipient.address);
  });
}

export default shouldHaveRoyalties;
