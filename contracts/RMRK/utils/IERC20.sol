//SPDX-License-Identifier: Apache 2.0

pragma solidity ^0.8.15;

/**
 * @title IERC20
 * @notice Interface smart contract of the ERC20 smart contract implementation.
 */
interface IERC20 {
    /**
     * @notice Used to transfer tokens from one address to another.
     * @param from Address of the account from which the the tokens are being transferred
     * @param to Address of the account to which the tokens are being transferred
     * @param amount Amount of tokens that are being transferred
     * @return bool A boolean value signifying whether the transfer was succesfull (`true`) or not (`false`)
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    /**
     * @notice Used to grant permission to an account to spend the tokens of another
     * @param owner Address that owns the tokens
     * @param spender Address that is being granted the permission to spend the tokens of the `owner`
     * @return uint256 Amount of tokens that the `spender` can manage
     */
    function allowance(address owner, address spender)
        external
        view
        returns (uint256);
}
