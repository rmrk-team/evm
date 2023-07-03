// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRMRKSecureTokenTransferProtocol is IERC165 {
    enum TokenType{
        ERC20,
        ERC721,
        ERC1155
    }

    /**
     * @notice Used to notify listeners that the token received held tokens.
     * @dev If the token type is `ERC-20`, the `heldTokenId` MUST equal `0`
     * @dev If the token type is `ERC-721`, the `amount` MUST equal `1`.
     * @param tokenContract The address of the held token's smart contract
     * @param tokenType The type of the held token being received
     * @param toTokenId The ID of the token receiving the held tokens
     * @param heldTokenId The ID of the held token being received
     * @param from The address of the account from which the tokens are being transferred
     * @param amount The amount of held tokens received
     */
    event ReceivedToken(
        address indexed tokenContract,
        TokenType tokenType,
        uint256 indexed toTokenId,
        uint256 heldTokenId,
        address indexed from,
        uint256 amount
    );

    /**
     * @notice Used to notify the listeners that the ERC-20 tokens have been transferred.
     * @dev If the token type is `ERC-20`, the `heldTokenId` MUST equal `0`
     * @dev If the token type is `ERC-721`, the `amount` MUST equal `1`.
     * @param tokenContract The address of the smart contract of the token being transferred
     * @param tokenType The type of the token being transferred
     * @param fromTokenId The ID of the token from which the held tokens have been transferred
     * @param heldTokenId The Id of the held token being transferred
     * @param to The address receiving the ERC-20 tokens
     * @param amount The amount of held tokens transferred
     */
    event TransferredToken(
        address indexed tokenContract,
        TokenType tokenType,
        uint256 indexed fromTokenId,
        uint256 heldTokenId,
        address indexed to,
        uint256 amount
    );

    /**
     * @notice Used to retrieve the given token's balance of given token
     * @dev When retrieving the balance of an ERC-20 token, the `heldTokenId` parameter MUST be ignored.
     * @param erc20Contract The address of the held token's smart contract
     * @param tokenType The type of the token being checked for balance
     * @param tokenId The ID of the token being checked for balance
     * @param heldTokenId The ID of the held token of which the balance is being retrieved
     * @return The amount of the specified ERC-20 tokens owned by a given token
     */
    function balanceOfToken(
        address erc20Contract,
        TokenType tokenType,
        uint256 tokenId,
        uint256 heldTokenId
    ) external view returns (uint256);

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
    function transferHeldTokenFromToken(
        address tokenContract,
        TokenType tokenType,
        uint256 tokenId,
        uint256 heldTokenId,
        uint256 amount,
        address to,
        bytes memory data
    ) external;

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
    function transferHeldTokenToToken(
        address tokenContract,
        TokenType tokenType,
        uint256 tokenId,
        uint256 heldTokenId,
        uint256 amount,
        bytes memory data
    ) external;
}
