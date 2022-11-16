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
 * @dev Extra utility functions for composing RMRK extended assets.
 */
contract RMRKEquipRenderUtils {
    using RMRKLib for uint64[];

    /**
     * @notice The structure used to display a full information of an active asset.
     * @return id ID of the asset
     * @return equppableGroupId ID of the equippable group this asset belongs to
     * @return priority Priority of the asset in the active assets array it belongs to
     * @return baseAddress Address of the `Base` smart contract this asset belongs to
     * @return metadata Metadata URI of the asset
     * @return fixedParts An array of IDs of fixed parts present in the asset
     * @return slotParts An array of IDs of slot parts present in the asset
     */
    struct ExtendedActiveAsset {
        uint64 id;
        uint64 equippableGroupId;
        uint16 priority;
        address baseAddress;
        string metadata;
        uint64[] fixedParts;
        uint64[] slotParts;
    }

    /**
     * @notice The structure used to display a full information of a pending asset.
     * @return id ID of the asset
     * @return equppableGroupId ID of the equippable group this asset belongs to
     * @return acceptRejectIndex The index of the given asset in the pending assets array it belongs to
     * @return overwritesAssetWithId ID of the asset the given asset will overwrite if accepted
     * @return baseAddress Address of the `Base` smart contract this asset belongs to
     * @return metadata Metadata URI of the asset
     * @return fixedParts An array of IDs of fixed parts present in the asset
     * @return slotParts An array of IDs of slot parts present in the asset
     */
    struct ExtendedPendingAsset {
        uint64 id;
        uint64 equippableGroupId;
        uint128 acceptRejectIndex;
        uint64 overwritesAssetWithId;
        address baseAddress;
        string metadata;
        uint64[] fixedParts;
        uint64[] slotParts;
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
     * @notice Used to get extended active assets of the given token.
     * @dev The full `ExtendedActiveAsset` looks like this:
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
     * @param tokenId ID of the token to retrieve the extended active assets for
     * @return sturct[] An array of ExtendedActiveAssets present on the given token
     */
    function getExtendedActiveAssets(address target, uint256 tokenId)
        public
        view
        virtual
        returns (ExtendedActiveAsset[] memory)
    {
        IRMRKEquippable target_ = IRMRKEquippable(target);

        uint64[] memory assets = target_.getActiveAssets(tokenId);
        uint16[] memory priorities = target_.getActiveAssetPriorities(tokenId);
        uint256 len = assets.length;
        if (len == 0) {
            revert RMRKTokenHasNoAssets();
        }

        ExtendedActiveAsset[] memory activeAssets = new ExtendedActiveAsset[](
            len
        );

        for (uint256 i; i < len; ) {
            (
                string memory metadataURI,
                uint64 equippableGroupId,
                address baseAddress,
                uint64[] memory fixedPartIds,
                uint64[] memory slotPartIds
            ) = target_.getExtendedAsset(tokenId, assets[i]);
            activeAssets[i] = ExtendedActiveAsset({
                id: assets[i],
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
        return activeAssets;
    }

    /**
     * @notice Used to get the extended pending assets of the given token.
     * @dev The full `ExtendedPendingAsset` looks like this:
     *  [
     *      ID,
     *      equippableGroupId,
     *      acceptRejectIndex,
     *      overwritesAssetWithId,
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
     * @param tokenId ID of the token to retrieve the extended pending assets for
     * @return sturct[] An array of ExtendedPendingAssets present on the given token
     */
    function getExtendedPendingAssets(address target, uint256 tokenId)
        public
        view
        virtual
        returns (ExtendedPendingAsset[] memory)
    {
        IRMRKEquippable target_ = IRMRKEquippable(target);

        uint64[] memory assets = target_.getPendingAssets(tokenId);
        uint256 len = assets.length;
        if (len == 0) {
            revert RMRKTokenHasNoAssets();
        }

        ExtendedPendingAsset[]
            memory pendingAssets = new ExtendedPendingAsset[](len);
        uint64 overwritesAssetWithId;
        for (uint256 i; i < len; ) {
            (
                string memory metadataURI,
                uint64 equippableGroupId,
                address baseAddress,
                uint64[] memory fixedPartIds,
                uint64[] memory slotPartIds
            ) = target_.getExtendedAsset(tokenId, assets[i]);
            overwritesAssetWithId = target_.getAssetOverwrites(
                tokenId,
                assets[i]
            );
            pendingAssets[i] = ExtendedPendingAsset({
                id: assets[i],
                equippableGroupId: equippableGroupId,
                acceptRejectIndex: uint128(i),
                overwritesAssetWithId: overwritesAssetWithId,
                baseAddress: baseAddress,
                metadata: metadataURI,
                fixedParts: fixedPartIds,
                slotParts: slotPartIds
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
     * @return slotParts An array of the IDs of the slot parts present in the given asset
     * @return childrenEquipped An array of `Equipment` structs containing info about the equipped children
     */
    function getEquipped(
        address target,
        uint64 tokenId,
        uint64 assetId
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
            .getExtendedAsset(tokenId, assetId);

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
            if (equipment.assetId == assetId) {
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
     * @return baseAddress Address of the base to which the asset belongs to
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
            address baseAddress,
            IRMRKEquippable.FixedPart[] memory fixedParts,
            EquippedSlotPart[] memory slotParts
        )
    {
        IRMRKEquippable target_ = IRMRKEquippable(target);
        uint64[] memory fixedPartIds;
        uint64[] memory slotPartIds;

        // If token does not have uint64[] memory slotPartId to save the asset, it would fail here.
        (
            metadataURI,
            equippableGroupId,
            baseAddress,
            fixedPartIds,
            slotPartIds
        ) = target_.getExtendedAsset(tokenId, assetId);
        if (baseAddress == address(0)) revert RMRKNotComposableAsset();

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
            assetId,
            baseAddress,
            slotPartIds
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
     * @param baseAddress The address of the base to which the given asset belongs to
     * @param slotPartIds An array of slot part IDs in the asset for which to retrieve the equipped slot parts
     * @return slotParts An array of `EquippedSlotPart` structs representing the equipped slot parts
     */
    function getEquippedSlotParts(
        IRMRKEquippable target_,
        uint256 tokenId,
        uint64 assetId,
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
                if (equipment.assetId == assetId) {
                    metadata = IRMRKEquippable(equipment.childEquippableAddress)
                        .getAssetMetadata(
                            equipment.childId,
                            equipment.childAssetId
                        );
                    slotParts[i] = EquippedSlotPart({
                        partId: slotPartIds[i],
                        childAssetId: equipment.childAssetId,
                        z: baseSlotParts[i].z,
                        childId: equipment.childId,
                        childAddress: equipment.childEquippableAddress,
                        childAssetMetadata: metadata,
                        partMetadata: baseSlotParts[i].metadataURI
                    });
                } else {
                    slotParts[i] = EquippedSlotPart({
                        partId: slotPartIds[i],
                        childAssetId: uint64(0),
                        z: baseSlotParts[i].z,
                        childId: uint256(0),
                        childAddress: address(0),
                        childAssetMetadata: "",
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
