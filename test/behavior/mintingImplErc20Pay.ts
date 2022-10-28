import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ONE_ETH } from '../utils';

async function shouldControlValidMintingErc20Pay(): Promise<void> {
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    const [, ...signersAddr] = await ethers.getSigners();
    addrs = signersAddr;
  });

  it('cannot mint under price', async function () {
    const HALF_ETH = ethers.utils.parseEther('0.05');
    const erc20Address = this.token.erc20TokenAddress();
    const erc20Factory = await ethers.getContractFactory('ERC20Mock');
    const erc20 = erc20Factory.attach(erc20Address);
    const owner = (await ethers.getSigners())[0];

    await erc20.mint(owner.address, ONE_ETH);
    await erc20.approve(this.token.address, HALF_ETH);
    await expect(this.token.mint(addrs[0].address, 1)).to.be.revertedWithCustomError(
      this.token,
      'RMRKNotEnoughAllowance',
    );
  });

  it('cannot mint 0 units', async function () {
    await expect(this.token.mint(addrs[0].address, 0)).to.be.revertedWithCustomError(
      this.token,
      'RMRKMintZero',
    );
  });

  it('cannot mint over max supply', async function () {
    await expect(this.token.mint(addrs[0].address, 99999)).to.be.revertedWithCustomError(
      this.token,
      'RMRKMintOverMax',
    );
  });
}

export default shouldControlValidMintingErc20Pay;
