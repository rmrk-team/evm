import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';

async function shouldHaveMetadata(
  mint: (token: Contract, to: string) => Promise<number>,
): Promise<void> {
  it('can get tokenURI', async function () {
    const owner = (await ethers.getSigners())[0];
    const tokenId = await mint(this.token, owner.address);
    expect(await this.token.tokenURI(tokenId)).to.eql('ipfs://tokenURI');
  });

  it('can get collection meta', async function () {
    expect(await this.token.collectionMetadata()).to.eql('ipfs://collection-meta');
  });
}

export default shouldHaveMetadata;
