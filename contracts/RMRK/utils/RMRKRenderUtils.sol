// SPDX-License-Identifier: Apache-2.0

import "contracts/RMRK/interfaces/IRMRKMultiResource.sol";
import "contracts/RMRK/interfaces/IRMRKRenderUtils.sol";

pragma solidity ^0.8.15;

/**
* @dev Extra utility functions for composing RMRK resources.
*/

contract RMRKRenderUtils is IRMRKRenderUtils { 
    function getResObjectByIndex(address target, uint256 tokenId, uint256 index)
        external
        view
        virtual
        returns (IRMRKMultiResource.Resource memory)
    {
        IRMRKMultiResource target_ = IRMRKMultiResource(target);
        uint64 resourceId = target_.getActiveResources(tokenId)[index];
        return target_.getResource(resourceId);
    }

    function getPendingResObjectByIndex(address target, uint256 tokenId, uint256 index)
        external
        view
        virtual
        returns (IRMRKMultiResource.Resource memory)
    {
        IRMRKMultiResource target_ = IRMRKMultiResource(target);
        uint64 resourceId = target_.getPendingResources(tokenId)[index];
        return target_.getResource(resourceId);
    }

    function getResourcesById(address target, uint64[] calldata resourceIds)
        public
        view
        virtual
        returns (IRMRKMultiResource.Resource[] memory)
    {
        IRMRKMultiResource target_ = IRMRKMultiResource(target);
        uint256 len = resourceIds.length;
        IRMRKMultiResource.Resource[] memory resources = new IRMRKMultiResource.Resource[](len);
        for (uint256 i; i < len; ) {
            resources[i] = target_.getResource(resourceIds[i]);
            unchecked {
                ++i;
            }
        }
        return resources;
    }
}