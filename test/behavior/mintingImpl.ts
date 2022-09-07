import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ONE_ETH } from '../utils';

async function shouldControlValidMinting(): Promise<void> {
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;
  });

  it('cannot mint under price', async function () {
    const HALF_ETH = ethers.utils.parseEther('0.05');
    await expect(
      this.token.mint(addrs[0].address, 1, { value: HALF_ETH }),
    ).to.be.revertedWithCustomError(this.token, 'RMRKMintUnderpriced');
  });

  it('cannot mint 0 units', async function () {
    await expect(
      this.token.mint(addrs[0].address, 0, { value: ONE_ETH }),
    ).to.be.revertedWithCustomError(this.token, 'RMRKMintZero');
  });

  it('cannot mint over max supply', async function () {
    await expect(
      this.token.mint(addrs[0].address, 99999, { value: ONE_ETH }),
    ).to.be.revertedWithCustomError(this.token, 'RMRKMintOverMax');
  });

  // FIXME: We should set a limit per address also, probably on deploy.
  // it('cannot mint over max quantity at a time', async function () {
  //   await expect(
  //     this.token.mint(addrs[0].address, 100, { value: ONE_ETH.mul(100) }),
  //   ).to.be.revertedWithCustomError(this.token, 'RMRKMintOverMax');
  // });
}

export default shouldControlValidMinting;
