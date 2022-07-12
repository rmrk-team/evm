import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';

async function shouldBehaveLikeEquippableResources(
  equippableContractName: string,
  nestingContractName: string,
) {
  let chunky: Contract;
  let chunkyEquip: Contract;

  let owner: SignerWithAddress;
  let addrs: any[];

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  const equippableRefIdDefault = BigNumber.from(1);
  const metaURIDefault = 'metaURI';
  const baseAddressDefault = ethers.constants.AddressZero;
  const customDefault: string[] = [];

  beforeEach(async () => {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const CHNKY = await ethers.getContractFactory(nestingContractName);
    chunky = await CHNKY.deploy(name, symbol);
    await chunky.deployed();

    const ChnkEqup = await ethers.getContractFactory(equippableContractName);
    chunkyEquip = await ChnkEqup.deploy();
    chunkyEquip.setNestingAddress(chunky.address);
    await chunkyEquip.deployed();
  });

  describe('Init', async function () {
    it('it can get names and symbols', async function () {
      expect(await chunky.name()).to.equal(name);
      expect(await chunky.symbol()).to.equal(symbol);
    });
  });

  describe('Interface support', async function () {
    it('can support IERC165', async function () {
      expect(await chunky.supportsInterface('0x01ffc9a7')).to.equal(true);
    });
    it('can support IEquippable', async function () {
      expect(await chunkyEquip.supportsInterface('0xe27dac58')).to.equal(true);
    });
    it('cannot support other interfaceId', async function () {
      expect(await chunkyEquip.supportsInterface('0xffffffff')).to.equal(false);
    });
  });

  describe('Issuer', async function () {
    it('can set and get issuer', async function () {
      const newIssuerAddr = addrs[1].address;
      expect(await chunky.getIssuer()).to.equal(owner.address);

      await chunky.setIssuer(newIssuerAddr);
      expect(await chunky.getIssuer()).to.equal(newIssuerAddr);
    });

    it('cannot set issuer if not issuer', async function () {
      const newIssuer = addrs[1];
      await expect(
        chunky.connect(newIssuer).setIssuer(newIssuer.address),
      ).to.be.revertedWithCustomError(chunky, 'RMRKOnlyIssuer');
    });
  });

  describe('Resource storage', async function () {
    it('can add resource', async function () {
      const id = BigNumber.from(1);

      await expect(
        chunkyEquip.addResourceEntry(
          {
            id: id,
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
            custom: customDefault,
          },
          [],
          [],
        ),
      )
        .to.emit(chunkyEquip, 'ResourceSet')
        .withArgs(id);
    });

    it('cannot get non existing resource', async function () {
      const id = BigNumber.from(1);
      await expect(chunkyEquip.getExtendedResource(id)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKNoResourceMatchingId',
      );
    });

    it('cannot add resource entry if not issuer', async function () {
      const id = BigNumber.from(1);
      await expect(
        chunkyEquip.connect(addrs[1]).addResourceEntry(
          {
            id: id,
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
            custom: customDefault,
          },
          [],
          [],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKOnlyIssuer');
    });

    it('cannot add resource entry with parts and no base', async function () {
      const id = BigNumber.from(1);
      await expect(
        chunkyEquip.addResourceEntry(
          {
            id: id,
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
            custom: customDefault,
          },
          [1],
          [],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKBaseRequiredForParts');
      await expect(
        chunkyEquip.addResourceEntry(
          {
            id: id,
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
            custom: customDefault,
          },
          [],
          [1],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKBaseRequiredForParts');
    });

    it('cannot overwrite resource', async function () {
      const id = BigNumber.from(1);

      await chunkyEquip.addResourceEntry(
        {
          id: id,
          equippableRefId: equippableRefIdDefault,
          metadataURI: metaURIDefault,
          baseAddress: baseAddressDefault,
          custom: customDefault,
        },
        [],
        [],
      );
      await expect(
        chunkyEquip.addResourceEntry(
          {
            id: id,
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
            custom: customDefault,
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
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
            custom: customDefault,
          },
          [],
          [],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKWriteToZero');
    });

    it('cannot add same resource twice', async function () {
      const id = BigNumber.from(1);

      await expect(
        chunkyEquip.addResourceEntry(
          {
            id: id,
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
            custom: customDefault,
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
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
            custom: customDefault,
          },
          [],
          [],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKResourceAlreadyExists');
    });

    it('can add and remove custom data for resource', async function () {
      const resId = BigNumber.from(1);
      const customDataTypeKey = 3;
      await chunkyEquip.addResourceEntry(
        {
          id: resId,
          equippableRefId: equippableRefIdDefault,
          metadataURI: metaURIDefault,
          baseAddress: baseAddressDefault,
          custom: customDefault,
        },
        [],
        [],
      );

      await expect(chunkyEquip.addCustomDataToResource(resId, customDataTypeKey))
        .to.emit(chunkyEquip, 'ResourceCustomDataAdded')
        .withArgs(resId, customDataTypeKey);
      let resource = await chunkyEquip.getExtendedResource(resId);
      expect(resource.custom).to.eql([BigNumber.from(customDataTypeKey)]);

      await expect(chunkyEquip.removeCustomDataFromResource(resId, 0))
        .to.emit(chunkyEquip, 'ResourceCustomDataRemoved')
        .withArgs(resId, customDataTypeKey);
      resource = await chunkyEquip.getExtendedResource(resId);
      expect(resource.custom).to.eql([]);
    });
  });

  describe('Adding resources', async function () {
    it('can add resource to token', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources([resId, resId2]);
      await expect(chunkyEquip.addResourceToToken(tokenId, resId, 0)).to.emit(
        chunkyEquip,
        'ResourceAddedToToken',
      );
      await expect(chunkyEquip.addResourceToToken(tokenId, resId2, 0)).to.emit(
        chunkyEquip,
        'ResourceAddedToToken',
      );

      const pending = await chunkyEquip.getFullPendingExtendedResources(tokenId);
      expect(pending).to.be.eql([
        [resId, equippableRefIdDefault, baseAddressDefault, metaURIDefault, customDefault],
        [resId2, equippableRefIdDefault, baseAddressDefault, metaURIDefault, customDefault],
      ]);

      expect(await chunkyEquip.getPendingExtendedResObjectByIndex(tokenId, 0)).to.eql([
        resId,
        equippableRefIdDefault,
        baseAddressDefault,
        metaURIDefault,
        customDefault,
      ]);
    });

    it('cannot add non existing resource to token', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await expect(chunkyEquip.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKNoResourceMatchingId',
      );
    });

    it('cannot add resource to non existing token', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await addResources([resId]);
      await expect(chunkyEquip.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        chunky,
        'ERC721InvalidTokenId',
      );
    });

    it('cannot add resource twice to the same token', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await expect(chunkyEquip.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKResourceAlreadyExists',
      );
    });

    it('cannot add too many resources to the same token', async function () {
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      for (let i = 1; i <= 128; i++) {
        await addResources([BigNumber.from(i)]);
        await chunkyEquip.addResourceToToken(tokenId, i, 0);
      }

      // Now it's full, next should fail
      const resId = BigNumber.from(129);
      await addResources([resId]);
      await expect(chunkyEquip.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKMaxPendingResourcesReached',
      );
    });

    it('can add same resource to 2 different tokens', async function () {
      const resId = BigNumber.from(1);
      const tokenId1 = 1;
      const tokenId2 = 2;

      await chunky['mint(address,uint256)'](owner.address, tokenId1);
      await chunky['mint(address,uint256)'](owner.address, tokenId2);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId1, resId, 0);
      await chunkyEquip.addResourceToToken(tokenId2, resId, 0);

      expect(await chunkyEquip.getPendingResources(tokenId1)).to.be.eql([resId]);
      expect(await chunkyEquip.getPendingResources(tokenId2)).to.be.eql([resId]);
    });
  });

  describe('Accepting resources', async function () {
    it('can accept resource', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await expect(chunkyEquip.acceptResource(tokenId, 0))
        .to.emit(chunkyEquip, 'ResourceAccepted')
        .withArgs(tokenId, resId);

      const pending = await chunkyEquip.getFullPendingExtendedResources(tokenId);
      expect(pending).to.be.eql([]);

      const accepted = await chunkyEquip.getFullExtendedResources(tokenId);
      expect(accepted).to.eql([
        [resId, equippableRefIdDefault, baseAddressDefault, metaURIDefault, customDefault],
      ]);

      expect(await chunkyEquip.getExtendedResObjectByIndex(tokenId, 0)).to.eql([
        resId,
        equippableRefIdDefault,
        baseAddressDefault,
        metaURIDefault,
        customDefault,
      ]);
    });

    it('can accept multiple resources', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources([resId, resId2]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.addResourceToToken(tokenId, resId2, 0);
      await expect(chunkyEquip.acceptResource(tokenId, 1)) // Accepting resId2
        .to.emit(chunkyEquip, 'ResourceAccepted')
        .withArgs(tokenId, resId2);
      await expect(chunkyEquip.acceptResource(tokenId, 0))
        .to.emit(chunkyEquip, 'ResourceAccepted')
        .withArgs(tokenId, resId);

      const pending = await chunkyEquip.getFullPendingExtendedResources(tokenId);
      expect(pending).to.be.eql([]);

      const accepted = await chunkyEquip.getFullExtendedResources(tokenId);
      expect(accepted).to.eql([
        [resId2, equippableRefIdDefault, baseAddressDefault, metaURIDefault, customDefault],
        [resId, equippableRefIdDefault, baseAddressDefault, metaURIDefault, customDefault],
      ]);
    });

    // approved not implemented yet
    it.skip('can accept resource if approved', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;
      const approvedAddress = addrs[1];
      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await chunky.approve(approvedAddress.address, tokenId);
      await addResources([resId]);

      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.connect(approvedAddress).acceptResource(tokenId, 0);

      const pending = await chunkyEquip.getFullPendingExtendedResources(tokenId);
      expect(pending).to.be.eql([]);
    });

    it('cannot accept resource twice', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.acceptResource(tokenId, 0);

      await expect(chunkyEquip.acceptResource(tokenId, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKIndexOutOfRange',
      );
    });

    it('cannot accept resource if not owner', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await expect(
        chunkyEquip.connect(addrs[1]).acceptResource(tokenId, 0),
      ).to.be.revertedWithCustomError(chunkyEquip, 'ERC721NotApprovedOrOwner');
    });

    it('cannot accept non existing resource', async function () {
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await expect(chunkyEquip.acceptResource(tokenId, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKIndexOutOfRange',
      );
    });
  });

  describe('Overwriting resources', async function () {
    it('can add resource to token overwritting an existing one', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources([resId, resId2]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.acceptResource(tokenId, 0);

      // Add new resource to overwrite the first, and accept
      const activeResources = await chunkyEquip.getActiveResources(tokenId);
      await expect(chunkyEquip.addResourceToToken(tokenId, resId2, activeResources[0])).to.emit(
        chunkyEquip,
        'ResourceOverwriteProposed',
      );
      const pendingResources = await chunkyEquip.getPendingResources(tokenId);

      expect(await chunkyEquip.getResourceOverwrites(tokenId, pendingResources[0])).to.eql(
        activeResources[0],
      );
      await expect(chunkyEquip.acceptResource(tokenId, 0)).to.emit(
        chunkyEquip,
        'ResourceOverwritten',
      );

      expect(await chunkyEquip.getFullExtendedResources(tokenId)).to.be.eql([
        [resId2, equippableRefIdDefault, baseAddressDefault, metaURIDefault, customDefault],
      ]);
      // Overwrite should be gone
      expect(await chunkyEquip.getResourceOverwrites(tokenId, pendingResources[0])).to.eql(
        BigNumber.from(0),
      );
    });

    it('can overwrite non existing resource to token, it could have been deleted', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, ethers.utils.hexZeroPad('0x1', 8));
      await chunkyEquip.acceptResource(tokenId, 0);

      expect(await chunkyEquip.getFullExtendedResources(tokenId)).to.be.eql([
        [resId, equippableRefIdDefault, baseAddressDefault, metaURIDefault, customDefault],
      ]);
    });
  });

  describe('Rejecting resources', async function () {
    it('can reject resource', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);

      await expect(chunkyEquip.rejectResource(tokenId, 0)).to.emit(chunkyEquip, 'ResourceRejected');

      const pending = await chunkyEquip.getFullPendingExtendedResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await chunkyEquip.getFullExtendedResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('can reject resource and overwrites are cleared', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources([resId, resId2]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.acceptResource(tokenId, 0);

      // Will try to overwrite but we reject it
      await chunkyEquip.addResourceToToken(tokenId, resId2, resId);
      await chunkyEquip.rejectResource(tokenId, 0);

      expect(await chunkyEquip.getResourceOverwrites(tokenId, resId2)).to.eql(BigNumber.from(0));
    });

    // FIXME: approve not implemented yet
    it.skip('can reject resource if approved', async function () {
      const resId = BigNumber.from(1);
      const approvedAddress = addrs[1];
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await chunky.approve(approvedAddress.address, tokenId);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);

      await expect(chunkyEquip.rejectResource(tokenId, 0)).to.emit(chunkyEquip, 'ResourceRejected');

      const pending = await chunkyEquip.getFullPendingExtendedResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await chunkyEquip.getFullExtendedResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('can reject all resources', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources([resId, resId2]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.addResourceToToken(tokenId, resId2, 0);

      await expect(chunkyEquip.rejectAllResources(tokenId)).to.emit(
        chunkyEquip,
        'ResourceRejected',
      );

      const pending = await chunkyEquip.getFullPendingExtendedResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await chunkyEquip.getFullExtendedResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('can reject all resources and overwrites are cleared', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources([resId, resId2]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.acceptResource(tokenId, 0);

      // Will try to overwrite but we reject all
      await chunkyEquip.addResourceToToken(tokenId, resId2, resId);
      await chunkyEquip.rejectAllResources(tokenId);

      expect(await chunkyEquip.getResourceOverwrites(tokenId, resId2)).to.eql(BigNumber.from(0));
    });

    it('can reject all pending resources at max capacity', async function () {
      const tokenId = 1;
      const resArr = [];

      for (let i = 1; i < 128; i++) {
        resArr.push(BigNumber.from(i));
      }

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources(resArr);

      for (let i = 1; i < 128; i++) {
        await chunkyEquip.addResourceToToken(tokenId, i, 1);
      }
      await chunkyEquip.rejectAllResources(tokenId);

      expect(await chunkyEquip.getResourceOverwrites(1, 2)).to.eql(BigNumber.from(0));
    });

    // FIXME: approve not implemented yet
    it.skip('can reject all resources if approved', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;
      const approvedAddress = addrs[1];

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await chunky.approve(approvedAddress.address, tokenId);
      await addResources([resId, resId2]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.addResourceToToken(tokenId, resId2, 0);

      await expect(chunkyEquip.connect(approvedAddress).rejectAllResources(tokenId)).to.emit(
        chunkyEquip,
        'ResourceRejected',
      );

      const pending = await chunkyEquip.getFullPendingExtendedResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await chunkyEquip.getFullExtendedResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('cannot reject resource twice', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.rejectResource(tokenId, 0);

      await expect(chunkyEquip.rejectResource(tokenId, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKIndexOutOfRange',
      );
    });

    it('cannot reject resource nor reject all if not owner', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await addResources([resId]);
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);

      await expect(
        chunkyEquip.connect(addrs[1]).rejectResource(tokenId, 0),
      ).to.be.revertedWithCustomError(chunkyEquip, 'ERC721NotApprovedOrOwner');
      await expect(
        chunkyEquip.connect(addrs[1]).rejectAllResources(tokenId),
      ).to.be.revertedWithCustomError(chunkyEquip, 'ERC721NotApprovedOrOwner');
    });

    it('cannot reject non existing resource', async function () {
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await expect(chunkyEquip.rejectResource(tokenId, 0)).to.be.revertedWithCustomError(
        chunkyEquip,
        'RMRKIndexOutOfRange',
      );
    });
  });

  describe('Priorities', async function () {
    it('can set and get priorities', async function () {
      const tokenId = 1;
      await addResourcesToToken(tokenId);

      expect(await chunkyEquip.getActiveResourcePriorities(tokenId)).to.be.eql([0, 0]);
      await expect(chunkyEquip.setPriority(tokenId, [2, 1]))
        .to.emit(chunkyEquip, 'ResourcePrioritySet')
        .withArgs(tokenId);
      expect(await chunkyEquip.getActiveResourcePriorities(tokenId)).to.be.eql([2, 1]);
    });

    // FIXME: approve not implemented yet
    it.skip('can set and get priorities if approved', async function () {
      const tokenId = 1;
      const approvedAddress = addrs[1];

      await addResourcesToToken(tokenId);
      await chunky.approve(approvedAddress.address, tokenId);

      expect(await chunkyEquip.getActiveResourcePriorities(tokenId)).to.be.eql([0, 0]);
      await expect(chunkyEquip.connect(approvedAddress).setPriority(tokenId, [2, 1]))
        .to.emit(chunkyEquip, 'ResourcePrioritySet')
        .withArgs(tokenId);
      expect(await chunkyEquip.getActiveResourcePriorities(tokenId)).to.be.eql([2, 1]);
    });

    it('cannot set priorities for non owned token', async function () {
      const tokenId = 1;
      await addResourcesToToken(tokenId);
      await expect(
        chunkyEquip.connect(addrs[1]).setPriority(tokenId, [2, 1]),
      ).to.be.revertedWithCustomError(chunkyEquip, 'ERC721NotApprovedOrOwner');
    });

    it('cannot set different number of priorities', async function () {
      const tokenId = 1;
      await addResourcesToToken(tokenId);
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

  describe('Token URI', async function () {
    it('can set fallback URI', async function () {
      await chunkyEquip.setFallbackURI('TestURI');
      expect(await chunkyEquip.getFallbackURI()).to.be.eql('TestURI');
    });

    it('gets fallback URI if no active resources on token', async function () {
      const tokenId = 1;
      const fallBackUri = 'fallback404';
      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await chunkyEquip.setFallbackURI(fallBackUri);
      expect(await chunkyEquip.tokenURI(tokenId)).to.eql(fallBackUri);
    });

    it('can get token URI when resource is not enumerated', async function () {
      const tokenId = 1;
      await addResourcesToToken(tokenId);
      expect(await chunkyEquip.tokenURI(tokenId)).to.eql(metaURIDefault);
    });

    it('can get token URI when resource is enumerated', async function () {
      const tokenId = 1;
      const resId = BigNumber.from(1);
      await addResourcesToToken(tokenId);
      await chunkyEquip.setTokenEnumeratedResource(resId, true);
      expect(await chunkyEquip.isTokenEnumeratedResource(resId)).to.eql(true);
      expect(await chunkyEquip.tokenURI(tokenId)).to.eql(`${metaURIDefault}${tokenId}`);
    });

    it('can get token URI at specific index', async function () {
      const tokenId = 1;
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await chunkyEquip.addResourceEntry(
        {
          id: resId,
          equippableRefId: equippableRefIdDefault,
          metadataURI: 'UriA',
          baseAddress: baseAddressDefault,
          custom: customDefault,
        },
        [],
        [],
      );
      await chunkyEquip.addResourceEntry(
        {
          id: resId2,
          equippableRefId: equippableRefIdDefault,
          metadataURI: 'UriB',
          baseAddress: baseAddressDefault,
          custom: customDefault,
        },
        [],
        [],
      );
      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.addResourceToToken(tokenId, resId2, 0);
      await chunkyEquip.acceptResource(tokenId, 0);
      await chunkyEquip.acceptResource(tokenId, 0);

      expect(await chunkyEquip.tokenURIAtIndex(tokenId, 1)).to.eql('UriB');
    });

    it('can get token URI by specific custom value', async function () {
      const tokenId = 1;
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      // We define some custom types and values which mean something to the issuer.
      // Resource 1 has Width, Height and Type. Resource 2 has Area and Type.
      const customDataWidthKey = 1;
      const customDataWidthValue = ethers.utils.hexZeroPad('0x1111', 16);
      const customDataHeightKey = 2;
      const customDataHeightValue = ethers.utils.hexZeroPad('0x1111', 16);
      const customDataTypeKey = 3;
      const customDataTypeValueA = ethers.utils.hexZeroPad('0xAAAA', 16);
      const customDataTypeValueB = ethers.utils.hexZeroPad('0xBBBB', 16);
      const customDataAreaKey = 4;
      const customDataAreaValue = ethers.utils.hexZeroPad('0x00FF', 16);

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await chunkyEquip.addResourceEntry(
        {
          id: resId,
          equippableRefId: equippableRefIdDefault,
          metadataURI: 'UriA',
          baseAddress: baseAddressDefault,
          custom: [customDataWidthKey, customDataHeightKey, customDataTypeKey],
        },
        [],
        [],
      );
      await chunkyEquip.addResourceEntry(
        {
          id: resId2,
          equippableRefId: equippableRefIdDefault,
          metadataURI: 'UriB',
          baseAddress: baseAddressDefault,
          custom: [customDataTypeKey, customDataAreaKey],
        },
        [],
        [],
      );
      await expect(
        chunkyEquip.setCustomResourceData(resId, customDataWidthKey, customDataWidthValue),
      )
        .to.emit(chunkyEquip, 'ResourceCustomDataSet')
        .withArgs(resId, customDataWidthKey);
      await chunkyEquip.setCustomResourceData(resId, customDataHeightKey, customDataHeightValue);
      await chunkyEquip.setCustomResourceData(resId, customDataTypeKey, customDataTypeValueA);
      await chunkyEquip.setCustomResourceData(resId2, customDataAreaKey, customDataAreaValue);
      await chunkyEquip.setCustomResourceData(resId2, customDataTypeKey, customDataTypeValueB);

      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.addResourceToToken(tokenId, resId2, 0);
      await chunkyEquip.acceptResource(tokenId, 0);
      await chunkyEquip.acceptResource(tokenId, 0);

      // Finally, user can get the right resource filtering by custom data.
      // In this case, we filter by type being equal to 0xAAAA. (Whatever that means for the issuer)
      expect(
        await chunkyEquip.tokenURIForCustomValue(tokenId, customDataTypeKey, customDataTypeValueB),
      ).to.eql('UriB');
    });

    it('gets fall back if matching value is not find on custom data', async function () {
      const tokenId = 1;
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      // We define a custom data for 'type'.
      const customDataTypeKey = 1;
      const customDataTypeValueA = ethers.utils.hexZeroPad('0xAAAA', 16);
      const customDataTypeValueB = ethers.utils.hexZeroPad('0xBBBB', 16);
      const customDataTypeValueC = ethers.utils.hexZeroPad('0xCCCC', 16);
      const customDataOtherKey = 2;

      await chunky['mint(address,uint256)'](owner.address, tokenId);

      await chunkyEquip.addResourceEntry(
        {
          id: resId,
          equippableRefId: equippableRefIdDefault,
          metadataURI: 'srcA',
          baseAddress: baseAddressDefault,
          custom: [customDataTypeKey],
        },
        [],
        [],
      );
      await chunkyEquip.addResourceEntry(
        {
          id: resId2,
          equippableRefId: equippableRefIdDefault,
          metadataURI: 'srcB',
          baseAddress: baseAddressDefault,
          custom: [customDataTypeKey],
        },
        [],
        [],
      );
      await chunkyEquip.setCustomResourceData(resId, customDataTypeKey, customDataTypeValueA);
      await chunkyEquip.setCustomResourceData(resId2, customDataTypeKey, customDataTypeValueB);

      await chunkyEquip.addResourceToToken(tokenId, resId, 0);
      await chunkyEquip.addResourceToToken(tokenId, resId2, 0);
      await chunkyEquip.acceptResource(tokenId, 0);
      await chunkyEquip.acceptResource(tokenId, 0);

      await chunkyEquip.setFallbackURI('fallback404');

      // No resource has this custom value for type:
      expect(
        await chunkyEquip.tokenURIForCustomValue(tokenId, customDataTypeKey, customDataTypeValueC),
      ).to.eql('fallback404');
      // No resource has this custom key:
      expect(
        await chunkyEquip.tokenURIForCustomValue(tokenId, customDataOtherKey, customDataTypeValueA),
      ).to.eql('fallback404');
    });
  });

  async function addResources(ids: BigNumber[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await chunkyEquip.addResourceEntry(
        {
          id: ids[i],
          equippableRefId: equippableRefIdDefault,
          metadataURI: metaURIDefault,
          baseAddress: baseAddressDefault,
          custom: customDefault,
        },
        [],
        [],
      );
    }
  }

  async function addResourcesToToken(tokenId: number): Promise<void> {
    const resId = BigNumber.from(1);
    const resId2 = BigNumber.from(2);
    await chunky['mint(address,uint256)'](owner.address, tokenId);
    await addResources([resId, resId2]);
    await chunkyEquip.addResourceToToken(tokenId, resId, 0);
    await chunkyEquip.addResourceToToken(tokenId, resId2, 0);
    await chunkyEquip.acceptResource(tokenId, 0);
    await chunkyEquip.acceptResource(tokenId, 0);
  }
}

export default shouldBehaveLikeEquippableResources;
