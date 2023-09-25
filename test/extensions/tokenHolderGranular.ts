import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { bn } from '../utils';
import {
  IERC165,
  IOtherInterface,
  IRMRKERC1155Holder,
  IRMRKERC20Holder,
  IRMRKERC721Holder,
} from '../interfaces';
import {
  ERC20Mock,
  ERC721Mock,
  ERC1155Mock,
  RMRKERC20HolderMock,
  RMRKERC721HolderMock,
  RMRKERC1155HolderMock,
  RMRKUniversalHolderMock,
} from '../../typechain-types';

// --------------- FIXTURES -----------------------

async function tokenHolderFixture() {
  const tokenHolderERC20Factory = await ethers.getContractFactory('RMRKERC20HolderMock');
  const tokenHolderERC721Factory = await ethers.getContractFactory('RMRKERC721HolderMock');
  const tokenHolderERC1155Factory = await ethers.getContractFactory('RMRKERC1155HolderMock');
  const tokenHolderUniversalFactory = await ethers.getContractFactory('RMRKUniversalHolderMock');
  const tokenHolderERC20 = await tokenHolderERC20Factory.deploy(
    'Secure Token Transfer Protocol',
    'STTP',
  );
  const tokenHolderERC721 = await tokenHolderERC721Factory.deploy(
    'Secure Token Transfer Protocol',
    'STTP',
  );
  const tokenHolderERC1155 = await tokenHolderERC1155Factory.deploy(
    'Secure Token Transfer Protocol',
    'STTP',
  );
  const tokenHolderUniversal = await tokenHolderUniversalFactory.deploy(
    'Secure Token Transfer Protocol',
    'STTP',
  );
  await tokenHolderERC20.deployed();
  await tokenHolderERC721.deployed();
  await tokenHolderERC1155.deployed();
  await tokenHolderUniversal.deployed();

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

  return {
    tokenHolderERC20,
    tokenHolderERC721,
    tokenHolderERC1155,
    tokenHolderUniversal,
    erc20,
    erc20B,
    erc721,
    erc721B,
    erc1155,
    erc1155B,
  };
}

