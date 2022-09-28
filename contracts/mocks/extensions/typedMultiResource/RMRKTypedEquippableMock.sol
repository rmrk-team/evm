// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../../RMRK/extension/typedMultiResource/RMRKTypedEquippable.sol";
import "../../RMRKEquippableMock.sol";

error RMRKTokenHasNoResourcesWithType();

abstract contract RMRKTypedEquippableMock is
    RMRKEquippableMock,
    RMRKTypedEquippable
{
    constructor(string memory name, string memory symbol)
        RMRKEquippableMock(name, symbol)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(RMRKEquippable, RMRKTypedEquippable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
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
