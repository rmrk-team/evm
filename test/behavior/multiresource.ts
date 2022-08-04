import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';

async function shouldBehaveLikeMultiResource(name: string, symbol: string) {
  let owner: SignerWithAddress;
  let addrs: any[];

  const metaURIDefault = 'metaURI';

  before(async () => {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;
  });

  describe('Init', async function () {
    it('Name', async function () {
      expect(await this.token.name()).to.equal(name);
    });

    it('Symbol', async function () {
      expect(await this.token.symbol()).to.equal(symbol);
    });
  });

  describe('Interface support', async function () {
    it('can support IERC165', async function () {
      expect(await this.token.supportsInterface('0x01ffc9a7')).to.equal(true);
    });

    it('can support IERC721', async function () {
      expect(await this.token.supportsInterface('0x80ac58cd')).to.equal(true);
    });

    it('can support IMultiResource', async function () {
      expect(await this.token.supportsInterface('0xbb5b3194')).to.equal(true);
    });

    it('cannot support other interfaceId', async function () {
      expect(await this.token.supportsInterface('0xffffffff')).to.equal(false);
    });
  });

  describe('Approvals', async function () {
    it('can approve address for resources', async function () {
      const tokenId = 1;
      const approvedAddress = addrs[1];
      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await this.token.approveForResources(approvedAddress.address, tokenId);
      expect(await this.token.getApprovedForResources(tokenId)).to.eql(approvedAddress.address);
    });

    it('can approve address for all for resources', async function () {
      const tokenId = 1;
      const approvedAddress = addrs[1].address;
      await this.token['mint(address,uint256)'](owner.address, tokenId);

      await this.token.setApprovalForAllForResources(approvedAddress, true);
      expect(await this.token.isApprovedForAllForResources(owner.address, approvedAddress)).to.eql(
        true,
      );

      await this.token.setApprovalForAllForResources(approvedAddress, false);
      expect(await this.token.isApprovedForAllForResources(owner.address, approvedAddress)).to.eql(
        false,
      );
    });

    it('cannot approve owner for resources', async function () {
      const tokenId = 1;
      await this.token['mint(address,uint256)'](owner.address, tokenId);

      await expect(
        this.token.approveForResources(owner.address, tokenId),
      ).to.be.revertedWithCustomError(this.token, 'RMRKApprovalForResourcesToCurrentOwner');
    });

    it('cannot approve owner for all resources', async function () {
      const tokenId = 1;
      await this.token['mint(address,uint256)'](owner.address, tokenId);

      await expect(
        this.token.setApprovalForAllForResources(owner.address, owner.address),
      ).to.be.revertedWithCustomError(this.token, 'RMRKApproveForResourcesToCaller');
    });

    it('cannot approve owner if not owner', async function () {
      const tokenId = 1;
      const notOwner = addrs[2];
      const approvedAddress = addrs[1].address;
      await this.token['mint(address,uint256)'](owner.address, tokenId);

      await expect(
        this.token.connect(notOwner).approveForResources(approvedAddress, tokenId),
      ).to.be.revertedWithCustomError(
        this.token,
        'RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll',
      );
    });

    it('can approve address for resources if approved for all resources', async function () {
      const tokenId = 1;
      const approvedForAll = addrs[1];
      const otherApproved = addrs[2];
      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await this.token.setApprovalForAllForResources(approvedForAll.address, true);

      await this.token.connect(approvedForAll).approveForResources(otherApproved.address, tokenId);
      expect(await this.token.getApprovedForResources(tokenId)).to.eql(otherApproved.address);
    });
  });

  describe('Resource storage', async function () {
    it('can add resource', async function () {
      const id = BigNumber.from(1);

      await expect(this.token.addResourceEntry(id, metaURIDefault))
        .to.emit(this.token, 'ResourceSet')
        .withArgs(id);
    });

    it('cannot get non existing resource', async function () {
      const id = BigNumber.from(1);
      await expect(this.token.getResource(id)).to.be.revertedWithCustomError(
        this.token,
        'RMRKNoResourceMatchingId',
      );
    });

    it('cannot overwrite resource', async function () {
      const id = BigNumber.from(1);

      await this.token.addResourceEntry(id, metaURIDefault);
      await expect(this.token.addResourceEntry(id, 'newMetaUri')).to.be.revertedWithCustomError(
        this.token,
        'RMRKResourceAlreadyExists',
      );
    });

    it('cannot add resource with id 0', async function () {
      const id = 0;

      await expect(this.token.addResourceEntry(id, metaURIDefault)).to.be.revertedWithCustomError(
        this.token,
        'RMRKWriteToZero',
      );
    });

    it('cannot add same resource twice', async function () {
      const id = BigNumber.from(1);

      await expect(this.token.addResourceEntry(id, metaURIDefault))
        .to.emit(this.token, 'ResourceSet')
        .withArgs(id);

      await expect(this.token.addResourceEntry(id, metaURIDefault)).to.be.revertedWithCustomError(
        this.token,
        'RMRKResourceAlreadyExists',
      );
    });
  });

  describe('Adding resources', async function () {
    it('can add resource to token', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, [resId, resId2]);
      await expect(this.token.addResourceToToken(tokenId, resId, 0)).to.emit(
        this.token,
        'ResourceAddedToToken',
      );
      await expect(this.token.addResourceToToken(tokenId, resId2, 0)).to.emit(
        this.token,
        'ResourceAddedToToken',
      );

      const pending = await this.token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([
        [resId, metaURIDefault],
        [resId2, metaURIDefault],
      ]);

      expect(await this.token.getPendingResObjectByIndex(tokenId, 0)).to.eql([
        resId,
        metaURIDefault,
      ]);
    });

    it('cannot add non existing resource to token', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await expect(this.token.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        this.token,
        'RMRKNoResourceMatchingId',
      );
    });

    it('cannot add resource to non existing token', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await addResources(this.token, [resId]);
      await expect(this.token.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        this.token,
        'ERC721InvalidTokenId',
      );
    });

    it('cannot add resource twice to the same token', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await expect(this.token.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        this.token,
        'RMRKResourceAlreadyExists',
      );
    });

    it('cannot add too many resources to the same token', async function () {
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      for (let i = 1; i <= 128; i++) {
        await addResources(this.token, [BigNumber.from(i)]);
        await this.token.addResourceToToken(tokenId, i, 0);
      }

      // Now it's full, next should fail
      const resId = BigNumber.from(129);
      await addResources(this.token, [resId]);
      await expect(this.token.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        this.token,
        'RMRKMaxPendingResourcesReached',
      );
    });

    it('can add same resource to 2 different tokens', async function () {
      const resId = BigNumber.from(1);
      const tokenId1 = 1;
      const tokenId2 = 2;

      await this.token['mint(address,uint256)'](owner.address, tokenId1);
      await this.token['mint(address,uint256)'](owner.address, tokenId2);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId1, resId, 0);
      await this.token.addResourceToToken(tokenId2, resId, 0);

      expect(await this.token.getPendingResources(tokenId1)).to.be.eql([resId]);
      expect(await this.token.getPendingResources(tokenId2)).to.be.eql([resId]);
    });
  });

  describe('Accepting resources', async function () {
    it('can accept resource', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await expect(this.token.acceptResource(tokenId, 0))
        .to.emit(this.token, 'ResourceAccepted')
        .withArgs(tokenId, resId);

      const pending = await this.token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);

      const accepted = await this.token.getFullResources(tokenId);
      expect(accepted).to.eql([[resId, metaURIDefault]]);

      expect(await this.token.getResObjectByIndex(tokenId, 0)).to.eql([resId, metaURIDefault]);
    });

    it('can accept multiple resources', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, [resId, resId2]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.addResourceToToken(tokenId, resId2, 0);
      await expect(this.token.acceptResource(tokenId, 1)) // Accepting resId2
        .to.emit(this.token, 'ResourceAccepted')
        .withArgs(tokenId, resId2);
      await expect(this.token.acceptResource(tokenId, 0))
        .to.emit(this.token, 'ResourceAccepted')
        .withArgs(tokenId, resId);

      const pending = await this.token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);

      const accepted = await this.token.getFullResources(tokenId);
      expect(accepted).to.eql([
        [resId2, metaURIDefault],
        [resId, metaURIDefault],
      ]);
    });

    it('can accept resource if approved', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;
      const approvedAddress = addrs[1];
      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await this.token.approveForResources(approvedAddress.address, tokenId);
      await addResources(this.token, [resId]);

      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.connect(approvedAddress).acceptResource(tokenId, 0);

      const pending = await this.token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
    });

    it('can accept resource if approved for all', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;
      const approvedAddress = addrs[1];
      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await this.token.setApprovalForAllForResources(approvedAddress.address, true);
      await addResources(this.token, [resId]);

      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.connect(approvedAddress).acceptResource(tokenId, 0);

      const pending = await this.token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
    });

    it('cannot accept resource twice', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.acceptResource(tokenId, 0);

      await expect(this.token.acceptResource(tokenId, 0)).to.be.revertedWithCustomError(
        this.token,
        'RMRKIndexOutOfRange',
      );
    });

    it('cannot accept resource if not owner or approved', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;
      const approvedAddress = addrs[1];
      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await this.token.approve(approvedAddress.address, tokenId);
      await addResources(this.token, [resId]);

      await this.token.addResourceToToken(tokenId, resId, 0);
      await expect(
        this.token.connect(addrs[1]).acceptResource(tokenId, 0),
      ).to.be.revertedWithCustomError(this.token, 'RMRKNotApprovedForResourcesOrOwner');
    });

    it('cannot accept resource if not approved for resource', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await expect(
        this.token.connect(addrs[1]).acceptResource(tokenId, 0),
      ).to.be.revertedWithCustomError(this.token, 'RMRKNotApprovedForResourcesOrOwner');
    });

    it('cannot accept non existing resource', async function () {
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await expect(this.token.acceptResource(tokenId, 0)).to.be.revertedWithCustomError(
        this.token,
        'RMRKIndexOutOfRange',
      );
    });
  });

  describe('Overwriting resources', async function () {
    it('can add resource to token overwritting an existing one', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, [resId, resId2]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.acceptResource(tokenId, 0);

      // Add new resource to overwrite the first, and accept
      const activeResources = await this.token.getActiveResources(tokenId);
      await expect(this.token.addResourceToToken(tokenId, resId2, activeResources[0])).to.emit(
        this.token,
        'ResourceOverwriteProposed',
      );
      const pendingResources = await this.token.getPendingResources(tokenId);

      expect(await this.token.getResourceOverwrites(tokenId, pendingResources[0])).to.eql(
        activeResources[0],
      );
      await expect(this.token.acceptResource(tokenId, 0)).to.emit(
        this.token,
        'ResourceOverwritten',
      );

      expect(await this.token.getFullResources(tokenId)).to.be.eql([[resId2, metaURIDefault]]);
      // Overwrite should be gone
      expect(await this.token.getResourceOverwrites(tokenId, pendingResources[0])).to.eql(
        BigNumber.from(0),
      );
    });

    it('can overwrite non existing resource to token, it could have been deleted', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 1);
      await this.token.acceptResource(tokenId, 0);

      expect(await this.token.getFullResources(tokenId)).to.be.eql([[resId, metaURIDefault]]);
    });
  });

  describe('Rejecting resources', async function () {
    it('can reject resource', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);

      await expect(this.token.rejectResource(tokenId, 0)).to.emit(this.token, 'ResourceRejected');

      const pending = await this.token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await this.token.getFullResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('can reject resource and overwrites are cleared', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, [resId, resId2]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.acceptResource(tokenId, 0);

      // Will try to overwrite but we reject it
      await this.token.addResourceToToken(tokenId, resId2, resId);
      await this.token.rejectResource(tokenId, 0);

      expect(await this.token.getResourceOverwrites(tokenId, resId2)).to.eql(BigNumber.from(0));
    });

    it('can reject resource if approved', async function () {
      const resId = BigNumber.from(1);
      const approvedAddress = addrs[1];
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await this.token.approveForResources(approvedAddress.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);

      await expect(this.token.rejectResource(tokenId, 0)).to.emit(this.token, 'ResourceRejected');

      const pending = await this.token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await this.token.getFullResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('can reject resource if approved for all', async function () {
      const resId = BigNumber.from(1);
      const approvedAddress = addrs[1];
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await this.token.setApprovalForAllForResources(approvedAddress.address, true);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);

      await expect(this.token.rejectResource(tokenId, 0)).to.emit(this.token, 'ResourceRejected');

      const pending = await this.token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await this.token.getFullResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('can reject all resources', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, [resId, resId2]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.addResourceToToken(tokenId, resId2, 0);

      await expect(this.token.rejectAllResources(tokenId)).to.emit(this.token, 'ResourceRejected');

      const pending = await this.token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await this.token.getFullResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('can reject all resources and overwrites are cleared', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, [resId, resId2]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.acceptResource(tokenId, 0);

      // Will try to overwrite but we reject all
      await this.token.addResourceToToken(tokenId, resId2, resId);
      await this.token.rejectAllResources(tokenId);

      expect(await this.token.getResourceOverwrites(tokenId, resId2)).to.eql(BigNumber.from(0));
    });

    it('can reject all pending resources at max capacity', async function () {
      const tokenId = 1;
      const resArr = [];

      for (let i = 1; i < 128; i++) {
        resArr.push(BigNumber.from(i));
      }

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, resArr);

      for (let i = 1; i < 128; i++) {
        await this.token.addResourceToToken(tokenId, i, 1);
      }
      await this.token.rejectAllResources(tokenId);

      expect(await this.token.getResourceOverwrites(1, 2)).to.eql(BigNumber.from(0));
    });

    it('can reject all resources if approved', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;
      const approvedAddress = addrs[1];

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await this.token.approveForResources(approvedAddress.address, tokenId);
      await addResources(this.token, [resId, resId2]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.addResourceToToken(tokenId, resId2, 0);

      await expect(this.token.connect(approvedAddress).rejectAllResources(tokenId)).to.emit(
        this.token,
        'ResourceRejected',
      );

      const pending = await this.token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await this.token.getFullResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('can reject all resources if approved for all', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;
      const approvedAddress = addrs[1];

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await this.token.setApprovalForAllForResources(approvedAddress.address, true);
      await addResources(this.token, [resId, resId2]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.addResourceToToken(tokenId, resId2, 0);

      await expect(this.token.connect(approvedAddress).rejectAllResources(tokenId)).to.emit(
        this.token,
        'ResourceRejected',
      );

      const pending = await this.token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await this.token.getFullResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('cannot reject resource twice', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.rejectResource(tokenId, 0);

      await expect(this.token.rejectResource(tokenId, 0)).to.be.revertedWithCustomError(
        this.token,
        'RMRKIndexOutOfRange',
      );
    });

    it('cannot reject resource nor reject all if not owner', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);

      await expect(
        this.token.connect(addrs[1]).rejectResource(tokenId, 0),
      ).to.be.revertedWithCustomError(this.token, 'RMRKNotApprovedForResourcesOrOwner');
      await expect(
        this.token.connect(addrs[1]).rejectAllResources(tokenId),
      ).to.be.revertedWithCustomError(this.token, 'RMRKNotApprovedForResourcesOrOwner');
    });

    it('cannot reject non existing resource', async function () {
      const tokenId = 1;

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await expect(this.token.rejectResource(tokenId, 0)).to.be.revertedWithCustomError(
        this.token,
        'RMRKIndexOutOfRange',
      );
    });
  });

  describe('Priorities', async function () {
    it('can set and get priorities', async function () {
      const tokenId = 1;
      await addResourcesToToken(this.token, tokenId);

      expect(await this.token.getActiveResourcePriorities(tokenId)).to.be.eql([0, 0]);
      await expect(this.token.setPriority(tokenId, [2, 1]))
        .to.emit(this.token, 'ResourcePrioritySet')
        .withArgs(tokenId);
      expect(await this.token.getActiveResourcePriorities(tokenId)).to.be.eql([2, 1]);
    });

    it('can set and get priorities if approved', async function () {
      const tokenId = 1;
      const approvedAddress = addrs[1];

      await addResourcesToToken(this.token, tokenId);
      await this.token.approveForResources(approvedAddress.address, tokenId);

      expect(await this.token.getActiveResourcePriorities(tokenId)).to.be.eql([0, 0]);
      await expect(this.token.connect(approvedAddress).setPriority(tokenId, [2, 1]))
        .to.emit(this.token, 'ResourcePrioritySet')
        .withArgs(tokenId);
      expect(await this.token.getActiveResourcePriorities(tokenId)).to.be.eql([2, 1]);
    });

    it('can set and get priorities if approved for all', async function () {
      const tokenId = 1;
      const approvedAddress = addrs[1];

      await addResourcesToToken(this.token, tokenId);
      await this.token.setApprovalForAllForResources(approvedAddress.address, true);

      expect(await this.token.getActiveResourcePriorities(tokenId)).to.be.eql([0, 0]);
      await expect(this.token.connect(approvedAddress).setPriority(tokenId, [2, 1]))
        .to.emit(this.token, 'ResourcePrioritySet')
        .withArgs(tokenId);
      expect(await this.token.getActiveResourcePriorities(tokenId)).to.be.eql([2, 1]);
    });

    it('cannot set priorities for non owned token', async function () {
      const tokenId = 1;
      await addResourcesToToken(this.token, tokenId);
      await expect(
        this.token.connect(addrs[1]).setPriority(tokenId, [2, 1]),
      ).to.be.revertedWithCustomError(this.token, 'RMRKNotApprovedForResourcesOrOwner');
    });

    it('cannot set different number of priorities', async function () {
      const tokenId = 1;
      await addResourcesToToken(this.token, tokenId);
      await expect(this.token.setPriority(tokenId, [1])).to.be.revertedWithCustomError(
        this.token,
        'RMRKBadPriorityListLength',
      );
      await expect(this.token.setPriority(tokenId, [2, 1, 3])).to.be.revertedWithCustomError(
        this.token,
        'RMRKBadPriorityListLength',
      );
    });

    it('cannot set priorities for non existing token', async function () {
      const tokenId = 1;
      await expect(
        this.token.connect(addrs[1]).setPriority(tokenId, []),
      ).to.be.revertedWithCustomError(this.token, 'ERC721InvalidTokenId');
    });
  });

  describe('Token URI', async function () {
    it('can set fallback URI', async function () {
      await this.token.setFallbackURI('TestURI');
      expect(await this.token.getFallbackURI()).to.be.eql('TestURI');
    });

    it('gets fallback URI if no active resources on token', async function () {
      const tokenId = 1;
      const fallBackUri = 'fallback404';
      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await this.token.setFallbackURI(fallBackUri);
      expect(await this.token.tokenURI(tokenId)).to.eql(fallBackUri);
    });

    it('can get token URI when resource is not enumerated', async function () {
      const tokenId = 1;
      await addResourcesToToken(this.token, tokenId);
      expect(await this.token.tokenURI(tokenId)).to.eql(metaURIDefault);
    });

    it('can get token URI when resource is enumerated', async function () {
      const tokenId = 1;
      const resId = BigNumber.from(1);
      await addResourcesToToken(this.token, tokenId);
      await this.token.setTokenEnumeratedResource(resId, true);
      expect(await this.token.isTokenEnumeratedResource(resId)).to.eql(true);
      expect(await this.token.tokenURI(tokenId)).to.eql(`${metaURIDefault}${tokenId}`);
    });

    it('can get token URI at specific index', async function () {
      const tokenId = 1;
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);

      await this.token['mint(address,uint256)'](owner.address, tokenId);
      await this.token.addResourceEntry(resId, 'UriA');
      await this.token.addResourceEntry(resId2, 'UriB');
      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.addResourceToToken(tokenId, resId2, 0);
      await this.token.acceptResource(tokenId, 0);
      await this.token.acceptResource(tokenId, 0);

      expect(await this.token.tokenURIAtIndex(tokenId, 1)).to.eql('UriB');
    });
  });

  async function addResources(token: Contract, ids: BigNumber[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await token.addResourceEntry(ids[i], metaURIDefault);
    }
  }

  async function addResourcesToToken(token: Contract, tokenId: number): Promise<void> {
    const resId = BigNumber.from(1);
    const resId2 = BigNumber.from(2);
    await token['mint(address,uint256)'](owner.address, tokenId);
    await addResources(token, [resId, resId2]);
    await token.addResourceToToken(tokenId, resId, 0);
    await token.addResourceToToken(tokenId, resId2, 0);
    await token.acceptResource(tokenId, 0);
    await token.acceptResource(tokenId, 0);
  }
}

export default shouldBehaveLikeMultiResource;
