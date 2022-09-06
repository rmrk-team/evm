// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "./IRMRKEquippable.sol";


interface IRMRKEquippableViews {

    function getEquipped(
        address equippableContract,
        uint64 tokenId,
        uint64 resourceId
    )
        external
        view
        returns (
            uint64[] memory slotParts,
            IRMRKEquippable.Equipment[] memory childrenEquipped
        );

    function composeEquippables(
        address equippableContract,
        uint256 tokenId,
        uint64 resourceId
    )
        external
        view
        returns (
            IRMRKEquippable.ExtendedResource memory resource,
            IRMRKEquippable.FixedPart[] memory fixedParts,
            IRMRKEquippable.SlotPart[] memory slotParts
        );
}
