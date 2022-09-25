// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./IRMRKTypedMultiResource.sol";

abstract contract RMRKTypedMultiResourceAbstract is IRMRKTypedMultiResource {
    mapping(uint64 => string) private _resourceTypes;

    function getResourceType(uint64 resourceId)
        public
        view
        returns (string memory)
    {
        return _resourceTypes[resourceId];
    }

    function _setResourceType(uint64 resourceId, string memory type_) internal {
        _resourceTypes[resourceId] = type_;
    }
}
