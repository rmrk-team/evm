import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';

async function shouldHaveMetadata(
  mint: (token: Contract, to: string) => Promise<BigNumber>,
  isTokenUriEnumerated: boolean,
): Promise<void> {
  it('can get tokenURI', async function () {
    const owner = (await ethers.getSigners())[0];
    const tokenId = await mint(this.token, owner.address);
    if (isTokenUriEnumerated) {
      expect(await this.token.tokenURI(tokenId)).to.eql(`ipfs://tokenURI/${tokenId}`);
    } else {
      expect(await this.token.tokenURI(tokenId)).to.eql('ipfs://tokenURI');
    }
  });

  it('can get collection meta', async function () {
    expect(await this.token.collectionMetadata()).to.eql('ipfs://collection-meta');
  });
}

export default shouldHaveMetadata;
