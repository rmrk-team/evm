import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';

async function shouldHaveMetadata(
  mint: (token: Contract, to: string) => Promise<bigint>,
  isTokenUriEnumerated: boolean,
): Promise<void> {
  it('can get tokenURI', async function () {
    const owner = (await ethers.getSigners())[0];
    const tokenId = await mint(this.token, await owner.getAddress());
    if (isTokenUriEnumerated) {
      expect(await this.token.tokenURI(tokenId)).to.eql(`ipfs://tokenURI/${tokenId}`);
    } else {
      expect(await this.token.tokenURI(tokenId)).to.eql('ipfs://tokenURI');
    }
  });

  it('can get collection meta', async function () {
    expect(await this.token.contractURI()).to.eql('ipfs://collection-meta');
  });
}

export default shouldHaveMetadata;
