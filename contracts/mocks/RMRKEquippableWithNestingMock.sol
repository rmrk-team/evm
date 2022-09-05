// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/equippable/RMRKExternalEquip.sol";

/* import "hardhat/console.sol"; */

//Minimal public implementation of RMRKEquippableWithNesting for testing.
contract RMRKEquippableWithNestingMock is RMRKExternalEquip {
    constructor(address nestingAddress)
        RMRKExternalEquip(nestingAddress)
    {}

    function setNestingAddress(address nestingAddress) external {
        _setNestingAddress(nestingAddress);
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external {
        // This reverts if token does not exist:
        ownerOf(tokenId);
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(
        ExtendedResource calldata resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds
    ) external {
        _addResourceEntry(resource, fixedPartIds, slotPartIds);
    }

    function setValidParentRefId(
        uint64 refId,
        address parentAddress,
        uint64 partId
    ) external {
        _setValidParentRefId(refId, parentAddress, partId);
    }
}
