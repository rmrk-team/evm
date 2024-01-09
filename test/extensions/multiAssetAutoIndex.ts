import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { bn } from '../utils';
import { IERC165, IERC5773, IRMRKMultiAssetAutoIndex, IOtherInterface } from '../interfaces';
import { RMRKMultiAssetAutoIndexMock } from '../../typechain-types';

// --------------- FIXTURES -----------------------

async function multiAssetAutoIndexFixture() {
  const factory = await ethers.getContractFactory('RMRKMultiAssetAutoIndexMock');
  const token = await factory.deploy();
  await token.waitForDeployment();

  return token;
}

describe('RMRKMultiAssetAutoIndexMock', async function () {
  let token: RMRKMultiAssetAutoIndexMock;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let tokenId = bn(1);

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    token = await loadFixture(multiAssetAutoIndexFixture);
  });

  it('can support IERC165', async function () {
    expect(await token.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support IERC5773', async function () {
    expect(await token.supportsInterface(IERC5773)).to.equal(true);
  });

  it('can support IRMRKMultiAssetAutoIndex', async function () {
    expect(await token.supportsInterface(IRMRKMultiAssetAutoIndex)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await token.supportsInterface(IOtherInterface)).to.equal(false);
  });

  describe('With minted tokens', async function () {
    const assetId = bn(1);

    beforeEach(async function () {
      await token.mint(await user.getAddress(), tokenId);
      await token.addAssetEntry(assetId, 'ipfs/something.json');
      await token.addAssetToToken(tokenId, assetId, 0);
    });

    it('can accept an asset', async function () {
      await token.connect(user)['acceptAsset(uint256,uint64)'](tokenId, assetId);
      expect(await token.getPendingAssets(tokenId)).to.be.eql([]);
      expect(await token.getActiveAssets(tokenId)).to.be.eql([assetId]);
    });

    it('can reject an asset', async function () {
      await token.connect(user)['rejectAsset(uint256,uint64)'](tokenId, assetId);
      expect(await token.getPendingAssets(tokenId)).to.be.eql([]);
      expect(await token.getActiveAssets(tokenId)).to.be.eql([]);
    });
  });

  describe('With multiple assets in the pending list', async function () {
    const asseOneId = bn(1);
    const assetTwoId = bn(2);
    const assetThreeId = bn(3);

    beforeEach(async function () {
      await token.connect(owner).addAssetEntry(asseOneId, 'ipfs/asset1.json');
      await token.connect(owner).addAssetToToken(tokenId, asseOneId, 0);
      await token.connect(owner).addAssetEntry(assetTwoId, 'ipfs/asset2.json');
      await token.addAssetToToken(tokenId, assetTwoId, 0);
      await token.connect(owner).addAssetEntry(assetThreeId, 'ipfs/asset3.json');
      await token.addAssetToToken(tokenId, assetThreeId, 0);
      expect(await token.getPendingAssets(tokenId)).to.be.eql([bn(1), bn(2), bn(3)]);
    });

    it('can reject a middle asset in the pending list', async function () {
      await token.connect(user)['rejectAsset(uint256,uint64)'](tokenId, assetTwoId);
      expect(await token.getPendingAssets(tokenId)).to.be.eql([bn(1), bn(3)]);
      expect(await token.getActiveAssets(tokenId)).to.be.eql([]);
    });

    it('can accept a middle asset in the pending list', async function () {
      await token.connect(user)['acceptAsset(uint256,uint64)'](tokenId, assetTwoId);
      expect(await token.getPendingAssets(tokenId)).to.be.eql([asseOneId, assetThreeId]);
      expect(await token.getActiveAssets(tokenId)).to.be.eql([assetTwoId]);
    });

    it('can reject first asset in the pending list', async function () {
      await token.connect(user)['rejectAsset(uint256,uint64)'](tokenId, asseOneId);
      expect(await token.getPendingAssets(tokenId)).to.be.eql([assetThreeId, assetTwoId]);
      expect(await token.getActiveAssets(tokenId)).to.be.eql([]);
    });

    it('can accept first asset in the pending list', async function () {
      await token.connect(user)['acceptAsset(uint256,uint64)'](tokenId, asseOneId);
      expect(await token.getPendingAssets(tokenId)).to.be.eql([assetThreeId, assetTwoId]);
      expect(await token.getActiveAssets(tokenId)).to.be.eql([asseOneId]);
    });

    it('can reject all assets in the pending list', async function () {
      await token.connect(user)['rejectAsset(uint256,uint64)'](tokenId, asseOneId);
      await token.connect(user)['rejectAsset(uint256,uint64)'](tokenId, assetThreeId);
      await token.connect(user)['rejectAsset(uint256,uint64)'](tokenId, assetTwoId);
      expect(await token.getPendingAssets(tokenId)).to.be.eql([]);
      expect(await token.getActiveAssets(tokenId)).to.be.eql([]);
    });

    it('can accept all assets in the pending list', async function () {
      await token.connect(user)['acceptAsset(uint256,uint64)'](tokenId, asseOneId);
      await token.connect(user)['acceptAsset(uint256,uint64)'](tokenId, assetThreeId);
      await token.connect(user)['acceptAsset(uint256,uint64)'](tokenId, assetTwoId);
      expect(await token.getPendingAssets(tokenId)).to.be.eql([]);
      expect(await token.getActiveAssets(tokenId)).to.be.eql([asseOneId, assetThreeId, assetTwoId]);
    });

    describe('With multiple assets in the active list', async function () {
      const assetFourId = bn(4);

      beforeEach(async function () {
        await token.connect(user)['acceptAsset(uint256,uint64)'](tokenId, asseOneId);
        await token.connect(user)['acceptAsset(uint256,uint64)'](tokenId, assetThreeId);
        await token.connect(user)['acceptAsset(uint256,uint64)'](tokenId, assetTwoId);
      });

      it('can replace the first active asset', async function () {
        await token.connect(owner).addAssetEntry(assetFourId, 'ipfs/asset4.json');
        await token.connect(owner).addAssetToToken(tokenId, assetFourId, asseOneId);
        await token.connect(user)['acceptAsset(uint256,uint64)'](tokenId, assetFourId);
        expect(await token.getPendingAssets(tokenId)).to.be.eql([]);
        expect(await token.getActiveAssets(tokenId)).to.be.eql([
          assetFourId,
          assetThreeId,
          assetTwoId,
        ]);
      });
    });
  });
});