describe('GranularTokenHolder', async function () {
  let tokenHolderERC20: RMRKERC20HolderMock;
  let tokenHolderERC721: RMRKERC721HolderMock;
  let tokenHolderERC1155: RMRKERC1155HolderMock;
  let erc20: ERC20Mock;
  let erc20B: ERC20Mock;
  let erc721: ERC721Mock;
  let erc721B: ERC721Mock;
  let erc1155: ERC1155Mock;
  let erc1155B: ERC1155Mock;
  let holder: SignerWithAddress;
  let otherHolder: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const tokenHolderId = bn(1);
  const otherTokenHolderId = bn(2);
  const tokenId = bn(1);
  const mockValue = ethers.utils.parseEther('10');

  beforeEach(async function () {
    [holder, otherHolder, ...addrs] = await ethers.getSigners();
    ({
      tokenHolderERC20,
      tokenHolderERC721,
      tokenHolderERC1155,
      erc20,
      erc20B,
      erc721,
      erc721B,
      erc1155,
      erc1155B,
    } = await loadFixture(tokenHolderFixture));
  });

  it('can support IERC165', async function () {
    expect(await tokenHolderERC20.supportsInterface(IERC165)).to.equal(true);
    expect(await tokenHolderERC721.supportsInterface(IERC165)).to.equal(true);
    expect(await tokenHolderERC1155.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support TokenHolder', async function () {
    expect(await tokenHolderERC20.supportsInterface(IRMRKERC20Holder)).to.equal(true);
    expect(await tokenHolderERC721.supportsInterface(IRMRKERC721Holder)).to.equal(true);
    expect(await tokenHolderERC1155.supportsInterface(IRMRKERC1155Holder)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await tokenHolderERC20.supportsInterface(IOtherInterface)).to.equal(false);
    expect(await tokenHolderERC721.supportsInterface(IOtherInterface)).to.equal(false);
    expect(await tokenHolderERC1155.supportsInterface(IOtherInterface)).to.equal(false);
  });

  describe('With minted tokens', async function () {
    beforeEach(async function () {
      await tokenHolderERC20.mint(holder.address, tokenHolderId);
      await tokenHolderERC721.mint(holder.address, tokenHolderId);
      await tokenHolderERC1155.mint(holder.address, tokenHolderId);
      await tokenHolderERC20.mint(otherHolder.address, otherTokenHolderId);
      await tokenHolderERC721.mint(otherHolder.address, otherTokenHolderId);
      await tokenHolderERC1155.mint(otherHolder.address, otherTokenHolderId);
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
      await erc20.approve(tokenHolderERC20.address, mockValue);
      await expect(
        tokenHolderERC20.transferERC20ToToken(erc20.address, tokenHolderId, mockValue, '0x00'),
      )
        .to.emit(tokenHolderERC20, 'ReceivedERC20')
        .withArgs(erc20.address, tokenHolderId, holder.address, mockValue);
      expect(await erc20.balanceOf(tokenHolderERC20.address)).to.equal(mockValue);
    });

    it('can receive ERC-721 tokens', async function () {
      await erc721.approve(tokenHolderERC721.address, tokenId);
      await expect(
        tokenHolderERC721.transferERC721ToToken(erc721.address, tokenHolderId, tokenId, '0x00'),
      )
        .to.emit(tokenHolderERC721, 'ReceivedERC721')
        .withArgs(erc721.address, tokenHolderId, tokenId, holder.address);
      expect(await erc721.balanceOf(tokenHolderERC721.address)).to.equal(1);
    });

    it('can receive ERC-1155 tokens', async function () {
      await erc1155.setApprovalForAll(tokenHolderERC1155.address, true);
      await expect(
        tokenHolderERC1155.transferERC1155ToToken(
          erc1155.address,
          tokenHolderId,
          tokenId,
          mockValue,
          '0x00',
        ),
      )
        .to.emit(tokenHolderERC1155, 'ReceivedERC1155')
        .withArgs(erc1155.address, tokenHolderId, tokenId, holder.address, mockValue);
      expect(await erc1155.balanceOf(tokenHolderERC1155.address, tokenId)).to.equal(mockValue);
    });

    it('can transfer ERC-20 tokens', async function () {
      await erc20.approve(tokenHolderERC20.address, mockValue);
      await tokenHolderERC20.transferERC20ToToken(erc20.address, tokenHolderId, mockValue, '0x00');
      await expect(
        tokenHolderERC20.transferHeldERC20FromToken(
          erc20.address,
          tokenHolderId,
          holder.address,
          mockValue.div(2),
          '0x00',
        ),
      )
        .to.emit(tokenHolderERC20, 'TransferredERC20')
        .withArgs(erc20.address, tokenHolderId, holder.address, mockValue.div(2));
      expect(await erc20.balanceOf(tokenHolderERC20.address)).to.equal(mockValue.div(2));
    });

    it('can transfer ERC-721 tokens', async function () {
      await erc721.approve(tokenHolderERC721.address, tokenId);
      await tokenHolderERC721.transferERC721ToToken(erc721.address, tokenHolderId, tokenId, '0x00');
      expect(await erc721.balanceOf(tokenHolderERC721.address)).to.equal(1);
      await expect(
        tokenHolderERC721.transferHeldERC721FromToken(
          erc721.address,
          tokenHolderId,
          tokenId,
          holder.address,
          '0x00',
        ),
      )
        .to.emit(tokenHolderERC721, 'TransferredERC721')
        .withArgs(erc721.address, tokenHolderId, tokenId, holder.address);
      expect(await erc721.balanceOf(tokenHolderERC721.address)).to.equal(0);
    });

    it('can transfer ERC-1155 tokens', async function () {
      await erc1155.setApprovalForAll(tokenHolderERC1155.address, true);
      await tokenHolderERC1155.transferERC1155ToToken(
        erc1155.address,
        tokenHolderId,
        tokenId,
        mockValue,
        '0x00',
      );
      expect(await erc1155.balanceOf(tokenHolderERC1155.address, tokenId)).to.equal(mockValue);
      await expect(
        tokenHolderERC1155.transferHeldERC1155FromToken(
          erc1155.address,
          tokenHolderId,
          tokenId,
          holder.address,
          mockValue.div(2),
          '0x00',
        ),
      )
        .to.emit(tokenHolderERC1155, 'TransferredERC1155')
        .withArgs(erc1155.address, tokenHolderId, tokenId, holder.address, mockValue.div(2));
      expect(await erc1155.balanceOf(tokenHolderERC1155.address, tokenId)).to.equal(
        mockValue.div(2),
      );
    });

    it('cannot transfer 0 value', async function () {
      await erc1155.setApprovalForAll(tokenHolderERC1155.address, true);

      await expect(
        tokenHolderERC20.transferERC20ToToken(erc20.address, tokenId, 0, '0x00'),
      ).to.be.revertedWithCustomError(tokenHolderERC20, 'InvalidValue');
      await expect(
        tokenHolderERC1155.transferERC1155ToToken(erc1155.address, tokenId, 2, 0, '0x00'),
      ).to.be.revertedWithCustomError(tokenHolderERC1155, 'InvalidValue');

      await expect(
        tokenHolderERC20.transferHeldERC20FromToken(
          erc20.address,
          tokenId,
          holder.address,
          0,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderERC20, 'InvalidValue');
      await expect(
        tokenHolderERC1155.transferHeldERC1155FromToken(
          erc1155.address,
          tokenId,
          2,
          holder.address,
          0,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderERC1155, 'InvalidValue');
    });

    it('cannot transfer to address 0', async function () {
      await expect(
        tokenHolderERC20.transferHeldERC20FromToken(
          erc20.address,
          tokenId,
          ethers.constants.AddressZero,
          1,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderERC20, 'InvalidAddress');
      await expect(
        tokenHolderERC721.transferHeldERC721FromToken(
          erc721.address,
          tokenId,
          1,
          ethers.constants.AddressZero,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderERC721, 'InvalidAddress');
      await expect(
        tokenHolderERC1155.transferHeldERC1155FromToken(
          erc1155.address,
          tokenId,
          2,
          ethers.constants.AddressZero,
          1,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderERC1155, 'InvalidAddress');
    });

    it('cannot transfer a token at address 0', async function () {
      await expect(
        tokenHolderERC20.transferHeldERC20FromToken(
          ethers.constants.AddressZero,
          tokenId,
          holder.address,
          1,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderERC20, 'InvalidAddress');
      await expect(
        tokenHolderERC721.transferHeldERC721FromToken(
          ethers.constants.AddressZero,
          tokenId,
          1,
          holder.address,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderERC721, 'InvalidAddress');
      await expect(
        tokenHolderERC1155.transferHeldERC1155FromToken(
          ethers.constants.AddressZero,
          tokenId,
          2,
          holder.address,
          1,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderERC1155, 'InvalidAddress');

      await expect(
        tokenHolderERC20.transferERC20ToToken(ethers.constants.AddressZero, tokenId, 1, '0x00'),
      ).to.be.revertedWithCustomError(tokenHolderERC20, 'InvalidAddress');
      await expect(
        tokenHolderERC721.transferERC721ToToken(ethers.constants.AddressZero, tokenId, 1, '0x00'),
      ).to.be.revertedWithCustomError(tokenHolderERC721, 'InvalidAddress');
      await expect(
        tokenHolderERC1155.transferERC1155ToToken(
          ethers.constants.AddressZero,
          tokenId,
          2,
          1,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderERC1155, 'InvalidAddress');
    });

    it('cannot transfer more balance than the token has', async function () {
      await erc20.approve(tokenHolderERC20.address, mockValue);
      await erc1155.setApprovalForAll(tokenHolderERC1155.address, true);

      await tokenHolderERC20.transferERC20ToToken(erc20.address, tokenId, mockValue.div(2), '0x00');
      await tokenHolderERC20.transferERC20ToToken(
        erc20.address,
        otherTokenHolderId,
        mockValue.div(2),
        '0x00',
      );
      await tokenHolderERC1155.transferERC1155ToToken(
        erc1155.address,
        2,
        tokenId,
        mockValue.div(2),
        '0x00',
      );
      await tokenHolderERC1155.transferERC1155ToToken(
        erc1155.address,
        2,
        otherTokenHolderId,
        mockValue.div(2),
        '0x00',
      );
      await expect(
        tokenHolderERC20.transferHeldERC20FromToken(
          erc20.address,
          tokenId,
          holder.address,
          mockValue, // The token only owns half of this value
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderERC20, 'InsufficientBalance');
      await expect(
        tokenHolderERC1155.transferHeldERC1155FromToken(
          erc1155.address,
          tokenHolderId,
          tokenId,
          holder.address,
          mockValue, // The token only owns half of this value
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderERC1155, 'InsufficientBalance');
    });

    it('cannot transfer balance from not owned token', async function () {
      await erc20.approve(tokenHolderERC20.address, mockValue);
      await tokenHolderERC20.transferERC20ToToken(erc20.address, tokenHolderId, mockValue, '0x00');
      // Other holder is not the owner of tokenId
      await expect(
        tokenHolderERC20
          .connect(otherHolder)
          .transferHeldERC20FromToken(
            erc20.address,
            tokenHolderId,
            otherHolder.address,
            mockValue,
            '0x00',
          ),
      ).to.be.revertedWithCustomError(tokenHolderERC20, 'OnlyNFTOwnerCanTransferTokensFromIt');
    });

    it('can manage multiple ERC20s', async function () {
      await erc20B.mint(holder.address, mockValue);
      await erc20.approve(tokenHolderERC20.address, mockValue);
      await erc20B.approve(tokenHolderERC20.address, mockValue);

      await tokenHolderERC20.transferERC20ToToken(
        erc20.address,
        tokenHolderId,
        ethers.utils.parseEther('3'),
        '0x00',
      );
      await tokenHolderERC20.transferERC20ToToken(
        erc20B.address,
        tokenHolderId,
        ethers.utils.parseEther('5'),
        '0x00',
      );

      expect(await tokenHolderERC20.balanceOfERC20(erc20.address, tokenHolderId)).to.equal(
        ethers.utils.parseEther('3'),
      );
      expect(await tokenHolderERC20.balanceOfERC20(erc20B.address, tokenHolderId)).to.equal(
        ethers.utils.parseEther('5'),
      );
    });

    it('can manage multiple ERC721s', async function () {
      await erc721B.mint(holder.address, tokenId);
      await erc721.approve(tokenHolderERC721.address, tokenId);
      await erc721B.approve(tokenHolderERC721.address, tokenId);

      await tokenHolderERC721.transferERC721ToToken(erc721.address, tokenHolderId, tokenId, '0x00');
      await tokenHolderERC721.transferERC721ToToken(
        erc721B.address,
        tokenHolderId,
        tokenId,
        '0x00',
      );

      expect(
        await tokenHolderERC721.balanceOfERC721(erc721.address, tokenHolderId, tokenId),
      ).to.equal(1);
      expect(
        await tokenHolderERC721.balanceOfERC721(erc721B.address, tokenHolderId, tokenId),
      ).to.equal(1);
    });

    it('can manage multiple ERC1155s', async function () {
      await erc1155B.mint(holder.address, tokenId, mockValue, '0x00');
      await erc1155.setApprovalForAll(tokenHolderERC1155.address, true);
      await erc1155B.setApprovalForAll(tokenHolderERC1155.address, true);

      await tokenHolderERC1155.transferERC1155ToToken(
        erc1155.address,
        tokenHolderId,
        tokenId,
        ethers.utils.parseEther('3'),
        '0x00',
      );
      await tokenHolderERC1155.transferERC1155ToToken(
        erc1155B.address,
        tokenHolderId,
        tokenId,
        ethers.utils.parseEther('5'),
        '0x00',
      );

      expect(
        await tokenHolderERC1155.balanceOfERC1155(erc1155.address, tokenHolderId, tokenId),
      ).to.equal(ethers.utils.parseEther('3'));
      expect(
        await tokenHolderERC1155.balanceOfERC1155(erc1155B.address, tokenHolderId, tokenId),
      ).to.equal(ethers.utils.parseEther('5'));
    });
  });
});

describe('UniversalTokenHolder', async function () {
  let tokenHolderUniversal: RMRKUniversalHolderMock;
  let erc20: ERC20Mock;
  let erc20B: ERC20Mock;
  let erc721: ERC721Mock;
  let erc721B: ERC721Mock;
  let erc1155: ERC1155Mock;
  let erc1155B: ERC1155Mock;
  let holder: SignerWithAddress;
  let otherHolder: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const tokenHolderId = bn(1);
  const otherTokenHolderId = bn(2);
  const tokenId = bn(1);
  const mockValue = ethers.utils.parseEther('10');

  beforeEach(async function () {
    [holder, otherHolder, ...addrs] = await ethers.getSigners();
    ({ tokenHolderUniversal, erc20, erc20B, erc721, erc721B, erc1155, erc1155B } =
      await loadFixture(tokenHolderFixture));
  });

  it('can support IERC165', async function () {
    expect(await tokenHolderUniversal.supportsInterface(IERC165)).to.equal(true);
  });

  it('can support TokenHolder', async function () {
    expect(await tokenHolderUniversal.supportsInterface(IRMRKERC20Holder)).to.equal(true);
    expect(await tokenHolderUniversal.supportsInterface(IRMRKERC721Holder)).to.equal(true);
    expect(await tokenHolderUniversal.supportsInterface(IRMRKERC1155Holder)).to.equal(true);
  });

  it('does not support other interfaces', async function () {
    expect(await tokenHolderUniversal.supportsInterface(IOtherInterface)).to.equal(false);
  });

  describe('With minted tokens', async function () {
    beforeEach(async function () {
      await tokenHolderUniversal.mint(holder.address, tokenHolderId);
      await tokenHolderUniversal.mint(otherHolder.address, otherTokenHolderId);
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
      await erc20.approve(tokenHolderUniversal.address, mockValue);
      await expect(
        tokenHolderUniversal.transferERC20ToToken(erc20.address, tokenHolderId, mockValue, '0x00'),
      )
        .to.emit(tokenHolderUniversal, 'ReceivedERC20')
        .withArgs(erc20.address, tokenHolderId, holder.address, mockValue);
      expect(await erc20.balanceOf(tokenHolderUniversal.address)).to.equal(mockValue);
    });

    it('can receive ERC-721 tokens', async function () {
      await erc721.approve(tokenHolderUniversal.address, tokenId);
      await expect(
        tokenHolderUniversal.transferERC721ToToken(erc721.address, tokenHolderId, tokenId, '0x00'),
      )
        .to.emit(tokenHolderUniversal, 'ReceivedERC721')
        .withArgs(erc721.address, tokenHolderId, tokenId, holder.address);
      expect(await erc721.balanceOf(tokenHolderUniversal.address)).to.equal(1);
    });

    it('can receive ERC-1155 tokens', async function () {
      await erc1155.setApprovalForAll(tokenHolderUniversal.address, true);
      await expect(
        tokenHolderUniversal.transferERC1155ToToken(
          erc1155.address,
          tokenHolderId,
          tokenId,
          mockValue,
          '0x00',
        ),
      )
        .to.emit(tokenHolderUniversal, 'ReceivedERC1155')
        .withArgs(erc1155.address, tokenHolderId, tokenId, holder.address, mockValue);
      expect(await erc1155.balanceOf(tokenHolderUniversal.address, tokenId)).to.equal(mockValue);
    });

    it('can transfer ERC-20 tokens', async function () {
      await erc20.approve(tokenHolderUniversal.address, mockValue);
      await tokenHolderUniversal.transferERC20ToToken(
        erc20.address,
        tokenHolderId,
        mockValue,
        '0x00',
      );
      await expect(
        tokenHolderUniversal.transferHeldERC20FromToken(
          erc20.address,
          tokenHolderId,
          holder.address,
          mockValue.div(2),
          '0x00',
        ),
      )
        .to.emit(tokenHolderUniversal, 'TransferredERC20')
        .withArgs(erc20.address, tokenHolderId, holder.address, mockValue.div(2));
      expect(await erc20.balanceOf(tokenHolderUniversal.address)).to.equal(mockValue.div(2));
    });

    it('can transfer ERC-721 tokens', async function () {
      await erc721.approve(tokenHolderUniversal.address, tokenId);
      await tokenHolderUniversal.transferERC721ToToken(
        erc721.address,
        tokenHolderId,
        tokenId,
        '0x00',
      );
      expect(await erc721.balanceOf(tokenHolderUniversal.address)).to.equal(1);
      await expect(
        tokenHolderUniversal.transferHeldERC721FromToken(
          erc721.address,
          tokenHolderId,
          tokenId,
          holder.address,
          '0x00',
        ),
      )
        .to.emit(tokenHolderUniversal, 'TransferredERC721')
        .withArgs(erc721.address, tokenHolderId, tokenId, holder.address);
      expect(await erc721.balanceOf(tokenHolderUniversal.address)).to.equal(0);
    });

    it('can transfer ERC-1155 tokens', async function () {
      await erc1155.setApprovalForAll(tokenHolderUniversal.address, true);
      await tokenHolderUniversal.transferERC1155ToToken(
        erc1155.address,
        tokenHolderId,
        tokenId,
        mockValue,
        '0x00',
      );
      expect(await erc1155.balanceOf(tokenHolderUniversal.address, tokenId)).to.equal(mockValue);
      await expect(
        tokenHolderUniversal.transferHeldERC1155FromToken(
          erc1155.address,
          tokenHolderId,
          tokenId,
          holder.address,
          mockValue.div(2),
          '0x00',
        ),
      )
        .to.emit(tokenHolderUniversal, 'TransferredERC1155')
        .withArgs(erc1155.address, tokenHolderId, tokenId, holder.address, mockValue.div(2));
      expect(await erc1155.balanceOf(tokenHolderUniversal.address, tokenId)).to.equal(
        mockValue.div(2),
      );
    });

    it('cannot transfer 0 value', async function () {
      await erc1155.setApprovalForAll(tokenHolderUniversal.address, true);

      await expect(
        tokenHolderUniversal.transferERC20ToToken(erc20.address, tokenId, 0, '0x00'),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InvalidValue');
      await expect(
        tokenHolderUniversal.transferERC1155ToToken(erc1155.address, tokenId, 2, 0, '0x00'),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InvalidValue');

      await expect(
        tokenHolderUniversal.transferHeldERC20FromToken(
          erc20.address,
          tokenId,
          holder.address,
          0,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InvalidValue');
      await expect(
        tokenHolderUniversal.transferHeldERC1155FromToken(
          erc1155.address,
          tokenId,
          2,
          holder.address,
          0,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InvalidValue');
    });

    it('cannot transfer to address 0', async function () {
      await expect(
        tokenHolderUniversal.transferHeldERC20FromToken(
          erc20.address,
          tokenId,
          ethers.constants.AddressZero,
          1,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InvalidAddress');
      await expect(
        tokenHolderUniversal.transferHeldERC721FromToken(
          erc721.address,
          tokenId,
          1,
          ethers.constants.AddressZero,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InvalidAddress');
      await expect(
        tokenHolderUniversal.transferHeldERC1155FromToken(
          erc1155.address,
          tokenId,
          2,
          ethers.constants.AddressZero,
          1,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InvalidAddress');
    });

    it('cannot transfer a token at address 0', async function () {
      await expect(
        tokenHolderUniversal.transferHeldERC20FromToken(
          ethers.constants.AddressZero,
          tokenId,
          holder.address,
          1,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InvalidAddress');
      await expect(
        tokenHolderUniversal.transferHeldERC721FromToken(
          ethers.constants.AddressZero,
          tokenId,
          1,
          holder.address,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InvalidAddress');
      await expect(
        tokenHolderUniversal.transferHeldERC1155FromToken(
          ethers.constants.AddressZero,
          tokenId,
          2,
          holder.address,
          1,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InvalidAddress');

      await expect(
        tokenHolderUniversal.transferERC20ToToken(ethers.constants.AddressZero, tokenId, 1, '0x00'),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InvalidAddress');
      await expect(
        tokenHolderUniversal.transferERC721ToToken(
          ethers.constants.AddressZero,
          tokenId,
          1,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InvalidAddress');
      await expect(
        tokenHolderUniversal.transferERC1155ToToken(
          ethers.constants.AddressZero,
          tokenId,
          2,
          1,
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InvalidAddress');
    });

    it('cannot transfer more balance than the token has', async function () {
      await erc20.approve(tokenHolderUniversal.address, mockValue);
      await erc1155.setApprovalForAll(tokenHolderUniversal.address, true);

      await tokenHolderUniversal.transferERC20ToToken(
        erc20.address,
        tokenId,
        mockValue.div(2),
        '0x00',
      );
      await tokenHolderUniversal.transferERC20ToToken(
        erc20.address,
        otherTokenHolderId,
        mockValue.div(2),
        '0x00',
      );
      await tokenHolderUniversal.transferERC1155ToToken(
        erc1155.address,
        2,
        tokenId,
        mockValue.div(2),
        '0x00',
      );
      await tokenHolderUniversal.transferERC1155ToToken(
        erc1155.address,
        2,
        otherTokenHolderId,
        mockValue.div(2),
        '0x00',
      );
      await expect(
        tokenHolderUniversal.transferHeldERC20FromToken(
          erc20.address,
          tokenId,
          holder.address,
          mockValue, // The token only owns half of this value
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InsufficientBalance');
      await expect(
        tokenHolderUniversal.transferHeldERC1155FromToken(
          erc1155.address,
          tokenHolderId,
          tokenId,
          holder.address,
          mockValue, // The token only owns half of this value
          '0x00',
        ),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'InsufficientBalance');
    });

    it('cannot transfer balance from not owned token', async function () {
      await erc20.approve(tokenHolderUniversal.address, mockValue);
      await tokenHolderUniversal.transferERC20ToToken(
        erc20.address,
        tokenHolderId,
        mockValue,
        '0x00',
      );
      // Other holder is not the owner of tokenId
      await expect(
        tokenHolderUniversal
          .connect(otherHolder)
          .transferHeldERC20FromToken(
            erc20.address,
            tokenHolderId,
            otherHolder.address,
            mockValue,
            '0x00',
          ),
      ).to.be.revertedWithCustomError(tokenHolderUniversal, 'OnlyNFTOwnerCanTransferTokensFromIt');
    });

    it('can manage multiple ERC20s', async function () {
      await erc20B.mint(holder.address, mockValue);
      await erc20.approve(tokenHolderUniversal.address, mockValue);
      await erc20B.approve(tokenHolderUniversal.address, mockValue);

      await tokenHolderUniversal.transferERC20ToToken(
        erc20.address,
        tokenHolderId,
        ethers.utils.parseEther('3'),
        '0x00',
      );
      await tokenHolderUniversal.transferERC20ToToken(
        erc20B.address,
        tokenHolderId,
        ethers.utils.parseEther('5'),
        '0x00',
      );

      expect(await tokenHolderUniversal.balanceOfERC20(erc20.address, tokenHolderId)).to.equal(
        ethers.utils.parseEther('3'),
      );
      expect(await tokenHolderUniversal.balanceOfERC20(erc20B.address, tokenHolderId)).to.equal(
        ethers.utils.parseEther('5'),
      );
    });

    it('can manage multiple ERC721s', async function () {
      await erc721B.mint(holder.address, tokenId);
      await erc721.approve(tokenHolderUniversal.address, tokenId);
      await erc721B.approve(tokenHolderUniversal.address, tokenId);

      await tokenHolderUniversal.transferERC721ToToken(
        erc721.address,
        tokenHolderId,
        tokenId,
        '0x00',
      );
      await tokenHolderUniversal.transferERC721ToToken(
        erc721B.address,
        tokenHolderId,
        tokenId,
        '0x00',
      );

      expect(
        await tokenHolderUniversal.balanceOfERC721(erc721.address, tokenHolderId, tokenId),
      ).to.equal(1);
      expect(
        await tokenHolderUniversal.balanceOfERC721(erc721B.address, tokenHolderId, tokenId),
      ).to.equal(1);
    });

    it('can manage multiple ERC1155s', async function () {
      await erc1155B.mint(holder.address, tokenId, mockValue, '0x00');
      await erc1155.setApprovalForAll(tokenHolderUniversal.address, true);
      await erc1155B.setApprovalForAll(tokenHolderUniversal.address, true);

      await tokenHolderUniversal.transferERC1155ToToken(
        erc1155.address,
        tokenHolderId,
        tokenId,
        ethers.utils.parseEther('3'),
        '0x00',
      );
      await tokenHolderUniversal.transferERC1155ToToken(
        erc1155B.address,
        tokenHolderId,
        tokenId,
        ethers.utils.parseEther('5'),
        '0x00',
      );

      expect(
        await tokenHolderUniversal.balanceOfERC1155(erc1155.address, tokenHolderId, tokenId),
      ).to.equal(ethers.utils.parseEther('3'));
      expect(
        await tokenHolderUniversal.balanceOfERC1155(erc1155B.address, tokenHolderId, tokenId),
      ).to.equal(ethers.utils.parseEther('5'));
    });
  });
});
