// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "./IRMRKTokenHolder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

error InvalidValue();
error InvalidAddress();
error InsufficientBalance();

/**
 * @title RMRKTokenHolder
 * @author RMRK team
 * @notice Smart contract of a token holder RMRK extension.
 * @dev The RMRKTokenHolder extension is capable of holding ERC-20, ERC-721, and ERC-1155 tokens.
 */
abstract contract RMRKTokenHolder is IRMRKTokenHolder {
    mapping(uint256 tokenId => mapping(address tokenAddress => mapping(TokenType tokenType => mapping(uint256 heldTokenId => uint256 balance))))
        private _balances;

    /**
     * @inheritdoc IRMRKTokenHolder
     */
    function balanceOfToken(
        address tokenContract,
        TokenType tokenType,
        uint256 tokenId,
        uint256 heldTokenId
    ) external view returns (uint256) {
        if (tokenType == TokenType.ERC20) {
            return _balances[tokenId][tokenContract][tokenType][0];
        } else {
            return _balances[tokenId][tokenContract][tokenType][heldTokenId];
        }
    }

    /**
     * @notice Transfer held tokens from a specific token.
     * @dev The balance MUST be transferred from this smart contract.
     * @dev Implementers should validate that the `msg.sender` is either the token owner or approved to manage it before
     *  calling this.
     * @dev If the token type is `ERC-20`, the `heldTokenId` MUST be ignored.
     * @dev IF the token type is `ERC-721`, the `amount` MUST be ignored.
     * @param tokenContract The address of the held token's smart contract
     * @param tokenType The type of the token being transferred
     * @param tokenId The ID of the token to transfer the held token from
     * @param heldTokenId The ID of the held token to transfer
     * @param amount The number of held tokens to transfer
     * @param to The address to transfer the held tokens to
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _transferHeldTokenFromToken(
        address tokenContract,
        TokenType tokenType,
        uint256 tokenId,
        uint256 heldTokenId,
        uint256 amount,
        address to,
        bytes memory data
    ) internal {
        if (tokenType == TokenType.ERC20) {
            heldTokenId = 0;
        } else if (tokenType == TokenType.ERC721) {
            amount = 1;
        }

        if (amount == 0) {
            revert InvalidValue();
        }
        if (to == address(0) || tokenContract == address(0)) {
            revert InvalidAddress();
        }
        if (
            _balances[tokenId][tokenContract][tokenType][heldTokenId] < amount
        ) {
            revert InsufficientBalance();
        }

        _beforeTransferHeldTokenFromToken(
            tokenContract,
            tokenType,
            tokenId,
            heldTokenId,
            to,
            amount,
            data
        );

        _balances[tokenId][tokenContract][tokenType][heldTokenId] -= amount;

        if (tokenType == TokenType.ERC20) {
            IERC20(tokenContract).transfer(to, amount);
        } else if (tokenType == TokenType.ERC721) {
            IERC721(tokenContract).safeTransferFrom(
                address(this),
                to,
                heldTokenId,
                data
            );
        } else {
            IERC1155(tokenContract).safeTransferFrom(
                address(this),
                to,
                heldTokenId,
                amount,
                data
            );
        }

        emit TransferredToken(
            tokenContract,
            tokenType,
            tokenId,
            heldTokenId,
            to,
            amount
        );

        _afterTransferHeldTokenFromToken(
            tokenContract,
            tokenType,
            tokenId,
            heldTokenId,
            to,
            amount,
            data
        );
    }

    /**
     * @notice Transfer tokens to a specific holder token.
     * @dev The token smart contract must have approval for this contract to transfer the tokens.
     * @dev The balance MUST be transferred from the `msg.sender`.
     * @dev If the token type is `ERC-20`, the `heldTokenId` MUST be ignored.
     * @dev If the token type is `ERC-721`, the `amount` MUST be ignored.
     * @param tokenContract The address of the token smart contract
     * @param tokenType The type of the token being transferred
     * @param tokenId The ID of the token to transfer the tokens to
     * @param heldTokenId The ID of the held token to transfer
     * @param amount The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _transferHeldTokenToToken(
        address tokenContract,
        TokenType tokenType,
        uint256 tokenId,
        uint256 heldTokenId,
        uint256 amount,
        bytes memory data
    ) internal {
        if (tokenType == TokenType.ERC20) {
            heldTokenId = 0;
        } else if (tokenType == TokenType.ERC721) {
            amount = 1;
        }

        if (amount == 0) {
            revert InvalidValue();
        }
        if (tokenContract == address(0)) {
            revert InvalidAddress();
        }

        _beforeTransferHeldTokenToToken(
            tokenContract,
            tokenType,
            tokenId,
            heldTokenId,
            msg.sender,
            amount,
            data
        );

        _balances[tokenId][tokenContract][tokenType][heldTokenId] += amount;

        if (tokenType == TokenType.ERC20) {
            IERC20(tokenContract).transferFrom(
                msg.sender,
                address(this),
                amount
            );
        } else if (tokenType == TokenType.ERC721) {
            IERC721(tokenContract).safeTransferFrom(
                msg.sender,
                address(this),
                heldTokenId,
                data
            );
        } else {
            IERC1155(tokenContract).safeTransferFrom(
                msg.sender,
                address(this),
                heldTokenId,
                amount,
                data
            );
        }

        emit ReceivedToken(
            tokenContract,
            tokenType,
            tokenId,
            heldTokenId,
            msg.sender,
            amount
        );

        _afterTransferHeldTokenToToken(
            tokenContract,
            tokenType,
            tokenId,
            heldTokenId,
            msg.sender,
            amount,
            data
        );
    }

    /**
     * @notice Hook that is called before any transfer of held tokens from a given token.
     * @dev If the token type is `ERC-20`, the `heldTokenId` MUST equal `0`
     * @dev If the token type is `ERC-721`, the `amount` MUST equal `1`.
     * @param tokenContract The address of the held token smart contract
     * @param tokenType The type of the held token being transferred
     * @param tokenId The ID of the token to transfer from
     * @param heldTokenId The ID of the held token to transfer
     * @param to The address to send the held tokens to
     * @param amount The amount of held tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _beforeTransferHeldTokenFromToken(
        address tokenContract,
        TokenType tokenType,
        uint256 tokenId,
        uint256 heldTokenId,
        address to,
        uint256 amount,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called after any transfer of held tokens from a token.
     * @dev If the token type is `ERC-20`, the `heldTokenId` MUST equal `0`
     * @dev If the token type is `ERC-721`, the `amount` MUST equal `1`.
     * @param tokenContract The address of the held token smart contract
     * @param tokenType The type of the held token being transferred
     * @param tokenId The ID of the token to transfer from
     * @param heldTokenId The ID of the held token to transfer
     * @param to The address to send the held tokens to
     * @param amount The amount of held tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _afterTransferHeldTokenFromToken(
        address tokenContract,
        TokenType tokenType,
        uint256 tokenId,
        uint256 heldTokenId,
        address to,
        uint256 amount,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called before any transfer of held tokens to a token.
     * @dev If the token type is `ERC-20`, the `heldTokenId` MUST equal `0`
     * @dev If the token type is `ERC-721`, the `amount` MUST equal `1`.
     * @param tokenContract The address of the held token's smart contract
     * @param tokenType The type of the token being transferred
     * @param tokenId The ID of the token to transfer the held tokens to
     * @param heldTokenId The ID of the held token to transfer
     * @param from The address to send the held tokens from
     * @param amount The number of held tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _beforeTransferHeldTokenToToken(
        address tokenContract,
        TokenType tokenType,
        uint256 tokenId,
        uint256 heldTokenId,
        address from,
        uint256 amount,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called after any transfer of held tokens to a token.
     * @dev If the token type is `ERC-20`, the `heldTokenId` MUST equal `0`
     * @dev If the token type is `ERC-721`, the `amount` MUST equal `1`.
     * @param tokenContract The address of the held token's smart contract contract
     * @param tokenType The type of the token being transferred
     * @param tokenId The ID of the token to transfer from
     * @param heldTokenId The ID of the held token to transfer
     * @param from The address to send the held tokens from
     * @param amount The amount of held tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _afterTransferHeldTokenToToken(
        address tokenContract,
        TokenType tokenType,
        uint256 tokenId,
        uint256 heldTokenId,
        address from,
        uint256 amount,
        bytes memory data
    ) internal virtual {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return type(IRMRKTokenHolder).interfaceId == interfaceId;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public pure virtual returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public pure virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }
}
