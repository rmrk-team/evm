import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { bn } from '../utils';
import { IERC165, IRMRKTokenHolder, IOtherInterface } from '../interfaces';
import { RMRKTokenHolderMock, ERC20Mock, ERC721Mock, ERC1155Mock } from '../../typechain-types';
import { tokenHolder } from '../../typechain-types/contracts/RMRK/extension';
import { token } from '../../typechain-types/@openzeppelin/contracts';

// --------------- FIXTURES -----------------------

async function tokenHolderFixture() {
  const tokenHolderFactory = await ethers.getContractFactory('RMRKTokenHolderMock');
  const tokenHolder = await tokenHolderFactory.deploy('Secure Token Transfer Protocol', 'STTP');
  await tokenHolder.deployed();

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

  return { tokenHolder, erc20, erc20B, erc721, erc721B, erc1155, erc1155B };
}

describe('RMRKTokenHolderMock', async function () {
  let tokenHolder: RMRKTokenHolderMock;
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
    ({ tokenHolder, erc20, erc20B, erc721, erc721B, erc1155, erc1155B } = await loadFixture(
      tokenHolderFixture,
    ));
  });

  it('can support IERC165', async function () {
    expect(await tokenHolder.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support TokenHolder', async function () {
    expect(await tokenHolder.supportsInterface(IRMRKTokenHolder)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await tokenHolder.supportsInterface(IOtherInterface)).to.equal(false);
  });

  describe('With minted tokens', async function () {
    beforeEach(async function () {
      await tokenHolder.mint(holder.address, tokenId);
      await tokenHolder.mint(otherHolder.address, otherTokenId);
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
      await erc20.approve(tokenHolder.address, mockValue);
      await expect(
        tokenHolder.transferHeldTokenToToken(erc20.address, 0, tokenId, 0, mockValue, '0x00'),
      )
        .to.emit(tokenHolder, 'ReceivedToken')
        .withArgs(erc20.address, 0, tokenId, 0, holder.address, mockValue);
      expect(await erc20.balanceOf(tokenHolder.address)).to.equal(mockValue);
    });

    it('can receive ERC-721 tokens', async function () {
      await erc721.approve(tokenHolder.address, 0);
      await expect(tokenHolder.transferHeldTokenToToken(erc721.address, 1, tokenId, 0, 1, '0x00'))
        .to.emit(tokenHolder, 'ReceivedToken')
        .withArgs(erc721.address, 1, tokenId, 0, holder.address, 1);
      expect(await erc721.balanceOf(tokenHolder.address)).to.equal(1);
    });

    it('can receive ERC-1155 tokens', async function () {
      await erc1155.setApprovalForAll(tokenHolder.address, true);
      await expect(
        tokenHolder.transferHeldTokenToToken(erc1155.address, 2, tokenId, 0, mockValue, '0x00'),
      )
        .to.emit(tokenHolder, 'ReceivedToken')
        .withArgs(erc1155.address, 2, tokenId, 0, holder.address, mockValue);
      expect(await erc1155.balanceOf(tokenHolder.address, 0)).to.equal(mockValue);
    });

    it('can transfer ERC-20 tokens', async function () {
      await erc20.approve(tokenHolder.address, mockValue);
      await tokenHolder.transferHeldTokenToToken(erc20.address, 0, tokenId, 0, mockValue, '0x00');
      await expect(
        tokenHolder.transferHeldTokenFromToken(
          erc20.address,
          0,
          tokenId,
          0,
          mockValue.div(2),
          holder.address,
          '0x00',
        ),
      )
        .to.emit(tokenHolder, 'TransferredToken')
        .withArgs(erc20.address, 0, tokenId, 0, holder.address, mockValue.div(2));
      expect(await erc20.balanceOf(tokenHolder.address)).to.equal(mockValue.div(2));
    });

    it('can transfer ERC-721 tokens', async function () {
      await erc721.approve(tokenHolder.address, 0);
      await tokenHolder.transferHeldTokenToToken(erc721.address, 1, tokenId, 0, 1, '0x00');
      expect(await erc721.balanceOf(tokenHolder.address)).to.equal(1);
      await expect(
        tokenHolder.transferHeldTokenFromToken(
          erc721.address,
          1,
          tokenId,
          0,
          1,
          holder.address,
          '0x00',
        ),
      )
        .to.emit(tokenHolder, 'TransferredToken')
        .withArgs(erc721.address, 1, tokenId, 0, holder.address, 1);
      expect(await erc721.balanceOf(tokenHolder.address)).to.equal(0);
    });

    it('can transfer ERC-1155 tokens', async function () {
      await erc1155.setApprovalForAll(tokenHolder.address, true);
      await tokenHolder.transferHeldTokenToToken(erc1155.address, 2, tokenId, 0, mockValue, '0x00');
      expect(await erc1155.balanceOf(tokenHolder.address, 0)).to.equal(mockValue);
      await expect(
        tokenHolder.transferHeldTokenFromToken(
          erc1155.address,
          2,
          tokenId,
          0,
          mockValue.div(2),
          holder.address,
          '0x00',
        ),
      )
        .to.emit(tokenHolder, 'TransferredToken')
        .withArgs(erc1155.address, 2, tokenId, 0, holder.address, mockValue.div(2));
      expect(await erc1155.balanceOf(tokenHolder.address, 0)).to.equal(mockValue.div(2));
    });

    it('cannot transfer 0 value', async function () {
      await erc1155.setApprovalForAll(tokenHolder.address, true);

      await expect(
        tokenHolder.transferHeldTokenToToken(erc20.address, 0, tokenId, 0, 0, '0x00'),
      ).to.be.revertedWithCustomError(tokenHolder, 'InvalidValue');
      await expect(
        tokenHolder.transferHeldTokenToToken(erc1155.address, 2, tokenId, 0, 0, '0x00'),
      ).to.be.revertedWithCustomError(tokenHolder, 'InvalidValue');
      await expect(
        tokenHolder.transferHeldTokenFromToken(
          erc20.address,
          0,
          tokenId,
          0,
          0,
          addrs[0].address,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolder, 'InvalidValue');
      await expect(
        tokenHolder.transferHeldTokenFromToken(
          erc1155.address,
          2,
          tokenId,
          0,
          0,
          addrs[0].address,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolder, 'InvalidValue');
    });

    it('cannot transfer to address 0', async function () {
      await expect(
        tokenHolder.transferHeldTokenFromToken(
          erc20.address,
          0,
          tokenId,
          0,
          mockValue,
          ethers.constants.AddressZero,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolder, 'InvalidAddress');
      await expect(
        tokenHolder.transferHeldTokenFromToken(
          erc721.address,
          1,
          tokenId,
          0,
          mockValue,
          ethers.constants.AddressZero,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolder, 'InvalidAddress');
      await expect(
        tokenHolder.transferHeldTokenFromToken(
          erc1155.address,
          2,
          tokenId,
          0,
          mockValue,
          ethers.constants.AddressZero,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolder, 'InvalidAddress');
    });

    it('cannot transfer a token at address 0', async function () {
      await expect(
        tokenHolder.transferHeldTokenToToken(
          ethers.constants.AddressZero,
          0,
          tokenId,
          0,
          mockValue,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolder, 'InvalidAddress');
      await expect(
        tokenHolder.transferHeldTokenToToken(
          ethers.constants.AddressZero,
          1,
          tokenId,
          0,
          1,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolder, 'InvalidAddress');
      await expect(
        tokenHolder.transferHeldTokenToToken(
          ethers.constants.AddressZero,
          2,
          tokenId,
          0,
          mockValue,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolder, 'InvalidAddress');
      await expect(
        tokenHolder.transferHeldTokenFromToken(
          ethers.constants.AddressZero,
          0,
          tokenId,
          0,
          mockValue,
          addrs[0].address,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolder, 'InvalidAddress');
      await expect(
        tokenHolder.transferHeldTokenFromToken(
          ethers.constants.AddressZero,
          1,
          tokenId,
          0,
          mockValue,
          addrs[0].address,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolder, 'InvalidAddress');
      await expect(
        tokenHolder.transferHeldTokenFromToken(
          ethers.constants.AddressZero,
          2,
          tokenId,
          0,
          mockValue,
          addrs[0].address,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolder, 'InvalidAddress');
    });

    it('cannot transfer more balance than the token has', async function () {
      await erc20.approve(tokenHolder.address, mockValue);
      await erc1155.setApprovalForAll(tokenHolder.address, true);
      await tokenHolder.transferHeldTokenToToken(
        erc20.address,
        0,
        tokenId,
        0,
        mockValue.div(2),
        '0x00',
      );
      await tokenHolder.transferHeldTokenToToken(
        erc20.address,
        0,
        otherTokenId,
        0,
        mockValue.div(2),
        '0x00',
      );
      await tokenHolder.transferHeldTokenToToken(
        erc1155.address,
        2,
        tokenId,
        0,
        mockValue.div(2),
        '0x00',
      );
      await tokenHolder.transferHeldTokenToToken(
        erc1155.address,
        2,
        otherTokenId,
        0,
        mockValue.div(2),
        '0x00',
      );
      await expect(
        tokenHolder.transferHeldTokenFromToken(
          erc20.address,
          0,
          tokenId,
          0,
          mockValue, // The token only owns half of this value
          holder.address,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolder, 'InsufficientBalance');
      await expect(
        tokenHolder.transferHeldTokenFromToken(
          erc1155.address,
          2,
          tokenId,
          0,
          mockValue, // The token only owns half of this value
          holder.address,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolder, 'InsufficientBalance');
    });

    it('cannot transfer balance from not owned token', async function () {
      await erc20.approve(tokenHolder.address, mockValue);
      await tokenHolder.transferHeldTokenToToken(erc20.address, 0, tokenId, 0, mockValue, '0x00');
      // Other holder is not the owner of tokenId
      await expect(
        tokenHolder
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
      ).to.be.revertedWithCustomError(tokenHolder, 'OnlyNFTOwnerCanTransferTokensFromIt');
    });

    it('can manage multiple ERC20s', async function () {
      await erc20B.mint(holder.address, mockValue);
      await erc20.approve(tokenHolder.address, mockValue);
      await erc20B.approve(tokenHolder.address, mockValue);

      await tokenHolder.transferHeldTokenToToken(
        erc20.address,
        0,
        tokenId,
        0,
        ethers.utils.parseEther('3'),
        '0x00',
      );
      await tokenHolder.transferHeldTokenToToken(
        erc20B.address,
        0,
        tokenId,
        0,
        ethers.utils.parseEther('5'),
        '0x00',
      );

      expect(await tokenHolder.balanceOfToken(erc20.address, 0, tokenId, 0)).to.equal(
        ethers.utils.parseEther('3'),
      );
      expect(await tokenHolder.balanceOfToken(erc20B.address, 0, tokenId, 0)).to.equal(
        ethers.utils.parseEther('5'),
      );
    });

    it('can manage multiple ERC721s', async function () {
      await erc721B.mint(holder.address, 0);
      await erc721.approve(tokenHolder.address, 0);
      await erc721B.approve(tokenHolder.address, 0);

      await tokenHolder.transferHeldTokenToToken(
        erc721.address,
        1,
        tokenId,
        0,
        ethers.utils.parseEther('3'),
        '0x00',
      );
      await tokenHolder.transferHeldTokenToToken(
        erc721B.address,
        1,
        tokenId,
        0,
        ethers.utils.parseEther('5'),
        '0x00',
      );

      expect(await tokenHolder.balanceOfToken(erc721.address, 1, tokenId, 0)).to.equal(1);
      expect(await tokenHolder.balanceOfToken(erc721B.address, 1, tokenId, 0)).to.equal(1);
    });

    it('can manage multiple ERC1155s', async function () {
      await erc1155B.mint(holder.address, 0, mockValue, '0x00');
      await erc1155.setApprovalForAll(tokenHolder.address, true);
      await erc1155B.setApprovalForAll(tokenHolder.address, true);

      await tokenHolder.transferHeldTokenToToken(
        erc1155.address,
        2,
        tokenId,
        0,
        ethers.utils.parseEther('3'),
        '0x00',
      );
      await tokenHolder.transferHeldTokenToToken(
        erc1155B.address,
        2,
        tokenId,
        0,
        ethers.utils.parseEther('5'),
        '0x00',
      );

      expect(await tokenHolder.balanceOfToken(erc1155.address, 2, tokenId, 0)).to.equal(
        ethers.utils.parseEther('3'),
      );
      expect(await tokenHolder.balanceOfToken(erc1155B.address, 2, tokenId, 0)).to.equal(
        ethers.utils.parseEther('5'),
      );
    });

    it('ignores token ID for ERC-20 tokens', async function () {
      await erc20.approve(tokenHolder.address, mockValue);

      await tokenHolder.transferHeldTokenToToken(erc20.address, 0, tokenId, 42, mockValue, '0x00');

      expect(await tokenHolder.balanceOfToken(erc20.address, 0, tokenId, 42)).to.equal(mockValue);

      await tokenHolder.transferHeldTokenFromToken(
        erc20.address,
        0,
        tokenId,
        42,
        mockValue,
        otherHolder.address,
        '0x00',
      );

      expect(await tokenHolder.balanceOfToken(erc20.address, 0, tokenId, 42)).to.equal(0);
    });

    it('ignores amount for ERC-721 tokens', async function () {
      await erc721.approve(tokenHolder.address, 0);

      await tokenHolder.transferHeldTokenToToken(erc721.address, 1, tokenId, 0, mockValue, '0x00');

      expect(await tokenHolder.balanceOfToken(erc721.address, 1, tokenId, 0)).to.equal(1);

      await tokenHolder.transferHeldTokenFromToken(
        erc721.address,
        1,
        tokenId,
        0,
        mockValue,
        otherHolder.address,
        '0x00',
      );

      expect(await tokenHolder.balanceOfToken(erc721.address, 1, tokenId, 0)).to.equal(0);
    });
  });
});
