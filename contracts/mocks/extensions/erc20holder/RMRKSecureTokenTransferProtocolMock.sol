// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;
import "../../../RMRK/extension/secureTokenTransferProtocol/RMRKSecureTokenTransferProtocol.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error OnlyNFTOwnerCanTransferTokensFromIt();
error OnlyNFTOwnerCanTransferTokensToIt();

/**
 * @title RMRKSecureTokenTransferProtocolMock
 * @author RMRK team
 * @notice Smart contract of the RMRK ERC20 Holder module.
 */
contract RMRKSecureTokenTransferProtocolMock is RMRKSecureTokenTransferProtocol, ERC721 {
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(RMRKSecureTokenTransferProtocol, ERC721) returns (bool) {
        return
            RMRKSecureTokenTransferProtocol.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc IRMRKSecureTokenTransferProtocol
     */
    function transferHeldTokenToToken(
        address tokenContract,
        TokenType tokenType,
        uint256 tokenId,
        uint256 heldTokenId,
        uint256 amount,
        bytes memory data
    ) external {
        _transferHeldTokenToToken(tokenContract, tokenType, tokenId, heldTokenId, amount, data);
    }

    /**
     * @inheritdoc IRMRKSecureTokenTransferProtocol
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
        if (msg.sender != ownerOf(tokenId)) {
            revert OnlyNFTOwnerCanTransferTokensFromIt();
        }
        _transferHeldTokenFromToken(tokenContract, tokenType, tokenId, heldTokenId, amount, to, data);
    }
}
