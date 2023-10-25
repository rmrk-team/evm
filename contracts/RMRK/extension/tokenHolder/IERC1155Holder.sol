// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IERC1155Holder is IERC165 {
    /**
     * @notice Used to notify listeners that the token received ERC-1155 tokens.
     * @param erc1155Contract The address of the ERC-1155 smart contract
     * @param tokenHolderId The ID of the token receiving the ERC-1155 tokens
     * @param tokenTransferredId The ID of the received token
     * @param from The address of the account from which the tokens are being transferred
     * @param amount The number of ERC-1155 tokens received
     */
    event ReceivedERC1155(
        address indexed erc1155Contract,
        uint256 indexed tokenHolderId,
        uint256 tokenTransferredId,
        address indexed from,
        uint256 amount
    );

    /**
     * @notice Used to notify the listeners that the ERC-1155 tokens have been transferred.
     * @param erc1155Contract The address of the ERC-1155 smart contract
     * @param tokenHolderId The ID of the token from which the ERC-1155 tokens have been transferred
     * @param tokenTransferredId The ID of the transferred token
     * @param to The address receiving the ERC-1155 tokens
     * @param amount The number of ERC-1155 tokens transferred
     */
    event TransferredERC1155(
        address indexed erc1155Contract,
        uint256 indexed tokenHolderId,
        uint256 tokenTransferredId,
        address indexed to,
        uint256 amount
    );

    /**
     * @notice Used to retrieve the given token's specific ERC-1155 balance
     * @param erc1155Contract The address of the ERC-1155 smart contract
     * @param tokenHolderId The ID of the token being checked for ERC-1155 balance
     * @param tokenHeldId The ID of the held token
     * @return The amount of the specified ERC-1155 tokens owned by a given token
     */
    function balanceOfERC1155(
        address erc1155Contract,
        uint256 tokenHolderId,
        uint256 tokenHeldId
    ) external view returns (uint256);

    /**
     * @notice Transfer ERC-1155 tokens from a specific token.
     * @dev The balance MUST be transferred from this smart contract.
     * @dev Implementers should validate that the `msg.sender` is either the token owner or approved to manage it before calling this.
     * @param erc1155Contract The address of the ERC-1155 smart contract
     * @param tokenHolderId The ID of the token to transfer the ERC-1155 tokens from
     * @param tokenToTransferId The ID of the held token being sent
     * @param amount The number of ERC-1155 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function transferHeldERC1155FromToken(
        address erc1155Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        address to,
        uint256 amount,
        bytes memory data
    ) external;

    /**
     * @notice Transfer ERC-1155 tokens to a specific token.
     * @dev The ERC-1155 smart contract must have approval for this contract to transfer the ERC-1155 tokens.
     * @dev The balance MUST be transferred from the `msg.sender`.
     * @param erc1155Contract The address of the ERC-1155 smart contract
     * @param tokenHolderId The ID of the token to transfer ERC-1155 tokens to
     * @param tokenToTransferId The ID of the held token being received
     * @param amount The number of ERC-1155 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function transferERC1155ToToken(
        address erc1155Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        uint256 amount,
        bytes memory data
    ) external;

    /**
     * @notice Nonce increased every time an ERC1155 token is transferred out of a token
     * @param tokenId The ID of the token to check the nonce for
     * @return The nonce of the token
     */
    function erc1155TransferOutNonce(
        uint256 tokenId
    ) external view returns (uint256);
}
