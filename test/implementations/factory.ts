import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('RMRKFactory', async () => {
  let rmrkFactory: Contract;

  let owner: SignerWithAddress;
  let addrs: any[];

  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;
  });

  describe('Deployment', async function () {
    beforeEach(async function () {
      const RMRKMultiResourceFactory = await ethers.getContractFactory('RMRKMultiResourceFactory');
      rmrkFactory = await RMRKMultiResourceFactory.deploy();
    });

    it('Deploy a new RMRK MultiResource contract', async function () {
      const name = 'RmrkTest';
      const symbol = 'RMRKTST';
      const ONE_ETH = ethers.utils.parseEther('1.0');
      const maxSupply = 10000;
      await expect(
        rmrkFactory.connect(owner).deployRMRKMultiResource(name, symbol, maxSupply, ONE_ETH),
      ).to.emit(rmrkFactory, 'NewRMRKMultiResourceContract');
    });
  });
});
