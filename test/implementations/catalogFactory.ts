import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { RMRKCatalogFactory } from '../../typechain-types';

async function catalogFactoryFixture(): Promise<RMRKCatalogFactory> {
  const factory = await ethers.getContractFactory('RMRKCatalogFactory');
  const catalogFactory = await factory.deploy();
  await catalogFactory.waitForDeployment();

  return catalogFactory;
}

describe('CatalogImpl', async () => {
  let catalogFactory: RMRKCatalogFactory;
  let deployer1: SignerWithAddress;
  let deployer2: SignerWithAddress;

  beforeEach(async () => {
    [, deployer1, deployer2] = await ethers.getSigners();
    catalogFactory = await loadFixture(catalogFactoryFixture);
  });

  it('can deploy a new catalog', async () => {
    const tx = await catalogFactory
      .connect(deployer1)
      .deployCatalog('ipfs://catalogMetadata', 'img/jpeg');
    const receipt = await tx.wait();
    const catalogAddress = receipt?.logs?.[0]?.address;
    if (!catalogAddress) {
      throw new Error('Catalog address not found');
    }
    const catalog = await ethers.getContractAt('RMRKCatalogImpl', catalogAddress);

    expect(await catalog.getMetadataURI()).to.equal('ipfs://catalogMetadata');
    expect(await catalog.getType()).to.equal('img/jpeg');
    expect(await catalog.owner()).to.equal(deployer1.address);
  });

  it('can get catalogs deployed by a deployer', async () => {
    const catalogAddress1 = await deployAndGetAddress(
      deployer1,
      'ipfs://catalogMetadata1',
      'img/jpeg',
    );
    const catalogAddress2 = await deployAndGetAddress(
      deployer1,
      'ipfs://catalogMetadata2',
      'img/png',
    );
    const catalogAddress3 = await deployAndGetAddress(
      deployer2,
      'ipfs://otherDeployerCatalog',
      'img/svg',
    );

    expect(await catalogFactory.getDeployerCatalogs(deployer1.address)).to.deep.equal([
      catalogAddress1,
      catalogAddress2,
    ]);
    expect(await catalogFactory.getDeployerCatalogs(deployer2.address)).to.deep.equal([
      catalogAddress3,
    ]);

    expect(await catalogFactory.getLastDeployerCatalog(deployer1.address)).to.equal(
      catalogAddress2,
    );
    expect(await catalogFactory.getLastDeployerCatalog(deployer2.address)).to.equal(
      catalogAddress3,
    );

    expect(await catalogFactory.getTotalDeployerCatalogs(deployer1.address)).to.equal(2);
    expect(await catalogFactory.getTotalDeployerCatalogs(deployer2.address)).to.equal(1);

    expect(await catalogFactory.getDeployerCatalogAtIndex(deployer1.address, 0)).to.equal(
      catalogAddress1,
    );
    expect(await catalogFactory.getDeployerCatalogAtIndex(deployer1.address, 1)).to.equal(
      catalogAddress2,
    );
  });

  async function deployAndGetAddress(
    deployer: SignerWithAddress,
    metadataURI: string,
    mediaType: string,
  ) {
    const tx = await catalogFactory.connect(deployer).deployCatalog(metadataURI, mediaType);
    const receipt = await tx.wait();
    const catalogAddress = receipt?.logs?.[0]?.address;
    if (!catalogAddress) {
      throw new Error('Catalog address not found');
    }
    return catalogAddress;
  }
});
