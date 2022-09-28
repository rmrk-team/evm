// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../../RMRK/extension/typedMultiResource/RMRKTypedMultiResource.sol";
import "../../RMRKEquippableMock.sol";

error RMRKTokenHasNoResourcesWithType();

contract RMRKTypedEquippableMock is RMRKEquippableMock, RMRKTypedMultiResource {
    constructor(string memory name, string memory symbol)
        RMRKEquippableMock(name, symbol)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(RMRKEquippable, RMRKTypedMultiResource)
        returns (bool)
    {
        return
            RMRKTypedMultiResource.supportsInterface(interfaceId) ||
            RMRKEquippable.supportsInterface(interfaceId);
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
