import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import shouldBehaveLikeOwnableLock from '../../behavior/ownableLock';
import shouldBehaveLikeMultiResource from '../../behavior/multiresource';
import shouldControlValidMintingErc20Pay from '../../behavior/mintingImplErc20Pay';
import {
  ADDRESS_ZERO,
  addResourceToToken,
  singleFixtureWithArgs,
  mintFromImplErc20Pay,
  addResourceEntryFromImpl,
  ONE_ETH,
} from '../../utils';

async function singleFixture(): Promise<{
  erc20: Contract;
  token: Contract;
  renderUtils: Contract;
}> {
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = await erc20Factory.deploy();
  await erc20.deployed();

  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiResourceRenderUtils');
  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  const token = await singleFixtureWithArgs('RMRKMultiResourceImplErc20Pay', [
    'MultiResource',
    'MR',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [erc20.address, ADDRESS_ZERO, ONE_ETH, 10000, 0],
  ]);
  return { erc20, token, renderUtils };
}

describe('MultiResourceImpl Other Behavior', async () => {
  let token: Contract;
  let erc20: Contract;

  let owner: SignerWithAddress;

  const defaultResource1 = 'default1.ipfs';
  const defaultResource2 = 'default2.ipfs';

  const isOwnableLockMock = false;

  beforeEach(async function () {
    owner = (await ethers.getSigners())[0];
  });

  describe('Deployment', async function () {
    beforeEach(async function () {
      ({ erc20, token } = await loadFixture(singleFixture));
      this.token = token;
    });

    it('can support IERC721', async function () {
      expect(await token.supportsInterface('0x80ac58cd')).to.equal(true);
    });

    shouldBehaveLikeOwnableLock(isOwnableLockMock);

    it('Can mint tokens through sale logic', async function () {
      await mintFromImplErc20Pay(token, owner.address);
      expect(await token.ownerOf(1)).to.equal(owner.address);
      expect(await token.totalSupply()).to.equal(1);
      expect(await token.balanceOf(owner.address)).to.equal(1);
    });

    it('Can mint multiple tokens through sale logic', async function () {
      await erc20.mint(owner.address, ONE_ETH.mul(10));
      await erc20.approve(token.address, ONE_ETH.mul(10));

      await token.connect(owner).mint(owner.address, 10);
      expect(await token.totalSupply()).to.equal(10);
      expect(await token.balanceOf(owner.address)).to.equal(10);

      await expect(token.connect(owner).mint(owner.address, 1)).to.be.revertedWithCustomError(
        token,
        'RMRKNotEnoughAllowance',
      );
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

  shouldBehaveLikeMultiResource(mintFromImplErc20Pay, addResourceEntryFromImpl, addResourceToToken);
});

describe('MultiResourceImpl Other', async function () {
  beforeEach(async function () {
    const { token } = await loadFixture(singleFixture);
    this.token = token;
  });

  shouldControlValidMintingErc20Pay();

  it('can get tokenURI', async function () {
    const owner = (await ethers.getSigners())[0];
    const tokenId = await mintFromImplErc20Pay(this.token, owner.address);
    expect(await this.token.tokenURI(tokenId)).to.eql('ipfs://tokenURI');
  });

  it('can get collection meta', async function () {
    expect(await this.token.collectionMetadata()).to.eql('ipfs://collection-meta');
  });
});
