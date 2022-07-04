// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "./IRMRKMultiResource.sol";

interface IRMRKEquippable is IRMRKMultiResource {

    struct Equipment {
        uint64 resourceId;
        uint64 childResourceId;
        uint childTokenId;
        address childAddress;
    }

    function markEquipped(uint tokenId, uint64 resourceId, bool equipped) external;

    function isEquipped(uint tokenId) external view returns(bool);

    function getCallerEquippableSlot(uint64 resourceId) external view returns (uint64 equippableSlot);
}
