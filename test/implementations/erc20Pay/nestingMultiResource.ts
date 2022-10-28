import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import shouldControlValidMintingErc20Pay from '../../behavior/mintingImplErc20Pay';
import { ADDRESS_ZERO, singleFixtureWithArgs, mintFromImplErc20Pay, ONE_ETH } from '../../utils';

async function singleFixture(): Promise<{
  erc20: Contract;
  token: Contract;
}> {
  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = await erc20Factory.deploy();
  await erc20.deployed();

  const token = await singleFixtureWithArgs('RMRKNestingMultiResourceImplErc20Pay', [
    'MultiResource',
    'MR',
    'ipfs://collection-meta',
    'ipfs://tokenURI',
    [erc20.address, 10000, 0, ADDRESS_ZERO, ONE_ETH],
  ]);
  return { erc20, token };
}

describe('NestingMultiResourceImplErc20Pay Minting', async () => {
  let token: Contract;
  let erc20: Contract;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    owner = (await ethers.getSigners())[0];
    ({ erc20, token } = await loadFixture(singleFixture));
    this.token = token;
  });

  it('Can mint tokens through sale logic', async function () {
    await mintFromImplErc20Pay(token, owner.address);
    expect(await token.ownerOf(1)).to.equal(owner.address);
    expect(await token.totalSupply()).to.equal(1);
    expect(await token.balanceOf(owner.address)).to.equal(1);
  });

  it('Can mint multiple tokens through sale logic', async function () {
    await erc20.mint(owner.address, ONE_ETH.mul(10));
    await erc20.approve(token.address, ONE_ETH.mul(10));

    await token.connect(owner).mint(owner.address, 10);
    expect(await token.totalSupply()).to.equal(10);
    expect(await token.balanceOf(owner.address)).to.equal(10);

    await expect(token.connect(owner).mint(owner.address, 1)).to.be.revertedWithCustomError(
      token,
      'RMRKNotEnoughAllowance',
    );
  });

  shouldControlValidMintingErc20Pay();
});
