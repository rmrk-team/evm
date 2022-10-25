// SPDX-License-Identifier: Apache-2.0

import "../base/IRMRKBaseStorage.sol";
import "../equippable/IRMRKEquippable.sol";
import "../library/RMRKLib.sol";
import "./IRMRKEquipRenderUtils.sol";
// import "hardhat/console.sol";

pragma solidity ^0.8.16;

error RMRKTokenDoesNotHaveActiveResource();
error RMRKNotComposableResource();

/**
 * @dev Extra utility functions for composing RMRK extended resources.
 */

contract RMRKEquipRenderUtils is IRMRKEquipRenderUtils {
    using RMRKLib for uint64[];

    function supportsInterface(bytes4 interfaceId)
        external
        view
        virtual
        returns (bool)
    {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IRMRKEquipRenderUtils).interfaceId;
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

        // We make sure token has that resource. Alternative is to receive index but makes equipping more complex.
        (, bool found) = target_.getActiveResources(tokenId).indexOf(
            resourceId
        );
        if (!found) revert RMRKTokenDoesNotHaveActiveResource();

        address targetBaseAddress = target_.getBaseAddressOfResource(
            resourceId
        );
        if (targetBaseAddress == address(0)) revert RMRKNotComposableResource();

        resource = target_.getExtendedResource(resourceId);

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
