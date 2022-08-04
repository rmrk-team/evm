import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';

async function shouldSupportInterfaces() {
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
}

// Assumes there's a minted token with tokenId, and that owner is first address after contract deployer
async function shouldHandleApprovalsForResources(tokenId: number) {
  let tokenOwner: SignerWithAddress;
  let approved: SignerWithAddress;
  let operator: SignerWithAddress;
  let notApproved: SignerWithAddress;

  before(async () => {
    const [, ...signersAddr] = await ethers.getSigners();
    tokenOwner = signersAddr[0];
    approved = signersAddr[1];
    operator = signersAddr[2];
    notApproved = signersAddr[3];
  });

  describe('Approvals', async function () {
    it('can approve address for resources', async function () {
      await this.token.connect(tokenOwner).approveForResources(approved.address, tokenId);
      expect(await this.token.getApprovedForResources(tokenId)).to.eql(approved.address);
    });

    it('can approve address for all for resources', async function () {
      await this.token.connect(tokenOwner).setApprovalForAllForResources(operator.address, true);
      expect(
        await this.token.isApprovedForAllForResources(tokenOwner.address, operator.address),
      ).to.eql(true);

      await this.token.connect(tokenOwner).setApprovalForAllForResources(operator.address, false);
      expect(
        await this.token.isApprovedForAllForResources(tokenOwner.address, operator.address),
      ).to.eql(false);
    });

    it('cannot approve owner for resources', async function () {
      await expect(
        this.token.connect(tokenOwner).approveForResources(tokenOwner.address, tokenId),
      ).to.be.revertedWithCustomError(this.token, 'RMRKApprovalForResourcesToCurrentOwner');
    });

    it('cannot approve owner for all resources', async function () {
      await expect(
        this.token.connect(tokenOwner).setApprovalForAllForResources(tokenOwner.address, true),
      ).to.be.revertedWithCustomError(this.token, 'RMRKApproveForResourcesToCaller');
    });

    it('cannot approve owner if not owner', async function () {
      await expect(
        this.token.connect(notApproved).approveForResources(approved.address, tokenId),
      ).to.be.revertedWithCustomError(
        this.token,
        'RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll',
      );
    });

    it('can approve address for resources if approved for all resources', async function () {
      await this.token.connect(tokenOwner).setApprovalForAllForResources(operator.address, true);
      await this.token.connect(operator).approveForResources(approved.address, tokenId);
      expect(await this.token.getApprovedForResources(tokenId)).to.eql(approved.address);
    });
  });
}

// Assumes there's a minted token with tokenId, and that owner is first address after contract deployer
async function shouldHandleAcceptsForResources(
  tokenId: number,
  resId1: BigNumber,
  resData1: string,
  resId2: BigNumber,
  resData2: string,
) {
  let tokenOwner: SignerWithAddress;
  let approved: SignerWithAddress;
  let operator: SignerWithAddress;
  let notApproved: SignerWithAddress;

  before(async () => {
    const [, ...signersAddr] = await ethers.getSigners();
    tokenOwner = signersAddr[0];
    approved = signersAddr[1];
    operator = signersAddr[2];
    notApproved = signersAddr[3];
  });

  describe('Accepting resources', async function () {
    it('can accept resource', async function () {
      expect(await this.token.getFullPendingResources(tokenId)).to.eql([
        [resId1, resData1],
        [resId2, resData2],
      ]);

      await expect(this.token.connect(tokenOwner).acceptResource(tokenId, 0))
        .to.emit(this.token, 'ResourceAccepted')
        .withArgs(tokenId, resId1);

      expect(await this.token.getFullResources(tokenId)).to.eql([[resId1, resData1]]);
      expect(await this.token.getFullPendingResources(tokenId)).to.eql([[resId2, resData2]]);
      expect(await this.token.getResObjectByIndex(tokenId, 0)).to.eql([resId1, resData1]);
    });

    it('can accept multiple resources', async function () {
      await expect(this.token.connect(tokenOwner).acceptResource(tokenId, 1)) // Accepting resId2
        .to.emit(this.token, 'ResourceAccepted')
        .withArgs(tokenId, resId2);
      await expect(this.token.connect(tokenOwner).acceptResource(tokenId, 0)) // Accepting resId1
        .to.emit(this.token, 'ResourceAccepted')
        .withArgs(tokenId, resId1);

      const pending = await this.token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);

      const accepted = await this.token.getFullResources(tokenId);
      expect(accepted).to.eql([
        [resId2, resData2],
        [resId1, resData1],
      ]);
    });

    it('can accept resource if approved', async function () {
      await this.token.connect(tokenOwner).approveForResources(approved.address, tokenId);
      await this.token.connect(approved).acceptResource(tokenId, 0);

      expect(await this.token.getFullResources(tokenId)).to.eql([[resId1, resData1]]);
    });

    it('can accept resource if approved for all', async function () {
      await this.token.connect(tokenOwner).setApprovalForAllForResources(operator.address, true);
      await this.token.connect(operator).acceptResource(tokenId, 0);

      expect(await this.token.getFullResources(tokenId)).to.eql([[resId1, resData1]]);
    });

    it('cannot accept more resources than there are', async function () {
      // Trying to accept over pending size
      await expect(
        this.token.connect(tokenOwner).acceptResource(tokenId, 3),
      ).to.be.revertedWithCustomError(this.token, 'RMRKIndexOutOfRange');

      // Accepts 2 pending
      await this.token.connect(tokenOwner).acceptResource(tokenId, 0);
      await this.token.connect(tokenOwner).acceptResource(tokenId, 0);

      // Nothing more to accept, even on index 0
      await expect(
        this.token.connect(tokenOwner).acceptResource(tokenId, 0),
      ).to.be.revertedWithCustomError(this.token, 'RMRKIndexOutOfRange');
    });

    it('cannot accept resource if not owner or approved', async function () {
      await expect(
        this.token.connect(notApproved).acceptResource(tokenId, 0),
      ).to.be.revertedWithCustomError(this.token, 'RMRKNotApprovedForResourcesOrOwner');
    });
  });
}

