import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { bn } from '../utils';
import { IERC165, IRMRKSecureTokenTransferProtocol, IOtherInterface } from '../interfaces';
import {
  RMRKSecureTokenTransferProtocolMock,
  ERC20Mock,
  ERC721Mock,
  ERC1155Mock,
} from '../../typechain-types';
import { secureTokenTransferProtocol } from '../../typechain-types/contracts/RMRK/extension';
import { token } from '../../typechain-types/@openzeppelin/contracts';

// --------------- FIXTURES -----------------------

async function secureTokenTransferProtocolFixture() {
  const secureTokenTransferProtocolFactory = await ethers.getContractFactory(
    'RMRKSecureTokenTransferProtocolMock',
  );
  const secureTokenTransferProtocol = await secureTokenTransferProtocolFactory.deploy(
    'Secure Token Transfer Protocol',
    'STTP',
  );
  await secureTokenTransferProtocol.deployed();

  const erc20Factory = await ethers.getContractFactory('ERC20Mock');
  const erc20 = await erc20Factory.deploy();
  await erc20.deployed();

  const erc20B = await erc20Factory.deploy();
  await erc20B.deployed();

  const erc721Factory = await ethers.getContractFactory('ERC721Mock');
  const erc721 = await erc721Factory.deploy('ERC721Mock', 'ERC721');
  await erc721.deployed();

  const erc721B = await erc721Factory.deploy('ERC721MockB', 'ERC721B');
  await erc721B.deployed();

  const erc1155Factory = await ethers.getContractFactory('ERC1155Mock');
  const erc1155 = await erc1155Factory.deploy('ipfs//:foo');
  await erc1155.deployed();

  const erc1155B = await erc1155Factory.deploy('ipfs//:bar');
  await erc1155B.deployed();

  return { secureTokenTransferProtocol, erc20, erc20B, erc721, erc721B, erc1155, erc1155B };
}

