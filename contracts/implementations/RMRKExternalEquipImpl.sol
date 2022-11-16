// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/equippable/RMRKExternalEquip.sol";
import "../RMRK/access/OwnableLock.sol";

contract RMRKExternalEquipImpl is OwnableLock, RMRKExternalEquip {
    uint256 private _totalAssets;

    constructor(address nestingAddress) RMRKExternalEquip(nestingAddress) {}

    function addAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 overwrites
    ) public virtual onlyOwnerOrContributor {
        _addAssetToToken(tokenId, assetId, overwrites);
    }

    function addAssetEntry(
        uint64 equippableGroupId,
        address baseAddress,
        string memory metadataURI,
        uint64[] memory fixedPartIds,
        uint64[] memory slotPartIds
    ) public virtual onlyOwnerOrContributor returns (uint256) {
        unchecked {
            _totalAssets += 1;
        }
        _addAssetEntry(
            uint64(_totalAssets),
            equippableGroupId,
            baseAddress,
            metadataURI,
            fixedPartIds,
            slotPartIds
        );
        return _totalAssets;
    }

    function setValidParentForEquippableGroup(
        uint64 equippableGroupId,
        address parentAddress,
        uint64 partId
    ) public virtual onlyOwnerOrContributor {
        _setValidParentForEquippableGroup(
            equippableGroupId,
            parentAddress,
            partId
        );
    }

    function totalAssets() public view virtual returns (uint256) {
        return _totalAssets;
    }
}
