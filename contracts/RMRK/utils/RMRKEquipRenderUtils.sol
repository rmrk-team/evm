// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../base/IRMRKBaseStorage.sol";
import "../equippable/IRMRKEquippable.sol";
import "../library/RMRKLib.sol";
import "../library/RMRKErrors.sol";

/**
 * @title RMRKEquipRenderUtils
 * @author RMRK team
 * @notice Smart contract of the RMRK Equip render utils module.
 * @dev Extra utility functions for composing RMRK extended resources.
 */
contract RMRKEquipRenderUtils {
    using RMRKLib for uint64[];

    /**
     * @notice The structure used to display a full information of an active resource.
     * @return id ID of the resource
     * @return equppableGroupId ID of the equippable group this resource belongs to
     * @return priority Priority of the resource in the active resources array it belongs to
     * @return baseAddress Address of the `Base` smart contract this resource belongs to
     * @return metadata Metadata URI of the resource
     * @return fixedParts An array of IDs of fixed parts present in the resource
     * @return slotParts An array of IDs of slot parts present in the resource
     */
    struct ExtendedActiveResource {
        uint64 id;
        uint64 equippableGroupId;
        uint16 priority;
        address baseAddress;
        string metadata;
        uint64[] fixedParts;
        uint64[] slotParts;
    }

    /**
     * @notice The structure used to display a full information of a pending resource.
     * @return id ID of the resource
     * @return equppableGroupId ID of the equippable group this resource belongs to
     * @return acceptRejectIndex The index of the given resource in the pending resources array it belongs to
     * @return overwritesResourceWithId ID of the resource the given resource will overwrite if accepted
     * @return baseAddress Address of the `Base` smart contract this resource belongs to
     * @return metadata Metadata URI of the resource
     * @return fixedParts An array of IDs of fixed parts present in the resource
     * @return slotParts An array of IDs of slot parts present in the resource
     */
    struct ExtendedPendingResource {
        uint64 id;
        uint64 equippableGroupId;
        uint128 acceptRejectIndex;
        uint64 overwritesResourceWithId;
        address baseAddress;
        string metadata;
        uint64[] fixedParts;
        uint64[] slotParts;
    }

    /**
     * @notice The structure used to display a full information of an equippend slot part.
     * @return partId ID of the slot part
     * @return childResourceId ID of the child resource equipped into the slot part
     * @return z The z value of the part defining how it should be rendered when presenting the full NFT
     * @return childAddress Address of the collection smart contract of the child token equipped into the slot
     * @return childId ID of the child token equipped into the slot
     * @return childResourceMetadata Metadata URI of the child token equipped into the slot
     * @return partMetadata Metadata URI of the given slot part
     */
    struct EquippedSlotPart {
        uint64 partId;
        uint64 childResourceId;
        uint8 z; //1 byte
        address childAddress;
        uint256 childId;
        string childResourceMetadata; //n bytes 32+
        string partMetadata; //n bytes 32+
    }

    /**
     * @notice Used to get extended active resources of the given token.
     * @dev The full `ExtendedActiveResource` looks like this:
     *  [
     *      ID,
     *      equippableGroupId,
     *      priority,
     *      baseAddress,
     *      metadata,
     *      [
     *          fixedPartId0,
     *          fixedPartId1,
     *          fixedPartId2
     *      ],
     *      [
     *          slotPartId0,
     *          slotPartId1,
     *          slotPartId2
     *      ]
     *  ]
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token to retrieve the extended active resources for
     * @return sturct[] An array of ExtendedActiveResources present on the given token
     */
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

    /**
     * @notice Used to get the extended pending resources of the given token.
     * @dev The full `ExtendedPendingResource` looks like this:
     *  [
     *      ID,
     *      equippableGroupId,
     *      acceptRejectIndex,
     *      overwritesResourceWithId, 
     *      baseAddress,
     *      metadata,
     *      [
     *          fixedPartId0,
     *          fixedPartId1,
     *          fixedPartId2
     *      ],
     *      [
     *          slotPartId0,
     *          slotPartId1,
     *          slotPartId2
     *      ]
     *  ]
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token to retrieve the extended pending resources for
     * @return sturct[] An array of ExtendedPendingResources present on the given token
     */
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
                acceptRejectIndex: uint128(i),
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

    /**
     * @notice Used to retrieve the equipped parts of the given token.
     * @dev NOTE: Some of the equipped children might be empty.
     * @dev The full `Equipment` struct looks like this:
     *  [
     *      resourceId,
     *      childResourceId,
     *      childId,
     *      childEquippableAddress
     *  ]
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token to retrieve the equipped items in the resource for
     * @param resourceId ID of the resource being queried for equipped parts
     * @return slotParts An array of the IDs of the slot parts present in the given resource
     * @return childrenEquipped An array of `Equipment` structs containing info about the equipped children
     */
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

    /**
     * @notice Used to compose the given equippables.
     * @dev The full `FixedPart` struct looks like this:
     *  [
     *      partId,
     *      z,
     *      metadataURI
     *  ]
     * @dev The full `EquippedSlotPart` struct looks like this:
     *  [
     *      partId,
     *      childResourceId,
     *      z,
     *      childAddress,
     *      childId,
     *      childResourceMetadata,
     *      partMetadata
     *  ]
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token to compose the equipped items in the resource for
     * @param resourceId ID of the resource being queried for equipped parts
     * @return metadataURI Metadata URI of the resource
     * @return equippableGroupId Equippable group ID of the resource
     * @return baseAddress Address of the base to which the resource belongs to
     * @return fixedParts An array of fixed parts respresented by the `FixedPart` structs present on the resource
     * @return slotParts An array of slot parts represented by the `EquippedSlotPart` structs present on the resource
     */
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

        // If token does not have uint64[] memory slotPartId to save the resource, it would fail here.
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

    /**
     * @notice Used to retrieve the equipped slot parts.
     * @dev The full `EquippedSlotPart` struct looks like this:
     *  [
     *      partId,
     *      childResourceId,
     *      z,
     *      childAddress,
     *      childId,
     *      childResourceMetadata,
     *      partMetadata
     *  ]
     * @param target_ An address of the `IRMRKEquippable` smart contract to retrieve the equipped slot parts from.
     * @param tokenId ID of the token for which to retrieve the equipped slot parts
     * @param resourceId ID of the resource on the token to retrieve the equipped slot parts
     * @param baseAddress The address of the base to which the given resource belongs to
     * @param slotPartIds An array of slot part IDs in the resource for which to retrieve the equipped slot parts
     * @return slotParts An array of `EquippedSlotPart` structs representing the equipped slot parts
     */
    function getEquippedSlotParts(
        IRMRKEquippable target_,
        uint256 tokenId,
        uint64 resourceId,
        address baseAddress,
        uint64[] memory slotPartIds
    ) private view returns (EquippedSlotPart[] memory slotParts) {
        slotParts = new EquippedSlotPart[](slotPartIds.length);
        uint256 len = slotPartIds.length;

        if (len != 0) {
            string memory metadata;
            IRMRKBaseStorage.Part[] memory baseSlotParts = IRMRKBaseStorage(
                baseAddress
            ).getParts(slotPartIds);
            for (uint256 i; i < len; ) {
                IRMRKEquippable.Equipment memory equipment = target_
                    .getEquipment(tokenId, baseAddress, slotPartIds[i]);
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
