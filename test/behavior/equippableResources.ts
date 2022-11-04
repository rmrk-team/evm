import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import { bn } from '../utils';
import { IERC165, IRMRKEquippable, IOtherInterface } from '../interfaces';

async function shouldBehaveLikeEquippableResources(
  mint: (token: Contract, to: string) => Promise<number>,
) {
  let chunky: Contract;
  let chunkyEquip: Contract;
  let renderUtils: Contract;

  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const equippableGroupIdDefault = bn(1);
  const metaURIDefault = 'metaURI';
  const baseAddressDefault = ethers.constants.AddressZero;

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;
    chunky = this.nesting;
    chunkyEquip = this.equip;
    renderUtils = this.renderUtils;
  });

  describe('Interface support', async function () {
    it('can support IERC165', async function () {
      expect(await chunky.supportsInterface(IERC165)).to.equal(true);
    });

    it('can support IEquippable', async function () {
      expect(await chunkyEquip.supportsInterface(IRMRKEquippable)).to.equal(true);
    });

    it('cannot support other interfaceId', async function () {
      expect(await chunkyEquip.supportsInterface(IOtherInterface)).to.equal(false);
    });
  });

  describe('Resource storage', async function () {
    it('can add resource', async function () {
      const id = bn(1);

      await expect(
        chunkyEquip.addResourceEntry(
          {
            id: id,
            equippableGroupId: equippableGroupIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
          },
          [],
          [],
        ),
      )
        .to.emit(chunkyEquip, 'ResourceSet')
        .withArgs(id);
    });

    it('cannot get non existing resource', async function () {
      const id = bn(1);
      await expect(chunkyEquip.getExtendedResource(id)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKNoResourceMatchingId',
      );
    });

    it('cannot add resource entry with parts and no base', async function () {
      const id = bn(1);
      await expect(
        chunkyEquip.addResourceEntry(
          {
            id: id,
            equippableGroupId: equippableGroupIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
          },
          [1],
          [],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKBaseRequiredForParts');
      await expect(
        chunkyEquip.addResourceEntry(
          {
            id: id,
            equippableGroupId: equippableGroupIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
          },
          [],
          [1],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKBaseRequiredForParts');
    });

    it('cannot add a resource with an existing ID', async function () {
      const id = bn(1);

      await chunkyEquip.addResourceEntry(
        {
          id: id,
          equippableGroupId: equippableGroupIdDefault,
          metadataURI: metaURIDefault,
          baseAddress: baseAddressDefault,
        },
        [],
        [],
      );
      await expect(
        chunkyEquip.addResourceEntry(
          {
            id: id,
            equippableGroupId: equippableGroupIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
          },
          [],
          [],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKResourceAlreadyExists');
    });

    it('cannot add resource with id 0', async function () {
      const id = 0;

      await expect(
        chunkyEquip.addResourceEntry(
          {
            id: id,
            equippableGroupId: equippableGroupIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
          },
          [],
          [],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKIdZeroForbidden');
    });

    it('cannot add same resource twice', async function () {
      const id = bn(1);

      await expect(
        chunkyEquip.addResourceEntry(
          {
            id: id,
            equippableGroupId: equippableGroupIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
          },
          [],
          [],
        ),
      )
        .to.emit(chunkyEquip, 'ResourceSet')
        .withArgs(id);

      await expect(
        chunkyEquip.addResourceEntry(
          {
            id: id,
            equippableGroupId: equippableGroupIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
          },
          [],
          [],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKResourceAlreadyExists');
    });
  });

  describe('Adding resources', async function () {
    it('can add resource to token', async function () {
      const resId = bn(1);
      const resId2 = bn(2);
      const tokenId = await mint(chunky, owner.address);
      await addResources([resId, resId2]);
      await expect(chunkyEquip.addResourceToToken(tokenId, resId, 0)).to.emit(
        chunkyEquip,
        'ResourceAddedToToken',
      );
      await expect(chunkyEquip.addResourceToToken(tokenId, resId2, 0)).to.emit(
        chunkyEquip,
        'ResourceAddedToToken',
      );

      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullPendingExtendedResources === undefined) {
        const pendingResources = await chunkyEquip.getPendingResources(tokenId);
        expect(await renderUtils.getResourcesById(chunkyEquip.address, pendingResources)).to.be.eql(
          [metaURIDefault, metaURIDefault],
        );
      } else {
        const pending = await chunkyEquip.getFullPendingExtendedResources(tokenId);
        expect(pending).to.be.eql([
          [resId, equippableGroupIdDefault, baseAddressDefault, metaURIDefault],
          [resId2, equippableGroupIdDefault, baseAddressDefault, metaURIDefault],
        ]);
      }
    });

    it('cannot add non existing resource to token', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await expect(chunkyEquip.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKNoResourceMatchingId',
      );
    });

    it('can add resource to non existing token and it is pending when minted', async function () {
      const resId = bn(1);
      const lastTokenId = await mint(chunky, owner.address);
      const nextTokenId = lastTokenId + 1; // not existing yet

      await addResources([resId]);
      await chunkyEquip.addResourceToToken(nextTokenId, resId, 0);
      await mint(chunky, owner.address);

      expect(await chunkyEquip.getPendingResources(nextTokenId)).to.eql([resId]);
    });

    it('cannot add resource twice to the same token', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await expect(chunkyEquip.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKResourceAlreadyExists',
      );
    });

    it('cannot add too many resources to the same token', async function () {
      const tokenId = await mint(chunky, owner.address);
      for (let i = 1; i <= 128; i++) {
        await addResources([bn(i)]);
        await chunkyEquip.addResourceToToken(tokenId, i, 0);
      }

      // Now it's full, next should fail
      const resId = bn(129);
      await addResources([resId]);
      await expect(chunkyEquip.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKMaxPendingResourcesReached',
      );
    });

    it('can add same resource to 2 different tokens', async function () {
      const resId = bn(1);
      const tokenId1 = await mint(chunky, owner.address);
      const tokenId2 = await mint(chunky, owner.address);

      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId1, resId, 0);
      await chunkyEquip.addResourceToToken(tokenId2, resId, 0);

      expect(await chunkyEquip.getPendingResources(tokenId1)).to.be.eql([resId]);
      expect(await chunkyEquip.getPendingResources(tokenId2)).to.be.eql([resId]);
    });
  });

  describe('Accepting resources', async function () {
    it('can accept resource', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await expect(chunkyEquip.acceptResource(tokenId, 0, resId))
        .to.emit(chunkyEquip, 'ResourceAccepted')
        .withArgs(tokenId, resId, 0);

      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullPendingExtendedResources === undefined) {
        expect(await chunkyEquip.getPendingResources(tokenId)).to.be.eql([]);
      } else {
        expect(await chunkyEquip.getFullPendingExtendedResources(tokenId)).to.be.eql([]);
      }

      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullExtendedResources === undefined) {
        const activeResources = await chunkyEquip.getActiveResources(tokenId);
        expect(await renderUtils.getResourcesById(chunkyEquip.address, activeResources)).to.eql([
          metaURIDefault,
        ]);
      } else {
        expect(await chunkyEquip.getFullExtendedResources(tokenId)).to.eql([
          [resId, equippableGroupIdDefault, baseAddressDefault, metaURIDefault],
        ]);
      }
    });

    it('can accept multiple resources', async function () {
      const resId = bn(1);
      const resId2 = bn(2);
      const tokenId = await mint(chunky, owner.address);
      await addResources([resId, resId2]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.addResourceToToken(tokenId, resId2, 0);
      await expect(chunkyEquip.acceptResource(tokenId, 1, resId2))
        .to.emit(chunkyEquip, 'ResourceAccepted')
        .withArgs(tokenId, resId2, 0);
      await expect(chunkyEquip.acceptResource(tokenId, 0, resId))
        .to.emit(chunkyEquip, 'ResourceAccepted')
        .withArgs(tokenId, resId, 0);

      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullPendingExtendedResources === undefined) {
        expect(await chunkyEquip.getPendingResources(tokenId)).to.be.eql([]);
      } else {
        expect(await chunkyEquip.getFullPendingExtendedResources(tokenId)).to.be.eql([]);
      }

      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullExtendedResources === undefined) {
        const activeResources = await chunkyEquip.getActiveResources(tokenId);
        expect(await renderUtils.getResourcesById(chunkyEquip.address, activeResources)).to.eql([
          metaURIDefault,
          metaURIDefault,
        ]);
      } else {
        expect(await chunkyEquip.getFullExtendedResources(tokenId)).to.eql([
          [resId2, equippableGroupIdDefault, baseAddressDefault, metaURIDefault],
          [resId, equippableGroupIdDefault, baseAddressDefault, metaURIDefault],
        ]);
      }
    });

    // approved not implemented yet
    it('can accept resource if approved', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      const approvedAddress = addrs[1];
      await chunkyEquip.approveForResources(approvedAddress.address, tokenId);
      await addResources([resId]);

      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.connect(approvedAddress).acceptResource(tokenId, 0, resId);

      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullPendingExtendedResources === undefined) {
        expect(await chunkyEquip.getPendingResources(tokenId)).to.be.eql([]);
      } else {
        expect(await chunkyEquip.getFullPendingExtendedResources(tokenId)).to.be.eql([]);
      }
    });

    it('cannot accept resource twice', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.acceptResource(tokenId, 0, resId);

      await expect(chunkyEquip.acceptResource(tokenId, 0, resId)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKIndexOutOfRange',
      );
    });

    it('cannot accept resource if not owner', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await expect(
        chunkyEquip.connect(addrs[1]).acceptResource(tokenId, 0, resId),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKNotApprovedForResourcesOrOwner');
    });

    it('cannot accept non existing resource', async function () {
      const tokenId = await mint(chunky, owner.address);
      await expect(chunkyEquip.acceptResource(tokenId, 0, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKIndexOutOfRange',
      );
    });
  });

  describe('Overwriting resources', async function () {
    it('can add resource to token overwritting an existing one', async function () {
      const resId = bn(1);
      const resId2 = bn(2);
      const tokenId = await mint(chunky, owner.address);
      await addResources([resId, resId2]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.acceptResource(tokenId, 0, resId);

      // Add new resource to overwrite the first, and accept
      const activeResources = await chunkyEquip.getActiveResources(tokenId);
      await expect(chunkyEquip.addResourceToToken(tokenId, resId2, activeResources[0]))
        .to.emit(chunkyEquip, 'ResourceAddedToToken')
        .withArgs(tokenId, resId2, resId);
      const pendingResources = await chunkyEquip.getPendingResources(tokenId);

      expect(await chunkyEquip.getResourceOverwrites(tokenId, pendingResources[0])).to.eql(
        activeResources[0],
      );
      await expect(chunkyEquip.acceptResource(tokenId, 0, resId2))
        .to.emit(chunkyEquip, 'ResourceAccepted')
        .withArgs(tokenId, resId2, resId);

      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullExtendedResources === undefined) {
        const activeResources = await chunkyEquip.getActiveResources(tokenId);
        expect(await renderUtils.getResourcesById(chunkyEquip.address, activeResources)).to.be.eql([
          metaURIDefault,
        ]);
      } else {
        expect(await chunkyEquip.getFullExtendedResources(tokenId)).to.be.eql([
          [resId2, equippableGroupIdDefault, baseAddressDefault, metaURIDefault],
        ]);
      }
      // Overwrite should be gone
      expect(await chunkyEquip.getResourceOverwrites(tokenId, pendingResources[0])).to.eql(bn(0));
    });

    it('can overwrite non existing resource to token, it could have been deleted', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, ethers.utils.hexZeroPad('0x1', 8));
      await chunkyEquip.acceptResource(tokenId, 0, resId);

      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullExtendedResources === undefined) {
        const activeResources = await chunkyEquip.getActiveResources(tokenId);
        expect(await renderUtils.getResourcesById(chunkyEquip.address, activeResources)).to.be.eql([
          metaURIDefault,
        ]);
      } else {
        expect(await chunkyEquip.getFullExtendedResources(tokenId)).to.be.eql([
          [resId, equippableGroupIdDefault, baseAddressDefault, metaURIDefault],
        ]);
      }
    });
  });

  describe('Rejecting resources', async function () {
    it('can reject resource', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);

      await expect(chunkyEquip.rejectResource(tokenId, 0, resId)).to.emit(
        chunkyEquip,
        'ResourceRejected',
      );

      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullPendingExtendedResources === undefined) {
        expect(await chunkyEquip.getPendingResources(tokenId)).to.be.eql([]);
      } else {
        expect(await chunkyEquip.getFullPendingExtendedResources(tokenId)).to.be.eql([]);
      }

      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullExtendedResources === undefined) {
        const activeResources = await chunkyEquip.getActiveResources(tokenId);
        expect(await renderUtils.getResourcesById(chunkyEquip.address, activeResources)).to.be.eql(
          [],
        );
      } else {
        expect(await chunkyEquip.getFullExtendedResources(tokenId)).to.be.eql([]);
      }
    });

    it('can reject resource and overwrites are cleared', async function () {
      const resId = bn(1);
      const resId2 = bn(2);
      const tokenId = await mint(chunky, owner.address);
      await addResources([resId, resId2]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.acceptResource(tokenId, 0, resId);

      // Will try to overwrite but we reject it
      await chunkyEquip.addResourceToToken(tokenId, resId2, resId);
      await chunkyEquip.rejectResource(tokenId, 0, resId2);

      expect(await chunkyEquip.getResourceOverwrites(tokenId, resId2)).to.eql(bn(0));
    });

    it('can reject resource if approved', async function () {
      const resId = bn(1);
      const approvedAddress = addrs[1];
      const tokenId = await mint(chunky, owner.address);
      await chunkyEquip.approveForResources(approvedAddress.address, tokenId);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);

      await expect(chunkyEquip.rejectResource(tokenId, 0, resId)).to.emit(
        chunkyEquip,
        'ResourceRejected',
      );

      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullPendingExtendedResources === undefined) {
        expect(await chunkyEquip.getPendingResources(tokenId)).to.be.eql([]);
      } else {
        expect(await chunkyEquip.getFullPendingExtendedResources(tokenId)).to.be.eql([]);
      }
      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullExtendedResources === undefined) {
        const activeResources = await chunkyEquip.getActiveResources(tokenId);
        expect(await renderUtils.getResourcesById(chunkyEquip.address, activeResources)).to.be.eql(
          [],
        );
      } else {
        expect(await chunkyEquip.getFullExtendedResources(tokenId)).to.be.eql([]);
      }
    });

    it('can reject all resources', async function () {
      const resId = bn(1);
      const resId2 = bn(2);
      const tokenId = await mint(chunky, owner.address);
      await addResources([resId, resId2]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.addResourceToToken(tokenId, resId2, 0);

      await expect(chunkyEquip.rejectAllResources(tokenId, 2)).to.emit(
        chunkyEquip,
        'ResourceRejected',
      );

      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullPendingExtendedResources === undefined) {
        expect(await chunkyEquip.getPendingResources(tokenId)).to.be.eql([]);
      } else {
        expect(await chunkyEquip.getFullPendingExtendedResources(tokenId)).to.be.eql([]);
      }
      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullExtendedResources === undefined) {
        const activeResources = await chunkyEquip.getActiveResources(tokenId);
        expect(await renderUtils.getResourcesById(chunkyEquip.address, activeResources)).to.be.eql(
          [],
        );
      } else {
        expect(await chunkyEquip.getFullExtendedResources(tokenId)).to.be.eql([]);
      }
    });

    it('can reject all resources and overwrites are cleared', async function () {
      const resId = bn(1);
      const resId2 = bn(2);
      const tokenId = await mint(chunky, owner.address);
      await addResources([resId, resId2]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.acceptResource(tokenId, 0, resId);

      // Will try to overwrite but we reject all
      await chunkyEquip.addResourceToToken(tokenId, resId2, resId);
      await chunkyEquip.rejectAllResources(tokenId, 1);

      expect(await chunkyEquip.getResourceOverwrites(tokenId, resId2)).to.eql(bn(0));
    });

    it('can reject all pending resources at max capacity', async function () {
      const tokenId = await mint(chunky, owner.address);
      const resArr = [];

      for (let i = 1; i < 128; i++) {
        resArr.push(bn(i));
      }
      await addResources(resArr);

      for (let i = 1; i < 128; i++) {
        await chunkyEquip.addResourceToToken(tokenId, i, 1);
      }
      await chunkyEquip.rejectAllResources(tokenId, 128);

      expect(await chunkyEquip.getResourceOverwrites(1, 2)).to.eql(bn(0));
    });

    it('can reject all resources if approved', async function () {
      const resId = bn(1);
      const resId2 = bn(2);
      const tokenId = await mint(chunky, owner.address);
      const approvedAddress = addrs[1];

      await chunkyEquip.approveForResources(approvedAddress.address, tokenId);
      await addResources([resId, resId2]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.addResourceToToken(tokenId, resId2, 0);

      await expect(chunkyEquip.connect(approvedAddress).rejectAllResources(tokenId, 2)).to.emit(
        chunkyEquip,
        'ResourceRejected',
      );

      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullPendingExtendedResources === undefined) {
        expect(await chunkyEquip.getPendingResources(tokenId)).to.be.eql([]);
      } else {
        expect(await chunkyEquip.getFullPendingExtendedResources(tokenId)).to.be.eql([]);
      }
      // The merged version does not implement this to save size:
      if (chunkyEquip.getFullExtendedResources === undefined) {
        const activeResources = await chunkyEquip.getActiveResources(tokenId);
        expect(await renderUtils.getResourcesById(chunkyEquip.address, activeResources)).to.be.eql(
          [],
        );
      } else {
        expect(await chunkyEquip.getFullExtendedResources(tokenId)).to.be.eql([]);
      }
    });

    it('cannot reject resource twice', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.rejectResource(tokenId, 0, resId);

      await expect(chunkyEquip.rejectResource(tokenId, 0, resId)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKIndexOutOfRange',
      );
    });

    it('cannot reject resource nor reject all if not owner', async function () {
      const resId = bn(1);
      const tokenId = await mint(chunky, owner.address);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);

      await expect(
        chunkyEquip.connect(addrs[1]).rejectResource(tokenId, 0, resId),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKNotApprovedForResourcesOrOwner');
      await expect(
        chunkyEquip.connect(addrs[1]).rejectAllResources(tokenId, 1),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKNotApprovedForResourcesOrOwner');
    });

    it('cannot reject non existing resource', async function () {
      const tokenId = await mint(chunky, owner.address);
      await expect(chunkyEquip.rejectResource(tokenId, 0, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKIndexOutOfRange',
      );
    });
  });

  describe('Priorities', async function () {
    it('can set and get priorities', async function () {
      const tokenId = await addResourcesToToken();

      expect(await chunkyEquip.getActiveResourcePriorities(tokenId)).to.be.eql([0, 0]);
      await expect(chunkyEquip.setPriority(tokenId, [2, 1]))
        .to.emit(chunkyEquip, 'ResourcePrioritySet')
        .withArgs(tokenId);
      expect(await chunkyEquip.getActiveResourcePriorities(tokenId)).to.be.eql([2, 1]);
    });

    it('can set and get priorities if approved', async function () {
      const approvedAddress = addrs[1];
      const tokenId = await addResourcesToToken();

      await chunkyEquip.approveForResources(approvedAddress.address, tokenId);

      expect(await chunkyEquip.getActiveResourcePriorities(tokenId)).to.be.eql([0, 0]);
      await expect(chunkyEquip.connect(approvedAddress).setPriority(tokenId, [2, 1]))
        .to.emit(chunkyEquip, 'ResourcePrioritySet')
        .withArgs(tokenId);
      expect(await chunkyEquip.getActiveResourcePriorities(tokenId)).to.be.eql([2, 1]);
    });

    it('cannot set priorities for non owned token', async function () {
      const tokenId = await addResourcesToToken();
      await expect(
        chunkyEquip.connect(addrs[1]).setPriority(tokenId, [2, 1]),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKNotApprovedForResourcesOrOwner');
    });

    it('cannot set different number of priorities', async function () {
      const tokenId = await addResourcesToToken();
      await expect(chunkyEquip.setPriority(tokenId, [1])).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKBadPriorityListLength',
      );
      await expect(chunkyEquip.setPriority(tokenId, [2, 1, 3])).to.be.revertedWithCustomError(
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
    it('cleans token and resources approvals on transfer', async function () {
      const tokenOwner = addrs[1];
      const newOwner = addrs[2];
      const approved = addrs[3];
      const tokenId = await mint(chunky, tokenOwner.address);
      await chunky.connect(tokenOwner).approve(approved.address, tokenId);
      await chunkyEquip.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(approved.address);
      expect(await chunkyEquip.getApprovedForResources(tokenId)).to.eql(approved.address);

      await chunky.connect(tokenOwner).transferFrom(tokenOwner.address, newOwner.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(ethers.constants.AddressZero);
      expect(await chunkyEquip.getApprovedForResources(tokenId)).to.eql(
        ethers.constants.AddressZero,
      );
    });

    it('cleans token and resources approvals on burn', async function () {
      const tokenOwner = addrs[1];
      const approved = addrs[3];
      const tokenId = await mint(chunky, tokenOwner.address);
      await chunky.connect(tokenOwner).approve(approved.address, tokenId);
      await chunkyEquip.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(approved.address);
      expect(await chunkyEquip.getApprovedForResources(tokenId)).to.eql(approved.address);

      await chunky.connect(tokenOwner)['burn(uint256)'](tokenId);

      await expect(chunky.getApproved(tokenId)).to.be.revertedWithCustomError(
        chunky,
        'ERC721InvalidTokenId',
      );
      await expect(chunkyEquip.getApprovedForResources(tokenId)).to.be.revertedWithCustomError(
        chunky,
        'ERC721InvalidTokenId',
      );
    });
  });

  async function addResources(ids: BigNumber[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await chunkyEquip.addResourceEntry(
        {
          id: ids[i],
          equippableGroupId: equippableGroupIdDefault,
          metadataURI: metaURIDefault,
          baseAddress: baseAddressDefault,
        },
        [],
        [],
      );
    }
  }

  async function addResourcesToToken(): Promise<number> {
    const resId = bn(1);
    const resId2 = bn(2);
    const tokenId = await mint(chunky, owner.address);
    await addResources([resId, resId2]);
    await chunkyEquip.addResourceToToken(tokenId, resId, 0);
    await chunkyEquip.addResourceToToken(tokenId, resId2, 0);
    await chunkyEquip.acceptResource(tokenId, 0, resId);
    await chunkyEquip.acceptResource(tokenId, 0, resId2);

    return tokenId;
  }
}

export default shouldBehaveLikeEquippableResources;