// Assumes there's a minted token with tokenId, and that owner is first address after contract deployer
async function shouldHandleRejectsForResources(
  tokenId: number,
  resId1: BigNumber,
  resData1: string,
  resId2: BigNumber,
  resData2: string,
) {
  let tokenOwner: SignerWithAddress;
  let approved: SignerWithAddress;
  let operator: SignerWithAddress;
  let notApproved: SignerWithAddress;

  before(async () => {
    const [, ...signersAddr] = await ethers.getSigners();
    tokenOwner = signersAddr[0];
    approved = signersAddr[1];
    operator = signersAddr[2];
    notApproved = signersAddr[3];
  });

  describe('Rejecting resources', async function () {
    it('can reject resource', async function () {
      await expect(this.token.connect(tokenOwner).rejectResource(tokenId, 0))
        .to.emit(this.token, 'ResourceRejected')
        .withArgs(tokenId, resId1);

      expect(await this.token.getFullResources(tokenId)).to.be.eql([]);
      expect(await this.token.getFullPendingResources(tokenId)).to.eql([[resId2, resData2]]);
    });

    // FIXME: Caller must set up the overwritting resource
    it.skip('can reject resource and overwrites are cleared', async function () {
      await this.token.rejectResource(tokenId, 0);

      expect(await this.token.getResourceOverwrites(tokenId, resId2)).to.eql(BigNumber.from(0));
    });

    it('can reject resource if approved', async function () {
      await this.token.connect(tokenOwner).approveForResources(approved.address, tokenId);
      await this.token.connect(approved).rejectResource(tokenId, 0);

      expect(await this.token.getFullResources(tokenId)).to.be.eql([]);
      expect(await this.token.getFullPendingResources(tokenId)).to.eql([[resId2, resData2]]);
    });

    it('can reject resource if approved for all', async function () {
      await this.token.connect(tokenOwner).setApprovalForAllForResources(operator.address, true);
      await this.token.connect(operator).rejectResource(tokenId, 0);

      expect(await this.token.getFullResources(tokenId)).to.be.eql([]);
      expect(await this.token.getFullPendingResources(tokenId)).to.eql([[resId2, resData2]]);
    });

    it('can reject all resources', async function () {
      await expect(this.token.connect(tokenOwner).rejectAllResources(tokenId))
        .to.emit(this.token, 'ResourceRejected')
        .withArgs(tokenId, 0);

      expect(await this.token.getFullResources(tokenId)).to.be.eql([]);
      expect(await this.token.getFullPendingResources(tokenId)).to.eql([]);
    });

    // FIXME: Caller must set up the overwritting resource
    it.skip('can reject all resources and overwrites are cleared', async function () {
      await this.token.rejectAllResources(tokenId);

      expect(await this.token.getResourceOverwrites(tokenId, resId2)).to.eql(BigNumber.from(0));
    });

    it('can reject allresources if approved', async function () {
      await this.token.connect(tokenOwner).approveForResources(approved.address, tokenId);
      await this.token.connect(approved).rejectAllResources(tokenId);

      expect(await this.token.getFullResources(tokenId)).to.be.eql([]);
      expect(await this.token.getFullPendingResources(tokenId)).to.eql([]);
    });

    it('can reject all resources if approved for all', async function () {
      await this.token.connect(tokenOwner).setApprovalForAllForResources(operator.address, true);
      await this.token.connect(operator).rejectAllResources(tokenId);

      expect(await this.token.getFullResources(tokenId)).to.be.eql([]);
      expect(await this.token.getFullPendingResources(tokenId)).to.eql([]);
    });

    // FIXME: Caller must setup all the pending resources
    it.skip('can reject all pending resources at max capacity', async function () {
      for (let i = 1; i < 128; i++) {
        await this.token.addResourceToToken(tokenId, i, 1);
      }
      await this.token.connect(tokenOwner).rejectAllResources(tokenId);
      expect(await this.token.getFullResources(tokenId)).to.be.eql([]);
      expect(await this.token.getFullPendingResources(tokenId)).to.eql([]);
    });

    it('cannot reject more resources than there are', async function () {
      // Trying to accept over pending size
      await expect(
        this.token.connect(tokenOwner).rejectResource(tokenId, 3),
      ).to.be.revertedWithCustomError(this.token, 'RMRKIndexOutOfRange');

      // Rejects 2 pending
      await this.token.connect(tokenOwner).rejectResource(tokenId, 0);
      await this.token.connect(tokenOwner).rejectResource(tokenId, 0);

      // Nothing more to reject, even on index 0
      await expect(
        this.token.connect(tokenOwner).rejectResource(tokenId, 0),
      ).to.be.revertedWithCustomError(this.token, 'RMRKIndexOutOfRange');
    });

    it('cannot reject resource nor reject all if not owner', async function () {
      await expect(
        this.token.connect(notApproved).rejectResource(tokenId, 0),
      ).to.be.revertedWithCustomError(this.token, 'RMRKNotApprovedForResourcesOrOwner');
      await expect(
        this.token.connect(notApproved).rejectAllResources(tokenId),
      ).to.be.revertedWithCustomError(this.token, 'RMRKNotApprovedForResourcesOrOwner');
    });
  });
}

