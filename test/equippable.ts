import { ethers } from 'hardhat';
import { expect } from 'chai';
import { RMRKBaseStorageMock, RMRKEquippableMock } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber } from 'ethers';

describe('MultiResource', async () => {
  let base: RMRKBaseStorageMock;
  let chunky: RMRKEquippableMock;
  let monkey: RMRKEquippableMock;

  let owner: SignerWithAddress;
  let addrs: any[];

  const baseName = 'RmrkBaseStorageTest';

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  const name2 = 'petMonkey';
  const symbol2 = 'MONKE';

  const equippableRefIdDefault = BigNumber.from(1);
  const metaURIDefault = 'metaURI';
  const baseAddressDefault = ethers.constants.AddressZero;
  const slotIdDefault = BigNumber.from(1);
  const customDefault: string[] = [];

  beforeEach(async () => {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const Base = await ethers.getContractFactory('RMRKBaseStorageMock');
    base = await Base.deploy(baseName);
    await base.deployed();

    const CHNKY = await ethers.getContractFactory('RMRKEquippableMock');
    chunky = await CHNKY.deploy(name, symbol);
    await chunky.deployed();

    const MONKE = await ethers.getContractFactory('RMRKEquippableMock');
    monkey = await MONKE.deploy(name2, symbol2);
    await monkey.deployed();
  });

  describe('Init', async function () {
    it('it can get names and symbols', async function () {
      expect(await base.name()).to.equal(baseName);
      expect(await chunky.name()).to.equal(name);
      expect(await monkey.name()).to.equal(name2);

      expect(await chunky.symbol()).to.equal(symbol);
      expect(await monkey.symbol()).to.equal(symbol2);
    });
  });

  describe('Interface support', async function () {
    it('can support IERC165', async function () {
      expect(await chunky.supportsInterface('0x01ffc9a7')).to.equal(true);
    });

    it('can support IERC721', async function () {
      expect(await chunky.supportsInterface('0x80ac58cd')).to.equal(true);
    });

    it('can support INesting', async function () {
      expect(await chunky.supportsInterface('0xebb57b26')).to.equal(true);
    });

    it('can support IEquippable', async function () {
      expect(await chunky.supportsInterface('0xebb57b26')).to.equal(true);
    });

    it('cannot support other interfaceId', async function () {
      expect(await chunky.supportsInterface('0xffffffff')).to.equal(false);
    });
  });

  describe('Resource storage', async function () {
    it('can add resource', async function () {
      const id = BigNumber.from(1);

      await expect(
        chunky.addResourceEntry(
          {
            id: id,
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
            slotId: slotIdDefault,
            custom: customDefault,
          },
          [],
          [],
        ),
      )
        .to.emit(chunky, 'ResourceSet')
        .withArgs(id);
    });

    it('cannot get non existing resource', async function () {
      const id = BigNumber.from(1);
      await expect(chunky.getResource(id)).to.be.revertedWith('RMRKNoResourceMatchingId()');
    });

    it('cannot add resource entry if not issuer', async function () {
      const id = BigNumber.from(1);
      await expect(
        chunky.connect(addrs[1]).addResourceEntry(
          {
            id: id,
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
            slotId: slotIdDefault,
            custom: customDefault,
          },
          [],
          [],
        ),
      ).to.be.revertedWith('RMRKOnlyIssuer()');
    });

    it('can set and get issuer', async function () {
      const newIssuerAddr = addrs[1].address;
      expect(await chunky.getIssuer()).to.equal(owner.address);

      await chunky.setIssuer(newIssuerAddr);
      expect(await chunky.getIssuer()).to.equal(newIssuerAddr);
    });

    it('cannot set issuer if not issuer', async function () {
      const newIssuer = addrs[1];
      await expect(chunky.connect(newIssuer).setIssuer(newIssuer.address)).to.be.revertedWith(
        'RMRKOnlyIssuer()',
      );
    });

    it('cannot overwrite resource', async function () {
      const id = BigNumber.from(1);

      await chunky.addResourceEntry(
        {
          id: id,
          equippableRefId: equippableRefIdDefault,
          metadataURI: metaURIDefault,
          baseAddress: baseAddressDefault,
          slotId: slotIdDefault,
          custom: customDefault,
        },
        [],
        [],
      );
      await expect(
        chunky.addResourceEntry(
          {
            id: id,
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
            slotId: slotIdDefault,
            custom: customDefault,
          },
          [],
          [],
        ),
      ).to.be.revertedWith('RMRKResourceAlreadyExists()');
    });

    it('cannot add resource with id 0', async function () {
      const id = 0;

      await expect(
        chunky.addResourceEntry(
          {
            id: id,
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
            slotId: slotIdDefault,
            custom: customDefault,
          },
          [],
          [],
        ),
      ).to.be.revertedWith('RMRKWriteToZero()');
    });

    it('cannot add same resource twice', async function () {
      const id = BigNumber.from(1);

      await expect(
        chunky.addResourceEntry(
          {
            id: id,
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
            slotId: slotIdDefault,
            custom: customDefault,
          },
          [],
          [],
        ),
      )
        .to.emit(chunky, 'ResourceSet')
        .withArgs(id);

      await expect(
        chunky.addResourceEntry(
          {
            id: id,
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
            slotId: slotIdDefault,
            custom: customDefault,
          },
          [],
          [],
        ),
      ).to.be.revertedWith('RMRKResourceAlreadyExists()');
    });

    it('can add and remove custom data for resource', async function () {
      const resId = BigNumber.from(1);
      const customDataTypeKey = 3;
      await chunky.addResourceEntry(
        {
          id: resId,
          equippableRefId: equippableRefIdDefault,
          metadataURI: metaURIDefault,
          baseAddress: baseAddressDefault,
          slotId: slotIdDefault,
          custom: customDefault,
        },
        [],
        [],
      );

      await expect(chunky.addCustomDataToResource(resId, customDataTypeKey))
        .to.emit(chunky, 'ResourceCustomDataAdded')
        .withArgs(resId, customDataTypeKey);
      let resource = await chunky.getResource(resId);
      expect(resource.custom).to.eql([BigNumber.from(customDataTypeKey)]);

      await expect(chunky.removeCustomDataFromResource(resId, 0))
        .to.emit(chunky, 'ResourceCustomDataRemoved')
        .withArgs(resId, customDataTypeKey);
      resource = await chunky.getResource(resId);
      expect(resource.custom).to.eql([]);
    });
  });

  describe('Adding resources', async function () {
    it('can add resource to token', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await addResources([resId, resId2]);
      await expect(chunky.addResourceToToken(tokenId, resId, 0)).to.emit(
        chunky,
        'ResourceAddedToToken',
      );
      await expect(chunky.addResourceToToken(tokenId, resId2, 0)).to.emit(
        chunky,
        'ResourceAddedToToken',
      );

      const pending = await chunky.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([
        [
          resId,
          equippableRefIdDefault,
          metaURIDefault,
          baseAddressDefault,
          slotIdDefault,
          customDefault,
        ],
        [
          resId2,
          equippableRefIdDefault,
          metaURIDefault,
          baseAddressDefault,
          slotIdDefault,
          customDefault,
        ],
      ]);

      expect(await chunky.getPendingResObjectByIndex(tokenId, 0)).to.eql([
        resId,
        equippableRefIdDefault,
        metaURIDefault,
        baseAddressDefault,
        slotIdDefault,
        customDefault,
      ]);
    });

    it('cannot add non existing resource to token', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await expect(chunky.addResourceToToken(tokenId, resId, 0)).to.be.revertedWith(
        'RMRKNoResourceMatchingId()',
      );
    });

    it('cannot add resource to non existing token', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await addResources([resId]);
      await expect(chunky.addResourceToToken(tokenId, resId, 0)).to.be.revertedWith(
        'RMRKOwnerQueryForNonexistentToken()',
      );
    });

    it('cannot add resource twice to the same token', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await addResources([resId]);
      await chunky.addResourceToToken(tokenId, resId, 0);
      await expect(chunky.addResourceToToken(tokenId, resId, 0)).to.be.revertedWith(
        'RMRKResourceAlreadyExists()',
      );
    });

    it('cannot add too many resources to the same token', async function () {
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      for (let i = 1; i <= 128; i++) {
        await addResources([BigNumber.from(i)]);
        await chunky.addResourceToToken(tokenId, i, 0);
      }

      // Now it's full, next should fail
      const resId = BigNumber.from(129);
      await addResources([resId]);
      await expect(chunky.addResourceToToken(tokenId, resId, 0)).to.be.revertedWith(
        'RMRKMaxPendingResourcesReached()',
      );
    });

    it('can add same resource to 2 different tokens', async function () {
      const resId = BigNumber.from(1);
      const tokenId1 = 1;
      const tokenId2 = 2;

      await chunky.mint(owner.address, tokenId1);
      await chunky.mint(owner.address, tokenId2);
      await addResources([resId]);
      await chunky.addResourceToToken(tokenId1, resId, 0);
      await chunky.addResourceToToken(tokenId2, resId, 0);

      expect(await chunky.getPendingResources(tokenId1)).to.be.eql([resId]);
      expect(await chunky.getPendingResources(tokenId2)).to.be.eql([resId]);
    });
  });

  describe('Accepting resources', async function () {
    it('can accept resource', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await addResources([resId]);
      await chunky.addResourceToToken(tokenId, resId, 0);
      await expect(chunky.acceptResource(tokenId, 0))
        .to.emit(chunky, 'ResourceAccepted')
        .withArgs(tokenId, resId);

      const pending = await chunky.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);

      const accepted = await chunky.getFullResources(tokenId);
      expect(accepted).to.eql([
        [
          resId,
          equippableRefIdDefault,
          metaURIDefault,
          baseAddressDefault,
          slotIdDefault,
          customDefault,
        ],
      ]);

      expect(await chunky.getResObjectByIndex(tokenId, 0)).to.eql([
        resId,
        equippableRefIdDefault,
        metaURIDefault,
        baseAddressDefault,
        slotIdDefault,
        customDefault,
      ]);
    });

    it('can accept multiple resources', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await addResources([resId, resId2]);
      await chunky.addResourceToToken(tokenId, resId, 0);
      await chunky.addResourceToToken(tokenId, resId2, 0);
      await expect(chunky.acceptResource(tokenId, 1)) // Accepting resId2
        .to.emit(chunky, 'ResourceAccepted')
        .withArgs(tokenId, resId2);
      await expect(chunky.acceptResource(tokenId, 0))
        .to.emit(chunky, 'ResourceAccepted')
        .withArgs(tokenId, resId);

      const pending = await chunky.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);

      const accepted = await chunky.getFullResources(tokenId);
      expect(accepted).to.eql([
        [
          resId2,
          equippableRefIdDefault,
          metaURIDefault,
          baseAddressDefault,
          slotIdDefault,
          customDefault,
        ],
        [
          resId,
          equippableRefIdDefault,
          metaURIDefault,
          baseAddressDefault,
          slotIdDefault,
          customDefault,
        ],
      ]);
    });

    // approved not implemented yet
    it.skip('can accept resource if approved', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;
      const approvedAddress = addrs[1];
      await chunky.mint(owner.address, tokenId);
      await chunky.approve(approvedAddress.address, tokenId);
      await addResources([resId]);

      await chunky.addResourceToToken(tokenId, resId, 0);
      await chunky.connect(approvedAddress).acceptResource(tokenId, 0);

      const pending = await chunky.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
    });

    it('cannot accept resource twice', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await addResources([resId]);
      await chunky.addResourceToToken(tokenId, resId, 0);
      await chunky.acceptResource(tokenId, 0);

      await expect(chunky.acceptResource(tokenId, 0)).to.be.revertedWith('RMRKIndexOutOfRange()');
    });

    it('cannot accept resource if not owner', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await addResources([resId]);
      await chunky.addResourceToToken(tokenId, resId, 0);
      await expect(chunky.connect(addrs[1]).acceptResource(tokenId, 0)).to.be.revertedWith(
        'ERC721NotApprovedOrOwner()',
      );
    });

    it('cannot accept non existing resource', async function () {
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await expect(chunky.acceptResource(tokenId, 0)).to.be.revertedWith('RMRKIndexOutOfRange()');
    });
  });

  describe('Overwriting resources', async function () {
    it('can add resource to token overwritting an existing one', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await addResources([resId, resId2]);
      await chunky.addResourceToToken(tokenId, resId, 0);
      await chunky.acceptResource(tokenId, 0);

      // Add new resource to overwrite the first, and accept
      const activeResources = await chunky.getActiveResources(tokenId);
      await expect(chunky.addResourceToToken(tokenId, resId2, activeResources[0])).to.emit(
        chunky,
        'ResourceOverwriteProposed',
      );
      const pendingResources = await chunky.getPendingResources(tokenId);

      expect(await chunky.getResourceOverwrites(tokenId, pendingResources[0])).to.eql(
        activeResources[0],
      );
      await expect(chunky.acceptResource(tokenId, 0)).to.emit(chunky, 'ResourceOverwritten');

      expect(await chunky.getFullResources(tokenId)).to.be.eql([
        [
          resId2,
          equippableRefIdDefault,
          metaURIDefault,
          baseAddressDefault,
          slotIdDefault,
          customDefault,
        ],
      ]);
      // Overwrite should be gone
      expect(await chunky.getResourceOverwrites(tokenId, pendingResources[0])).to.eql(
        BigNumber.from(0),
      );
    });

    it('can overwrite non existing resource to token, it could have been deleted', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await addResources([resId]);
      await chunky.addResourceToToken(tokenId, resId, ethers.utils.hexZeroPad('0x1', 8));
      await chunky.acceptResource(tokenId, 0);

      expect(await chunky.getFullResources(tokenId)).to.be.eql([
        [
          resId,
          equippableRefIdDefault,
          metaURIDefault,
          baseAddressDefault,
          slotIdDefault,
          customDefault,
        ],
      ]);
    });
  });

  describe('Rejecting resources', async function () {
    it('can reject resource', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await addResources([resId]);
      await chunky.addResourceToToken(tokenId, resId, 0);

      await expect(chunky.rejectResource(tokenId, 0)).to.emit(chunky, 'ResourceRejected');

      const pending = await chunky.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await chunky.getFullResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('can reject resource and overwrites are cleared', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await addResources([resId, resId2]);
      await chunky.addResourceToToken(tokenId, resId, 0);
      await chunky.acceptResource(tokenId, 0);

      // Will try to overwrite but we reject it
      await chunky.addResourceToToken(tokenId, resId2, resId);
      await chunky.rejectResource(tokenId, 0);

      expect(await chunky.getResourceOverwrites(tokenId, resId2)).to.eql(BigNumber.from(0));
    });

    // FIXME: approve not implemented yet
    it.skip('can reject resource if approved', async function () {
      const resId = BigNumber.from(1);
      const approvedAddress = addrs[1];
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await chunky.approve(approvedAddress.address, tokenId);
      await addResources([resId]);
      await chunky.addResourceToToken(tokenId, resId, 0);

      await expect(chunky.rejectResource(tokenId, 0)).to.emit(chunky, 'ResourceRejected');

      const pending = await chunky.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await chunky.getFullResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('can reject all resources', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await addResources([resId, resId2]);
      await chunky.addResourceToToken(tokenId, resId, 0);
      await chunky.addResourceToToken(tokenId, resId2, 0);

      await expect(chunky.rejectAllResources(tokenId)).to.emit(chunky, 'ResourceRejected');

      const pending = await chunky.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await chunky.getFullResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('can reject all resources and overwrites are cleared', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await addResources([resId, resId2]);
      await chunky.addResourceToToken(tokenId, resId, 0);
      await chunky.acceptResource(tokenId, 0);

      // Will try to overwrite but we reject all
      await chunky.addResourceToToken(tokenId, resId2, resId);
      await chunky.rejectAllResources(tokenId);

      expect(await chunky.getResourceOverwrites(tokenId, resId2)).to.eql(BigNumber.from(0));
    });

    it('can reject all pending resources at max capacity', async function () {
      const tokenId = 1;
      const resArr = [];

      for (let i = 1; i < 128; i++) {
        resArr.push(BigNumber.from(i));
      }

      await chunky.mint(owner.address, tokenId);
      await addResources(resArr);

      for (let i = 1; i < 128; i++) {
        await chunky.addResourceToToken(tokenId, i, 1);
      }
      await chunky.rejectAllResources(tokenId);

      expect(await chunky.getResourceOverwrites(1, 2)).to.eql(BigNumber.from(0));
    });

    // FIXME: approve not implemented yet
    it.skip('can reject all resources if approved', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;
      const approvedAddress = addrs[1];

      await chunky.mint(owner.address, tokenId);
      await chunky.approve(approvedAddress.address, tokenId);
      await addResources([resId, resId2]);
      await chunky.addResourceToToken(tokenId, resId, 0);
      await chunky.addResourceToToken(tokenId, resId2, 0);

      await expect(chunky.connect(approvedAddress).rejectAllResources(tokenId)).to.emit(
        chunky,
        'ResourceRejected',
      );

      const pending = await chunky.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await chunky.getFullResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('cannot reject resource twice', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await addResources([resId]);
      await chunky.addResourceToToken(tokenId, resId, 0);
      await chunky.rejectResource(tokenId, 0);

      await expect(chunky.rejectResource(tokenId, 0)).to.be.revertedWith('RMRKIndexOutOfRange()');
    });

    it('cannot reject resource nor reject all if not owner', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await addResources([resId]);
      await chunky.addResourceToToken(tokenId, resId, 0);

      await expect(chunky.connect(addrs[1]).rejectResource(tokenId, 0)).to.be.revertedWith(
        'ERC721NotApprovedOrOwner()',
      );
      await expect(chunky.connect(addrs[1]).rejectAllResources(tokenId)).to.be.revertedWith(
        'ERC721NotApprovedOrOwner()',
      );
    });

    it('cannot reject non existing resource', async function () {
      const tokenId = 1;

      await chunky.mint(owner.address, tokenId);
      await expect(chunky.rejectResource(tokenId, 0)).to.be.revertedWith('RMRKIndexOutOfRange()');
    });
  });

  describe('Priorities', async function () {
    it('can set and get priorities', async function () {
      const tokenId = 1;
      await addResourcesToToken(tokenId);

      expect(await chunky.getActiveResourcePriorities(tokenId)).to.be.eql([0, 0]);
      await expect(chunky.setPriority(tokenId, [2, 1]))
        .to.emit(chunky, 'ResourcePrioritySet')
        .withArgs(tokenId);
      expect(await chunky.getActiveResourcePriorities(tokenId)).to.be.eql([2, 1]);
    });

    // FIXME: approve not implemented yet
    it.skip('can set and get priorities if approved', async function () {
      const tokenId = 1;
      const approvedAddress = addrs[1];

      await addResourcesToToken(tokenId);
      await chunky.approve(approvedAddress.address, tokenId);

      expect(await chunky.getActiveResourcePriorities(tokenId)).to.be.eql([0, 0]);
      await expect(chunky.connect(approvedAddress).setPriority(tokenId, [2, 1]))
        .to.emit(chunky, 'ResourcePrioritySet')
        .withArgs(tokenId);
      expect(await chunky.getActiveResourcePriorities(tokenId)).to.be.eql([2, 1]);
    });

    it('cannot set priorities for non owned token', async function () {
      const tokenId = 1;
      await addResourcesToToken(tokenId);
      await expect(chunky.connect(addrs[1]).setPriority(tokenId, [2, 1])).to.be.revertedWith(
        'ERC721NotApprovedOrOwner()',
      );
    });

    it('cannot set different number of priorities', async function () {
      const tokenId = 1;
      await addResourcesToToken(tokenId);
      await expect(chunky.setPriority(tokenId, [1])).to.be.revertedWith(
        'RMRKBadPriorityListLength()',
      );
      await expect(chunky.setPriority(tokenId, [2, 1, 3])).to.be.revertedWith(
        'RMRKBadPriorityListLength()',
      );
    });

    it('cannot set priorities for non existing token', async function () {
      const tokenId = 1;
      await expect(chunky.connect(addrs[1]).setPriority(tokenId, [])).to.be.revertedWith(
        'RMRKOwnerQueryForNonexistentToken()',
      );
    });
  });

  describe('Token URI', async function () {
    it('can set fallback URI', async function () {
      await chunky.setFallbackURI('TestURI');
      expect(await chunky.getFallbackURI()).to.be.eql('TestURI');
    });

    it('gets fallback URI if no active resources on token', async function () {
      const tokenId = 1;
      const fallBackUri = 'fallback404';
      await chunky.mint(owner.address, tokenId);
      await chunky.setFallbackURI(fallBackUri);
      expect(await chunky.tokenURI(tokenId)).to.eql(fallBackUri);
    });

    it('can get token URI when resource is not enumerated', async function () {
      const tokenId = 1;
      await addResourcesToToken(tokenId);
      expect(await chunky.tokenURI(tokenId)).to.eql(metaURIDefault);
    });

    it('can get token URI when resource is enumerated', async function () {
      const tokenId = 1;
      const resId = BigNumber.from(1);
      await addResourcesToToken(tokenId);
      await chunky.setTokenEnumeratedResource(resId, true);
      expect(await chunky.isTokenEnumeratedResource(resId)).to.eql(true);
      expect(await chunky.tokenURI(tokenId)).to.eql(`${metaURIDefault}${tokenId}`);
    });

    it('can get token URI at specific index', async function () {
      const tokenId = 1;
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);

      await chunky.mint(owner.address, tokenId);
      await chunky.addResourceEntry(
        {
          id: resId,
          equippableRefId: equippableRefIdDefault,
          metadataURI: 'UriA',
          baseAddress: baseAddressDefault,
          slotId: slotIdDefault,
          custom: customDefault,
        },
        [],
        [],
      );
      await chunky.addResourceEntry(
        {
          id: resId2,
          equippableRefId: equippableRefIdDefault,
          metadataURI: 'UriB',
          baseAddress: baseAddressDefault,
          slotId: slotIdDefault,
          custom: customDefault,
        },
        [],
        [],
      );
      await chunky.addResourceToToken(tokenId, resId, 0);
      await chunky.addResourceToToken(tokenId, resId2, 0);
      await chunky.acceptResource(tokenId, 0);
      await chunky.acceptResource(tokenId, 0);

      expect(await chunky.tokenURIAtIndex(tokenId, 1)).to.eql('UriB');
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

      await chunky.mint(owner.address, tokenId);
      await chunky.addResourceEntry(
        {
          id: resId,
          equippableRefId: equippableRefIdDefault,
          metadataURI: 'UriA',
          baseAddress: baseAddressDefault,
          slotId: slotIdDefault,
          custom: [customDataWidthKey, customDataHeightKey, customDataTypeKey],
        },
        [],
        [],
      );
      await chunky.addResourceEntry(
        {
          id: resId2,
          equippableRefId: equippableRefIdDefault,
          metadataURI: 'UriB',
          baseAddress: baseAddressDefault,
          slotId: slotIdDefault,
          custom: [customDataTypeKey, customDataAreaKey],
        },
        [],
        [],
      );
      await expect(chunky.setCustomResourceData(resId, customDataWidthKey, customDataWidthValue))
        .to.emit(chunky, 'ResourceCustomDataSet')
        .withArgs(resId, customDataWidthKey);
      await chunky.setCustomResourceData(resId, customDataHeightKey, customDataHeightValue);
      await chunky.setCustomResourceData(resId, customDataTypeKey, customDataTypeValueA);
      await chunky.setCustomResourceData(resId2, customDataAreaKey, customDataAreaValue);
      await chunky.setCustomResourceData(resId2, customDataTypeKey, customDataTypeValueB);

      await chunky.addResourceToToken(tokenId, resId, 0);
      await chunky.addResourceToToken(tokenId, resId2, 0);
      await chunky.acceptResource(tokenId, 0);
      await chunky.acceptResource(tokenId, 0);

      // Finally, user can get the right resource filtering by custom data.
      // In this case, we filter by type being equal to 0xAAAA. (Whatever that means for the issuer)
      expect(
        await chunky.tokenURIForCustomValue(tokenId, customDataTypeKey, customDataTypeValueB),
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

      await chunky.mint(owner.address, tokenId);

      await chunky.addResourceEntry(
        {
          id: resId,
          equippableRefId: equippableRefIdDefault,
          metadataURI: 'srcA',
          baseAddress: baseAddressDefault,
          slotId: slotIdDefault,
          custom: [customDataTypeKey],
        },
        [],
        [],
      );
      await chunky.addResourceEntry(
        {
          id: resId2,
          equippableRefId: equippableRefIdDefault,
          metadataURI: 'srcB',
          baseAddress: baseAddressDefault,
          slotId: slotIdDefault,
          custom: [customDataTypeKey],
        },
        [],
        [],
      );
      await chunky.setCustomResourceData(resId, customDataTypeKey, customDataTypeValueA);
      await chunky.setCustomResourceData(resId2, customDataTypeKey, customDataTypeValueB);

      await chunky.addResourceToToken(tokenId, resId, 0);
      await chunky.addResourceToToken(tokenId, resId2, 0);
      await chunky.acceptResource(tokenId, 0);
      await chunky.acceptResource(tokenId, 0);

      await chunky.setFallbackURI('fallback404');

      // No resource has this custom value for type:
      expect(
        await chunky.tokenURIForCustomValue(tokenId, customDataTypeKey, customDataTypeValueC),
      ).to.eql('fallback404');
      // No resource has this custom key:
      expect(
        await chunky.tokenURIForCustomValue(tokenId, customDataOtherKey, customDataTypeValueA),
      ).to.eql('fallback404');
    });
  });

  async function addResources(ids: BigNumber[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await chunky.addResourceEntry(
        {
          id: ids[i],
          equippableRefId: equippableRefIdDefault,
          metadataURI: metaURIDefault,
          baseAddress: baseAddressDefault,
          slotId: slotIdDefault,
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
    await chunky.mint(owner.address, tokenId);
    await addResources([resId, resId2]);
    await chunky.addResourceToToken(tokenId, resId, 0);
    await chunky.addResourceToToken(tokenId, resId2, 0);
    await chunky.acceptResource(tokenId, 0);
    await chunky.acceptResource(tokenId, 0);
  }
});
