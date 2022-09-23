// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../multiresource/RMRKMultiResource.sol";
import "./IRMRKTypedMultiResource.sol";

contract RMRKTypedMultiResource is IRMRKTypedMultiResource, RMRKMultiResource {
    mapping(uint64 => string) private _resourceTypes;

    constructor(string memory name, string memory symbol)
        RMRKMultiResource(name, symbol)
    {}

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, RMRKMultiResource)
        returns (bool)
    {
        return
            RMRKMultiResource.supportsInterface(interfaceId) ||
            interfaceId == type(IRMRKTypedMultiResource).interfaceId;
    }

    function _addTypedResourceEntry(
        uint64 resourceId,
        string memory metadataURI,
        string memory type_
    ) internal {
        _addResourceEntry(resourceId, metadataURI);
        _resourceTypes[resourceId] = type_;
    }

    function getResourceType(uint64 resourceId)
        public
        view
        returns (string memory)
    {
        return _resourceTypes[resourceId];
    }
}
