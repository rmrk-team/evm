import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { RMRKResourceCore } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';


describe('init', async () => {
  let resourceStorage: RMRKResourceCore;

  let owner: SignerWithAddress;
  let addrs: any[];
  let rmrkNft: Contract;

  const name = 'RmrkTest';
  const symbol = 'RMRKTST';
  const resourceName = 'TestResource';

  /*
  Mints 10 NFTs of NFT to addrs[0] and addrs[1] on init.
  */

  // let baseParts = {
  //   baseAddress: ethers.utils.hexZeroPad('0x1111', 20),
  //   partIds: [
  //     ethers.utils.hexZeroPad('0x1111', 8),
  //     ethers.utils.hexZeroPad('0x2222', 8),
  //     ethers.utils.hexZeroPad('0x3333', 8),
  //     ethers.utils.hexZeroPad('0x4444', 8),
  //   ],
  // };

  const resArr = [
    {
      tokenId: 1,
      id: ethers.utils.hexZeroPad('0x1', 8),
      src: '',
      thumb: 'ipfs://ipfs/QmR3rK1P4n24PPqvfjGYNXWixPJpyBKTV6rYzAS2TYHLpT',
      metadataURI: '',
    },
    {
      tokenId: 2,
      id: ethers.utils.hexZeroPad('0x2', 8),
      src: 'ipfs://ipfs/QmQBhz44R6K6DeKJCCycgAn9RxPo6tn8Tg7vsEX3wewupP/99.png',
      thumb: 'ipfs://ipfs/QmZFWSK9cyfSTgdDVWJucn1eNLtmkBaFEqM8CmfNrhkaZU/99_thumb.png',
      metadataURI: '',
    },
  ];

  beforeEach(async () => {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const RMRK = await ethers.getContractFactory('RMRKCoreMock');
    rmrkNft = await RMRK.deploy(name, symbol, resourceName);
    await rmrkNft.deployed();

    let i = 1;
    while (i <= 10) {
      await rmrkNft.doMint(addrs[0].address, i);
      i++;
    }
    i = 11;
    while (i <= 20) {
      await rmrkNft.doMint(addrs[1].address, i);
      i++;
    }

    // Initialize resource storage contract that was deployed as a component of RMRKCore
    const RMRKResourceStorage = await ethers.getContractFactory('RMRKResourceCore');
    const RMRKResourceAddress = await rmrkNft.resourceStorage();
    resourceStorage = await RMRKResourceStorage.attach(RMRKResourceAddress);
  });

  describe('Init', async function () {
    it('Name', async function () {
      expect(await rmrkNft.name()).to.equal(name);
    });

    it('Symbol', async function () {
      expect(await rmrkNft.symbol()).to.equal(symbol);
    });

    it('Resource Storage Name', async function () {
      expect(await resourceStorage.getResourceName()).to.equal(resourceName);
    });

    it('Contract2 Owner Test', async function () {
      expect(await rmrkNft.ownerOf(10)).to.equal(addrs[0].address);
      expect(await rmrkNft.ownerOf(20)).to.equal(addrs[1].address);
    });
  });

  describe('Add resource', async function () {
    it('can add resource', async function () {
      const resourceIndex = 0;
      await _addResource(resourceIndex);
    });

    it('reverts if not issuer tries to add resource', async function () {
      const resourceIndex = 0;
      await expect(
        rmrkNft
          .connect(addrs[1])
          .addResourceEntry(resArr[resourceIndex].id, resArr[resourceIndex].src, resArr[resourceIndex].thumb, resArr[resourceIndex].metadataURI),
      ).to.be.reverted;
    });

    it('can add resource to token', async function () {
      const tokenId = 1;
      const resourceIndex = 0;

      const resId16 = await _addResource(resourceIndex);
      await rmrkNft
        .connect(owner)
        .addResourceToToken(
          tokenId,
          resourceStorage.address,
          resArr[0].id,
          ethers.utils.hexZeroPad("0x0", 16),
        );

      // Get pending resources
      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([resId16]);

      // Get renderable resources - should return none
      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([]);

    });

    it('reverts if not issuer tries to add resource to token', async function () {
      const resourceIndex = 0;
      const tokenId = 0;
      await _addResource(resourceIndex);

      await expect(
        rmrkNft
          .connect(addrs[1])
          .addResourceToToken(
            tokenId,
            resourceStorage.address,
            resArr[resourceIndex].id,
            ethers.utils.hexZeroPad('0x0', 16),
          )
      ).to.be.reverted;
    });

    it('can add same resource to 2 different tokens', async function () {
      const tokenId = 1;
      const otherTokenId = 2;
      const resourceIndex = 0;

      const resId16 = await _addResource(resourceIndex);

      await rmrkNft
        .connect(owner)
        .addResourceToToken(
          tokenId,
          resourceStorage.address,
          resArr[resourceIndex].id,
          ethers.utils.hexZeroPad("0x0", 16),
        );
        

      await rmrkNft
        .connect(owner)
        .addResourceToToken(
          otherTokenId,
          resourceStorage.address,
          resArr[resourceIndex].id,
          ethers.utils.hexZeroPad("0x0", 16),
        );

      // Get pending resources
      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([resId16]);
      expect(await rmrkNft.getPendingResources(otherTokenId)).to.eql([resId16]);

      // Get renderable resources - should return none
      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([]);
      expect(await rmrkNft.getActiveResources(otherTokenId)).to.eql([]);

    });
    
    it('cannot add the same resource twice', async function () {

      const resourceIndex = 0;
      await _addResource(resourceIndex);

      // Check expected reverts
      await expect(
        rmrkNft
          .connect(owner)
          .addResourceEntry(resArr[resourceIndex].id, resArr[resourceIndex].src, resArr[resourceIndex].thumb, resArr[resourceIndex].metadataURI),
      ).to.be.revertedWith('RMRK: resource already exists');

    });
    
    it('cannot add resource with id 0', async function () {
      const resourceIndex = 0;
      await _addResource(resourceIndex);
      await expect(
        rmrkNft
          .connect(owner)
          .addResourceEntry(
            ethers.utils.hexZeroPad('0x0', 8),
            resArr[resourceIndex].src,
            resArr[resourceIndex].thumb,
            resArr[resourceIndex].metadataURI,
          ),
      ).to.be.revertedWith('RMRK: Write to zero');
    });

    it('cannot add the same resource to the same token twice', async function () {

      const tokenId = 1;
      const resourceIndex = 0;
      await _addResourceAndAddToToken(resourceIndex, tokenId);

      await expect(
        rmrkNft
          .connect(owner)
          .addResourceToToken(
            tokenId,
            resourceStorage.address,
            resArr[resourceIndex].id,
            ethers.utils.hexZeroPad('0x0', 16),
          ),
      ).to.be.revertedWith('RMRKCore: Resource already exists on token');
    });

    it('cannot add resource with not added resource id to a token', async function () {

      const tokenId = 1;
      await expect(
        rmrkNft
          .connect(owner)
          .addResourceToToken(
            tokenId,
            resourceStorage.address,
            ethers.utils.hexZeroPad('0xa1a2a3', 8),
            ethers.utils.hexZeroPad('0x0', 16),
          ),
      ).to.be.revertedWith('RMRKResource: No resource at index');
    });
  });

  describe('Accept resource', async function () {
    it('can accept resource', async () => {

      const tokenId = 1;
      const resourceIndex = 0;
      const resId16 =  await _addResourceAndAddToToken(resourceIndex, tokenId);

      await rmrkNft.connect(addrs[0]).acceptResource(tokenId, 0);

      // Get pending resources - should return none
      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([]);

      // Get active resources
      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([resId16]);

      // Check getRenderableResource getter
      expect(await rmrkNft.getRenderableResource(tokenId)).to.eql([
        resourceStorage.address,
        resArr[0].id,
      ]);
    });

    it('reverts if not owner/approved tries to accept resource', async function () {
      const tokenId = 1;
      const resourceIndex = 0;
      await _addResourceAndAddToToken(resourceIndex, tokenId);

      await expect(
        rmrkNft.connect(addrs[1]).acceptResource(tokenId, 0)
      ).to.be.revertedWith('RMRKCore: Not approved or owner');

    })

    it('allows approved address (not owner) to accept resource', async function () {
      const tokenId = 1;
      const resourceIndex = 0;
      const approvedAddress = addrs[1];
      const resId16 =  await _addResourceAndAddToToken(resourceIndex, tokenId);

      await rmrkNft.connect(addrs[0]).approve(approvedAddress.address, tokenId);
      await rmrkNft.connect(approvedAddress).acceptResource(tokenId, 0);

      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([]);
      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([resId16]);
    })

    it('can accept multiple resources', async function () {
      const targetResArrs = [
        [resArr[0].id, resArr[0].src, resArr[0].thumb, resArr[0].metadataURI],
        [resArr[1].id, resArr[1].src, resArr[1].thumb, resArr[1].metadataURI],
      ];

      const tokenId = 1;
      const resId16_1 = await _addResourceAndAddToToken(0, tokenId);
      const resId16_2 = await _addResourceAndAddToToken(1, tokenId);

      // Get pending resources
      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([resId16_1, resId16_2]);

      await rmrkNft.connect(addrs[0]).acceptResource(tokenId, 0);
      await rmrkNft.connect(addrs[0]).acceptResource(tokenId, 0);

      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([]);
      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([resId16_1, resId16_2]);

      expect(await rmrkNft.getResObjectByIndex(tokenId, 0)).to.eql(targetResArrs[0]);
      expect(await rmrkNft.getResObjectByIndex(tokenId, 1)).to.eql(targetResArrs[1]);

    });

    it('can reorder priorities', async function () {
      const tokenId = 1;
      // Will also accept:
      const resId16_1 = await _addResourceAndAddToToken(0, tokenId, true);
      const resId16_2 = await _addResourceAndAddToToken(1, tokenId, true);

      // Reorder priorities and return correct renderable resource
      await rmrkNft.connect(addrs[0]).setPriority(tokenId, [resId16_2, resId16_1]);

      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([resId16_2, resId16_1]);
    });

    it('reverts if not owner/approved tries to reorder priorities', async function () {
      const tokenId = 1;
      // Will also accept:
      const resId16_1 = await _addResourceAndAddToToken(0, tokenId, true);
      const resId16_2 = await _addResourceAndAddToToken(1, tokenId, true);

      await expect(
        rmrkNft.connect(addrs[1]).setPriority(tokenId, [resId16_2, resId16_1]),
      ).to.be.revertedWith('RMRKCore: Not approved or owner');
    });

    it('allows approved address (not owner) to reorder priorities', async function () {
      const tokenId = 1;
      const approvedAddress = addrs[1];
      // Will also accept:
      const resId16_1 = await _addResourceAndAddToToken(0, tokenId, true);
      const resId16_2 = await _addResourceAndAddToToken(1, tokenId, true);

      await rmrkNft.connect(addrs[0]).approve(approvedAddress.address, tokenId);
      await rmrkNft.connect(addrs[1]).setPriority(tokenId, [resId16_2, resId16_1])

      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([resId16_2, resId16_1]);
    })

    it('reverts if the new order has does not have the same length', async function () {
      const tokenId = 1;
      // Will also accept:
      await _addResourceAndAddToToken(0, tokenId, true);
      const resId16_2 = await _addResourceAndAddToToken(1, tokenId, true);

      await expect(rmrkNft.connect(addrs[0]).setPriority(tokenId, [resId16_2])).to.be.revertedWith(
        'RMRK: Bad priority list length',
      );
    });

    it('reverts if trying to reprioritize non-existant resources', async function () {
      const tokenId = 1;
      // Will also accept:
      await _addResourceAndAddToToken(0, tokenId, true);
      await _addResourceAndAddToToken(1, tokenId, true);

      await expect(
        rmrkNft
          .connect(addrs[0])
          .setPriority(tokenId, [
            ethers.utils.hexZeroPad('0xaaaaa', 16),
            ethers.utils.hexZeroPad('0xbbbb', 16),
          ]),
      ).to.be.revertedWith('RMRK: Trying to reprioritize a non-existant resource');
    });

    it('Can overwrite resource', async function () {
      const targetResArrs = [
        [resArr[0].id, resArr[0].src, resArr[0].thumb, resArr[0].metadataURI],
        [resArr[1].id, resArr[1].src, resArr[1].thumb, resArr[1].metadataURI],
      ];

      const tokenId = 1;
      const originalResourceIndex = 0;
      const replacingResourceIndex = 1;
      // Will also accept:
      const resId16_1 = await _addResourceAndAddToToken(originalResourceIndex, tokenId, true);
      const resId16_2 = await _addResource(replacingResourceIndex);

      await rmrkNft
        .connect(owner)
        .addResourceToToken(
          tokenId,
          resourceStorage.address,
          resArr[replacingResourceIndex].id,
          resId16_1, // overwrite
        );

      // Get pending resources
      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([resId16_2]);

      await rmrkNft.connect(addrs[0]).acceptResource(tokenId, 0);

      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([]);
      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([resId16_2]);

      expect(await rmrkNft.getResObjectByIndex(tokenId, 0)).to.eql(targetResArrs[1]);

    });
  });

  describe('Reject resource', async function () {
    it('can reject resource', async () => {
      const tokenId = 1;
      const resourceIndex = 0;
      await _addResourceAndAddToToken(resourceIndex, tokenId);

      await rmrkNft.connect(addrs[0]).rejectResource(tokenId, 0);

      // Get pending resources - should return none
      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([]);

      // Get active resources
      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([]);
    });

    it('cannot reject resources for non existing index', async () => {
      // Cannot reject resources for non existing index
      await expect(
        rmrkNft.connect(addrs[0]).rejectResource(1, 0),
      ).to.be.revertedWith('RMRKcore: Pending child index out of range');
    });

    it('reverts if not owner/approved tries to reject resource', async function () {
      const tokenId = 1;
      const resourceIndex = 0;
      await _addResourceAndAddToToken(resourceIndex, tokenId);

      await expect(
        rmrkNft.connect(addrs[1]).rejectResource(tokenId, resourceIndex),
      ).to.be.revertedWith('RMRKCore: Not approved or owner');
    });

    it('allows approved address (not owner) to reject resource', async function () {
      const tokenId = 1;
      const resourceIndex = 0;
      const approvedAddress = addrs[1];
      await _addResourceAndAddToToken(resourceIndex, tokenId);

      await rmrkNft.connect(addrs[0]).approve(approvedAddress.address, tokenId);
      await rmrkNft.connect(approvedAddress).rejectResource(tokenId, 0);

      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([]);
      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([]);
    });

    it('can reject all resources', async () => {
      const tokenId = 1;
      await _addResourceAndAddToToken(0, tokenId);
      await _addResourceAndAddToToken(1, tokenId);

      await rmrkNft.connect(addrs[0]).rejectAllResources(tokenId);

      // Get pending resources - should return none
      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([]);

      // Get active resources - should return none
      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([]);

      // It is harmless if resources are already empty:
      await rmrkNft.connect(addrs[0]).rejectAllResources(tokenId);
    });

    it('reverts if not owner/approved tries to reject all resources', async function () {
      const tokenId = 1;
      await _addResourceAndAddToToken(0, tokenId);
      await _addResourceAndAddToToken(1, tokenId);

      await expect(
        rmrkNft.connect(addrs[1]).rejectAllResources(tokenId),
      ).to.be.revertedWith('RMRKCore: Not approved or owner');
    });

    it('allows approved address (not owner) to reject all resources', async function () {
      const tokenId = 1;
      const resourceIndex = 0;
      const approvedAddress = addrs[1];
      await _addResourceAndAddToToken(resourceIndex, tokenId);

      await rmrkNft.connect(addrs[0]).approve(approvedAddress.address, tokenId);
      await rmrkNft.connect(approvedAddress).rejectAllResources(tokenId);

      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([]);
      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([]);
    });
  });

  async function _addResource(resourceIndex: number): Promise<string> {
    const resId32 = ethers.utils.solidityKeccak256(
      ['address', 'bytes8'],
      [resourceStorage.address, resArr[resourceIndex].id],
    );
    const resId16 = ethers.utils.hexDataSlice(resId32, 0, 16);

    // Check on and offchain kekkac256 method
    const testKec = await rmrkNft.hashResource16(resourceStorage.address, resArr[resourceIndex].id);
    expect(testKec).to.equal(resId16);

    const targetResultArr = [resArr[resourceIndex].id, resArr[resourceIndex].src, resArr[resourceIndex].thumb, resArr[resourceIndex].metadataURI];

    // add resource
    await rmrkNft
      .connect(owner)
      .addResourceEntry(resArr[resourceIndex].id, resArr[resourceIndex].src, resArr[resourceIndex].thumb, resArr[resourceIndex].metadataURI);

    expect(await resourceStorage.getResource(resArr[resourceIndex].id)).to.eql(targetResultArr);

    return resId16;
  }

  async function _addResourceAndAddToToken(resourceIndex: number, tokenId: number, accept: boolean=false): Promise<string> {
    const resId16 = await _addResource(resourceIndex);

    await rmrkNft
        .connect(owner)
        .addResourceToToken(
          tokenId,
          resourceStorage.address,
          resArr[resourceIndex].id,
          ethers.utils.hexZeroPad('0x0', 16),
        );

    if (accept){
      // The 0 is for the index, not for the resourceId:
      await rmrkNft.connect(addrs[0]).acceptResource(tokenId, 0);
    }
    
    return resId16;
  }

});
