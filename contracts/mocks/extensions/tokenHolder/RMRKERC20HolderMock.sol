// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;
import "../../../RMRK/extension/tokenHolder/ERC20Holder.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error OnlyNFTOwnerCanTransferTokensFromIt();

/**
 * @title RMRKERC20HolderMock
 * @author RMRK team
 * @notice Smart contract of the RMRK ERC20 Holder module.
 */
contract RMRKERC20HolderMock is ERC20Holder, ERC721 {
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC20Holder, ERC721) returns (bool) {
        return
            ERC20Holder.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
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
}
