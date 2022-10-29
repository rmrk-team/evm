// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./IRMRKTypedMultiResource.sol";

/**
 * @title RMRKTypedMultiResource
 * @author RMRK team
 * @notice Smart contract of the RMRK Typed multi resource module.
 */
contract RMRKTypedMultiResource is IRMRKTypedMultiResource {
    mapping(uint64 => string) private _resourceTypes;

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        returns (bool)
    {
        return interfaceId == type(IRMRKTypedMultiResource).interfaceId;
    }

    /**
     * @notice Used to get the type of the resource.
     * @param resourceId ID of the resource to check
     * @return string The type of the resource
     */
    function getResourceType(uint64 resourceId)
        public
        view
        returns (string memory)
    {
        return _resourceTypes[resourceId];
    }

    /**
     * @notice Used to set the type of the resource.
     * @param resourceId ID of the resource for which the type is being set
     * @param type_ The type of the resource
     */
    function _setResourceType(uint64 resourceId, string memory type_) internal {
        _resourceTypes[resourceId] = type_;
    }
}
