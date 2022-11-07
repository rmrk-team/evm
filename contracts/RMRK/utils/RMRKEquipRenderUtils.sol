// SPDX-License-Identifier: Apache-2.0

import "../base/IRMRKBaseStorage.sol";
import "../equippable/IRMRKEquippable.sol";
import "../library/RMRKLib.sol";
import "../library/RMRKErrors.sol";

pragma solidity ^0.8.16;

/**
 * @dev Extra utility functions for composing RMRK extended resources.
 */

contract RMRKEquipRenderUtils {
    using RMRKLib for uint64[];

    /**
     * @notice Returns `ExtendedResource` object associated with `resourceId`
     *
     * Requirements:
     *
     * - `resourceId` must exist.
     *
     */
    function getActiveExtendedResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view virtual returns (IRMRKEquippable.ExtendedResource memory) {
        IRMRKEquippable target_ = IRMRKEquippable(target);
        uint64 resourceId = target_.getActiveResources(tokenId)[index];
        return target_.getExtendedResource(tokenId, resourceId);
    }

    /**
     * @notice Returns `ExtendedResource` object at `index` of active resource array on `tokenId`
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     * - `index` must be inside the range of active resource array
     */
    function getPendingExtendedResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view virtual returns (IRMRKEquippable.ExtendedResource memory) {
        IRMRKEquippable target_ = IRMRKEquippable(target);
        uint64 resourceId = target_.getPendingResources(tokenId)[index];
        return target_.getExtendedResource(tokenId, resourceId);
    }

    /**
     * @notice Returns `ExtendedResource` objects for the given ids
     *
     * Requirements:
     *
     * - `resourceIds` must exist.
     */
    function getExtendedResourcesById(
        address target,
        uint256 tokenId,
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
            resources[i] = target_.getExtendedResource(tokenId, resourceIds[i]);
            unchecked {
                ++i;
            }
        }
        return resources;
    }

    function getEquipped(
        address target,
        uint64 tokenId,
        uint64 resourceId
    )
        public
        view
        returns (
            uint64[] memory slotParts,
            IRMRKEquippable.Equipment[] memory childrenEquipped
        )
    {
        IRMRKEquippable target_ = IRMRKEquippable(target);

        address targetBaseAddress = target_.getBaseAddressOfResource(
            resourceId
        );
        uint64[] memory slotPartIds = target_.getSlotPartIds(resourceId);

        // TODO: Clarify on docs: Some children equipped might be empty.
        slotParts = new uint64[](slotPartIds.length);
        childrenEquipped = new IRMRKEquippable.Equipment[](slotPartIds.length);

        uint256 len = slotPartIds.length;
        for (uint256 i; i < len; ) {
            slotParts[i] = slotPartIds[i];
            IRMRKEquippable.Equipment memory equipment = target_.getEquipment(
                tokenId,
                targetBaseAddress,
                slotPartIds[i]
            );
            if (equipment.resourceId == resourceId) {
                childrenEquipped[i] = equipment;
            }
            unchecked {
                ++i;
            }
        }
    }

    function composeEquippables(
        address target,
        uint256 tokenId,
        uint64 resourceId
    )
        public
        view
        returns (
            IRMRKEquippable.ExtendedResource memory resource,
            IRMRKEquippable.FixedPart[] memory fixedParts,
            IRMRKEquippable.SlotPart[] memory slotParts
        )
    {
        IRMRKEquippable target_ = IRMRKEquippable(target);
        address targetBaseAddress = target_.getBaseAddressOfResource(
            resourceId
        );
        if (targetBaseAddress == address(0)) revert RMRKNotComposableResource();

        // If token does not have the resource, it would fail here.
        resource = target_.getExtendedResource(tokenId, resourceId);

        // Fixed parts:
        uint64[] memory fixedPartIds = target_.getFixedPartIds(resourceId);
        fixedParts = new IRMRKEquippable.FixedPart[](fixedPartIds.length);

        uint256 len = fixedPartIds.length;
        if (len != 0) {
            IRMRKBaseStorage.Part[] memory baseFixedParts = IRMRKBaseStorage(
                targetBaseAddress
            ).getParts(fixedPartIds);
            for (uint256 i; i < len; ) {
                fixedParts[i] = IRMRKEquippable.FixedPart({
                    partId: fixedPartIds[i],
                    z: baseFixedParts[i].z,
                    metadataURI: baseFixedParts[i].metadataURI
                });
                unchecked {
                    ++i;
                }
            }
        }

        // Slot parts:
        uint64[] memory slotPartIds = target_.getSlotPartIds(resourceId);
        slotParts = new IRMRKEquippable.SlotPart[](slotPartIds.length);
        len = slotPartIds.length;

        if (len != 0) {
            IRMRKBaseStorage.Part[] memory baseSlotParts = IRMRKBaseStorage(
                targetBaseAddress
            ).getParts(slotPartIds);
            for (uint256 i; i < len; ) {
                IRMRKEquippable.Equipment memory equipment = target_
                    .getEquipment(tokenId, targetBaseAddress, slotPartIds[i]);
                if (equipment.resourceId == resourceId) {
                    slotParts[i] = IRMRKEquippable.SlotPart({
                        partId: slotPartIds[i],
                        childResourceId: equipment.childResourceId,
                        z: baseSlotParts[i].z,
                        childTokenId: equipment.childTokenId,
                        childAddress: equipment.childEquippableAddress,
                        metadataURI: baseSlotParts[i].metadataURI
                    });
                } else {
                    slotParts[i] = IRMRKEquippable.SlotPart({
                        partId: slotPartIds[i],
                        childResourceId: uint64(0),
                        z: baseSlotParts[i].z,
                        childTokenId: uint256(0),
                        childAddress: address(0),
                        metadataURI: baseSlotParts[i].metadataURI
                    });
                }
                unchecked {
                    ++i;
                }
            }
        }
    }
}
