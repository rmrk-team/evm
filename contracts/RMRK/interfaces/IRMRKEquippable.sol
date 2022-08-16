// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "./IRMRKMultiResource.sol";

interface IRMRKEquippable is IRMRKMultiResource {

    function getNestingAddress() external view returns(address);

    function isChildEquipped(
        uint tokenId,
        address childAddress,
        uint childTokenId
    ) external view returns(bool);

    function canTokenBeEquippedWithResourceIntoSlot(
        address parent,
        uint tokenId,
        uint64 resourceId,
        uint64 slotId
    ) external view returns (bool);
}
