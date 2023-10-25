// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IERC721Holder is IERC165 {
    /**
     * @notice Used to notify listeners that the token received ERC-721 tokens.
     * @param erc721Contract The address of the ERC-721 smart contract
     * @param tokenHolderId The ID of the token receiving the ERC-721 tokens
     * @param tokenTransferredId The ID of the received token
     * @param from The address of the account from which the tokens are being transferred
     */
    event ReceivedERC721(
        address indexed erc721Contract,
        uint256 indexed tokenHolderId,
        uint256 tokenTransferredId,
        address indexed from
    );

    /**
     * @notice Used to notify the listeners that the ERC-721 tokens have been transferred.
     * @param erc721Contract The address of the ERC-721 smart contract
     * @param tokenHolderId The ID of the token from which the ERC-721 tokens have been transferred
     * @param tokenTransferredId The ID of the transferred token
     * @param to The address receiving the ERC-721 tokens
     */
    event TransferredERC721(
        address indexed erc721Contract,
        uint256 indexed tokenHolderId,
        uint256 tokenTransferredId,
        address indexed to
    );

    /**
     * @notice Used to retrieve the given token's specific ERC-721 balance
     * @param erc721Contract The address of the ERC-721 smart contract
     * @param tokenHolderId The ID of the token being checked for ERC-721 balance
     * @param tokenHeldId The ID of the held token
     */
    function balanceOfERC721(
        address erc721Contract,
        uint256 tokenHolderId,
        uint256 tokenHeldId
    ) external view returns (uint256);

    /**
     * @notice Transfer ERC-721 tokens from a specific token.
     * @dev The balance MUST be transferred from this smart contract.
     * @dev Implementers should validate that the `msg.sender` is either the token owner or approved to manage it before calling this.
     * @param erc721Contract The address of the ERC-721 smart contract
     * @param tokenHolderId The ID of the token to transfer the ERC-721 tokens from
     * @param tokenToTransferId The ID of the held token being sent
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function transferHeldERC721FromToken(
        address erc721Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        address to,
        bytes memory data
    ) external;

    /**
     * @notice Transfer ERC-721 tokens to a specific token.
     * @dev The ERC-721 smart contract must have approval for this contract to transfer the ERC-721 tokens.
     * @dev The balance MUST be transferred from the `msg.sender`.
     * @param erc721Contract The address of the ERC-721 smart contract
     * @param tokenHolderId The ID of the token to transfer ERC-721 tokens to
     * @param tokenToTransferId The ID of the held token being received
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function transferERC721ToToken(
        address erc721Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        bytes memory data
    ) external;

    /**
     * @notice Nonce increased every time an ERC721 token is transferred out of a token
     * @param tokenId The ID of the token to check the nonce for
     * @return The nonce of the token
     */
    function erc721TransferOutNonce(
        uint256 tokenId
    ) external view returns (uint256);
}
