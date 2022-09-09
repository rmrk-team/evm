// SPDX-License-Identifier: Apache-2.0

import "contracts/RMRK/multiresource/IRMRKMultiResource.sol";
import "contracts/RMRK/utils/IRMRKMultiResourceRenderUtils.sol";

pragma solidity ^0.8.15;

/**
 * @dev Extra utility functions for composing RMRK resources.
 */

contract RMRKMultiResourceRenderUtils is IRMRKMultiResourceRenderUtils {
    function supportsInterface(bytes4 interfaceId)
        external
        view
        virtual
        returns (bool)
    {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IRMRKMultiResourceRenderUtils).interfaceId;
    }

    function getResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view virtual returns (IRMRKMultiResource.Resource memory) {
        IRMRKMultiResource target_ = IRMRKMultiResource(target);
        uint64 resourceId = target_.getActiveResources(tokenId)[index];
        return target_.getResource(resourceId);
    }

    function getPendingResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view virtual returns (IRMRKMultiResource.Resource memory) {
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
        IRMRKMultiResource.Resource[]
            memory resources = new IRMRKMultiResource.Resource[](len);
        for (uint256 i; i < len; ) {
            resources[i] = target_.getResource(resourceIds[i]);
            unchecked {
                ++i;
            }
        }
        return resources;
    }
}
