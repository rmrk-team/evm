// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./IRMRKTypedMultiResource.sol";

contract RMRKTypedMultiResource is IRMRKTypedMultiResource {
    mapping(uint64 => string) private _resourceTypes;

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        returns (bool)
    {
        return interfaceId == type(IRMRKTypedMultiResource).interfaceId;
    }

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
