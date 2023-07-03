import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { bn } from '../utils';
import { IERC165, IRMRKSecureTokenTransferProtocol, IOtherInterface } from '../interfaces';
import { RMRKSecureTokenTransferProtocolMock, ERC20Mock } from '../../typechain-types';
import { secureTokenTransferProtocol } from '../../typechain-types/contracts/RMRK/extension';

// --------------- FIXTURES -----------------------

async function secureTokenTransferProtocolFixture() {
  const secureTokenTransferProtocolFactory = await ethers.getContractFactory('RMRKSecureTokenTransferProtocolMock');
  const secureTokenTransferProtocol = await secureTokenTransferProtocolFactory.deploy('Secure Token Transfer Protocol', 'STTP');
  await secureTokenTransferProtocol.deployed();

  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = await erc20Factory.deploy();
  await erc20.deployed();

  const erc20B = await erc20Factory.deploy();
  await erc20B.deployed();

  return { secureTokenTransferProtocol, erc20, erc20B };
}

describe('RMRKSecureTokenTransferProtocolMock', async function () {
  let secureTokenTransferProtocol: RMRKSecureTokenTransferProtocolMock;
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
    ({ secureTokenTransferProtocol, erc20, erc20B } = await loadFixture(secureTokenTransferProtocolFixture));
  });

  it('can support IERC165', async function () {
    expect(await secureTokenTransferProtocol.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support SecureTokenTransferProtocol', async function () {
    expect(await secureTokenTransferProtocol.supportsInterface(IRMRKSecureTokenTransferProtocol)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await secureTokenTransferProtocol.supportsInterface(IOtherInterface)).to.equal(false);
  });

  describe('With minted tokens', async function () {
    beforeEach(async function () {
      await secureTokenTransferProtocol.mint(holder.address, tokenId);
      await secureTokenTransferProtocol.mint(otherHolder.address, otherTokenId);
      await erc20.mint(holder.address, mockValue);
      await erc20.mint(otherHolder.address, mockValue);
    });

    it('can receive tokens', async function () {
      await erc20.approve(secureTokenTransferProtocol.address, mockValue);
      await expect(secureTokenTransferProtocol.transferHeldTokenToToken(erc20.address, 0, tokenId, 0, mockValue, '0x00'))
        .to.emit(secureTokenTransferProtocol, 'ReceivedToken')
        .withArgs(erc20.address, 0, tokenId, 0, holder.address, mockValue);
      expect(await erc20.balanceOf(secureTokenTransferProtocol.address)).to.equal(mockValue);
    });

    it('can transfer tokens', async function () {
      await erc20.approve(secureTokenTransferProtocol.address, mockValue);
      await secureTokenTransferProtocol.transferHeldTokenToToken(erc20.address, 0, tokenId, 0, mockValue, '0x00');
      await expect(
        secureTokenTransferProtocol.transferHeldTokenFromToken(
          erc20.address,
          0,
          tokenId,
          0,
          mockValue.div(2),
          holder.address,
          '0x00',
        ),
      )
        .to.emit(secureTokenTransferProtocol, 'TransferredToken')
        .withArgs(erc20.address, 0, tokenId, 0, holder.address, mockValue.div(2));
      expect(await erc20.balanceOf(secureTokenTransferProtocol.address)).to.equal(mockValue.div(2));
    });

    it('cannot transfer 0 value', async function () {
      await expect(
        secureTokenTransferProtocol.transferHeldTokenToToken(erc20.address, 0, tokenId, 0, 0, '0x00'),
      ).to.be.revertedWithCustomError(secureTokenTransferProtocol, 'InvalidValue');
      await expect(
        secureTokenTransferProtocol.transferHeldTokenFromToken(erc20.address, 0, tokenId, 0, 0, addrs[0].address, '0x00'),
      ).to.be.revertedWithCustomError(secureTokenTransferProtocol, 'InvalidValue');
    });

    it('cannot transfer to address 0', async function () {
      await expect(
        secureTokenTransferProtocol.transferHeldTokenFromToken(
          erc20.address,
          0,
          tokenId,
          0,
          mockValue,
          ethers.constants.AddressZero,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(secureTokenTransferProtocol, 'InvalidAddress');
    });

    it('cannot transfer a token at address 0', async function () {
      await expect(
        secureTokenTransferProtocol.transferHeldTokenToToken(ethers.constants.AddressZero, 0, tokenId, 0, mockValue, '0x00'),
      ).to.be.revertedWithCustomError(secureTokenTransferProtocol, 'InvalidAddress');
      await expect(
        secureTokenTransferProtocol.transferHeldTokenFromToken(
          ethers.constants.AddressZero,
          0,
          tokenId,
          0,
          mockValue,
          addrs[0].address,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(secureTokenTransferProtocol, 'InvalidAddress');
    });

    it('cannot transfer more balance than the token has', async function () {
      await erc20.approve(secureTokenTransferProtocol.address, mockValue);
      await secureTokenTransferProtocol.transferHeldTokenToToken(erc20.address, 0, tokenId, 0, mockValue.div(2), '0x00');
      await secureTokenTransferProtocol.transferHeldTokenToToken(erc20.address, 0, otherTokenId, 0, mockValue.div(2), '0x00');
      await expect(
        secureTokenTransferProtocol.transferHeldTokenFromToken(
          erc20.address,
          0,
          tokenId,
          0,
          mockValue, // The token only owns half of this value
          holder.address,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(secureTokenTransferProtocol, 'InsufficientBalance');
    });

    it('cannot transfer balance from not owned token', async function () {
      await erc20.approve(secureTokenTransferProtocol.address, mockValue);
      await secureTokenTransferProtocol.transferHeldTokenToToken(erc20.address, 0, tokenId, 0, mockValue, '0x00');
      // Other holder is not the owner of tokenId
      await expect(
        secureTokenTransferProtocol
          .connect(otherHolder)
          .transferHeldTokenFromToken(erc20.address, 0, tokenId, 0, mockValue, otherHolder.address, '0x00'),
      ).to.be.revertedWithCustomError(secureTokenTransferProtocol, 'OnlyNFTOwnerCanTransferTokensFromIt');
    });

    it('can manage multiple ERC20s', async function () {
      await erc20B.mint(holder.address, mockValue);
      await erc20.approve(secureTokenTransferProtocol.address, mockValue);
      await erc20B.approve(secureTokenTransferProtocol.address, mockValue);

      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc20.address,
        0,
        tokenId,
        0,
        ethers.utils.parseEther('3'),
        '0x00',
      );
      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc20B.address,
        0,
        tokenId,
        0,
        ethers.utils.parseEther('5'),
        '0x00',
      );

      expect(await secureTokenTransferProtocol.balanceOfToken(erc20.address, 0, tokenId, 0)).to.equal(
        ethers.utils.parseEther('3'),
      );
      expect(await secureTokenTransferProtocol.balanceOfToken(erc20B.address, 0, tokenId, 0)).to.equal(
        ethers.utils.parseEther('5'),
      );
    });
  });
});
