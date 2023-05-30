import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { bn } from '../utils';
import { IERC165, IERC20Holder, IOtherInterface } from '../interfaces';
import { RMRKERC20HolderMock, ERC20Mock } from '../../typechain-types';
import { erc20Holder } from '../../typechain-types/contracts/RMRK/extension';

// --------------- FIXTURES -----------------------

async function erc20HolderFixture() {
  const erc20HolderFactory = await ethers.getContractFactory('RMRKERC20HolderMock');
  const erc20holder = await erc20HolderFactory.deploy('ERC20 Holder', '20H');
  await erc20holder.deployed();

  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = await erc20Factory.deploy();
  await erc20.deployed();

  return { erc20holder, erc20 };
}

describe('RMRKERC20HolderMock', async function () {
  let erc20holder: RMRKERC20HolderMock;
  let erc20: ERC20Mock;
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const tokenId = bn(1);

  beforeEach(async function () {
    [owner, ...addrs] = await ethers.getSigners();
    ({ erc20holder, erc20 } = await loadFixture(erc20HolderFixture));
  });

  it('can support IERC165', async function () {
    expect(await erc20holder.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support ERC20Holder', async function () {
    expect(await erc20holder.supportsInterface(IERC20Holder)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await erc20holder.supportsInterface(IOtherInterface)).to.equal(false);
  });

  describe('With minted tokens', async function () {
    beforeEach(async function () {
      await erc20holder.mint(owner.address, tokenId);
      await erc20.mint(owner.address, ethers.utils.parseEther('10'));
    });

    it('can receive tokens', async function () {
      await erc20.approve(erc20holder.address, ethers.utils.parseEther('10'));
      await erc20holder.transferERC20ToToken(
        erc20.address,
        tokenId,
        ethers.utils.parseEther('10'),
        '0x00',
      );
      expect(await erc20.balanceOf(erc20holder.address)).to.equal(ethers.utils.parseEther('10'));
    });

    it('can transfer tokens', async function () {
      await erc20.approve(erc20holder.address, ethers.utils.parseEther('10'));
      await erc20holder.transferERC20ToToken(
        erc20.address,
        tokenId,
        ethers.utils.parseEther('10'),
        '0x00',
      );
      await erc20holder.transferERC20FromToken(
        erc20.address,
        tokenId,
        owner.address,
        ethers.utils.parseEther('5'),
        '0x00',
      );
      expect(await erc20.balanceOf(erc20holder.address)).to.equal(ethers.utils.parseEther('5'));
    });

    it('cannot transfer 0 value', async function () {});

    it('cannot transfer to address 0', async function () {});

    it('cannot transfer a token at address 0', async function () {});

    it('cannot transfer more balance than the token has', async function () {});

    it('cannot transfer balance from not owned token', async function () {});

    it('can manage multiple ERC20s', async function () {});
  });
});
