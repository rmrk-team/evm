// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../multiresource/IRMRKMultiResource.sol";
import "../library/RMRKErrors.sol";

/**
 * @title RMRKMultiResourceRenderUtils
 * @author RMRK team
 */
contract RMRKMultiResourceRenderUtils {
    uint16 private constant _LOWEST_POSSIBLE_PRIORITY = 2**16 - 1;

    /**
     * @notice The structure used to display information about an active resource.
     * @return id ID of the resource
     * @return priority The priority assigned to the resource
     * @return metadata The metadata URI of the resource
     */
    struct ActiveResource {
        uint64 id;
        uint16 priority;
        string metadata;
    }

    /**
     * @notice The structure used to display information about a pending resource.
     * @return id ID of the resource
     * @return acceptRejectIndex An index to use in order to accept or reject the given resource
     * @return overwritesResourceWithId ID of the resource that would be overwritten if this resource gets accepted
     * @return metadata The metadata URI of the resource
     */
    struct PendingResource {
        uint64 id;
        uint128 acceptRejectIndex;
        uint64 overwritesResourceWithId;
        string metadata;
    }

    /**
     * @notice Used to get the active resources of the given token.
     * @dev The full `ActiveResource` looks like this:
     *  [
     *      id,
     *      priority,
     *      metadata
     *  ]
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token to retrieve the active resources for
     * @return struct[] An array of ActiveResources present on the given token
     */
    function getActiveResources(address target, uint256 tokenId)
        public
        view
        virtual
        returns (ActiveResource[] memory)
    {
        IRMRKMultiResource target_ = IRMRKMultiResource(target);

        uint64[] memory resources = target_.getActiveResources(tokenId);
        uint16[] memory priorities = target_.getActiveResourcePriorities(
            tokenId
        );
        uint256 len = resources.length;
        if (len == 0) {
            revert RMRKTokenHasNoResources();
        }

        ActiveResource[] memory activeResources = new ActiveResource[](len);
        string memory metadata;
        for (uint256 i; i < len; ) {
            metadata = target_.getResourceMetadata(tokenId, resources[i]);
            activeResources[i] = ActiveResource({
                id: resources[i],
                priority: priorities[i],
                metadata: metadata
            });
            unchecked {
                ++i;
            }
        }
        return activeResources;
    }

    /**
     * @notice Used to get the pending resources of the given token.
     * @dev The full `PendingResource` looks like this:
     *  [
     *      id,
     *      acceptRejectIndex,
     *      overwritesResourceWithId,
     *      metadata
     *  ]
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token to retrieve the pending resources for
     * @return struct[] An array of PendingResources present on the given token
     */
    function getPendingResources(address target, uint256 tokenId)
        public
        view
        virtual
        returns (PendingResource[] memory)
    {
        IRMRKMultiResource target_ = IRMRKMultiResource(target);

        uint64[] memory resources = target_.getPendingResources(tokenId);
        uint256 len = resources.length;
        if (len == 0) {
            revert RMRKTokenHasNoResources();
        }

        PendingResource[] memory pendingResources = new PendingResource[](len);
        string memory metadata;
        uint64 overwritesResourceWithId;
        for (uint256 i; i < len; ) {
            metadata = target_.getResourceMetadata(tokenId, resources[i]);
            overwritesResourceWithId = target_.getResourceOverwrites(
                tokenId,
                resources[i]
            );
            pendingResources[i] = PendingResource({
                id: resources[i],
                acceptRejectIndex: uint128(i),
                overwritesResourceWithId: overwritesResourceWithId,
                metadata: metadata
            });
            unchecked {
                ++i;
            }
        }
        return pendingResources;
    }

    /**
     * @notice Used to retrieve the metadata URI of specified resources in the specified token.
     * @dev Requirements:
     *
     *  - `resourceIds` must exist.
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token to retrieve the specified resources for
     * @param resourceIds[] An array of resource IDs for which to retrieve the metadata URIs
     * @return string[] An array of metadata URIs belonging to specified resources
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
     * @notice Used to retrieve the metadata URI of the specified token's resource with the highest priority.
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token for which to retrieve the metadata URI of the resource with the highest priority
     * @return string The metadata URI of the resource with the highest priority
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
