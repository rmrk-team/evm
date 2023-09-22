// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;
import "../../../RMRK/extension/tokenHolder/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error OnlyNFTOwnerCanTransferTokensFromIt();

/**
 * @title RMRKERC721HolderMock
 * @author RMRK team
 * @notice Smart contract of the RMRK ERC721 Holder module.
 */
contract RMRKERC721HolderMock is ERC721Holder, ERC721 {
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721Holder, ERC721) returns (bool) {
        return
            ERC721Holder.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
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
}
