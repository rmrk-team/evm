// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IERC20Holder is IERC165 {
    /**
     * @notice This emits when a token receives ERC-20 tokens.
     * @param erc20Contract The ERC-20 contract
     * @param from The prior owner of the token
     * @param toTokenId The token that receives the ERC-20 tokens
     * @param value The number of ERC-20 tokens received
     */
    event ReceivedERC20(
        address indexed erc20Contract,
        uint256 indexed toTokenId,
        address indexed from,
        uint256 value
    );

    /**
     * @notice This emits when a token transfers ERC-20 tokens.
     * @param erc20Contract The ERC-20 contract
     * @param fromTokenId The token that owned the ERC-20 tokens
     * @param to The address that sends the ERC-20 tokens
     * @param value The number of ERC-20 tokens transferred
     */
    event TransferredERC20(
        address indexed erc20Contract,
        uint256 indexed fromTokenId,
        address indexed to,
        uint256 value
    );

    /**
     * @notice Look up the balance of ERC-20 tokens for a specific token and ERC-20 contract
     * @param erc20Contract The ERC-20 contract
     * @param tokenId The token that owns the ERC-20 tokens
     * @return The number of ERC-20 tokens owned by a token from an ERC-20 contract
     */
    function balanceOfERC20(
        address erc20Contract,
        uint256 tokenId
    ) external view returns (uint256);

    /**
     * @notice Transfer ERC-20 tokens to address
     * @param erc20Contract The ERC-20 contract
     * @param tokenId The token to transfer from
     * @param to The address to send the ERC-20 tokens to
     * @param value The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function transferERC20FromToken(
        address erc20Contract,
        uint256 tokenId,
        address to,
        uint256 value,
        bytes memory data
    ) external;

    /**
     * @notice Transfer ERC-20 tokens to a specific token
     * @dev The ERC-20 contract must have approved this contract to transfer the ERC-20 tokens
     * @dev The balance MUST be transferred from the message sender
     * @param erc20Contract The ERC-20 contract
     * @param tokenId The token to transfer to
     * @param value The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function transferERC20ToToken(
        address erc20Contract,
        uint256 tokenId,
        uint256 value,
        bytes memory data
    ) external;
}
