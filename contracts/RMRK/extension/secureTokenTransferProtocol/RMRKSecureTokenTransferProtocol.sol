// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./IRMRKSecureTokenTransferProtocol.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

error InvalidValue();
error InvalidAddress();
error InsufficientBalance();

abstract contract RMRKSecureTokenTransferProtocol is
    IRMRKSecureTokenTransferProtocol
{
    mapping(uint256 tokenId => mapping(address tokenAddress => mapping(TokenType tokenType => mapping(uint256 heldTokenId => uint256 balance))))
        private _balances;

    /**
     * @inheritdoc IRMRKSecureTokenTransferProtocol
     */
    function balanceOfToken(
        address tokenContract,
        TokenType tokenType,
        uint256 tokenId,
        uint256 heldTokenId
    ) external view returns (uint256) {
        if (tokenType == TokenType.ERC20) {
            return _balances[tokenId][tokenContract][tokenType][heldTokenId];
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
        if (amount == 0 && tokenType != TokenType.ERC721) {
            revert InvalidValue();
        }
        if (to == address(0) || tokenContract == address(0)) {
            revert InvalidAddress();
        }
        if (_balances[tokenId][tokenContract][tokenType][tokenId] < amount) {
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

        if (tokenType == TokenType.ERC20) {
            IERC20(tokenContract).transfer(to, amount);
            _balances[tokenId][tokenContract][tokenType][0] -= amount;

            emit TransferredToken(
                tokenContract,
                tokenType,
                tokenId,
                0,
                to,
                amount
            );
        } else if (tokenType == TokenType.ERC721) {
            IERC721(tokenContract).safeTransferFrom(
                address(this),
                to,
                heldTokenId,
                data
            );
            _balances[tokenId][tokenContract][tokenType][heldTokenId] -= 1;

            emit TransferredToken(
                tokenContract,
                tokenType,
                tokenId,
                heldTokenId,
                to,
                1
            );
        } else {
            IERC1155(tokenContract).safeTransferFrom(
                address(this),
                to,
                heldTokenId,
                amount,
                data
            );
            _balances[tokenId][tokenContract][tokenType][heldTokenId] -= amount;

            emit TransferredToken(
                tokenContract,
                tokenType,
                tokenId,
                heldTokenId,
                to,
                amount
            );
        }

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
        if (amount == 0 && TokenType.ERC721 != tokenType) {
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

        if (tokenType == TokenType.ERC20) {
            IERC20(tokenContract).transferFrom(
                msg.sender,
                address(this),
                amount
            );
            _balances[tokenId][tokenContract][tokenType][0] += amount;

            emit ReceivedToken(
                tokenContract,
                tokenType,
                tokenId,
                0,
                msg.sender,
                amount
            );
        } else if (tokenType == TokenType.ERC721) {
            IERC721(tokenContract).safeTransferFrom(
                msg.sender,
                address(this),
                heldTokenId,
                data
            );
            _balances[tokenId][tokenContract][tokenType][heldTokenId] += 1;

            emit ReceivedToken(
                tokenContract,
                tokenType,
                tokenId,
                heldTokenId,
                msg.sender,
                1
            );
        } else {
            IERC1155(tokenContract).safeTransferFrom(
                msg.sender,
                address(this),
                heldTokenId,
                amount,
                data
            );
            _balances[tokenId][tokenContract][tokenType][heldTokenId] += amount;

            emit ReceivedToken(
                tokenContract,
                tokenType,
                tokenId,
                heldTokenId,
                msg.sender,
                amount
            );
        }

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
        return type(RMRKSecureTokenTransferProtocol).interfaceId == interfaceId;
    }
}
