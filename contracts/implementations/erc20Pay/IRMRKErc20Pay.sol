// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

/**
 * @title IRMRKErc20Pay
 * @author RMRK team
 * @notice Interface implementation of RMRK ERC20 pay module.
 */
interface IRMRKErc20Pay {
    /**
     * @notice Used to retrieve the address of the ERC20 token this smart contract supports.
     * @return Address of the ERC20 token's smart contract
     */
    function erc20TokenAddress() external view returns (address);
}
