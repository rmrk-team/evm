// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "./IRMRKMultiResource.sol";

interface IRMRKEquippable is IRMRKMultiResource {

    /**
    * @dev Returns the Equippable contract's corresponding nesting address.
    */
    function getNestingAddress() external view returns(address);

    /**
    * @dev Returns if the tokenId is considered to be equipped into another resource.
    */
    function isChildEquipped(
        uint tokenId,
        address childAddress,
        uint childTokenId
    ) external view returns(bool);

    /**
    * @dev Returns whether or not tokenId with resourceId can be equipped into parent contract at slot
    *
    */
    function canTokenBeEquippedWithResourceIntoSlot(
        address parent,
        uint tokenId,
        uint64 resourceId,
        uint64 slotId
    ) external view returns (bool);
}
