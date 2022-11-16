// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/equippable/RMRKExternalEquip.sol";

/* import "hardhat/console.sol"; */

//Minimal public implementation of RMRKEquippableWithNestable for testing.
contract RMRKExternalEquipMock is RMRKExternalEquip {
    constructor(address nestableAddress) RMRKExternalEquip(nestableAddress) {}

    function setNestableAddress(address nestableAddress) external {
        _setNestableAddress(nestableAddress);
    }

    function addAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 overwrites
    ) external {
        _addAssetToToken(tokenId, assetId, overwrites);
    }

    function addAssetEntry(
        uint64 id,
        uint64 equippableGroupId,
        address baseAddress,
        string memory metadataURI,
        uint64[] memory fixedPartIds,
        uint64[] memory slotPartIds
    ) external {
        _addAssetEntry(
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
