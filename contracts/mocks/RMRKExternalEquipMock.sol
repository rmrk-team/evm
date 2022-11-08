// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/equippable/RMRKExternalEquip.sol";

/* import "hardhat/console.sol"; */

//Minimal public implementation of RMRKEquippableWithNesting for testing.
contract RMRKExternalEquipMock is RMRKExternalEquip {
    constructor(address nestingAddress) RMRKExternalEquip(nestingAddress) {}

    function setNestingAddress(address nestingAddress) external {
        _setNestingAddress(nestingAddress);
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external {
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(
        uint64 id,
        uint64 equippableGroupId,
        address baseAddress,
        string memory metadataURI,
        uint64[] memory fixedPartIds,
        uint64[] memory slotPartIds
    ) external {
        _addResourceEntry(
            id,
            equippableGroupId,
            baseAddress,
            metadataURI,
            fixedPartIds,
            slotPartIds
        );
    }

    function setValidParentForEquippableGroup(
        uint64 equippableGroupId,
        address parentAddress,
        uint64 partId
    ) external {
        _setValidParentForEquippableGroup(
            equippableGroupId,
            parentAddress,
            partId
        );
    }
}
