// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../equippable/RMRKExternalEquip.sol";
import "./IRMRKTypedMultiResource.sol";

contract RMRKTypedExternalEquippable is IRMRKTypedMultiResource, RMRKExternalEquip {
    mapping(uint64 => string) private _resourceTypes;

    constructor(address nestingAddress)
        RMRKExternalEquip(nestingAddress)
    {}

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, RMRKExternalEquip)
        returns (bool)
    {
        return
            RMRKExternalEquip.supportsInterface(interfaceId) ||
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
