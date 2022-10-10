import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import shouldBehaveLikeOwnableLock from '../behavior/ownableLock';
import shouldBehaveLikeMultiResource from '../behavior/multiresource';
import shouldControlValidMinting from '../behavior/mintingImpl';
import {
  ADDRESS_ZERO,
  addResourceToToken,
  singleFixtureWithArgs,
  mintFromImpl,
  addResourceEntryFromImpl,
  ONE_ETH,
} from '../utils';

async function singleFixture(): Promise<{ token: Contract; renderUtils: Contract }> {
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiResourceRenderUtils');
  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  const token = await singleFixtureWithArgs('RMRKMultiResourceImpl', [
    'MultiResource',
    'MR',
    10000,
    ONE_ETH,
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [ADDRESS_ZERO, 0],
  ]);
  return { token, renderUtils };
}

describe('MultiResourceImpl Other Behavior', async () => {
  let token: Contract;

  let owner: SignerWithAddress;

  const defaultResource1 = 'default1.ipfs';
  const defaultResource2 = 'default2.ipfs';

  const isOwnableLockMock = false;

  beforeEach(async function () {
    owner = (await ethers.getSigners())[0];
  });

  describe('Deployment', async function () {
    beforeEach(async function () {
      ({ token } = await loadFixture(singleFixture));
      this.token = token;
    });

    it('can support IERC721', async function () {
      expect(await token.supportsInterface('0x80ac58cd')).to.equal(true);
    });

    shouldBehaveLikeOwnableLock(isOwnableLockMock);

    it('Can mint tokens through sale logic', async function () {
      await mintFromImpl(token, owner.address);
      expect(await token.ownerOf(1)).to.equal(owner.address);
      expect(await token.totalSupply()).to.equal(1);
      expect(await token.balanceOf(owner.address)).to.equal(1);

      await expect(
        token.connect(owner).mint(owner.address, 1, { value: ONE_ETH.div(2) }),
      ).to.be.revertedWithCustomError(token, 'RMRKMintUnderpriced');
      await expect(
        token.connect(owner).mint(owner.address, 1, { value: 0 }),
      ).to.be.revertedWithCustomError(token, 'RMRKMintUnderpriced');
    });

    it('Can mint multiple tokens through sale logic', async function () {
      await token.connect(owner).mint(owner.address, 10, { value: ONE_ETH.mul(10) });
      expect(await token.totalSupply()).to.equal(10);
      expect(await token.balanceOf(owner.address)).to.equal(10);
      await expect(
        token.connect(owner).mint(owner.address, 1, { value: ONE_ETH.div(2) }),
      ).to.be.revertedWithCustomError(token, 'RMRKMintUnderpriced');
      await expect(
        token.connect(owner).mint(owner.address, 1, { value: 0 }),
      ).to.be.revertedWithCustomError(token, 'RMRKMintUnderpriced');
    });

    it('Can autoincrement resources', async function () {
      await token.connect(owner).addResourceEntry(defaultResource1, []);
      await token.connect(owner).addResourceEntry(defaultResource2, []);

      expect(await token.getResourceMeta(1)).to.eql(defaultResource1);
      expect(await token.getResourceMeta(2)).to.eql(defaultResource2);
    });
  });
});

describe('MultiResourceImpl MR behavior', async () => {
  beforeEach(async function () {
    const { token, renderUtils } = await loadFixture(singleFixture);
    this.token = token;
    this.renderUtils = renderUtils;
  });

  shouldBehaveLikeMultiResource(mintFromImpl, addResourceEntryFromImpl, addResourceToToken);
});

describe('MultiResourceImpl Other', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(singleFixture);
    this.token = token;
  });

  shouldControlValidMinting();

  it('can get tokenURI', async function () {
    const owner = (await ethers.getSigners())[0];
    const tokenId = await mintFromImpl(this.token, owner.address);
    expect(await this.token.tokenURI(tokenId)).to.eql('ipfs://tokenURI');
  });

  it('can get collection meta', async function () {
    expect(await this.token.collectionMetadata()).to.eql('ipfs://collection-meta');
  });
});
