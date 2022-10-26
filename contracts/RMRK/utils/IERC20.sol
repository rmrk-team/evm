//SPDX-License-Identifier: Apache 2.0

pragma solidity ^0.8.15;

interface IERC20 {
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);
}
