import { ethers } from 'hardhat';
import { expect } from 'chai';
import { RMRKMultiResourceMock } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber } from 'ethers';

describe('MultiResource', async () => {
  let token: RMRKMultiResourceMock;

  let owner: SignerWithAddress;
  let addrs: any[];

  const name = 'RmrkTest';
  const symbol = 'RMRKTST';

  const metaURIDefault = 'metaURI';
  const customDefault: string[] = [];

  beforeEach(async () => {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const Token = await ethers.getContractFactory('RMRKMultiResourceMock');
    token = await Token.deploy(name, symbol);
    await token.deployed();
  });

  describe('Init', async function () {
    it('Name', async function () {
      expect(await token.name()).to.equal(name);
    });

    it('Symbol', async function () {
      expect(await token.symbol()).to.equal(symbol);
    });
  });

  describe('Resource storage', async function () {
    it('can add resource', async function () {
      const id = BigNumber.from(1);

      await expect(token.addResourceEntry(id, metaURIDefault, customDefault))
        .to.emit(token, 'ResourceSet')
        .withArgs(id);
    });

    it('cannot get non existing resource', async function () {
      const id = BigNumber.from(1);
      await expect(token.getResource(id)).to.be.revertedWith('RMRKNoResourceMatchingId()');
    });

    it('cannot add resource entry if not issuer', async function () {
      const id = BigNumber.from(1);
      await expect(
        token.connect(addrs[1]).addResourceEntry(id, metaURIDefault, customDefault),
      ).to.be.revertedWith('RMRKOnlyIssuer()');
    });

    it('can set and get issuer', async function () {
      const newIssuerAddr = addrs[1].address;
      expect(await token.getIssuer()).to.equal(owner.address);

      await token.setIssuer(newIssuerAddr);
      expect(await token.getIssuer()).to.equal(newIssuerAddr);
    });

    it('cannot set issuer if not issuer', async function () {
      const newIssuer = addrs[1];
      await expect(token.connect(newIssuer).setIssuer(newIssuer.address)).to.be.revertedWith(
        'RMRKOnlyIssuer()',
      );
    });

    it('cannot overwrite resource', async function () {
      const id = BigNumber.from(1);

      await token.addResourceEntry(id, metaURIDefault, customDefault);
      await expect(token.addResourceEntry(id, 'newMetaUri', customDefault)).to.be.revertedWith(
        'RMRKResourceAlreadyExists()',
      );
    });

    it('cannot add resource with id 0', async function () {
      const id = 0;

      await expect(token.addResourceEntry(id, metaURIDefault, customDefault)).to.be.revertedWith(
        'RMRKWriteToZero()',
      );
    });

    it('cannot add same resource twice', async function () {
      const id = BigNumber.from(1);

      await expect(token.addResourceEntry(id, metaURIDefault, customDefault))
        .to.emit(token, 'ResourceSet')
        .withArgs(id);

      await expect(token.addResourceEntry(id, metaURIDefault, customDefault)).to.be.revertedWith(
        'RMRKResourceAlreadyExists()',
      );
    });

    it('can add and remove custom data for resource', async function () {
      const resId = BigNumber.from(1);
      const customDataTypeKey = 3;
      await token.addResourceEntry(resId, metaURIDefault, customDefault);

      await expect(token.addCustomDataToResource(resId, customDataTypeKey))
        .to.emit(token, 'ResourceCustomDataAdded')
        .withArgs(resId, customDataTypeKey);
      let resource = await token.getResource(resId);
      expect(resource.custom).to.eql([BigNumber.from(customDataTypeKey)]);

      await expect(token.removeCustomDataFromResource(resId, 0))
        .to.emit(token, 'ResourceCustomDataRemoved')
        .withArgs(resId, customDataTypeKey);
      resource = await token.getResource(resId);
      expect(resource.custom).to.eql([]);
    });
  });

  describe('Adding resources', async function () {
    it('can add resource to token', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await addResources([resId, resId2]);
      await expect(token.addResourceToToken(tokenId, resId, 0)).to.emit(
        token,
        'ResourceAddedToToken',
      );
      await expect(token.addResourceToToken(tokenId, resId2, 0)).to.emit(
        token,
        'ResourceAddedToToken',
      );

      const pending = await token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([
        [resId, metaURIDefault, customDefault],
        [resId2, metaURIDefault, customDefault],
      ]);

      expect(await token.getPendingResObjectByIndex(tokenId, 0)).to.eql([
        resId,
        metaURIDefault,
        customDefault,
      ]);
    });

    it('cannot add non existing resource to token', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await expect(token.addResourceToToken(tokenId, resId, 0)).to.be.revertedWith(
        'RMRKNoResourceMatchingId()',
      );
    });

    it('cannot add resource to non existing token', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await addResources([resId]);
      await expect(token.addResourceToToken(tokenId, resId, 0)).to.be.revertedWith(
        'RMRKCoreOwnerQueryForNonexistentToken()',
      );
    });

    it('cannot add resource twice to the same token', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await addResources([resId]);
      await token.addResourceToToken(tokenId, resId, 0);
      await expect(token.addResourceToToken(tokenId, resId, 0)).to.be.revertedWith(
        'MultiResourceAlreadyExists()',
      );
    });

    it('cannot add too many resources to the same token', async function () {
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      for (let i = 1; i <= 128; i++) {
        await addResources([BigNumber.from(i)]);
        await token.addResourceToToken(tokenId, i, 0);
      }

      // Now it's full, next should fail
      const resId = BigNumber.from(129);
      await addResources([resId]);
      await expect(token.addResourceToToken(tokenId, resId, 0)).to.be.revertedWith(
        'MultiResourceMaxPendingResourcesReached()',
      );
    });

    it('can add same resource to 2 different tokens', async function () {
      const resId = BigNumber.from(1);
      const tokenId1 = 1;
      const tokenId2 = 2;

      await token.mint(owner.address, tokenId1);
      await token.mint(owner.address, tokenId2);
      await addResources([resId]);
      await token.addResourceToToken(tokenId1, resId, 0);
      await token.addResourceToToken(tokenId2, resId, 0);

      expect(await token.getPendingResources(tokenId1)).to.be.eql([resId]);
      expect(await token.getPendingResources(tokenId2)).to.be.eql([resId]);
    });
  });

  describe('Accepting resources', async function () {
    it('can accept resource', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await addResources([resId]);
      await token.addResourceToToken(tokenId, resId, 0);
      await expect(token.acceptResource(tokenId, 0))
        .to.emit(token, 'ResourceAccepted')
        .withArgs(tokenId, resId);

      const pending = await token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);

      const accepted = await token.getFullResources(tokenId);
      expect(accepted).to.eql([[resId, metaURIDefault, customDefault]]);

      expect(await token.getResObjectByIndex(tokenId, 0)).to.eql([
        resId,
        metaURIDefault,
        customDefault,
      ]);
    });

    it('can accept multiple resources', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await addResources([resId, resId2]);
      await token.addResourceToToken(tokenId, resId, 0);
      await token.addResourceToToken(tokenId, resId2, 0);
      await expect(token.acceptResource(tokenId, 1)) // Accepting resId2
        .to.emit(token, 'ResourceAccepted')
        .withArgs(tokenId, resId2);
      await expect(token.acceptResource(tokenId, 0))
        .to.emit(token, 'ResourceAccepted')
        .withArgs(tokenId, resId);

      const pending = await token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);

      const accepted = await token.getFullResources(tokenId);
      expect(accepted).to.eql([
        [resId2, metaURIDefault, customDefault],
        [resId, metaURIDefault, customDefault],
      ]);
    });

    it('can accept resource if approved', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;
      const approvedAddress = addrs[1];
      await token.mint(owner.address, tokenId);
      await token.approve(approvedAddress.address, tokenId);
      await addResources([resId]);

      await token.addResourceToToken(tokenId, resId, 0);
      await token.connect(approvedAddress).acceptResource(tokenId, 0);

      const pending = await token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
    });

    it('cannot accept resource twice', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await addResources([resId]);
      await token.addResourceToToken(tokenId, resId, 0);
      await token.acceptResource(tokenId, 0);

      await expect(token.acceptResource(tokenId, 0)).to.be.revertedWith(
        'MultiResourceIndexOutOfBounds()',
      );
    });

    it('cannot accept resource if not owner', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await addResources([resId]);
      await token.addResourceToToken(tokenId, resId, 0);
      await expect(token.connect(addrs[1]).acceptResource(tokenId, 0)).to.be.revertedWith(
        'MultiResourceNotOwner()',
      );
    });

    it('cannot accept non existing resource', async function () {
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await expect(token.acceptResource(tokenId, 0)).to.be.revertedWith(
        'MultiResourceIndexOutOfBounds()',
      );
    });
  });

  describe('Overwriting resources', async function () {
    it('can add resource to token overwritting an existing one', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await addResources([resId, resId2]);
      await token.addResourceToToken(tokenId, resId, 0);
      await token.acceptResource(tokenId, 0);

      // Add new resource to overwrite the first, and accept
      const activeResources = await token.getActiveResources(tokenId);
      await expect(token.addResourceToToken(tokenId, resId2, activeResources[0])).to.emit(
        token,
        'ResourceOverwriteProposed',
      );
      const pendingResources = await token.getPendingResources(tokenId);

      expect(await token.getResourceOverwrites(tokenId, pendingResources[0])).to.eql(
        activeResources[0],
      );
      await expect(token.acceptResource(tokenId, 0)).to.emit(token, 'ResourceOverwritten');

      expect(await token.getFullResources(tokenId)).to.be.eql([
        [resId2, metaURIDefault, customDefault],
      ]);
      // Overwrite should be gone
      expect(await token.getResourceOverwrites(tokenId, pendingResources[0])).to.eql(
        BigNumber.from(0),
      );
    });

    it('can overwrite non existing resource to token, it could have been deleted', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await addResources([resId]);
      await token.addResourceToToken(tokenId, resId, 1);
      await token.acceptResource(tokenId, 0);

      expect(await token.getFullResources(tokenId)).to.be.eql([
        [resId, metaURIDefault, customDefault],
      ]);
    });
  });

  describe('Rejecting resources', async function () {
    it('can reject resource', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await addResources([resId]);
      await token.addResourceToToken(tokenId, resId, 0);

      await expect(token.rejectResource(tokenId, 0)).to.emit(token, 'ResourceRejected');

      const pending = await token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await token.getFullResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('can reject resource if approved', async function () {
      const resId = BigNumber.from(1);
      const approvedAddress = addrs[1];
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await token.approve(approvedAddress.address, tokenId);
      await addResources([resId]);
      await token.addResourceToToken(tokenId, resId, 0);

      await expect(token.rejectResource(tokenId, 0)).to.emit(token, 'ResourceRejected');

      const pending = await token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await token.getFullResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('can reject all resources', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await addResources([resId, resId2]);
      await token.addResourceToToken(tokenId, resId, 0);
      await token.addResourceToToken(tokenId, resId2, 0);

      await expect(token.rejectAllResources(tokenId)).to.emit(token, 'ResourceRejected');

      const pending = await token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await token.getFullResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('can reject all resources if approved', async function () {
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);
      const tokenId = 1;
      const approvedAddress = addrs[1];

      await token.mint(owner.address, tokenId);
      await token.approve(approvedAddress.address, tokenId);
      await addResources([resId, resId2]);
      await token.addResourceToToken(tokenId, resId, 0);
      await token.addResourceToToken(tokenId, resId2, 0);

      await expect(token.connect(approvedAddress).rejectAllResources(tokenId)).to.emit(
        token,
        'ResourceRejected',
      );

      const pending = await token.getFullPendingResources(tokenId);
      expect(pending).to.be.eql([]);
      const accepted = await token.getFullResources(tokenId);
      expect(accepted).to.be.eql([]);
    });

    it('cannot reject resource twice', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await addResources([resId]);
      await token.addResourceToToken(tokenId, resId, 0);
      await token.rejectResource(tokenId, 0);

      await expect(token.rejectResource(tokenId, 0)).to.be.revertedWith(
        'MultiResourceIndexOutOfBounds()',
      );
    });

    it('cannot reject resource nor reject all if not owner', async function () {
      const resId = BigNumber.from(1);
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await addResources([resId]);
      await token.addResourceToToken(tokenId, resId, 0);

      await expect(token.connect(addrs[1]).rejectResource(tokenId, 0)).to.be.revertedWith(
        'MultiResourceNotOwner()',
      );
      await expect(token.connect(addrs[1]).rejectAllResources(tokenId)).to.be.revertedWith(
        'MultiResourceNotOwner()',
      );
    });

    it('cannot reject non existing resource', async function () {
      const tokenId = 1;

      await token.mint(owner.address, tokenId);
      await expect(token.rejectResource(tokenId, 0)).to.be.revertedWith(
        'MultiResourceIndexOutOfBounds()',
      );
    });
  });

  describe('Priorities', async function () {
    it('can set and get priorities', async function () {
      const tokenId = 1;
      await addResourcesToToken(tokenId);

      expect(await token.getActiveResourcePriorities(tokenId)).to.be.eql([0, 0]);
      await expect(token.setPriority(tokenId, [2, 1]))
        .to.emit(token, 'ResourcePrioritySet')
        .withArgs(tokenId);
      expect(await token.getActiveResourcePriorities(tokenId)).to.be.eql([2, 1]);
    });

    it('can set and get priorities if approved', async function () {
      const tokenId = 1;
      const approvedAddress = addrs[1];

      await addResourcesToToken(tokenId);
      await token.approve(approvedAddress.address, tokenId);

      expect(await token.getActiveResourcePriorities(tokenId)).to.be.eql([0, 0]);
      await expect(token.connect(approvedAddress).setPriority(tokenId, [2, 1]))
        .to.emit(token, 'ResourcePrioritySet')
        .withArgs(tokenId);
      expect(await token.getActiveResourcePriorities(tokenId)).to.be.eql([2, 1]);
    });

    it('cannot set priorities for non owned token', async function () {
      const tokenId = 1;
      await addResourcesToToken(tokenId);
      await expect(token.connect(addrs[1]).setPriority(tokenId, [2, 1])).to.be.revertedWith(
        'MultiResourceNotOwner()',
      );
    });

    it('cannot set different number of priorities', async function () {
      const tokenId = 1;
      await addResourcesToToken(tokenId);
      await expect(token.setPriority(tokenId, [1])).to.be.revertedWith(
        'MultiResourceBadPriorityListLength()',
      );
      await expect(token.setPriority(tokenId, [2, 1, 3])).to.be.revertedWith(
        'MultiResourceBadPriorityListLength()',
      );
    });

    it('cannot set priorities for non existing token', async function () {
      const tokenId = 1;
      await expect(token.connect(addrs[1]).setPriority(tokenId, [])).to.be.revertedWith(
        'RMRKCoreOwnerQueryForNonexistentToken()',
      );
    });
  });

  describe('Token URI', async function () {
    it('can set fallback URI', async function () {
      await token.setFallbackURI('TestURI');
      expect(await token.getFallbackURI()).to.be.eql('TestURI');
    });

    it('gets fallback URI if no active resources on token', async function () {
      const tokenId = 1;
      const fallBackUri = 'fallback404';
      await token.mint(owner.address, tokenId);
      await token.setFallbackURI(fallBackUri);
      expect(await token.tokenURI(tokenId)).to.eql(fallBackUri);
    });

    it('can get token URI when resource is not enumerated', async function () {
      const tokenId = 1;
      await addResourcesToToken(tokenId);
      expect(await token.tokenURI(tokenId)).to.eql(metaURIDefault);
    });

    it('can get token URI when resource is enumerated', async function () {
      const tokenId = 1;
      const resId = BigNumber.from(1);
      await addResourcesToToken(tokenId);
      await token.setTokenEnumeratedResource(resId, true);
      expect(await token.isTokenEnumeratedResource(resId)).to.eql(true);
      expect(await token.tokenURI(tokenId)).to.eql(`${metaURIDefault}${tokenId}`);
    });

    it('can get token URI at specific index', async function () {
      const tokenId = 1;
      const resId = BigNumber.from(1);
      const resId2 = BigNumber.from(2);

      await token.mint(owner.address, tokenId);
      await token.addResourceEntry(resId, 'UriA', customDefault);
      await token.addResourceEntry(resId2, 'UriB', customDefault);
      await token.addResourceToToken(tokenId, resId, 0);
      await token.addResourceToToken(tokenId, resId2, 0);
      await token.acceptResource(tokenId, 0);
      await token.acceptResource(tokenId, 0);

      expect(await token.tokenURIAtIndex(tokenId, 1)).to.eql('UriB');
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

      await token.mint(owner.address, tokenId);
      await token.addResourceEntry(resId, 'UriA', [
        customDataWidthKey,
        customDataHeightKey,
        customDataTypeKey,
      ]);
      await token.addResourceEntry(resId2, 'UriB', [customDataTypeKey, customDataAreaKey]);
      await expect(token.setCustomResourceData(resId, customDataWidthKey, customDataWidthValue))
        .to.emit(token, 'ResourceCustomDataSet')
        .withArgs(resId, customDataWidthKey);
      await token.setCustomResourceData(resId, customDataHeightKey, customDataHeightValue);
      await token.setCustomResourceData(resId, customDataTypeKey, customDataTypeValueA);
      await token.setCustomResourceData(resId2, customDataAreaKey, customDataAreaValue);
      await token.setCustomResourceData(resId2, customDataTypeKey, customDataTypeValueB);

      await token.addResourceToToken(tokenId, resId, 0);
      await token.addResourceToToken(tokenId, resId2, 0);
      await token.acceptResource(tokenId, 0);
      await token.acceptResource(tokenId, 0);

      // Finally, user can get the right resource filtering by custom data.
      // In this case, we filter by type being equal to 0xAAAA. (Whatever that means for the issuer)
      expect(
        await token.tokenURIForCustomValue(tokenId, customDataTypeKey, customDataTypeValueB),
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

      await token.mint(owner.address, tokenId);
      await token.addResourceEntry(resId, 'srcA', [customDataTypeKey]);
      await token.addResourceEntry(resId2, 'srcB', [customDataTypeKey]);
      await token.setCustomResourceData(resId, customDataTypeKey, customDataTypeValueA);
      await token.setCustomResourceData(resId2, customDataTypeKey, customDataTypeValueB);

      await token.addResourceToToken(tokenId, resId, 0);
      await token.addResourceToToken(tokenId, resId2, 0);
      await token.acceptResource(tokenId, 0);
      await token.acceptResource(tokenId, 0);

      await token.setFallbackURI('fallback404');

      // No resource has this custom value for type:
      expect(
        await token.tokenURIForCustomValue(tokenId, customDataTypeKey, customDataTypeValueC),
      ).to.eql('fallback404');
      // No resource has this custom key:
      expect(
        await token.tokenURIForCustomValue(tokenId, customDataOtherKey, customDataTypeValueA),
      ).to.eql('fallback404');
    });
  });

  async function addResources(ids: BigNumber[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await token.addResourceEntry(ids[i], metaURIDefault, customDefault);
    }
  }

  async function addResourcesToToken(tokenId: number): Promise<void> {
    const resId = BigNumber.from(1);
    const resId2 = BigNumber.from(2);
    await token.mint(owner.address, tokenId);
    await addResources([resId, resId2]);
    await token.addResourceToToken(tokenId, resId, 0);
    await token.addResourceToToken(tokenId, resId2, 0);
    await token.acceptResource(tokenId, 0);
    await token.acceptResource(tokenId, 0);
  }
});
