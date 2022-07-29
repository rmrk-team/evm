// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "./IRMRKMultiResource.sol";

interface IRMRKEquippable is IRMRKMultiResource {

    function getNestingAddress() external view returns(address);

    function markEquipped(uint tokenId, uint64 resourceId, bool equipped) external;

    function isEquipped(uint tokenId) external view returns(bool);

    function getCallerEquippableSlot(uint64 resourceId) external view returns (uint64 equippableSlot);
}
