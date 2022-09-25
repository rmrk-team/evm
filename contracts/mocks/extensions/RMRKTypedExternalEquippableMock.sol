// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../RMRK/extension/typedMultiResource/RMRKTypedExternalEquippable.sol";

error RMRKTokenHasNoResourcesWithType();

contract RMRKTypedExternalEquippableMock is RMRKTypedExternalEquippable {
    constructor(address nestingAddress)
        RMRKTypedExternalEquippable(nestingAddress)
    {}

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external {
        _requireMinted(tokenId);
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addTypedResourceEntry(
        ExtendedResource memory resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds,
        string memory type_
    ) external {
        _addResourceEntry(resource, fixedPartIds, slotPartIds);
        _setResourceType(resource.id, type_);
    }
}
