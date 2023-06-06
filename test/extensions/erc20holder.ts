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

  const erc20B = await erc20Factory.deploy();
  await erc20B.deployed();

  return { erc20holder, erc20, erc20B };
}

describe('RMRKERC20HolderMock', async function () {
  let erc20holder: RMRKERC20HolderMock;
  let erc20: ERC20Mock;
  let erc20B: ERC20Mock;
  let holder: SignerWithAddress;
  let otherHolder: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const tokenId = bn(1);
  const otherTokenId = bn(2);
  const mockValue = ethers.utils.parseEther('10');

  beforeEach(async function () {
    [holder, otherHolder, ...addrs] = await ethers.getSigners();
    ({ erc20holder, erc20, erc20B } = await loadFixture(erc20HolderFixture));
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
      await erc20holder.mint(holder.address, tokenId);
      await erc20holder.mint(otherHolder.address, otherTokenId);
      await erc20.mint(holder.address, mockValue);
      await erc20.mint(otherHolder.address, mockValue);
    });

    it('can receive tokens', async function () {
      await erc20.approve(erc20holder.address, mockValue);
      await expect(erc20holder.transferERC20ToToken(erc20.address, tokenId, mockValue, '0x00'))
        .to.emit(erc20holder, 'ReceivedERC20')
        .withArgs(erc20.address, tokenId, holder.address, mockValue);
      expect(await erc20.balanceOf(erc20holder.address)).to.equal(mockValue);
    });

    it('can transfer tokens', async function () {
      await erc20.approve(erc20holder.address, mockValue);
      await erc20holder.transferERC20ToToken(erc20.address, tokenId, mockValue, '0x00');
      await expect(
        erc20holder.transferERC20FromToken(
          erc20.address,
          tokenId,
          holder.address,
          mockValue.div(2),
          '0x00',
        ),
      )
        .to.emit(erc20holder, 'TransferredERC20')
        .withArgs(erc20.address, tokenId, holder.address, mockValue.div(2));
      expect(await erc20.balanceOf(erc20holder.address)).to.equal(mockValue.div(2));
    });

    it('cannot transfer 0 value', async function () {
      await expect(
        erc20holder.transferERC20ToToken(erc20.address, tokenId, 0, '0x00'),
      ).to.be.revertedWithCustomError(erc20holder, 'InvalidValue');
      await expect(
        erc20holder.transferERC20FromToken(erc20.address, tokenId, addrs[0].address, 0, '0x00'),
      ).to.be.revertedWithCustomError(erc20holder, 'InvalidValue');
    });

    it('cannot transfer to address 0', async function () {
      await expect(
        erc20holder.transferERC20FromToken(
          erc20.address,
          tokenId,
          ethers.constants.AddressZero,
          mockValue,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(erc20holder, 'InvalidAddress');
    });

    it('cannot transfer a token at address 0', async function () {
      await expect(
        erc20holder.transferERC20ToToken(ethers.constants.AddressZero, tokenId, mockValue, '0x00'),
      ).to.be.revertedWithCustomError(erc20holder, 'InvalidAddress');
      await expect(
        erc20holder.transferERC20FromToken(
          ethers.constants.AddressZero,
          tokenId,
          addrs[0].address,
          mockValue,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(erc20holder, 'InvalidAddress');
    });

    it('cannot transfer more balance than the token has', async function () {
      await erc20.approve(erc20holder.address, mockValue);
      await erc20holder.transferERC20ToToken(erc20.address, tokenId, mockValue.div(2), '0x00');
      await erc20holder.transferERC20ToToken(erc20.address, otherTokenId, mockValue.div(2), '0x00');
      await expect(
        erc20holder.transferERC20FromToken(
          erc20.address,
          tokenId,
          holder.address,
          mockValue, // The token only owns half of this value
          '0x00',
        ),
      ).to.be.revertedWithCustomError(erc20holder, 'InsufficientBalance');
    });

    it('cannot transfer balance from not owned token', async function () {
      await erc20.approve(erc20holder.address, mockValue);
      await erc20holder.transferERC20ToToken(erc20.address, tokenId, mockValue, '0x00');
      // Other holder is not the owner of tokenId
      await expect(
        erc20holder
          .connect(otherHolder)
          .transferERC20FromToken(erc20.address, tokenId, otherHolder.address, mockValue, '0x00'),
      ).to.be.revertedWithCustomError(erc20holder, 'OnlyNFTOwnerCanTransferTokensFromIt');
    });

    it('can manage multiple ERC20s', async function () {
      await erc20B.mint(holder.address, mockValue);
      await erc20.approve(erc20holder.address, mockValue);
      await erc20B.approve(erc20holder.address, mockValue);

      await erc20holder.transferERC20ToToken(
        erc20.address,
        tokenId,
        ethers.utils.parseEther('3'),
        '0x00',
      );
      await erc20holder.transferERC20ToToken(
        erc20B.address,
        tokenId,
        ethers.utils.parseEther('5'),
        '0x00',
      );

      expect(await erc20holder.balanceOfERC20(erc20.address, tokenId)).to.equal(
        ethers.utils.parseEther('3'),
      );
      expect(await erc20holder.balanceOfERC20(erc20B.address, tokenId)).to.equal(
        ethers.utils.parseEther('5'),
      );
    });
  });
});
