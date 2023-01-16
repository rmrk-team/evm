// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./RMRKRenderUtils.sol";
import "./RMRKMultiAssetRenderUtils.sol";
import "../catalog/IRMRKCatalog.sol";
import "../equippable/IRMRKEquippable.sol";
import "../nestable/IRMRKNestable.sol";
import "../library/RMRKLib.sol";
import "../library/RMRKErrors.sol";

/**
 * @title RMRKEquipRenderUtils
 * @author RMRK team
 * @notice Smart contract of the RMRK Equip render utils module.
 * @dev Extra utility functions for composing RMRK extended assets.
 */
contract RMRKEquipRenderUtils is RMRKRenderUtils, RMRKMultiAssetRenderUtils {
    using RMRKLib for uint64[];

    /**
     * @notice The structure used to display a full information of an active asset.
     * @return id ID of the asset
     * @return equppableGroupId ID of the equippable group this asset belongs to
     * @return priority Priority of the asset in the active assets array it belongs to
     * @return catalogAddress Address of the `Catalog` smart contract this asset belongs to
     * @return metadata Metadata URI of the asset
     * @return partIds[] An array of IDs of fixed and slot parts present in the asset
     */
    struct ExtendedEquippableActiveAsset {
        uint64 id;
        uint64 equippableGroupId;
        uint16 priority;
        address catalogAddress;
        string metadata;
        uint64[] partIds;
    }

    /**
     * @notice The structure used to display a full information of a pending asset.
     * @return id ID of the asset
     * @return equppableGroupId ID of the equippable group this asset belongs to
     * @return acceptRejectIndex The index of the given asset in the pending assets array it belongs to
     * @return replacesAssetWithId ID of the asset the given asset will replace if accepted
     * @return catalogAddress Address of the `Catalog` smart contract this asset belongs to
     * @return metadata Metadata URI of the asset
     * @return partIds[] An array of IDs of fixed and slot parts present in the asset
     */
    struct ExtendedPendingAsset {
        uint64 id;
        uint64 equippableGroupId;
        uint128 acceptRejectIndex;
        uint64 replacesAssetWithId;
        address catalogAddress;
        string metadata;
        uint64[] partIds;
    }

    /**
     * @notice The structure used to display a full information of an equippend slot part.
     * @return partId ID of the slot part
     * @return childAssetId ID of the child asset equipped into the slot part
     * @return z The z value of the part defining how it should be rendered when presenting the full NFT
     * @return childAddress Address of the collection smart contract of the child token equipped into the slot
     * @return childId ID of the child token equipped into the slot
     * @return childAssetMetadata Metadata URI of the child token equipped into the slot
     * @return partMetadata Metadata URI of the given slot part
     */
    struct EquippedSlotPart {
        uint64 partId;
        uint64 childAssetId;
        uint8 z; //1 byte
        address childAddress;
        uint256 childId;
        string childAssetMetadata; //n bytes 32+
        string partMetadata; //n bytes 32+
    }

    /**
     * @notice Used to provide data about fixed parts.
     * @return partId ID of the part
     * @return z The z value of the asset, specifying how the part should be rendered in a composed NFT
     * @return matadataURI The metadata URI of the fixed part
     */
    struct FixedPart {
        uint64 partId;
        uint8 z; //1 byte
        string metadataURI; //n bytes 32+
    }

    struct AssetWithSlot {
        uint64 slotPartId;
        uint64 assetId;
    }

    /**
     * @notice Used to get extended active assets of the given token.
     * @dev The full `ExtendedEquippableActiveAsset` looks like this:
     *  [
     *      ID,
     *      equippableGroupId,
     *      priority,
     *      catalogAddress,
     *      metadata,
     *      [
     *          fixedPartId0,
     *          fixedPartId1,
     *          fixedPartId2,
     *          slotPartId0,
     *          slotPartId1,
     *          slotPartId2
     *      ]
     *  ]
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token to retrieve the extended active assets for
     * @return ExtendedActiveAssets[] An array of ExtendedActiveAssets present on the given token
     */
    function getExtendedEquippableActiveAssets(
        address target,
        uint256 tokenId
    ) public view virtual returns (ExtendedEquippableActiveAsset[] memory) {
        IRMRKEquippable target_ = IRMRKEquippable(target);

        uint64[] memory assets = target_.getActiveAssets(tokenId);
        uint16[] memory priorities = target_.getActiveAssetPriorities(tokenId);
        uint256 len = assets.length;
        if (len == 0) {
            revert RMRKTokenHasNoAssets();
        }

        ExtendedEquippableActiveAsset[]
            memory activeAssets = new ExtendedEquippableActiveAsset[](len);

        for (uint256 i; i < len; ) {
            (
                string memory metadataURI,
                uint64 equippableGroupId,
                address catalogAddress,
                uint64[] memory partIds
            ) = target_.getAssetAndEquippableData(tokenId, assets[i]);
            activeAssets[i] = ExtendedEquippableActiveAsset({
                id: assets[i],
                equippableGroupId: equippableGroupId,
                priority: priorities[i],
                catalogAddress: catalogAddress,
                metadata: metadataURI,
                partIds: partIds
            });
            unchecked {
                ++i;
            }
        }
        return activeAssets;
    }

    /**
     * @notice Used to get the extended pending assets of the given token.
     * @dev The full `ExtendedPendingAsset` looks like this:
     *  [
     *      ID,
     *      equippableGroupId,
     *      acceptRejectIndex,
     *      replacesAssetWithId,
     *      catalogAddress,
     *      metadata,
     *      [
     *          fixedPartId0,
     *          fixedPartId1,
     *          fixedPartId2,
     *          slotPartId0,
     *          slotPartId1,
     *          slotPartId2
     *      ]
     *  ]
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token to retrieve the extended pending assets for
     * @return ExtendedPendingAssets[] An array of ExtendedPendingAssets present on the given token
     */
    function getExtendedPendingAssets(
        address target,
        uint256 tokenId
    ) public view virtual returns (ExtendedPendingAsset[] memory) {
        IRMRKEquippable target_ = IRMRKEquippable(target);

        uint64[] memory assets = target_.getPendingAssets(tokenId);
        uint256 len = assets.length;
        if (len == 0) {
            revert RMRKTokenHasNoAssets();
        }

        ExtendedPendingAsset[]
            memory pendingAssets = new ExtendedPendingAsset[](len);
        uint64 replacesAssetWithId;
        for (uint256 i; i < len; ) {
            (
                string memory metadataURI,
                uint64 equippableGroupId,
                address catalogAddress,
                uint64[] memory partIds
            ) = target_.getAssetAndEquippableData(tokenId, assets[i]);
            replacesAssetWithId = target_.getAssetReplacements(
                tokenId,
                assets[i]
            );
            pendingAssets[i] = ExtendedPendingAsset({
                id: assets[i],
                equippableGroupId: equippableGroupId,
                acceptRejectIndex: uint128(i),
                replacesAssetWithId: replacesAssetWithId,
                catalogAddress: catalogAddress,
                metadata: metadataURI,
                partIds: partIds
            });
            unchecked {
                ++i;
            }
        }
        return pendingAssets;
    }

    /**
     * @notice Used to retrieve the equipped parts of the given token.
     * @dev NOTE: Some of the equipped children might be empty.
     * @dev The full `Equipment` struct looks like this:
     *  [
     *      assetId,
     *      childAssetId,
     *      childId,
     *      childEquippableAddress
     *  ]
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token to retrieve the equipped items in the asset for
     * @param assetId ID of the asset being queried for equipped parts
     * @return slotPartIds An array of the IDs of the slot parts present in the given asset
     * @return childrenEquipped An array of `Equipment` structs containing info about the equipped children
     * @return childrenAssetMetadata An array of strings corresponding to asset metadata of the equipped children
     */
    function getEquipped(
        address target,
        uint64 tokenId,
        uint64 assetId
    )
        public
        view
        returns (
            uint64[] memory slotPartIds,
            IRMRKEquippable.Equipment[] memory childrenEquipped,
            string[] memory childrenAssetMetadata
        )
    {
        IRMRKEquippable target_ = IRMRKEquippable(target);

        (, , address catalogAddress, uint64[] memory partIds) = target_
            .getAssetAndEquippableData(tokenId, assetId);

        (slotPartIds, ) = _splitSlotAndFixedParts(partIds, catalogAddress);
        uint256 len = slotPartIds.length;

        childrenEquipped = new IRMRKEquippable.Equipment[](len);
        childrenAssetMetadata = new string[](len);

        for (uint256 i; i < len; ) {
            IRMRKEquippable.Equipment memory equipment = target_.getEquipment(
                tokenId,
                catalogAddress,
                slotPartIds[i]
            );
            if (equipment.assetId == assetId) {
                childrenEquipped[i] = equipment;
                childrenAssetMetadata[i] = IRMRKEquippable(
                    equipment.childEquippableAddress
                ).getAssetMetadata(equipment.childId, equipment.childAssetId);
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
     *      childAssetId,
     *      z,
     *      childAddress,
     *      childId,
     *      childAssetMetadata,
     *      partMetadata
     *  ]
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token to compose the equipped items in the asset for
     * @param assetId ID of the asset being queried for equipped parts
     * @return metadataURI Metadata URI of the asset
     * @return equippableGroupId Equippable group ID of the asset
     * @return catalogAddress Address of the catalog to which the asset belongs to
     * @return fixedParts An array of fixed parts respresented by the `FixedPart` structs present on the asset
     * @return slotParts An array of slot parts represented by the `EquippedSlotPart` structs present on the asset
     */
    function composeEquippables(
        address target,
        uint256 tokenId,
        uint64 assetId
    )
        public
        view
        returns (
            string memory metadataURI,
            uint64 equippableGroupId,
            address catalogAddress,
            FixedPart[] memory fixedParts,
            EquippedSlotPart[] memory slotParts
        )
    {
        IRMRKEquippable target_ = IRMRKEquippable(target);
        uint64[] memory partIds;

        // If token does not have uint64[] memory slotPartId to save the asset, it would fail here.
        (metadataURI, equippableGroupId, catalogAddress, partIds) = target_
            .getAssetAndEquippableData(tokenId, assetId);
        if (catalogAddress == address(0)) revert RMRKNotComposableAsset();

        (
            uint64[] memory slotPartIds,
            uint64[] memory fixedPartIds
        ) = _splitSlotAndFixedParts(partIds, catalogAddress);

        // Fixed parts:
        fixedParts = new FixedPart[](fixedPartIds.length);

        uint256 len = fixedPartIds.length;
        if (len != 0) {
            IRMRKCatalog.Part[] memory catalogFixedParts = IRMRKCatalog(
                catalogAddress
            ).getParts(fixedPartIds);
            for (uint256 i; i < len; ) {
                fixedParts[i] = FixedPart({
                    partId: fixedPartIds[i],
                    z: catalogFixedParts[i].z,
                    metadataURI: catalogFixedParts[i].metadataURI
                });
                unchecked {
                    ++i;
                }
            }
        }

        slotParts = _getEquippedSlotParts(
            target_,
            tokenId,
            assetId,
            catalogAddress,
            slotPartIds
        );
    }

    /**
     * @notice Used to get the child's assets and slot parts pairs, for which the child asset can be equipped into parent's slot part.
     * @dev The full `AssetWithSlot` struct looks like this:
     *  [
     *      assetId,
     *      slotPartId
     *  ]
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the child token whose assets will be matched against parent's slot parts
     * @param parentAssetId ID of the target parent asset to use to equip the child
     * @return assetsWithSlots An array of `AssetWithSlot` structs containing info about the equippable child assets and their corresponding slot parts
     */
    function getEquippableSlotsFromParent(
        address target,
        uint256 tokenId,
        uint64 parentAssetId
    ) public view returns (AssetWithSlot[] memory assetsWithSlots) {
        (
            address parentAddress,
            uint64[] memory parentSlotPartIds
        ) = _getParentAndSlotParts(target, tokenId, parentAssetId);

        IRMRKEquippable targetChild = IRMRKEquippable(target);
        uint64[] memory childAssets = targetChild.getActiveAssets(tokenId);
        uint256 totalChildAssets = childAssets.length;
        uint256 totalParentSlots = parentSlotPartIds.length;
        // There can be at most min(totalChildAssets, totalParentSlots) resulting matches, we just pick one of them.
        AssetWithSlot[] memory tempAssetsWithSlots = new AssetWithSlot[](
            totalParentSlots
        );
        uint256 totalMatches;

        for (uint256 i; i < totalChildAssets; ) {
            for (uint256 j; j < totalParentSlots; ) {
                if (
                    targetChild.canTokenBeEquippedWithAssetIntoSlot(
                        parentAddress,
                        tokenId,
                        childAssets[i],
                        parentSlotPartIds[j]
                    )
                ) {
                    tempAssetsWithSlots[totalMatches] = AssetWithSlot({
                        assetId: childAssets[i],
                        slotPartId: parentSlotPartIds[j]
                    });
                    unchecked {
                        ++totalMatches;
                    }
                }
                unchecked {
                    ++j;
                }
            }
            unchecked {
                ++i;
            }
        }

        // Finally, we copy the matches into the final array which has the right lenght according to results
        assetsWithSlots = new AssetWithSlot[](totalMatches);
        for (uint256 i; i < totalMatches; ) {
            assetsWithSlots[i] = tempAssetsWithSlots[i];
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Used to retrieve the equippable data of the specified token's asset with the highest priority.
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token for which to retrieve the equippable data of the asset with the highest priority
     * @return topAsset ExtendedEquippableActiveAsset struct with the equippable data for the the asset with the highest priority
     */
    function getTopAssetAndEquippableDataForToken(
        address target,
        uint256 tokenId
    ) public view returns (ExtendedEquippableActiveAsset memory topAsset) {
        (uint64 topAssetId, uint16 topPriority) = getAssetIdWithTopPriority(
            target,
            tokenId
        );
        (
            string memory metadataURI,
            uint64 equippableGroupId,
            address catalogAddress,
            uint64[] memory partIds
        ) = IRMRKEquippable(target).getAssetAndEquippableData(
                tokenId,
                topAssetId
            );
        topAsset = ExtendedEquippableActiveAsset({
            id: topAssetId,
            equippableGroupId: equippableGroupId,
            priority: topPriority,
            catalogAddress: catalogAddress,
            metadata: metadataURI,
            partIds: partIds
        });
    }

    /**
     * @notice Used to retrieve the parent address and is slot part ids for a given target child.
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the child token
     * @param parentAssetId ID of the parent asset from which to get the slot parts
     * @return parentAddress Address of the parent token owning the target child
     * @return parentSlotPartIds Array of slot part ids of the parent asset
     * @dev Reverts if the parent is not an NFT or if the parent asset is not composable.
     */
    function _getParentAndSlotParts(
        address target,
        uint256 tokenId,
        uint64 parentAssetId
    )
        private
        view
        returns (address parentAddress, uint64[] memory parentSlotPartIds)
    {
        uint256 parentId;
        bool isNFT;
        (parentAddress, parentId, isNFT) = IRMRKNestable(target).directOwnerOf(
            tokenId
        );
        if (!isNFT) revert RMRKParentIsNotNFT();

        (
            ,
            ,
            address catalogAddress,
            uint64[] memory parentPartIds
        ) = IRMRKEquippable(parentAddress).getAssetAndEquippableData(
                parentId,
                parentAssetId
            );
        if (catalogAddress == address(0)) revert RMRKNotComposableAsset();

        (parentSlotPartIds, ) = _splitSlotAndFixedParts(
            parentPartIds,
            catalogAddress
        );
    }

    /**
     * @notice Used to retrieve the equipped slot parts.
     * @dev The full `EquippedSlotPart` struct looks like this:
     *  [
     *      partId,
     *      childAssetId,
     *      z,
     *      childAddress,
     *      childId,
     *      childAssetMetadata,
     *      partMetadata
     *  ]
     * @param target_ An address of the `IRMRKEquippable` smart contract to retrieve the equipped slot parts from.
     * @param tokenId ID of the token for which to retrieve the equipped slot parts
     * @param assetId ID of the asset on the token to retrieve the equipped slot parts
     * @param catalogAddress The address of the catalog to which the given asset belongs to
     * @param slotPartIds An array of slot part IDs in the asset for which to retrieve the equipped slot parts
     * @return slotParts An array of `EquippedSlotPart` structs representing the equipped slot parts
     */
    function _getEquippedSlotParts(
        IRMRKEquippable target_,
        uint256 tokenId,
        uint64 assetId,
        address catalogAddress,
        uint64[] memory slotPartIds
    ) private view returns (EquippedSlotPart[] memory slotParts) {
        slotParts = new EquippedSlotPart[](slotPartIds.length);
        uint256 len = slotPartIds.length;

        // TODO: is this check really needed?
        if (len != 0) {
            string memory metadata;
            IRMRKCatalog.Part[] memory catalogSlotParts = IRMRKCatalog(
                catalogAddress
            ).getParts(slotPartIds);
            for (uint256 i; i < len; ) {
                IRMRKEquippable.Equipment memory equipment = target_
                    .getEquipment(tokenId, catalogAddress, slotPartIds[i]);
                if (equipment.assetId == assetId) {
                    metadata = IRMRKEquippable(equipment.childEquippableAddress)
                        .getAssetMetadata(
                            equipment.childId,
                            equipment.childAssetId
                        );
                    slotParts[i] = EquippedSlotPart({
                        partId: slotPartIds[i],
                        childAssetId: equipment.childAssetId,
                        z: catalogSlotParts[i].z,
                        childId: equipment.childId,
                        childAddress: equipment.childEquippableAddress,
                        childAssetMetadata: metadata,
                        partMetadata: catalogSlotParts[i].metadataURI
                    });
                } else {
                    slotParts[i] = EquippedSlotPart({
                        partId: slotPartIds[i],
                        childAssetId: uint64(0),
                        z: catalogSlotParts[i].z,
                        childId: uint256(0),
                        childAddress: address(0),
                        childAssetMetadata: "",
                        partMetadata: catalogSlotParts[i].metadataURI
                    });
                }
                unchecked {
                    ++i;
                }
            }
        }
    }

    /**
     * @notice Used to split slot and fixed parts.
     * @param allPartIds[] An array of `Part` IDs containing both, `Slot` and `Fixed` parts
     * @param catalogAddress An address of the catalog to which the given `Part`s belong to
     * @return slotPartIds An array of IDs of the `Slot` parts included in the `allPartIds`
     * @return fixedPartIds An array of IDs of the `Fixed` parts included in the `allPartIds`
     */
    function _splitSlotAndFixedParts(
        uint64[] memory allPartIds,
        address catalogAddress
    )
        public
        view
        returns (uint64[] memory slotPartIds, uint64[] memory fixedPartIds)
    {
        IRMRKCatalog.Part[] memory allParts = IRMRKCatalog(catalogAddress)
            .getParts(allPartIds);
        uint256 numFixedParts;
        uint256 numSlotParts;

        uint256 numParts = allPartIds.length;
        // This for loop is just to discover the right size of the split arrays, since we can't create them dynamically
        for (uint256 i; i < numParts; ) {
            if (allParts[i].itemType == IRMRKCatalog.ItemType.Fixed)
                numFixedParts += 1;
                // We could just take the numParts - numFixedParts, but it doesn't hurt to double check it's not an uninitialized part:
            else if (allParts[i].itemType == IRMRKCatalog.ItemType.Slot)
                numSlotParts += 1;
            unchecked {
                ++i;
            }
        }

        slotPartIds = new uint64[](numSlotParts);
        fixedPartIds = new uint64[](numFixedParts);
        uint256 slotPartsIndex;
        uint256 fixedPartsIndex;

        // This for loop is to actually fill the split arrays
        for (uint256 i; i < numParts; ) {
            if (allParts[i].itemType == IRMRKCatalog.ItemType.Fixed) {
                fixedPartIds[fixedPartsIndex] = allPartIds[i];
                fixedPartsIndex += 1;
            } else if (allParts[i].itemType == IRMRKCatalog.ItemType.Slot) {
                slotPartIds[slotPartsIndex] = allPartIds[i];
                slotPartsIndex += 1;
            }
            unchecked {
                ++i;
            }
        }
    }
}
