// SPDX-License-Identifier: Apache-2.0

import "contracts/RMRK/multiresource/IRMRKMultiResource.sol";
import "contracts/RMRK/utils/IRMRKMultiResourceRenderUtils.sol";

pragma solidity ^0.8.15;

/**
 * @dev Extra utility functions for composing RMRK resources.
 */

error RMRKTokenHasNoResources();

contract RMRKMultiResourceRenderUtils is IRMRKMultiResourceRenderUtils {
    uint16 private constant _LOWEST_POSSIBLE_PRIORITY = 2**16 - 1;

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
    ) external view virtual returns (string memory) {
        IRMRKMultiResource target_ = IRMRKMultiResource(target);
        uint64 resourceId = target_.getActiveResources(tokenId)[index];
        return target_.getResourceMeta(resourceId);
    }

    function getPendingResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view virtual returns (string memory) {
        IRMRKMultiResource target_ = IRMRKMultiResource(target);
        uint64 resourceId = target_.getPendingResources(tokenId)[index];
        return target_.getResourceMeta(resourceId);
    }

    function getResourcesById(address target, uint64[] calldata resourceIds)
        public
        view
        virtual
        returns (string[] memory)
    {
        IRMRKMultiResource target_ = IRMRKMultiResource(target);
        uint256 len = resourceIds.length;
        string[] memory resources = new string[](len);
        for (uint256 i; i < len; ) {
            resources[i] = target_.getResourceMeta(resourceIds[i]);
            unchecked {
                ++i;
            }
        }
        return resources;
    }

    function getTopResourceMetaForToken(address target, uint256 tokenId)
        external
        view
        returns (string memory)
    {
        IRMRKMultiResource target_ = IRMRKMultiResource(target);
        uint16[] memory priorities = target_.getActiveResourcePriorities(
            tokenId
        );
        uint256 len = priorities.length;
        if (len == 0) {
            revert RMRKTokenHasNoResources();
        }

        uint16 maxPriority = _LOWEST_POSSIBLE_PRIORITY;
        uint64 maxPriorityIndex = 0;
        for (uint64 i; i < len; ) {
            uint16 currentPrio = priorities[i];
            if (currentPrio < maxPriority) {
                maxPriority = currentPrio;
                maxPriorityIndex = i;
            }
            unchecked {
                ++i;
            }
        }
        return target_.getResourceMetaForToken(tokenId, maxPriorityIndex);
    }
}
