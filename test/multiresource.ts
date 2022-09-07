import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  addResourceEntryFromMock,
  addResourceToToken,
  bn,
  mintFromMock,
  singleFixtureWithArgs,
} from './utils';
import shouldBehaveLikeMultiResource from './behavior/multiresource';
import shouldBehaveLikeERC721 from './behavior/erc721';

const name = 'RmrkTest';
const symbol = 'RMRKTST';

async function singleFixture(): Promise<{ token: Contract; renderUtils: Contract }> {
  const renderUtilsFactory = await ethers.getContractFactory('RMRKRenderUtils');
  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();

  const token = await singleFixtureWithArgs('RMRKMultiResourceMock', [name, symbol]);
  return { token, renderUtils };
}

describe('MultiResourceMock Other Behavior', async function () {
  let token: Contract;
  let renderUtils: Contract;
  let tokenOwner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  before(async function () {
    ({ token, renderUtils } = await loadFixture(singleFixture));
    [tokenOwner, ...addrs] = await ethers.getSigners();
  });

  describe('Init', async function () {
    it('Name', async function () {
      expect(await token.name()).to.equal(name);
    });

    it('Symbol', async function () {
      expect(await token.symbol()).to.equal(symbol);
    });

    it('can support IERC721', async function () {
      expect(await token.supportsInterface('0x80ac58cd')).to.equal(true);
    });
  });

  describe('Resource storage', async function () {
    const metaURIDefault = 'ipfs//something';

    it('can add resource', async function () {
      const id = bn(2222);

      await expect(token.addResourceEntry(id, metaURIDefault))
        .to.emit(token, 'ResourceSet')
        .withArgs(id);
    });

    it('cannot get non existing resource', async function () {
      const id = bn(9999);
      await expect(token.getResource(id)).to.be.revertedWithCustomError(
        token,
        'RMRKNoResourceMatchingId',
      );
    });

    it('cannot add existing resource', async function () {
      const id = bn(12345);

      await token.addResourceEntry(id, metaURIDefault);
      await expect(token.addResourceEntry(id, 'newMetaUri')).to.be.revertedWithCustomError(
        token,
        'RMRKResourceAlreadyExists',
      );
    });

    it('cannot add resource with id 0', async function () {
      const id = 0;

      await expect(token.addResourceEntry(id, metaURIDefault)).to.be.revertedWithCustomError(
        token,
        'RMRKWriteToZero',
      );
    });

    it('cannot add same resource twice', async function () {
      const id = bn(1111);

      await expect(token.addResourceEntry(id, metaURIDefault))
        .to.emit(token, 'ResourceSet')
        .withArgs(id);

      await expect(token.addResourceEntry(id, metaURIDefault)).to.be.revertedWithCustomError(
        token,
        'RMRKResourceAlreadyExists',
      );
    });
  });

  describe('Adding resources to tokens', async function () {
    it('can add resource to token', async function () {
      const resId = await addResourceEntryFromMock(token, 'data1');
      const resId2 = await addResourceEntryFromMock(token, 'data2');
      const tokenId = await mintFromMock(token, tokenOwner.address);

      await expect(token.addResourceToToken(tokenId, resId, 0)).to.emit(
        token,
        'ResourceAddedToToken',
      );
      await expect(token.addResourceToToken(tokenId, resId2, 0)).to.emit(
        token,
        'ResourceAddedToToken',
      );

      const pendingIds = await token.getPendingResources(tokenId);
      expect(await renderUtils.getResourcesById(token.address, pendingIds)).to.be.eql([
        [resId, 'data1'],
        [resId2, 'data2'],
      ]);

      expect(await renderUtils.getPendingResourceByIndex(token.address, tokenId, 0)).to.eql([
        resId,
        'data1',
      ]);
    });

    it('cannot add non existing resource to token', async function () {
      const resId = bn(9999);
      const tokenId = await mintFromMock(token, tokenOwner.address);

      await expect(token.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        token,
        'RMRKNoResourceMatchingId',
      );
    });

    it('cannot add resource to non existing token', async function () {
      const resId = await addResourceEntryFromMock(token);
      const tokenId = 9999;

      await expect(token.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        token,
        'ERC721InvalidTokenId',
      );
    });

    it('cannot add resource twice to the same token', async function () {
      const resId = await addResourceEntryFromMock(token);
      const tokenId = await mintFromMock(token, tokenOwner.address);

      await token.addResourceToToken(tokenId, resId, 0);
      await expect(token.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        token,
        'RMRKResourceAlreadyExists',
      );
    });

    it('cannot add too many resources to the same token', async function () {
      const tokenId = await mintFromMock(token, tokenOwner.address);

      for (let i = 1; i <= 128; i++) {
        const resId = await addResourceEntryFromMock(token);
        await token.addResourceToToken(tokenId, resId, 0);
      }

      // Now it's full, next should fail
      const resId = await addResourceEntryFromMock(token);
      await expect(token.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        token,
        'RMRKMaxPendingResourcesReached',
      );
    });

    it('can add same resource to 2 different tokens', async function () {
      const resId = await addResourceEntryFromMock(token);
      const tokenId1 = await mintFromMock(token, tokenOwner.address);
      const tokenId2 = await mintFromMock(token, tokenOwner.address);

      await token.addResourceToToken(tokenId1, resId, 0);
      await token.addResourceToToken(tokenId2, resId, 0);

      expect(await token.getPendingResources(tokenId1)).to.be.eql([resId]);
      expect(await token.getPendingResources(tokenId2)).to.be.eql([resId]);
    });
  });

  describe('token URI', async function () {
    it('can get token URI', async function () {
      const resId = await addResourceEntryFromMock(token, 'uri1');
      const resId2 = await addResourceEntryFromMock(token, 'uri2');
      const tokenId = await mintFromMock(token, tokenOwner.address);

      await token.addResourceToToken(tokenId, resId, 0);
      await token.addResourceToToken(tokenId, resId2, 0);
      await token.connect(tokenOwner).acceptResource(tokenId, 0);
      await token.connect(tokenOwner).acceptResource(tokenId, 0);
      expect(await token.tokenURI(tokenId)).to.eql('uri1');
    });

    it('can get token URI at specific index', async function () {
      const resId = await addResourceEntryFromMock(token, 'UriA');
      const resId2 = await addResourceEntryFromMock(token, 'UriB');
      const tokenId = await mintFromMock(token, tokenOwner.address);

      await token.addResourceToToken(tokenId, resId, 0);
      await token.addResourceToToken(tokenId, resId2, 0);
      await token.connect(tokenOwner).acceptResource(tokenId, 0);
      await token.connect(tokenOwner).acceptResource(tokenId, 0);

      expect(await token.tokenURIAtIndex(tokenId, 1)).to.eql('UriB');
      await expect(token.tokenURIAtIndex(tokenId, 2)).to.be.revertedWithCustomError(
        token,
        'RMRKIndexOutOfRange',
      );
    });

    it('cannot get token URI if token has no resources', async function () {
      const tokenId = await mintFromMock(token, tokenOwner.address);
      await expect(token.tokenURI(tokenId)).to.be.revertedWithCustomError(
        token,
        'RMRKIndexOutOfRange',
      );
    });
  });

  describe('Approvals cleaning', async () => {
    it('cleans token and resources approvals on transfer', async function () {
      const tokenOwner = addrs[1];
      const newOwner = addrs[2];
      const approved = addrs[3];
      const tokenId = await mintFromMock(token, tokenOwner.address);
      await token.connect(tokenOwner).approve(approved.address, tokenId);
      await token.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await token.getApproved(tokenId)).to.eql(approved.address);
      expect(await token.getApprovedForResources(tokenId)).to.eql(approved.address);

      await token.connect(tokenOwner).transferFrom(tokenOwner.address, newOwner.address, tokenId);

      expect(await token.getApproved(tokenId)).to.eql(ethers.constants.AddressZero);
      expect(await token.getApprovedForResources(tokenId)).to.eql(ethers.constants.AddressZero);
    });

    it('cleans token and resources approvals on burn', async function () {
      const tokenOwner = addrs[1];
      const approved = addrs[3];
      const tokenId = await mintFromMock(token, tokenOwner.address);
      await token.connect(tokenOwner).approve(approved.address, tokenId);
      await token.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await token.getApproved(tokenId)).to.eql(approved.address);
      expect(await token.getApprovedForResources(tokenId)).to.eql(approved.address);

      await token.connect(tokenOwner).burn(tokenId);

      await expect(token.getApproved(tokenId)).to.be.revertedWithCustomError(
        token,
        'ERC721InvalidTokenId',
      );
      await expect(token.getApprovedForResources(tokenId)).to.be.revertedWithCustomError(
        token,
        'ERC721InvalidTokenId',
      );
    });
  });
});

describe('MultiResourceMock MR behavior', async () => {
  beforeEach(async function () {
    const { token, renderUtils } = await loadFixture(singleFixture);
    this.token = token;
    this.renderUtils = renderUtils;
  });

  shouldBehaveLikeMultiResource(mintFromMock, addResourceEntryFromMock, addResourceToToken);
});

describe('MultiResourceMock ERC721 behavior', function () {
  beforeEach(async function () {
    const { token } = await loadFixture(singleFixture);
    this.token = token;
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
  });

  shouldBehaveLikeERC721(name, symbol);
});
