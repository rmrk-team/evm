import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';

async function shouldBehaveLikeMultiResource(
  mint: (token: Contract, to: string) => Promise<number>,
  addResourceEntryFunc: (token: Contract, data?: string) => Promise<BigNumber>,
  addResourceToTokenFunc: (
    token: Contract,
    tokenId: number,
    resId: BigNumber,
    overwrites: BigNumber | number,
  ) => Promise<void>,
) {
  let tokenId: number;
  let tokenOwner: SignerWithAddress;
  let approved: SignerWithAddress;
  let operator: SignerWithAddress;
  let notApproved: SignerWithAddress;
  const metaURIDefault = 'metaURI';

  before(async () => {
    const [, ...signersAddr] = await ethers.getSigners();
    tokenOwner = signersAddr[0];
    approved = signersAddr[1];
    operator = signersAddr[2];
    notApproved = signersAddr[3];
  });

  describe('Interface support', async function () {
    it('can support IERC165', async function () {
      expect(await this.token.supportsInterface('0x01ffc9a7')).to.equal(true);
    });

    it('can support IMultiResource', async function () {
      expect(await this.token.supportsInterface('0xbb5b3194')).to.equal(true);
    });

    it('cannot support other interfaceId', async function () {
      expect(await this.token.supportsInterface('0xffffffff')).to.equal(false);
    });
  });

  describe('With minted token', async function () {
    beforeEach(async function () {
      tokenId = await mint(this.token, tokenOwner.address);
    });

    describe('Add resource', async function () {
      it('can add resource to token', async function () {
        const resId = await addResourceEntryFunc(this.token);
        await expect(addResourceToTokenFunc(this.token, tokenId, resId, 0))
          .to.emit(this.token, 'ResourceAddedToToken')
          .withArgs(tokenId, resId);
      });

      it('cannot add non existing resource to token', async function () {
        const badResId = BigNumber.from(10);
        await expect(
          addResourceToTokenFunc(this.token, tokenId, badResId, 0),
        ).to.be.revertedWithCustomError(this.token, 'RMRKNoResourceMatchingId');
      });
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

    describe('Overwriting resources', async function () {
      it('can add resource to token overwritting an existing one', async function () {
        const resId = await addResourceEntryFunc(this.token);
        const resId2 = await addResourceEntryFunc(this.token);
        await addResourceToTokenFunc(this.token, tokenId, resId, 0);
        await this.token.connect(tokenOwner).acceptResource(tokenId, 0);

        // Add new resource to overwrite the first, and accept
        const activeResources = await this.token.getActiveResources(tokenId);
        await expect(this.token.addResourceToToken(tokenId, resId2, activeResources[0]))
          .to.emit(this.token, 'ResourceOverwriteProposed')
          .withArgs(tokenId, resId2, resId);
        const pendingResources = await this.token.getPendingResources(tokenId);

        expect(await this.token.getResourceOverwrites(tokenId, pendingResources[0])).to.eql(
          activeResources[0],
        );
        await expect(this.token.connect(tokenOwner).acceptResource(tokenId, 0))
          .to.emit(this.token, 'ResourceOverwritten')
          .withArgs(tokenId, resId, resId2);

        expect(await this.token.getFullResources(tokenId)).to.be.eql([[resId2, metaURIDefault]]);
        // Overwrite should be gone
        expect(await this.token.getResourceOverwrites(tokenId, pendingResources[0])).to.eql(
          BigNumber.from(0),
        );
      });

      it('can overwrite non existing resource to token, it could have been deleted', async function () {
        const resId = await addResourceEntryFunc(this.token);

        await addResourceToTokenFunc(this.token, tokenId, resId, 1);
        await this.token.connect(tokenOwner).acceptResource(tokenId, 0);

        expect(await this.token.getFullResources(tokenId)).to.be.eql([[resId, metaURIDefault]]);
      });

      it('can reject resource and overwrites are cleared', async function () {
        const resId = await addResourceEntryFunc(this.token);
        await addResourceToTokenFunc(this.token, tokenId, resId, 0);
        await this.token.connect(tokenOwner).acceptResource(tokenId, 0);

        const resId2 = await addResourceEntryFunc(this.token);
        await addResourceToTokenFunc(this.token, tokenId, resId2, resId);
        await this.token.connect(tokenOwner).rejectResource(tokenId, 0);

        expect(await this.token.getResourceOverwrites(tokenId, resId2)).to.eql(BigNumber.from(0));
      });

      it('can reject all resources and overwrites are cleared', async function () {
        const resId = await addResourceEntryFunc(this.token);
        await addResourceToTokenFunc(this.token, tokenId, resId, 0);
        await this.token.connect(tokenOwner).acceptResource(tokenId, 0);

        const resId2 = await addResourceEntryFunc(this.token);
        await addResourceToTokenFunc(this.token, tokenId, resId2, resId);
        await this.token.connect(tokenOwner).rejectAllResources(tokenId);

        expect(await this.token.getResourceOverwrites(tokenId, resId2)).to.eql(BigNumber.from(0));
      });
    });
  });

  describe('With minted token and 2 pending resources', async function () {
    const resData1 = 'data1';
    const resData2 = 'data2';
    let resId1: BigNumber;
    let resId2: BigNumber;

    beforeEach(async function () {
      // Mint and add 2 resources to token
      tokenId = await mint(this.token, tokenOwner.address);
      resId1 = await addResourceEntryFunc(this.token, resData1);
      resId2 = await addResourceEntryFunc(this.token, resData2);
      await addResourceToTokenFunc(this.token, tokenId, resId1, 0);
      await addResourceToTokenFunc(this.token, tokenId, resId2, 0);
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

      it('can get all resources', async function () {
        expect(await this.token.getAllResources()).to.eql([resId1, resId2]);
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

    describe('Rejecting resources', async function () {
      it('can reject resource', async function () {
        expect(await this.token.getFullPendingResources(tokenId)).to.eql([
          [resId1, resData1],
          [resId2, resData2],
        ]);

        await expect(this.token.connect(tokenOwner).rejectResource(tokenId, 0))
          .to.emit(this.token, 'ResourceRejected')
          .withArgs(tokenId, resId1);

        expect(await this.token.getFullResources(tokenId)).to.be.eql([]);
        expect(await this.token.getFullPendingResources(tokenId)).to.eql([[resId2, resData2]]);
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

    describe('With minted token and 2 accepted resources', async function () {
      beforeEach(async function () {
        await this.token.connect(tokenOwner).acceptResource(tokenId, 0);
        await this.token.connect(tokenOwner).acceptResource(tokenId, 0);
      });

      describe('Priorities', async function () {
        it('can set and get priorities', async function () {
          expect(await this.token.getActiveResourcePriorities(tokenId)).to.be.eql([0, 0]);

          await expect(this.token.connect(tokenOwner).setPriority(tokenId, [2, 1]))
            .to.emit(this.token, 'ResourcePrioritySet')
            .withArgs(tokenId);
          expect(await this.token.getActiveResourcePriorities(tokenId)).to.be.eql([2, 1]);
        });

        it('can set and get priorities if approved', async function () {
          await this.token.connect(tokenOwner).approveForResources(approved.address, tokenId);

          await expect(this.token.connect(approved).setPriority(tokenId, [2, 1]))
            .to.emit(this.token, 'ResourcePrioritySet')
            .withArgs(tokenId);
          expect(await this.token.getActiveResourcePriorities(tokenId)).to.be.eql([2, 1]);
        });

        it('can set and get priorities if approved for all', async function () {
          await this.token
            .connect(tokenOwner)
            .setApprovalForAllForResources(operator.address, true);

          expect(await this.token.getActiveResourcePriorities(tokenId)).to.be.eql([0, 0]);
          await expect(this.token.connect(operator).setPriority(tokenId, [2, 1]))
            .to.emit(this.token, 'ResourcePrioritySet')
            .withArgs(tokenId);
          expect(await this.token.getActiveResourcePriorities(tokenId)).to.be.eql([2, 1]);
        });

        it('cannot set priorities for non owned token', async function () {
          await expect(
            this.token.connect(notApproved).setPriority(tokenId, [2, 1]),
          ).to.be.revertedWithCustomError(this.token, 'RMRKNotApprovedForResourcesOrOwner');
        });

        it('cannot set different number of priorities', async function () {
          await expect(
            this.token.connect(tokenOwner).setPriority(tokenId, [1]),
          ).to.be.revertedWithCustomError(this.token, 'RMRKBadPriorityListLength');
          await expect(
            this.token.connect(tokenOwner).setPriority(tokenId, [2, 1, 3]),
          ).to.be.revertedWithCustomError(this.token, 'RMRKBadPriorityListLength');
        });

        it('cannot set priorities for non existing token', async function () {
          const badTokenId = 99;
          await expect(this.token.connect(tokenOwner).setPriority(badTokenId, [])).to.be.reverted;
        });
      });
    });
  });
}

export default shouldBehaveLikeMultiResource;
