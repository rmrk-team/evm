import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('RMRKFactory', async () => {
  const name = 'RmrkTest';
  const symbol = 'RMRKTST';
  const ONE_ETH = ethers.utils.parseEther('1.0');
  const maxSupply = 10000;

  async function deployFactoriesFixture() {
    const [owner, ...signersAddr] = await ethers.getSigners();

    const RMRKMultiResourceFactory = await ethers.getContractFactory('RMRKMultiResourceFactory');
    const RMRKNestingFactory = await ethers.getContractFactory('RMRKNestingFactory');

    const rmrkMultiResourceFactory = await RMRKMultiResourceFactory.deploy();
    const rmrkNestingFactory = await RMRKNestingFactory.deploy();

    return { rmrkMultiResourceFactory, rmrkNestingFactory, owner };
  }

  it('Deploy a new RMRK MultiResource contract', async function () {
    const { rmrkMultiResourceFactory, owner } = await loadFixture(deployFactoriesFixture);
    await expect(
      rmrkMultiResourceFactory
        .connect(owner)
        .deployRMRKMultiResource(name, symbol, maxSupply, ONE_ETH),
    ).to.emit(rmrkMultiResourceFactory, 'NewRMRKMultiResourceContract');
  });

  it('Deploy a new RMRK Nesting contract', async function () {
    const { rmrkNestingFactory, owner } = await loadFixture(deployFactoriesFixture);
    await expect(
      rmrkNestingFactory.connect(owner).deployRMRKNesting(name, symbol, maxSupply, ONE_ETH),
    ).to.emit(rmrkNestingFactory, 'NewRMRKNestingContract');
  });
});
