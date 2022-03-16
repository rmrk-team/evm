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
    it('Adds resource', async function () {
      const resId32 = ethers.utils.solidityKeccak256(
        ['address', 'bytes8'],
        [resourceStorage.address, resArr[0].id],
      );
      const resId16 = ethers.utils.hexDataSlice(resId32, 0, 16);

      // Check on and offchain kekkac256 method
      const testKec = await rmrkNft.hashResource16(resourceStorage.address, resArr[0].id);
      expect(testKec).to.equal(resId16);

      const targetResultArr = [resArr[0].id, resArr[0].src, resArr[0].thumb, resArr[0].metadataURI];

      // add resource
      await rmrkNft
        .connect(owner)
        .addResourceEntry(resArr[0].id, resArr[0].src, resArr[0].thumb, resArr[0].metadataURI);

      expect(await resourceStorage.getResource(resArr[0].id)).to.eql(targetResultArr);

      const tokenId = 1;
      await rmrkNft
        .connect(owner)
        .addResourceToToken(
          tokenId,
          resourceStorage.address,
          resArr[0].id,
          ethers.utils.hexZeroPad("0x0", 16),
        );

      // add resource to other token
      const otherTokenId = 2;
        await rmrkNft
        .connect(owner)
        .addResourceToToken(
          otherTokenId,
          resourceStorage.address,
          resArr[0].id,
          ethers.utils.hexZeroPad('0x0', 16),
        );

      // Get pending resources
      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([resId16]);
      expect(await rmrkNft.getPendingResources(otherTokenId)).to.eql([resId16]);

      // Get renderable resources - should return none
      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([]);
      expect(await rmrkNft.getActiveResources(otherTokenId)).to.eql([]);

      // Check expected reverts
      await expect(
        rmrkNft
          .connect(owner)
          .addResourceEntry(resArr[0].id, resArr[0].src, resArr[0].thumb, resArr[0].metadataURI),
      ).to.be.revertedWith('RMRK: resource already exists');

      await expect(
        rmrkNft
          .connect(owner)
          .addResourceEntry(
            ethers.utils.hexZeroPad('0x0', 8),
            resArr[0].src,
            resArr[0].thumb,
            resArr[0].metadataURI,
          ),
      ).to.be.revertedWith('RMRK: Write to zero');
    });

    it('Accept resource', async () => {
      const resId32 = ethers.utils.solidityKeccak256(
        ['address', 'bytes8'],
        [resourceStorage.address, resArr[0].id],
      );
      const resId16 = ethers.utils.hexDataSlice(resId32, 0, 16);

      await rmrkNft
        .connect(owner)
        .addResourceEntry(resArr[0].id, resArr[0].src, resArr[0].thumb, resArr[0].metadataURI);

      const tokenId = 1;
      await rmrkNft
        .connect(owner)
        .addResourceToToken(
          tokenId,
          resourceStorage.address,
          resArr[0].id,
          ethers.utils.hexZeroPad('0x0', 16),
        );

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

    it('Rejects resource', async () => {
      await rmrkNft
        .connect(owner)
        .addResourceEntry(resArr[0].id, resArr[0].src, resArr[0].thumb, resArr[0].metadataURI);

      const tokenId = 1;
      await rmrkNft
        .connect(owner)
        .addResourceToToken(
          tokenId,
          resourceStorage.address,
          resArr[0].id,
          ethers.utils.hexZeroPad('0x0', 16),
        );

      await rmrkNft.connect(addrs[0]).rejectResource(tokenId, 0);

      // Get pending resources - should return none
      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([]);

      // Get active resources
      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([]);

      // Cannot reject resources for non existing index
      await expect(
        rmrkNft.connect(addrs[0]).rejectResource(tokenId, 0),
      ).to.be.revertedWith('RMRKcore: Pending child index out of range');
    });

    it('Reject all resources', async () => {
      await rmrkNft
        .connect(owner)
        .addResourceEntry(resArr[0].id, resArr[0].src, resArr[0].thumb, resArr[0].metadataURI);
      await rmrkNft
        .connect(owner)
        .addResourceEntry(resArr[1].id, resArr[1].src, resArr[1].thumb, resArr[1].metadataURI);

      const tokenId = 1;
      await rmrkNft
        .connect(owner)
        .addResourceToToken(
          tokenId,
          resourceStorage.address,
          resArr[0].id,
          ethers.utils.hexZeroPad('0x0', 16),
        );
      await rmrkNft
        .connect(owner)
        .addResourceToToken(
          tokenId,
          resourceStorage.address,
          resArr[1].id,
          ethers.utils.hexZeroPad('0x0', 16),
        );

      await rmrkNft.connect(addrs[0]).rejectAllResources(tokenId);

      // Get pending resources - should return none
      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([]);

      // Get active resources - should return none
      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([]);

      // It is harmless if resources are already empty:
      await rmrkNft.connect(addrs[0]).rejectAllResources(tokenId);
    });

    it('Add multiple resources and reorder priorities', async function () {
      const targetResArrs = [
        [resArr[0].id, resArr[0].src, resArr[0].thumb, resArr[0].metadataURI],
        [resArr[1].id, resArr[1].src, resArr[1].thumb, resArr[1].metadataURI],
      ];

      const resId32_1 = ethers.utils.solidityKeccak256(
        ['address', 'bytes8'],
        [resourceStorage.address, resArr[0].id],
      );
      const resId16_1 = ethers.utils.hexDataSlice(resId32_1, 0, 16);

      const resId32_2 = ethers.utils.solidityKeccak256(
        ['address', 'bytes8'],
        [resourceStorage.address, resArr[1].id],
      );
      const resId16_2 = ethers.utils.hexDataSlice(resId32_2, 0, 16);

      await rmrkNft
        .connect(owner)
        .addResourceEntry(resArr[0].id, resArr[0].src, resArr[0].thumb, resArr[0].metadataURI);
      await rmrkNft
        .connect(owner)
        .addResourceEntry(resArr[1].id, resArr[1].src, resArr[1].thumb, resArr[1].metadataURI);

      // Check existing priority order

      const tokenId = 1;
      await rmrkNft
        .connect(owner)
        .addResourceToToken(
          tokenId,
          resourceStorage.address,
          resArr[0].id,
          ethers.utils.hexZeroPad('0x0', 16),
        );

      await rmrkNft
        .connect(owner)
        .addResourceToToken(
          tokenId,
          resourceStorage.address,
          resArr[1].id,
          ethers.utils.hexZeroPad('0x0', 16),
        );

      // Get pending resources
      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([resId16_1, resId16_2]);

      await rmrkNft.connect(addrs[0]).acceptResource(tokenId, 0);
      await rmrkNft.connect(addrs[0]).acceptResource(tokenId, 0);

      expect(await rmrkNft.getPendingResources(tokenId)).to.eql([]);
      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([resId16_1, resId16_2]);

      expect(await rmrkNft.getResObjectByIndex(tokenId, 0)).to.eql(targetResArrs[0]);

      // Reorder priorities and return correct renderable resource
      await rmrkNft.connect(addrs[0]).setPriority(tokenId, [resId16_2, resId16_1]);

      expect(await rmrkNft.getActiveResources(tokenId)).to.eql([resId16_2, resId16_1]);

      await expect(
        rmrkNft.connect(addrs[1]).setPriority(tokenId, [resId16_2, resId16_1]),
      ).to.be.revertedWith('RMRK: Attempting to set priority in non-owned NFT');

      await expect(rmrkNft.connect(addrs[0]).setPriority(tokenId, [resId16_2])).to.be.revertedWith(
        'RMRK: Bad priority list length',
      );

      await expect(
        rmrkNft
          .connect(addrs[0])
          .setPriority(tokenId, [
            ethers.utils.hexZeroPad('0xaaaaa', 16),
            ethers.utils.hexZeroPad('0xbbbb', 16),
          ]),
      ).to.be.revertedWith('RMRK: Trying to reprioritize a non-existant resource');

      await expect(
        rmrkNft
          .connect(owner)
          .addResourceToToken(
            tokenId,
            resourceStorage.address,
            resArr[1].id,
            ethers.utils.hexZeroPad('0x0', 16),
          ),
      ).to.be.revertedWith('RMRKCore: Resource already exists on token');

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

    it('Overwrites resource', async function () {
      const targetResArrs = [
        [resArr[0].id, resArr[0].src, resArr[0].thumb, resArr[0].metadataURI],
        [resArr[1].id, resArr[1].src, resArr[1].thumb, resArr[1].metadataURI],
      ];

      const resId32_1 = ethers.utils.solidityKeccak256(
        ['address', 'bytes8'],
        [resourceStorage.address, resArr[0].id],
      );
      const resId16_1 = ethers.utils.hexDataSlice(resId32_1, 0, 16);

      const resId32_2 = ethers.utils.solidityKeccak256(
        ['address', 'bytes8'],
        [resourceStorage.address, resArr[1].id],
      );
      const resId16_2 = ethers.utils.hexDataSlice(resId32_2, 0, 16);

      const tokenId = 1;
      await rmrkNft
        .connect(owner)
        .addResourceEntry(resArr[0].id, resArr[0].src, resArr[0].thumb, resArr[0].metadataURI);
      await rmrkNft
        .connect(owner)
        .addResourceEntry(resArr[1].id, resArr[1].src, resArr[1].thumb, resArr[1].metadataURI);

      await rmrkNft
        .connect(owner)
        .addResourceToToken(
          tokenId,
          resourceStorage.address,
          resArr[0].id,
          ethers.utils.hexZeroPad('0x0', 16),
        );

      await rmrkNft.connect(addrs[0]).acceptResource(tokenId, 0);

      await rmrkNft
        .connect(owner)
        .addResourceToToken(
          tokenId,
          resourceStorage.address,
          resArr[1].id,
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
});
