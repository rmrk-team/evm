// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/equippable/RMRKExternalEquip.sol";
import "../RMRK/access/OwnableLock.sol";

contract RMRKExternalEquipImpl is OwnableLock, RMRKExternalEquip {
    uint256 private _totalResources;

    constructor(address nestingAddress) RMRKExternalEquip(nestingAddress) {}

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) public virtual onlyOwnerOrContributor {
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(
        uint64 equippableGroupId,
        address baseAddress,
        string memory metadataURI,
        uint64[] memory fixedPartIds,
        uint64[] memory slotPartIds
    ) public virtual onlyOwnerOrContributor returns (uint256) {
        unchecked {
            _totalResources += 1;
        }
        _addResourceEntry(
            uint64(_totalResources),
            equippableGroupId,
            baseAddress,
            metadataURI,
            fixedPartIds,
            slotPartIds
        );
        return _totalResources;
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

    function totalResources() public view virtual returns (uint256) {
        return _totalResources;
    }
}
