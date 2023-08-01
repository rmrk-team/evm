import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import { ADDRESS_ZERO, bn } from '../utils';
import { IERC165, IERC6220, IOtherInterface } from '../interfaces';

async function shouldBehaveLikeEquippableAssets(
  mint: (token: Contract, to: string) => Promise<BigNumber>,
) {
  let chunky: Contract;
  let chunkyEquip: Contract;

  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const equippableGroupIdDefault = bn(1);
  const metaURIDefault = 'metaURI';
  const catalogAddressDefault = ADDRESS_ZERO;

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;
    chunky = this.nestable;
    chunkyEquip = this.equip;
  });

  describe('Interface support', async function () {
    it('can support IERC165', async function () {
      expect(await chunky.supportsInterface(IERC165)).to.equal(true);
    });

    it('can support IEquippable', async function () {
      expect(await chunkyEquip.supportsInterface(IERC6220)).to.equal(true);
    });

    it('cannot support other interfaceId', async function () {
      expect(await chunkyEquip.supportsInterface(IOtherInterface)).to.equal(false);
    });
  });

  describe('Asset storage', async function () {
    it('can add asset', async function () {
      const id = bn(1);

      await expect(
        chunkyEquip.addEquippableAssetEntry(
          id,
          equippableGroupIdDefault,
          catalogAddressDefault,
          metaURIDefault,
          [],
        ),
      )
        .to.emit(chunkyEquip, 'AssetSet')
        .withArgs(id);
    });

    it('cannot get extended assets for non existing asset or non existing token', async function () {
      const tokenId = await mint(chunkyEquip, owner.address);
      const resId = 1;
      await chunkyEquip.addEquippableAssetEntry(
        resId,
        equippableGroupIdDefault,
        catalogAddressDefault,
        metaURIDefault,
        [],
      );
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);
      await expect(
        chunkyEquip.getAssetAndEquippableData(tokenId, resId + 1),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKTokenDoesNotHaveAsset');
      await expect(
        chunkyEquip.getAssetAndEquippableData(tokenId.add(1), resId),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKTokenDoesNotHaveAsset');
    });

    it('cannot add asset entry with parts and no catalog', async function () {
      const id = bn(1);
      await expect(
        chunkyEquip.addEquippableAssetEntry(
          id,
          equippableGroupIdDefault,
          catalogAddressDefault,
          metaURIDefault,
          [1],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKCatalogRequiredForParts');
      await expect(
        chunkyEquip.addEquippableAssetEntry(
          id,
          equippableGroupIdDefault,
          catalogAddressDefault,
          metaURIDefault,
          [1],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKCatalogRequiredForParts');
    });

    it('cannot add an asset with an existing ID', async function () {
      const id = bn(1);

      await chunkyEquip.addEquippableAssetEntry(
        id,
        equippableGroupIdDefault,
        catalogAddressDefault,
        metaURIDefault,
        [],
      );
      await expect(
        chunkyEquip.addEquippableAssetEntry(
          id,
          equippableGroupIdDefault,
          catalogAddressDefault,
          metaURIDefault,
          [],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKAssetAlreadyExists');
    });

    it('cannot add asset with id 0', async function () {
      const id = 0;

      await expect(
        chunkyEquip.addEquippableAssetEntry(
          id,
          equippableGroupIdDefault,
          catalogAddressDefault,
          metaURIDefault,
          [],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKIdZeroForbidden');
    });

    it('cannot add same asset twice', async function () {
      const id = bn(1);

      await expect(
        chunkyEquip.addEquippableAssetEntry(
          id,
          equippableGroupIdDefault,
          catalogAddressDefault,
          metaURIDefault,
          [],
        ),
      )
        .to.emit(chunkyEquip, 'AssetSet')
        .withArgs(id);

      await expect(
        chunkyEquip.addEquippableAssetEntry(
          id,
          equippableGroupIdDefault,
          catalogAddressDefault,
          metaURIDefault,
          [],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKAssetAlreadyExists');
    });
  });

  describe('Adding assets', async function () {
    it('can add asset to token', async function () {
      const resId = bn(1);
      const resId2 = bn(2);
      const tokenId = await mint(chunky, owner.address);
      await addAssets([resId, resId2]);
      await expect(chunkyEquip.addAssetToToken(tokenId, resId, 0)).to.emit(
        chunkyEquip,
        'AssetAddedToTokens',
      );
      await expect(chunkyEquip.addAssetToToken(tokenId, resId2, 0)).to.emit(
        chunkyEquip,
        'AssetAddedToTokens',
      );

      expect(await chunkyEquip.getPendingAssets(tokenId)).to.eql([resId, resId2]);
    });

    it('cannot add non existing asset to token', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await expect(chunkyEquip.addAssetToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKNoAssetMatchingId',
      );
    });

    it('can add asset to non existing token and it is pending when minted', async function () {
      const resId = bn(1);
      const lastTokenId = await mint(chunky, owner.address);
      const nextTokenId = lastTokenId.add(1); // not existing yet

      await addAssets([resId]);
      await chunkyEquip.addAssetToToken(nextTokenId, resId, 0);
      await mint(chunky, owner.address);

      expect(await chunkyEquip.getPendingAssets(nextTokenId)).to.eql([resId]);
    });

    it('cannot add asset twice to the same token', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addAssets([resId]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);
      await expect(chunkyEquip.addAssetToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKAssetAlreadyExists',
      );
    });

    it('cannot add too many assets to the same token', async function () {
      const tokenId = await mint(chunky, owner.address);
      for (let i = 1; i <= 128; i++) {
        await addAssets([bn(i)]);
        await chunkyEquip.addAssetToToken(tokenId, i, 0);
      }

      // Now it's full, next should fail
      const resId = bn(129);
      await addAssets([resId]);
      await expect(chunkyEquip.addAssetToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKMaxPendingAssetsReached',
      );
    });

    it('can add same asset to 2 different tokens', async function () {
      const resId = bn(1);
      const tokenId1 = await mint(chunky, owner.address);
      const tokenId2 = await mint(chunky, owner.address);

      await addAssets([resId]);
      await chunkyEquip.addAssetToToken(tokenId1, resId, 0);
      await chunkyEquip.addAssetToToken(tokenId2, resId, 0);

      expect(await chunkyEquip.getPendingAssets(tokenId1)).to.be.eql([resId]);
      expect(await chunkyEquip.getPendingAssets(tokenId2)).to.be.eql([resId]);
    });
  });

  describe('Accepting assets', async function () {
    it('can accept asset', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addAssets([resId]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);
      await expect(chunkyEquip.acceptAsset(tokenId, 0, resId))
        .to.emit(chunkyEquip, 'AssetAccepted')
        .withArgs(tokenId, resId, 0);

      expect(await chunkyEquip.getPendingAssets(tokenId)).to.be.eql([]);
      expect(await chunkyEquip.getActiveAssets(tokenId)).to.be.eql([resId]);
    });

    it('can accept multiple assets', async function () {
      const resId = bn(1);
      const resId2 = bn(2);
      const tokenId = await mint(chunky, owner.address);
      await addAssets([resId, resId2]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);
      await chunkyEquip.addAssetToToken(tokenId, resId2, 0);
      await expect(chunkyEquip.acceptAsset(tokenId, 1, resId2))
        .to.emit(chunkyEquip, 'AssetAccepted')
        .withArgs(tokenId, resId2, 0);
      await expect(chunkyEquip.acceptAsset(tokenId, 0, resId))
        .to.emit(chunkyEquip, 'AssetAccepted')
        .withArgs(tokenId, resId, 0);

      expect(await chunkyEquip.getPendingAssets(tokenId)).to.be.eql([]);
      expect(await chunkyEquip.getActiveAssets(tokenId)).to.be.eql([resId2, resId]);
    });

    // approved not implemented yet
    it('can accept asset if approved', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      const approvedAddress = addrs[1];
      await chunkyEquip.approveForAssets(approvedAddress.address, tokenId);
      await addAssets([resId]);

      await chunkyEquip.addAssetToToken(tokenId, resId, 0);
      await chunkyEquip.connect(approvedAddress).acceptAsset(tokenId, 0, resId);

      expect(await chunkyEquip.getPendingAssets(tokenId)).to.be.eql([]);
    });

    it('cannot accept asset twice', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addAssets([resId]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);
      await chunkyEquip.acceptAsset(tokenId, 0, resId);

      await expect(chunkyEquip.acceptAsset(tokenId, 0, resId)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKIndexOutOfRange',
      );
    });

    it('cannot accept asset if not owner', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addAssets([resId]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);
      await expect(
        chunkyEquip.connect(addrs[1]).acceptAsset(tokenId, 0, resId),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKNotApprovedForAssetsOrOwner');
    });

    it('cannot accept non existing asset', async function () {
      const tokenId = await mint(chunky, owner.address);
      await expect(chunkyEquip.acceptAsset(tokenId, 0, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKIndexOutOfRange',
      );
    });
  });

  describe('Replacing assets', async function () {
    it('can add asset to token replacing an existing one', async function () {
      const resId = bn(1);
      const resId2 = bn(2);
      const tokenId = await mint(chunky, owner.address);
      await addAssets([resId, resId2]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);
      await chunkyEquip.acceptAsset(tokenId, 0, resId);

      // Add new asset to replace the first, and accept
      await expect(chunkyEquip.addAssetToToken(tokenId, resId2, resId))
        .to.emit(chunkyEquip, 'AssetAddedToTokens')
        .withArgs([tokenId], resId2, resId);

      expect(await chunkyEquip.getAssetReplacements(tokenId, resId2)).to.eql(resId);
      await expect(chunkyEquip.acceptAsset(tokenId, 0, resId2))
        .to.emit(chunkyEquip, 'AssetAccepted')
        .withArgs(tokenId, resId2, resId);

      expect(await chunkyEquip.getActiveAssets(tokenId)).to.be.eql([resId2]);
      expect(await chunkyEquip.getActiveAssetPriorities(tokenId)).to.be.eql([bn(0)]);

      // Replacements should be gone
      expect(await chunkyEquip.getAssetReplacements(tokenId, resId2)).to.eql(bn(0));
    });

    it('can replace non existing asset to token, it could have been deleted', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addAssets([resId]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 1);
      await chunkyEquip.acceptAsset(tokenId, 0, resId);

      expect(await chunkyEquip.getActiveAssets(tokenId)).to.be.eql([resId]);
      expect(await chunkyEquip.getActiveAssetPriorities(tokenId)).to.eql([bn(0)]);
    });
  });

  describe('Rejecting assets', async function () {
    it('can reject asset', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addAssets([resId]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);

      await expect(chunkyEquip.rejectAsset(tokenId, 0, resId)).to.emit(
        chunkyEquip,
        'AssetRejected',
      );

      expect(await chunkyEquip.getPendingAssets(tokenId)).to.be.eql([]);
      expect(await chunkyEquip.getActiveAssets(tokenId)).to.be.eql([]);
    });

    it('can reject asset and replacements are cleared', async function () {
      const resId = bn(1);
      const resId2 = bn(2);
      const tokenId = await mint(chunky, owner.address);
      await addAssets([resId, resId2]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);
      await chunkyEquip.acceptAsset(tokenId, 0, resId);

      // Will try to replace but we reject it
      await chunkyEquip.addAssetToToken(tokenId, resId2, resId);
      await chunkyEquip.rejectAsset(tokenId, 0, resId2);

      expect(await chunkyEquip.getAssetReplacements(tokenId, resId2)).to.eql(bn(0));
    });

    it('can reject asset if approved', async function () {
      const resId = bn(1);
      const approvedAddress = addrs[1];
      const tokenId = await mint(chunky, owner.address);
      await chunkyEquip.approveForAssets(approvedAddress.address, tokenId);
      await addAssets([resId]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);

      await expect(chunkyEquip.rejectAsset(tokenId, 0, resId)).to.emit(
        chunkyEquip,
        'AssetRejected',
      );
      expect(await chunkyEquip.getPendingAssets(tokenId)).to.be.eql([]);
      expect(await chunkyEquip.getActiveAssets(tokenId)).to.be.eql([]);
    });

    it('can reject all assets', async function () {
      const resId = bn(1);
      const resId2 = bn(2);
      const tokenId = await mint(chunky, owner.address);
      await addAssets([resId, resId2]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);
      await chunkyEquip.addAssetToToken(tokenId, resId2, 0);

      await expect(chunkyEquip.rejectAllAssets(tokenId, 2)).to.emit(chunkyEquip, 'AssetRejected');

      expect(await chunkyEquip.getPendingAssets(tokenId)).to.be.eql([]);
      expect(await chunkyEquip.getActiveAssets(tokenId)).to.be.eql([]);
    });

    it('can reject all assets and replacements are cleared', async function () {
      const resId = bn(1);
      const resId2 = bn(2);
      const tokenId = await mint(chunky, owner.address);
      await addAssets([resId, resId2]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);
      await chunkyEquip.acceptAsset(tokenId, 0, resId);

      // Will try to replace but we reject all
      await chunkyEquip.addAssetToToken(tokenId, resId2, resId);
      await chunkyEquip.rejectAllAssets(tokenId, 1);

      expect(await chunkyEquip.getAssetReplacements(tokenId, resId2)).to.eql(bn(0));
    });

    it('can reject all pending assets at max capacity', async function () {
      const tokenId = await mint(chunky, owner.address);
      const resArr = [];

      for (let i = 1; i < 128; i++) {
        resArr.push(bn(i));
      }
      await addAssets(resArr);

      for (let i = 1; i < 128; i++) {
        await chunkyEquip.addAssetToToken(tokenId, i, 1);
      }
      await chunkyEquip.rejectAllAssets(tokenId, 128);

      expect(await chunkyEquip.getAssetReplacements(1, 2)).to.eql(bn(0));
    });

    it('can reject all assets if approved', async function () {
      const resId = bn(1);
      const resId2 = bn(2);
      const tokenId = await mint(chunky, owner.address);
      const approvedAddress = addrs[1];

      await chunkyEquip.approveForAssets(approvedAddress.address, tokenId);
      await addAssets([resId, resId2]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);
      await chunkyEquip.addAssetToToken(tokenId, resId2, 0);

      await expect(chunkyEquip.connect(approvedAddress).rejectAllAssets(tokenId, 2)).to.emit(
        chunkyEquip,
        'AssetRejected',
      );

      expect(await chunkyEquip.getPendingAssets(tokenId)).to.be.eql([]);
      expect(await chunkyEquip.getActiveAssets(tokenId)).to.be.eql([]);
    });

    it('cannot reject asset twice', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addAssets([resId]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);
      await chunkyEquip.rejectAsset(tokenId, 0, resId);

      await expect(chunkyEquip.rejectAsset(tokenId, 0, resId)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKIndexOutOfRange',
      );
    });

    it('cannot reject asset nor reject all if not owner', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addAssets([resId]);
      await chunkyEquip.addAssetToToken(tokenId, resId, 0);

      await expect(
        chunkyEquip.connect(addrs[1]).rejectAsset(tokenId, 0, resId),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKNotApprovedForAssetsOrOwner');
      await expect(
        chunkyEquip.connect(addrs[1]).rejectAllAssets(tokenId, 1),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKNotApprovedForAssetsOrOwner');
    });

    it('cannot reject non existing asset', async function () {
      const tokenId = await mint(chunky, owner.address);
      await expect(chunkyEquip.rejectAsset(tokenId, 0, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKIndexOutOfRange',
      );
    });
  });

  describe('Priorities', async function () {
    it('can set and get priorities', async function () {
      const tokenId = await addAssetsToToken();

      expect(await chunkyEquip.getActiveAssetPriorities(tokenId)).to.be.eql([bn(0), bn(1)]);
      await expect(chunkyEquip.setPriority(tokenId, [1, 0]))
        .to.emit(chunkyEquip, 'AssetPrioritySet')
        .withArgs(tokenId);
      expect(await chunkyEquip.getActiveAssetPriorities(tokenId)).to.be.eql([bn(1), bn(0)]);
    });

    it('can set and get priorities if approved', async function () {
      const approvedAddress = addrs[1];
      const tokenId = await addAssetsToToken();

      await chunkyEquip.approveForAssets(approvedAddress.address, tokenId);

      expect(await chunkyEquip.getActiveAssetPriorities(tokenId)).to.be.eql([bn(0), bn(1)]);
      await expect(chunkyEquip.connect(approvedAddress).setPriority(tokenId, [1, 0]))
        .to.emit(chunkyEquip, 'AssetPrioritySet')
        .withArgs(tokenId);
      expect(await chunkyEquip.getActiveAssetPriorities(tokenId)).to.be.eql([bn(1), bn(0)]);
    });

    it('cannot set priorities for non owned token', async function () {
      const tokenId = await addAssetsToToken();
      await expect(
        chunkyEquip.connect(addrs[1]).setPriority(tokenId, [1, 0]),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKNotApprovedForAssetsOrOwner');
    });

    it('cannot set different number of priorities', async function () {
      const tokenId = await addAssetsToToken();
      await expect(chunkyEquip.setPriority(tokenId, [1])).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKBadPriorityListLength',
      );
      await expect(chunkyEquip.setPriority(tokenId, [1, 0, 2])).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKBadPriorityListLength',
      );
    });

    it('cannot set priorities for non existing token', async function () {
      const tokenId = 1;
      await expect(
        chunkyEquip.connect(addrs[1]).setPriority(tokenId, []),
      ).to.be.revertedWithCustomError(chunky, 'ERC721InvalidTokenId');
    });
  });

  describe('Approval Cleaning', async function () {
    it('cleans token and assets approvals on transfer', async function () {
      const tokenOwner = addrs[1];
      const newOwner = addrs[2];
      const approved = addrs[3];
      const tokenId = await mint(chunky, tokenOwner.address);
      await chunky.connect(tokenOwner).approve(approved.address, tokenId);
      await chunkyEquip.connect(tokenOwner).approveForAssets(approved.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(approved.address);
      expect(await chunkyEquip.getApprovedForAssets(tokenId)).to.eql(approved.address);

      await chunky.connect(tokenOwner).transferFrom(tokenOwner.address, newOwner.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(ADDRESS_ZERO);
      expect(await chunkyEquip.getApprovedForAssets(tokenId)).to.eql(ADDRESS_ZERO);
    });

    it('cleans token and assets approvals on burn', async function () {
      const tokenOwner = addrs[1];
      const approved = addrs[3];
      const tokenId = await mint(chunky, tokenOwner.address);
      await chunky.connect(tokenOwner).approve(approved.address, tokenId);
      await chunkyEquip.connect(tokenOwner).approveForAssets(approved.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(approved.address);
      expect(await chunkyEquip.getApprovedForAssets(tokenId)).to.eql(approved.address);

      await chunky.connect(tokenOwner)['burn(uint256)'](tokenId);

      await expect(chunky.getApproved(tokenId)).to.be.revertedWithCustomError(
        chunky,
        'ERC721InvalidTokenId',
      );
      await expect(chunkyEquip.getApprovedForAssets(tokenId)).to.be.revertedWithCustomError(
        chunky,
        'ERC721InvalidTokenId',
      );
    });
  });

  async function addAssets(ids: BigNumber[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await chunkyEquip.addEquippableAssetEntry(
        ids[i],
        equippableGroupIdDefault,
        catalogAddressDefault,
        metaURIDefault,
        [],
      );
    }
  }

  async function addAssetsToToken(): Promise<BigNumber> {
    const resId = bn(1);
    const resId2 = bn(2);
    const tokenId = await mint(chunky, owner.address);
    await addAssets([resId, resId2]);
    await chunkyEquip.addAssetToToken(tokenId, resId, 0);
    await chunkyEquip.addAssetToToken(tokenId, resId2, 0);
    await chunkyEquip.acceptAsset(tokenId, 0, resId);
    await chunkyEquip.acceptAsset(tokenId, 0, resId2);

    return tokenId;
  }
}

export default shouldBehaveLikeEquippableAssets;
