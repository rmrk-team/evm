// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../../RMRK/extension/typedMultiResource/RMRKNestingTypedMultiResource.sol";
import "../../RMRKNestingMultiResourceMock.sol";

error RMRKTokenHasNoResourcesWithType();

contract RMRKNestingTypedMultiResourceMock is
    RMRKNestingMultiResourceMock,
    RMRKNestingTypedMultiResource
{
    constructor(string memory name, string memory symbol)
        RMRKNestingMultiResourceMock(name, symbol)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(RMRKNestingMultiResource, RMRKNestingTypedMultiResource)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function addTypedResourceEntry(
        uint64 resourceId,
        string memory metadataURI,
        string memory type_
    ) external {
        _addResourceEntry(resourceId, metadataURI);
        _setResourceType(resourceId, type_);
    }
}
