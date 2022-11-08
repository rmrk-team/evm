// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

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
        uint64 id,
        uint64 equippableGroupId,
        address baseAddress,
        string memory metadataURI,
        uint64[] memory fixedPartIds,
        uint64[] memory slotPartIds,
        string memory type_
    ) external {
        _addResourceEntry(
            id,
            equippableGroupId,
            baseAddress,
            metadataURI,
            fixedPartIds,
            slotPartIds
        );
        _setResourceType(id, type_);
    }
}
