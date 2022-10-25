// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./IRMRKEquippable.sol";

interface IRMRKExternalEquip is IRMRKEquippable {
    /**
     * @dev emitted when the nesting address is set
     */
    event NestingAddressSet(address old, address new_);

    /**
     * @dev Returns the Equippable contract's corresponding nesting address.
     */
    function getNestingAddress() external view returns (address);
}
