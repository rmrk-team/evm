// SPDX-License-Identifier: Apache-2.0

import "contracts/RMRK/multiresource/IRMRKMultiResource.sol";
import "../library/RMRKErrors.sol";

pragma solidity ^0.8.16;

/**
 * @dev Extra utility functions for composing RMRK resources.
 */

contract RMRKMultiResourceRenderUtils {
    uint16 private constant _LOWEST_POSSIBLE_PRIORITY = 2**16 - 1;

    /**
     * @notice Returns resource metadata at `index` of active resource array on `tokenId`
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     * - `index` must be inside the range of active resource array
     */
    function getActiveResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view virtual returns (string memory) {
        IRMRKMultiResource target_ = IRMRKMultiResource(target);
        uint64 resourceId = target_.getActiveResources(tokenId)[index];
        return target_.getResourceMetadata(tokenId, resourceId);
    }

    /**
     * @notice Returns resource metadata at `index` of pending resource array on `tokenId`
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     * - `index` must be inside the range of pending resource array
     */
    function getPendingResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view virtual returns (string memory) {
        IRMRKMultiResource target_ = IRMRKMultiResource(target);
        uint64 resourceId = target_.getPendingResources(tokenId)[index];
        return target_.getResourceMetadata(tokenId, resourceId);
    }

    /**
     * @notice Returns resource metadata strings for the given ids
     *
     * Requirements:
     *
     * - `resourceIds` must exist.
     */
    function getResourcesById(
        address target,
        uint256 tokenId,
        uint64[] calldata resourceIds
    ) public view virtual returns (string[] memory) {
        IRMRKMultiResource target_ = IRMRKMultiResource(target);
        uint256 len = resourceIds.length;
        string[] memory resources = new string[](len);
        for (uint256 i; i < len; ) {
            resources[i] = target_.getResourceMetadata(tokenId, resourceIds[i]);
            unchecked {
                ++i;
            }
        }
        return resources;
    }

    /**
     * @notice Returns the resource metadata with the highest priority for the given token
     */
    function getTopResourceMetaForToken(address target, uint256 tokenId)
        external
        view
        returns (string memory)
    {
        IRMRKMultiResource target_ = IRMRKMultiResource(target);
        uint16[] memory priorities = target_.getActiveResourcePriorities(
            tokenId
        );
        uint64[] memory resources = target_.getActiveResources(tokenId);
        uint256 len = priorities.length;
        if (len == 0) {
            revert RMRKTokenHasNoResources();
        }

        uint16 maxPriority = _LOWEST_POSSIBLE_PRIORITY;
        uint64 maxPriorityResource;
        for (uint64 i; i < len; ) {
            uint16 currentPrio = priorities[i];
            if (currentPrio < maxPriority) {
                maxPriority = currentPrio;
                maxPriorityResource = resources[i];
            }
            unchecked {
                ++i;
            }
        }
        return target_.getResourceMetadata(tokenId, maxPriorityResource);
    }
}
