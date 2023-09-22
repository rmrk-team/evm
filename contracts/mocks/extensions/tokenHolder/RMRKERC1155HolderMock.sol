// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;
import "../../../RMRK/extension/tokenHolder/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error OnlyNFTOwnerCanTransferTokensFromIt();

/**
 * @title RMRKERC1155HolderMock
 * @author RMRK team
 * @notice Smart contract of the RMRK ERC1155 Holder module.
 */
contract RMRKERC1155HolderMock is ERC1155Holder, ERC721 {
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC1155Holder, ERC721) returns (bool) {
        return
            ERC1155Holder.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
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
