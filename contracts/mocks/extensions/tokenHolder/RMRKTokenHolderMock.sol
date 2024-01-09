// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {RMRKTokenHolder} from "../../../RMRK/extension/tokenHolder/RMRKTokenHolder.sol";
import {IERC7590} from "../../../RMRK/extension/tokenHolder/IERC7590.sol";

error OnlyNFTOwnerCanTransferTokensFromIt();

/**
 * @title RMRKTokenHolderMock
 * @author RMRK team
 * @notice Smart contract of the RMRK ERC20 Holder module.
 */
contract RMRKTokenHolderMock is RMRKTokenHolder, ERC721 {
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(RMRKTokenHolder, ERC721) returns (bool) {
        return
            RMRKTokenHolder.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc IERC7590
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
