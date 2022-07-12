import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import { IRMRKMultiResource } from '../../typechain';

async function shouldBehaveLikeMultiResource(name: string, symbol: string) {
  let owner: SignerWithAddress;
  let addrs: any[];

  const metaURIDefault = 'metaURI';
  const customDefault: string[] = [];

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
      expect(await this.token.supportsInterface('0xb925bcaf')).to.equal(true);
    });

    it('cannot support other interfaceId', async function () {
      expect(await this.token.supportsInterface('0xffffffff')).to.equal(false);
    });
  });

  describe('Resource storage', async function () {
    it('can add resource', async function () {
      const id = BigNumber.from(1);

      await expect(this.token.addResourceEntry(id, metaURIDefault, customDefault))
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

    it('cannot add resource entry if not issuer', async function () {
      const id = BigNumber.from(1);
      await expect(this.token.connect(addrs[1]).addResourceEntry(id, metaURIDefault, customDefault))
        .to.be.reverted;
    });

    it('cannot overwrite resource', async function () {
      const id = BigNumber.from(1);

      await this.token.addResourceEntry(id, metaURIDefault, customDefault);
      await expect(
        this.token.addResourceEntry(id, 'newMetaUri', customDefault),
      ).to.be.revertedWithCustomError(this.token, 'RMRKResourceAlreadyExists');
    });

    it('cannot add resource with id 0', async function () {
      const id = 0;

      await expect(
        this.token.addResourceEntry(id, metaURIDefault, customDefault),
      ).to.be.revertedWithCustomError(this.token, 'RMRKWriteToZero');
    });

    it('cannot add same resource twice', async function () {
      const id = BigNumber.from(1);

      await expect(this.token.addResourceEntry(id, metaURIDefault, customDefault))
        .to.emit(this.token, 'ResourceSet')
        .withArgs(id);

      await expect(
        this.token.addResourceEntry(id, metaURIDefault, customDefault),
      ).to.be.revertedWithCustomError(this.token, 'RMRKResourceAlreadyExists');
    });

    it('can add and remove custom data for resource', async function () {
      const resId = BigNumber.from(1);
      const customDataTypeKey = 3;
      await this.token.addResourceEntry(resId, metaURIDefault, customDefault);

      await expect(this.token.addCustomDataToResource(resId, customDataTypeKey))
        .to.emit(this.token, 'ResourceCustomDataAdded')
        .withArgs(resId, customDataTypeKey);
      let resource = await this.token.getResource(resId);
      expect(resource.custom).to.eql([BigNumber.from(customDataTypeKey)]);

      await expect(this.token.removeCustomDataFromResource(resId, 0))
        .to.emit(this.token, 'ResourceCustomDataRemoved')
        .withArgs(resId, customDataTypeKey);
      resource = await this.token.getResource(resId);
      expect(resource.custom).to.eql([]);
    });
  });

  describe('Adding resources', async function () {
    it('can add resource to token', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await this.token.mint(owner.address, tokenId);
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
        [resId, metaURIDefault, customDefault],
        [resId2, metaURIDefault, customDefault],
      ]);

      expect(await this.token.getPendingResObjectByIndex(tokenId, 0)).to.eql([
        resId,
        metaURIDefault,
        customDefault,
      ]);
    });

    it('cannot add non existing resource to token', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await this.token.mint(owner.address, tokenId);
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

      await this.token.mint(owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await expect(this.token.addResourceToToken(tokenId, resId, 0)).to.be.revertedWithCustomError(
        this.token,
        'RMRKResourceAlreadyExists',
      );
    });

    it('cannot add too many resources to the same token', async function () {
      const tokenId = 1;

      await this.token.mint(owner.address, tokenId);
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

      await this.token.mint(owner.address, tokenId1);
      await this.token.mint(owner.address, tokenId2);
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

      await this.token.mint(owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await expect(this.token.acceptResource(tokenId, 0))
        .to.emit(this.token, 'ResourceAccepted')
        .withArgs(tokenId, resId);

      const pending = await this.token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);

      const accepted = await this.token.getFullResources(tokenId);
      expect(accepted).to.eql([[resId, metaURIDefault, customDefault]]);

      expect(await this.token.getResObjectByIndex(tokenId, 0)).to.eql([
        resId,
        metaURIDefault,
        customDefault,
      ]);
    });

    it('can accept multiple resources', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await this.token.mint(owner.address, tokenId);
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
        [resId2, metaURIDefault, customDefault],
        [resId, metaURIDefault, customDefault],
      ]);
    });

    it('can accept resource if approved', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;
      const approvedAddress = addrs[1];
      await this.token.mint(owner.address, tokenId);
      await this.token.approve(approvedAddress.address, tokenId);
      await addResources(this.token, [resId]);

      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.connect(approvedAddress).acceptResource(tokenId, 0);

      const pending = await this.token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
    });

    it('cannot accept resource twice', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await this.token.mint(owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.acceptResource(tokenId, 0);

      await expect(this.token.acceptResource(tokenId, 0)).to.be.revertedWithCustomError(
        this.token,
        'RMRKIndexOutOfRange',
      );
    });

    it('cannot accept resource if not owner', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await this.token.mint(owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await expect(
        this.token.connect(addrs[1]).acceptResource(tokenId, 0),
      ).to.be.revertedWithCustomError(this.token, 'ERC721NotApprovedOrOwner');
    });

    it('cannot accept non existing resource', async function () {
      const tokenId = 1;

      await this.token.mint(owner.address, tokenId);
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

      await this.token.mint(owner.address, tokenId);
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

      expect(await this.token.getFullResources(tokenId)).to.be.eql([
        [resId2, metaURIDefault, customDefault],
      ]);
      // Overwrite should be gone
      expect(await this.token.getResourceOverwrites(tokenId, pendingResources[0])).to.eql(
        BigNumber.from(0),
      );
    });

    it('can overwrite non existing resource to token, it could have been deleted', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await this.token.mint(owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 1);
      await this.token.acceptResource(tokenId, 0);

      expect(await this.token.getFullResources(tokenId)).to.be.eql([
        [resId, metaURIDefault, customDefault],
      ]);
    });
  });

  describe('Rejecting resources', async function () {
    it('can reject resource', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await this.token.mint(owner.address, tokenId);
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

      await this.token.mint(owner.address, tokenId);
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

      await this.token.mint(owner.address, tokenId);
      await this.token.approve(approvedAddress.address, tokenId);
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

      await this.token.mint(owner.address, tokenId);
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

      await this.token.mint(owner.address, tokenId);
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

      await this.token.mint(owner.address, tokenId);
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

      await this.token.mint(owner.address, tokenId);
      await this.token.approve(approvedAddress.address, tokenId);
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

      await this.token.mint(owner.address, tokenId);
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

      await this.token.mint(owner.address, tokenId);
      await addResources(this.token, [resId]);
      await this.token.addResourceToToken(tokenId, resId, 0);

      await expect(
        this.token.connect(addrs[1]).rejectResource(tokenId, 0),
      ).to.be.revertedWithCustomError(this.token, 'ERC721NotApprovedOrOwner');
      await expect(
        this.token.connect(addrs[1]).rejectAllResources(tokenId),
      ).to.be.revertedWithCustomError(this.token, 'ERC721NotApprovedOrOwner');
    });

    it('cannot reject non existing resource', async function () {
      const tokenId = 1;

      await this.token.mint(owner.address, tokenId);
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
      await this.token.approve(approvedAddress.address, tokenId);

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
      ).to.be.revertedWithCustomError(this.token, 'ERC721NotApprovedOrOwner');
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
      await this.token.mint(owner.address, tokenId);
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

      await this.token.mint(owner.address, tokenId);
      await this.token.addResourceEntry(resId, 'UriA', customDefault);
      await this.token.addResourceEntry(resId2, 'UriB', customDefault);
      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.addResourceToToken(tokenId, resId2, 0);
      await this.token.acceptResource(tokenId, 0);
      await this.token.acceptResource(tokenId, 0);

      expect(await this.token.tokenURIAtIndex(tokenId, 1)).to.eql('UriB');
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

      await this.token.mint(owner.address, tokenId);
      await this.token.addResourceEntry(resId, 'UriA', [
        customDataWidthKey,
        customDataHeightKey,
        customDataTypeKey,
      ]);
      await this.token.addResourceEntry(resId2, 'UriB', [customDataTypeKey, customDataAreaKey]);
      await expect(
        this.token.setCustomResourceData(resId, customDataWidthKey, customDataWidthValue),
      )
        .to.emit(this.token, 'ResourceCustomDataSet')
        .withArgs(resId, customDataWidthKey);
      await this.token.setCustomResourceData(resId, customDataHeightKey, customDataHeightValue);
      await this.token.setCustomResourceData(resId, customDataTypeKey, customDataTypeValueA);
      await this.token.setCustomResourceData(resId2, customDataAreaKey, customDataAreaValue);
      await this.token.setCustomResourceData(resId2, customDataTypeKey, customDataTypeValueB);

      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.addResourceToToken(tokenId, resId2, 0);
      await this.token.acceptResource(tokenId, 0);
      await this.token.acceptResource(tokenId, 0);

      // Finally, user can get the right resource filtering by custom data.
      // In this case, we filter by type being equal to 0xAAAA. (Whatever that means for the issuer)
      expect(
        await this.token.tokenURIForCustomValue(tokenId, customDataTypeKey, customDataTypeValueB),
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

      await this.token.mint(owner.address, tokenId);
      await this.token.addResourceEntry(resId, 'srcA', [customDataTypeKey]);
      await this.token.addResourceEntry(resId2, 'srcB', [customDataTypeKey]);
      await this.token.setCustomResourceData(resId, customDataTypeKey, customDataTypeValueA);
      await this.token.setCustomResourceData(resId2, customDataTypeKey, customDataTypeValueB);

      await this.token.addResourceToToken(tokenId, resId, 0);
      await this.token.addResourceToToken(tokenId, resId2, 0);
      await this.token.acceptResource(tokenId, 0);
      await this.token.acceptResource(tokenId, 0);

      await this.token.setFallbackURI('fallback404');

      // No resource has this custom value for type:
      expect(
        await this.token.tokenURIForCustomValue(tokenId, customDataTypeKey, customDataTypeValueC),
      ).to.eql('fallback404');
      // No resource has this custom key:
      expect(
        await this.token.tokenURIForCustomValue(tokenId, customDataOtherKey, customDataTypeValueA),
      ).to.eql('fallback404');
    });
  });

  async function addResources(token: Contract, ids: BigNumber[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await token.addResourceEntry(ids[i], metaURIDefault, customDefault);
    }
  }

  async function addResourcesToToken(token: Contract, tokenId: number): Promise<void> {
    const resId = BigNumber.from(1);
    const resId2 = BigNumber.from(2);
    await token.mint(owner.address, tokenId);
    await addResources(token, [resId, resId2]);
    await token.addResourceToToken(tokenId, resId, 0);
    await token.addResourceToToken(tokenId, resId2, 0);
    await token.acceptResource(tokenId, 0);
    await token.acceptResource(tokenId, 0);
  }
}

export default shouldBehaveLikeMultiResource;