async function shouldBehaveLikeMultiResource(
  mintFunc: (token: Contract, to: string, tokenId: number) => Promise<void>,
) {
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const metaURIDefault = 'metaURI';

  before(async () => {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;
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

    it('cannot add existing resource', async function () {
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

      await mintFunc(this.token, owner.address, tokenId);
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

      await mintFunc(this.token, owner.address, tokenId);
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

      await mintFunc(this.token, owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await expect(this.token.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        this.token,
        'RMRKResourceAlreadyExists',
      );
    });

    it('cannot add too many resources to the same token', async function () {
      const tokenId = 1;

      await mintFunc(this.token, owner.address, tokenId);
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

      await mintFunc(this.token, owner.address, tokenId1);
      await mintFunc(this.token, owner.address, tokenId2);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId1, resId, 0);
      await this.token.addResourceToToken(tokenId2, resId, 0);

      expect(await this.token.getPendingResources(tokenId1)).to.be.eql([resId]);
      expect(await this.token.getPendingResources(tokenId2)).to.be.eql([resId]);
    });
  });

  describe('Overwriting resources', async function () {
    it('can add resource to token overwritting an existing one', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await mintFunc(this.token, owner.address, tokenId);
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

      await mintFunc(this.token, owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 1);
      await this.token.acceptResource(tokenId, 0);

      expect(await this.token.getFullResources(tokenId)).to.be.eql([[resId, metaURIDefault]]);
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
      await mintFunc(this.token, owner.address, tokenId);
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

      await mintFunc(this.token, owner.address, tokenId);
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
    await mintFunc(token, owner.address, tokenId);
    await addResources(token, [resId, resId2]);
    await token.addResourceToToken(tokenId, resId, 0);
    await token.addResourceToToken(tokenId, resId2, 0);
    await token.acceptResource(tokenId, 0);
    await token.acceptResource(tokenId, 0);
  }
}

export {
  shouldBehaveLikeMultiResource,
  shouldSupportInterfaces,
  shouldHandleApprovalsForResources,
  shouldHandleAcceptsForResources,
  shouldHandleRejectsForResources,
};
