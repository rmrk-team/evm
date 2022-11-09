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

    struct ExtendedActiveResource {
        uint64 id;
        uint64 equippableGroupId;
        uint16 priority;
        address baseAddress;
        string metadata;
        uint64[] fixedParts;
        uint64[] slotParts;
    }

    struct ExtendedPendingResource {
        uint64 id;
        uint64 equippableGroupId;
        uint64 overwritesResourceWithId;
        address baseAddress;
        string metadata;
        uint64[] fixedParts;
        uint64[] slotParts;
    }

    struct EquippedSlotPart {
        uint64 partId;
        uint64 childResourceId;
        uint8 z; //1 byte
        address childAddress;
        uint256 childId;
        string childResourceMetadata; //n bytes 32+
        string partMetadata; //n bytes 32+
    }

    function getExtendedActiveResources(address target, uint256 tokenId)
        public
        view
        virtual
        returns (ExtendedActiveResource[] memory)
    {
        IRMRKEquippable target_ = IRMRKEquippable(target);

        uint64[] memory resources = target_.getActiveResources(tokenId);
        uint16[] memory priorities = target_.getActiveResourcePriorities(
            tokenId
        );
        uint256 len = resources.length;
        if (len == 0) {
            revert RMRKTokenHasNoResources();
        }

        ExtendedActiveResource[]
            memory activeResources = new ExtendedActiveResource[](len);

        for (uint256 i; i < len; ) {
            (
                string memory metadataURI,
                uint64 equippableGroupId,
                address baseAddress,
                uint64[] memory fixedPartIds,
                uint64[] memory slotPartIds
            ) = target_.getExtendedResource(tokenId, resources[i]);
            activeResources[i] = ExtendedActiveResource({
                id: resources[i],
                equippableGroupId: equippableGroupId,
                priority: priorities[i],
                baseAddress: baseAddress,
                metadata: metadataURI,
                fixedParts: fixedPartIds,
                slotParts: slotPartIds
            });
            unchecked {
                ++i;
            }
        }
        return activeResources;
    }

    function getExtendedPendingResources(address target, uint256 tokenId)
        public
        view
        virtual
        returns (ExtendedPendingResource[] memory)
    {
        IRMRKEquippable target_ = IRMRKEquippable(target);

        uint64[] memory resources = target_.getPendingResources(tokenId);
        uint256 len = resources.length;
        if (len == 0) {
            revert RMRKTokenHasNoResources();
        }

        ExtendedPendingResource[]
            memory pendingResources = new ExtendedPendingResource[](len);
        uint64 overwritesResourceWithId;
        for (uint256 i; i < len; ) {
            (
                string memory metadataURI,
                uint64 equippableGroupId,
                address baseAddress,
                uint64[] memory fixedPartIds,
                uint64[] memory slotPartIds
            ) = target_.getExtendedResource(tokenId, resources[i]);
            overwritesResourceWithId = target_.getResourceOverwrites(
                tokenId,
                resources[i]
            );
            pendingResources[i] = ExtendedPendingResource({
                id: resources[i],
                equippableGroupId: equippableGroupId,
                overwritesResourceWithId: overwritesResourceWithId,
                baseAddress: baseAddress,
                metadata: metadataURI,
                fixedParts: fixedPartIds,
                slotParts: slotPartIds
            });
            unchecked {
                ++i;
            }
        }
        return pendingResources;
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

        (, , address baseAddress, , uint64[] memory slotPartIds) = target_
            .getExtendedResource(tokenId, resourceId);

        // TODO: Clarify on docs: Some children equipped might be empty.
        slotParts = new uint64[](slotPartIds.length);
        childrenEquipped = new IRMRKEquippable.Equipment[](slotPartIds.length);

        uint256 len = slotPartIds.length;
        for (uint256 i; i < len; ) {
            slotParts[i] = slotPartIds[i];
            IRMRKEquippable.Equipment memory equipment = target_.getEquipment(
                tokenId,
                baseAddress,
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
            string memory metadataURI,
            uint64 equippableGroupId,
            address baseAddress,
            IRMRKEquippable.FixedPart[] memory fixedParts,
            EquippedSlotPart[] memory slotParts
        )
    {
        IRMRKEquippable target_ = IRMRKEquippable(target);
        uint64[] memory fixedPartIds;
        uint64[] memory slotPartIds;

        // If token does not huint64[] memory slotPartIdsave the resource, it would fail here.
        (
            metadataURI,
            equippableGroupId,
            baseAddress,
            fixedPartIds,
            slotPartIds
        ) = target_.getExtendedResource(tokenId, resourceId);
        if (baseAddress == address(0)) revert RMRKNotComposableResource();

        // Fixed parts:
        fixedParts = new IRMRKEquippable.FixedPart[](fixedPartIds.length);

        uint256 len = fixedPartIds.length;
        if (len != 0) {
            IRMRKBaseStorage.Part[] memory baseFixedParts = IRMRKBaseStorage(
                baseAddress
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

        slotParts = getEquippedSlotParts(
            target_,
            tokenId,
            resourceId,
            baseAddress,
            slotPartIds
        );
    }

    function getEquippedSlotParts(
        IRMRKEquippable target_,
        uint256 tokenId,
        uint64 resourceId,
        address baseAdress,
        uint64[] memory slotPartIds
    ) private view returns (EquippedSlotPart[] memory slotParts) {
        slotParts = new EquippedSlotPart[](slotPartIds.length);
        uint256 len = slotPartIds.length;

        if (len != 0) {
            string memory metadata;
            IRMRKBaseStorage.Part[] memory baseSlotParts = IRMRKBaseStorage(
                baseAdress
            ).getParts(slotPartIds);
            for (uint256 i; i < len; ) {
                IRMRKEquippable.Equipment memory equipment = target_
                    .getEquipment(tokenId, baseAdress, slotPartIds[i]);
                if (equipment.resourceId == resourceId) {
                    metadata = IRMRKEquippable(equipment.childEquippableAddress)
                        .getResourceMetadata(
                            equipment.childId,
                            equipment.childResourceId
                        );
                    slotParts[i] = EquippedSlotPart({
                        partId: slotPartIds[i],
                        childResourceId: equipment.childResourceId,
                        z: baseSlotParts[i].z,
                        childId: equipment.childId,
                        childAddress: equipment.childEquippableAddress,
                        childResourceMetadata: metadata,
                        partMetadata: baseSlotParts[i].metadataURI
                    });
                } else {
                    slotParts[i] = EquippedSlotPart({
                        partId: slotPartIds[i],
                        childResourceId: uint64(0),
                        z: baseSlotParts[i].z,
                        childId: uint256(0),
                        childAddress: address(0),
                        childResourceMetadata: "",
                        partMetadata: baseSlotParts[i].metadataURI
                    });
                }
                unchecked {
                    ++i;
                }
            }
        }
    }
}
