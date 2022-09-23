// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../equippable/RMRKEquippable.sol";
import "./IRMRKTypedMultiResource.sol";

contract RMRKTypedEquippable is IRMRKTypedMultiResource, RMRKEquippable {
    mapping(uint64 => string) private _resourceTypes;

    constructor(string memory name, string memory symbol)
        RMRKEquippable(name, symbol)
    {}

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, RMRKEquippable)
        returns (bool)
    {
        return
            RMRKEquippable.supportsInterface(interfaceId) ||
            interfaceId == type(IRMRKTypedMultiResource).interfaceId;
    }

    function _addTypedResourceEntry(
        ExtendedResource memory resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds,
        string memory type_
    ) internal {
        _addResourceEntry(resource, fixedPartIds, slotPartIds);
        _resourceTypes[resource.id] = type_;
    }

    function getResourceType(uint64 resourceId)
        public
        view
        returns (string memory)
    {
        return _resourceTypes[resourceId];
    }
}
