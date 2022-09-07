// SPDX-License-Identifier: Apache-2.0

import "contracts/RMRK/equippable/IRMRKEquippable.sol";
import "contracts/RMRK/utils/IRMRKRenderUtilsEquip.sol";

pragma solidity ^0.8.15;

/**
 * @dev Extra utility functions for composing RMRK extended resources.
 */

contract RMRKRenderUtilsEquip is IRMRKRenderUtilsEquip {
    function supportsInterface(bytes4 interfaceId)
        external
        view
        virtual
        returns (bool)
    {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IRMRKRenderUtilsEquip).interfaceId;
    }

    function getExtendedResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view virtual returns (IRMRKEquippable.ExtendedResource memory) {
        IRMRKEquippable target_ = IRMRKEquippable(target);
        uint64 resourceId = target_.getActiveResources(tokenId)[index];
        return target_.getExtendedResource(resourceId);
    }

    function getPendingExtendedResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view virtual returns (IRMRKEquippable.ExtendedResource memory) {
        IRMRKEquippable target_ = IRMRKEquippable(target);
        uint64 resourceId = target_.getPendingResources(tokenId)[index];
        return target_.getExtendedResource(resourceId);
    }

    function getExtendedResourcesById(
        address target,
        uint64[] calldata resourceIds
    )
        external
        view
        virtual
        returns (IRMRKEquippable.ExtendedResource[] memory)
    {
        IRMRKEquippable target_ = IRMRKEquippable(target);
        uint256 len = resourceIds.length;
        IRMRKEquippable.ExtendedResource[]
            memory resources = new IRMRKEquippable.ExtendedResource[](len);
        for (uint256 i; i < len; ) {
            resources[i] = target_.getExtendedResource(resourceIds[i]);
            unchecked {
                ++i;
            }
        }
        return resources;
    }
}
