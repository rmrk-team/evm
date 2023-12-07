// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {RMRKTokenHolder} from "../../../RMRK/extension/tokenHolder/RMRKTokenHolder.sol";
import {IRMRKTokenHolder} from "../../../RMRK/extension/tokenHolder/IRMRKTokenHolder.sol";

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
        _safeMint(to, tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(RMRKTokenHolder, ERC721) returns (bool) {
        return
            RMRKTokenHolder.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc IRMRKTokenHolder
     */
    function transferHeldTokenToToken(
        address tokenContract,
        TokenType tokenType,
        uint256 tokenId,
        uint256 heldTokenId,
        uint256 amount,
        bytes memory data
    ) external {
        _transferHeldTokenToToken(
            tokenContract,
            tokenType,
            tokenId,
            heldTokenId,
            amount,
            data
        );
    }

    /**
     * @inheritdoc IRMRKTokenHolder
     */
    function transferHeldTokenFromToken(
        address tokenContract,
        TokenType tokenType,
        uint256 tokenId,
        uint256 heldTokenId,
        uint256 amount,
        address to,
        bytes memory data
    ) external {
        if (_msgSender() != ownerOf(tokenId)) {
            revert OnlyNFTOwnerCanTransferTokensFromIt();
        }
        _transferHeldTokenFromToken(
            tokenContract,
            tokenType,
            tokenId,
            heldTokenId,
            amount,
            to,
            data
        );
    }
}
