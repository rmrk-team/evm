// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/equippable/RMRKExternalEquip.sol";
import "../RMRK/access/OwnableLock.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

//Minimal public implementation of RMRKEquippableWithNesting for testing.
contract RMRKExternalEquipImpl is OwnableLock, RMRKExternalEquip {
    using Strings for uint256;

    constructor(address nestingAddress) RMRKExternalEquip(nestingAddress) {}

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) public onlyOwner {
        // This reverts if token does not exist:
        ownerOf(tokenId);
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(
        ExtendedResource calldata resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds
    ) public onlyOwner {
        _addResourceEntry(resource, fixedPartIds, slotPartIds);
    }

    function setValidParentRefId(
        uint64 refId,
        address parentAddress,
        uint64 partId
    ) public onlyOwner {
        _setValidParentRefId(refId, parentAddress, partId);
    }
}