describe('RMRKSecureTokenTransferProtocolMock', async function () {
  let secureTokenTransferProtocol: RMRKSecureTokenTransferProtocolMock;
  let erc20: ERC20Mock;
  let erc20B: ERC20Mock;
  let erc721: ERC721Mock;
  let erc721B: ERC721Mock;
  let erc1155: ERC1155Mock;
  let erc1155B: ERC1155Mock;
  let holder: SignerWithAddress;
  let otherHolder: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const tokenId = bn(1);
  const otherTokenId = bn(2);
  const mockValue = ethers.utils.parseEther('10');

  beforeEach(async function () {
    [holder, otherHolder, ...addrs] = await ethers.getSigners();
    ({ secureTokenTransferProtocol, erc20, erc20B, erc721, erc721B, erc1155, erc1155B } =
      await loadFixture(secureTokenTransferProtocolFixture));
  });

  it('can support IERC165', async function () {
    expect(await secureTokenTransferProtocol.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support SecureTokenTransferProtocol', async function () {
    expect(
      await secureTokenTransferProtocol.supportsInterface(IRMRKSecureTokenTransferProtocol),
    ).to.equal(true);
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
      for (let i = 0; i < 4; i++) {
        await erc721.mint(holder.address, i);
        await erc721.mint(otherHolder.address, i + 4);
        await erc1155.mint(holder.address, i, mockValue, '0x00');
        await erc1155.mint(otherHolder.address, i + 4, mockValue, '0x00');
      }
    });

    it('can receive ERC-20 tokens', async function () {
      await erc20.approve(secureTokenTransferProtocol.address, mockValue);
      await expect(
        secureTokenTransferProtocol.transferHeldTokenToToken(
          erc20.address,
          0,
          tokenId,
          0,
          mockValue,
          '0x00',
        ),
      )
        .to.emit(secureTokenTransferProtocol, 'ReceivedToken')
        .withArgs(erc20.address, 0, tokenId, 0, holder.address, mockValue);
      expect(await erc20.balanceOf(secureTokenTransferProtocol.address)).to.equal(mockValue);
    });

    it('can receive ERC-721 tokens', async function () {
      await erc721.approve(secureTokenTransferProtocol.address, 0);
      await expect(
        secureTokenTransferProtocol.transferHeldTokenToToken(
          erc721.address,
          1,
          tokenId,
          0,
          1,
          '0x00',
        ),
      )
        .to.emit(secureTokenTransferProtocol, 'ReceivedToken')
        .withArgs(erc721.address, 1, tokenId, 0, holder.address, 1);
      expect(await erc721.balanceOf(secureTokenTransferProtocol.address)).to.equal(1);
    });

    it('can receive ERC-1155 tokens', async function () {
      await erc1155.setApprovalForAll(secureTokenTransferProtocol.address, true);
      await expect(
        secureTokenTransferProtocol.transferHeldTokenToToken(
          erc1155.address,
          2,
          tokenId,
          0,
          mockValue,
          '0x00',
        ),
      )
        .to.emit(secureTokenTransferProtocol, 'ReceivedToken')
        .withArgs(erc1155.address, 2, tokenId, 0, holder.address, mockValue);
      expect(await erc1155.balanceOf(secureTokenTransferProtocol.address, 0)).to.equal(mockValue);
    });

    it('can transfer ERC-20 tokens', async function () {
      await erc20.approve(secureTokenTransferProtocol.address, mockValue);
      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc20.address,
        0,
        tokenId,
        0,
        mockValue,
        '0x00',
      );
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

    it('can transfer ERC-721 tokens', async function () {
      await erc721.approve(secureTokenTransferProtocol.address, 0);
      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc721.address,
        1,
        tokenId,
        0,
        1,
        '0x00',
      );
      expect(await erc721.balanceOf(secureTokenTransferProtocol.address)).to.equal(1);
      await expect(
        secureTokenTransferProtocol.transferHeldTokenFromToken(
          erc721.address,
          1,
          tokenId,
          0,
          1,
          holder.address,
          '0x00',
        ),
      )
        .to.emit(secureTokenTransferProtocol, 'TransferredToken')
        .withArgs(erc721.address, 1, tokenId, 0, holder.address, 1);
      expect(await erc721.balanceOf(secureTokenTransferProtocol.address)).to.equal(0);
    });

    it('can transfer ERC-1155 tokens', async function () {
      await erc1155.setApprovalForAll(secureTokenTransferProtocol.address, true);
      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc1155.address,
        2,
        tokenId,
        0,
        mockValue,
        '0x00',
      );
      expect(await erc1155.balanceOf(secureTokenTransferProtocol.address, 0)).to.equal(mockValue);
      await expect(
        secureTokenTransferProtocol.transferHeldTokenFromToken(
          erc1155.address,
          2,
          tokenId,
          0,
          mockValue.div(2),
          holder.address,
          '0x00',
        ),
      )
        .to.emit(secureTokenTransferProtocol, 'TransferredToken')
        .withArgs(erc1155.address, 2, tokenId, 0, holder.address, mockValue.div(2));
      expect(await erc1155.balanceOf(secureTokenTransferProtocol.address, 0)).to.equal(
        mockValue.div(2),
      );
    });

    it('cannot transfer 0 value', async function () {
      await erc1155.setApprovalForAll(secureTokenTransferProtocol.address, true);

      await expect(
        secureTokenTransferProtocol.transferHeldTokenToToken(
          erc20.address,
          0,
          tokenId,
          0,
          0,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(secureTokenTransferProtocol, 'InvalidValue');
      await expect(
        secureTokenTransferProtocol.transferHeldTokenToToken(
          erc1155.address,
          2,
          tokenId,
          0,
          0,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(secureTokenTransferProtocol, 'InvalidValue');
      await expect(
        secureTokenTransferProtocol.transferHeldTokenFromToken(
          erc20.address,
          0,
          tokenId,
          0,
          0,
          addrs[0].address,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(secureTokenTransferProtocol, 'InvalidValue');
      await expect(
        secureTokenTransferProtocol.transferHeldTokenFromToken(
          erc1155.address,
          2,
          tokenId,
          0,
          0,
          addrs[0].address,
          '0x00',
        ),
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
      await expect(
        secureTokenTransferProtocol.transferHeldTokenFromToken(
          erc721.address,
          1,
          tokenId,
          0,
          mockValue,
          ethers.constants.AddressZero,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(secureTokenTransferProtocol, 'InvalidAddress');
      await expect(
        secureTokenTransferProtocol.transferHeldTokenFromToken(
          erc1155.address,
          2,
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
        secureTokenTransferProtocol.transferHeldTokenToToken(
          ethers.constants.AddressZero,
          0,
          tokenId,
          0,
          mockValue,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(secureTokenTransferProtocol, 'InvalidAddress');
      await expect(
        secureTokenTransferProtocol.transferHeldTokenToToken(
          ethers.constants.AddressZero,
          1,
          tokenId,
          0,
          1,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(secureTokenTransferProtocol, 'InvalidAddress');
      await expect(
        secureTokenTransferProtocol.transferHeldTokenToToken(
          ethers.constants.AddressZero,
          2,
          tokenId,
          0,
          mockValue,
          '0x00',
        ),
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
      await expect(
        secureTokenTransferProtocol.transferHeldTokenFromToken(
          ethers.constants.AddressZero,
          1,
          tokenId,
          0,
          mockValue,
          addrs[0].address,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(secureTokenTransferProtocol, 'InvalidAddress');
      await expect(
        secureTokenTransferProtocol.transferHeldTokenFromToken(
          ethers.constants.AddressZero,
          2,
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
      await erc1155.setApprovalForAll(secureTokenTransferProtocol.address, true);
      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc20.address,
        0,
        tokenId,
        0,
        mockValue.div(2),
        '0x00',
      );
      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc20.address,
        0,
        otherTokenId,
        0,
        mockValue.div(2),
        '0x00',
      );
      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc1155.address,
        2,
        tokenId,
        0,
        mockValue.div(2),
        '0x00',
      );
      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc1155.address,
        2,
        otherTokenId,
        0,
        mockValue.div(2),
        '0x00',
      );
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
      await expect(
        secureTokenTransferProtocol.transferHeldTokenFromToken(
          erc1155.address,
          2,
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
      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc20.address,
        0,
        tokenId,
        0,
        mockValue,
        '0x00',
      );
      // Other holder is not the owner of tokenId
      await expect(
        secureTokenTransferProtocol
          .connect(otherHolder)
          .transferHeldTokenFromToken(
            erc20.address,
            0,
            tokenId,
            0,
            mockValue,
            otherHolder.address,
            '0x00',
          ),
      ).to.be.revertedWithCustomError(
        secureTokenTransferProtocol,
        'OnlyNFTOwnerCanTransferTokensFromIt',
      );
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

      expect(
        await secureTokenTransferProtocol.balanceOfToken(erc20.address, 0, tokenId, 0),
      ).to.equal(ethers.utils.parseEther('3'));
      expect(
        await secureTokenTransferProtocol.balanceOfToken(erc20B.address, 0, tokenId, 0),
      ).to.equal(ethers.utils.parseEther('5'));
    });

    it('can manage multiple ERC721s', async function () {
      await erc721B.mint(holder.address, 0);
      await erc721.approve(secureTokenTransferProtocol.address, 0);
      await erc721B.approve(secureTokenTransferProtocol.address, 0);

      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc721.address,
        1,
        tokenId,
        0,
        ethers.utils.parseEther('3'),
        '0x00',
      );
      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc721B.address,
        1,
        tokenId,
        0,
        ethers.utils.parseEther('5'),
        '0x00',
      );

      expect(
        await secureTokenTransferProtocol.balanceOfToken(erc721.address, 1, tokenId, 0),
      ).to.equal(1);
      expect(
        await secureTokenTransferProtocol.balanceOfToken(erc721B.address, 1, tokenId, 0),
      ).to.equal(1);
    });

    it('can manage multiple ERC1155s', async function () {
      await erc1155B.mint(holder.address, 0, mockValue, '0x00');
      await erc1155.setApprovalForAll(secureTokenTransferProtocol.address, true);
      await erc1155B.setApprovalForAll(secureTokenTransferProtocol.address, true);

      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc1155.address,
        2,
        tokenId,
        0,
        ethers.utils.parseEther('3'),
        '0x00',
      );
      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc1155B.address,
        2,
        tokenId,
        0,
        ethers.utils.parseEther('5'),
        '0x00',
      );

      expect(
        await secureTokenTransferProtocol.balanceOfToken(erc1155.address, 2, tokenId, 0),
      ).to.equal(ethers.utils.parseEther('3'));
      expect(
        await secureTokenTransferProtocol.balanceOfToken(erc1155B.address, 2, tokenId, 0),
      ).to.equal(ethers.utils.parseEther('5'));
    });

    it('ignores token ID for ERC-20 tokens', async function () {
      await erc20.approve(secureTokenTransferProtocol.address, mockValue);

      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc20.address,
        0,
        tokenId,
        42,
        mockValue,
        '0x00',
      );

      expect(
        await secureTokenTransferProtocol.balanceOfToken(erc20.address, 0, tokenId, 42),
      ).to.equal(mockValue);

      await secureTokenTransferProtocol.transferHeldTokenFromToken(
        erc20.address,
        0,
        tokenId,
        42,
        mockValue,
        otherHolder.address,
        '0x00',
      );

      expect(
        await secureTokenTransferProtocol.balanceOfToken(erc20.address, 0, tokenId, 42),
      ).to.equal(0);
    });

    it('ignores amount for ERC-721 tokens', async function () {
      await erc721.approve(secureTokenTransferProtocol.address, 0);

      await secureTokenTransferProtocol.transferHeldTokenToToken(
        erc721.address,
        1,
        tokenId,
        0,
        mockValue,
        '0x00',
      );

      expect(
        await secureTokenTransferProtocol.balanceOfToken(erc721.address, 1, tokenId, 0),
      ).to.equal(1);

      await secureTokenTransferProtocol.transferHeldTokenFromToken(
        erc721.address,
        1,
        tokenId,
        0,
        mockValue,
        otherHolder.address,
        '0x00',
      );

      expect(
        await secureTokenTransferProtocol.balanceOfToken(erc721.address, 1, tokenId, 0),
      ).to.equal(0);
    });
  });
});
