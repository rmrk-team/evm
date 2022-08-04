import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

async function shouldBehaveLikeEquippableResources(
  equippableContractName: string,
  nestingContractName: string,
) {
  let chunky: Contract;
  let chunkyEquip: Contract;

  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const name = 'ownerChunky';
  const symbol = 'CHNKY';

  const equippableRefIdDefault = BigNumber.from(1);
  const metaURIDefault = 'metaURI';
  const baseAddressDefault = ethers.constants.AddressZero;

  async function deployTokensFixture() {
    const CHNKY = await ethers.getContractFactory(nestingContractName);
    const ChnkEqup = await ethers.getContractFactory(equippableContractName);

    const chunkyContract = await CHNKY.deploy(name, symbol);
    await chunkyContract.deployed();

    const chunkyEquipContract = await ChnkEqup.deploy(chunkyContract.address);
    await chunkyEquipContract.deployed();

    await chunkyContract.setEquippableAddress(chunkyEquipContract.address);

    return { chunkyContract, chunkyEquipContract };
  }

  beforeEach(async () => {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;
    const { chunkyContract, chunkyEquipContract } = await loadFixture(deployTokensFixture);
    chunky = chunkyContract;
    chunkyEquip = chunkyEquipContract;
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
      expect(await chunkyEquip.supportsInterface('0xc3730101')).to.equal(true);
    });
    it('cannot support other interfaceId', async function () {
      expect(await chunkyEquip.supportsInterface('0xffffffff')).to.equal(false);
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

    it('cannot add resource entry with parts and no base', async function () {
      const id = BigNumber.from(1);
      await expect(
        chunkyEquip.addResourceEntry(
          {
            id: id,
            equippableRefId: equippableRefIdDefault,
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
            equippableRefId: equippableRefIdDefault,
            metadataURI: metaURIDefault,
            baseAddress: baseAddressDefault,
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
          },
          [],
          [],
        ),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKResourceAlreadyExists');
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
        [resId, equippableRefIdDefault, baseAddressDefault, metaURIDefault],
        [resId2, equippableRefIdDefault, baseAddressDefault, metaURIDefault],
      ]);

      expect(await chunkyEquip.getPendingExtendedResObjectByIndex(tokenId, 0)).to.eql([
        resId,
        equippableRefIdDefault,
        baseAddressDefault,
        metaURIDefault,
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
        [resId, equippableRefIdDefault, baseAddressDefault, metaURIDefault],
      ]);

      expect(await chunkyEquip.getExtendedResObjectByIndex(tokenId, 0)).to.eql([
        resId,
        equippableRefIdDefault,
        baseAddressDefault,
        metaURIDefault,
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
        [resId2, equippableRefIdDefault, baseAddressDefault, metaURIDefault],
        [resId, equippableRefIdDefault, baseAddressDefault, metaURIDefault],
      ]);
    });

    // approved not implemented yet
    it('can accept resource if approved', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;
      const approvedAddress = addrs[1];
      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await chunkyEquip.approveForResources(approvedAddress.address, tokenId);
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
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKNotApprovedForResourcesOrOwner');
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
        [resId2, equippableRefIdDefault, baseAddressDefault, metaURIDefault],
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
        [resId, equippableRefIdDefault, baseAddressDefault, metaURIDefault],
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

    it('can reject resource if approved', async function () {
      const resId = BigNumber.from(1);
      const approvedAddress = addrs[1];
      const tokenId = 1;

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await chunkyEquip.approveForResources(approvedAddress.address, tokenId);
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

    it('can reject all resources if approved', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;
      const approvedAddress = addrs[1];

      await chunky['mint(address,uint256)'](owner.address, tokenId);
      await chunkyEquip.approveForResources(approvedAddress.address, tokenId);
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
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKNotApprovedForResourcesOrOwner');
      await expect(
        chunkyEquip.connect(addrs[1]).rejectAllResources(tokenId),
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKNotApprovedForResourcesOrOwner');
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

    it('can set and get priorities if approved', async function () {
      const tokenId = 1;
      const approvedAddress = addrs[1];

      await addResourcesToToken(tokenId);
      await chunkyEquip.approveForResources(approvedAddress.address, tokenId);

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
      ).to.be.revertedWithCustomError(chunkyEquip, 'RMRKNotApprovedForResourcesOrOwner');
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
  });

  describe('Approval Cleaning', async function () {
    it('cleans token and resources approvals on transfer', async function () {
      const tokenId = 1;
      const tokenOwner = addrs[1];
      const newOwner = addrs[2];
      const approved = addrs[3];
      await chunky['mint(address,uint256)'](tokenOwner.address, tokenId);
      await chunky.connect(tokenOwner).approve(approved.address, tokenId);
      await chunkyEquip.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(approved.address);
      expect(await chunkyEquip.getApprovedForResources(tokenId)).to.eql(approved.address);

      await chunky.connect(tokenOwner).transfer(newOwner.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(ethers.constants.AddressZero);
      expect(await chunkyEquip.getApprovedForResources(tokenId)).to.eql(
        ethers.constants.AddressZero,
      );
    });

    it('cleans token and resources approvals on burn', async function () {
      const tokenId = 1;
      const tokenOwner = addrs[1];
      const approved = addrs[3];
      await chunky['mint(address,uint256)'](tokenOwner.address, tokenId);
      await chunky.connect(tokenOwner).approve(approved.address, tokenId);
      await chunkyEquip.connect(tokenOwner).approveForResources(approved.address, tokenId);

      expect(await chunky.getApproved(tokenId)).to.eql(approved.address);
      expect(await chunkyEquip.getApprovedForResources(tokenId)).to.eql(approved.address);

      await chunky.connect(tokenOwner).burn(tokenId);

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
          equippableRefId: equippableRefIdDefault,
          metadataURI: metaURIDefault,
          baseAddress: baseAddressDefault,
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
