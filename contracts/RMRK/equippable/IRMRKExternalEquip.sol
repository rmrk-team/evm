// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "./IRMRKEquippable.sol";

/**
 * @title IRMRKExternalEquip
 * @author RMRK team
 * @notice Interface smart contract of the RMRK external equippable module.
 */
interface IRMRKExternalEquip is IRMRKEquippable {
    /**
     * @notice Used to notify listeners of a new `Nesting` smart contract address being set.
     * @dev When initially setting the `Nesting` smart contract address, the `old` value should equal `0x0` address.
     * @param old Previous `Nesting` smart contract address
     * @param new_ New `Nesting` smart contract address
     */
    event NestingAddressSet(address old, address new_);

    /**
     * @dev Returns the Equippable contract's corresponding nesting address.
     */
    function getNestingAddress() external view returns (address);
}
