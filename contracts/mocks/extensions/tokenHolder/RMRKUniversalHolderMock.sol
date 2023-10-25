// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;
import "../../../RMRK/extension/tokenHolder/ERC20Holder.sol";
import "../../../RMRK/extension/tokenHolder/ERC721Holder.sol";
import "../../../RMRK/extension/tokenHolder/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error OnlyNFTOwnerCanTransferTokensFromIt();

/**
 * @title RMRKUniversalHolderMock
 * @author RMRK team
 * @notice Smart contract of the RMRK ERC1155 Holder module.
 */
contract RMRKUniversalHolderMock is
    ERC20Holder,
    ERC721Holder,
    ERC1155Holder,
    ERC721
{
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC20Holder, ERC721Holder, ERC1155Holder, ERC721)
        returns (bool)
    {
        return
            ERC20Holder.supportsInterface(interfaceId) ||
            ERC721Holder.supportsInterface(interfaceId) ||
            ERC1155Holder.supportsInterface(interfaceId) ||
            ERC721.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc IERC20Holder
     */
    function transferHeldERC20FromToken(
        address erc20Contract,
        uint256 tokenHolderId,
        address to,
        uint256 amount,
        bytes memory data
    ) external {
        if (msg.sender != ownerOf(tokenHolderId)) {
            revert OnlyNFTOwnerCanTransferTokensFromIt();
        }
        _transferHeldERC20FromToken(
            erc20Contract,
            tokenHolderId,
            to,
            amount,
            data
        );
    }

    /**
     * @inheritdoc IERC721Holder
     */
    function transferHeldERC721FromToken(
        address erc721Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        address to,
        bytes memory data
    ) external {
        if (msg.sender != ownerOf(tokenHolderId)) {
            revert OnlyNFTOwnerCanTransferTokensFromIt();
        }
        _transferHeldERC721FromToken(
            erc721Contract,
            tokenHolderId,
            tokenToTransferId,
            to,
            data
        );
    }

    /**
     * @inheritdoc IERC1155Holder
     */
    function transferHeldERC1155FromToken(
        address erc1155Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        address to,
        uint256 amount,
        bytes memory data
    ) external {
        if (msg.sender != ownerOf(tokenHolderId)) {
            revert OnlyNFTOwnerCanTransferTokensFromIt();
        }
        _transferHeldERC1155FromToken(
            erc1155Contract,
            tokenHolderId,
            tokenToTransferId,
            to,
            amount,
            data
        );
    }
}
