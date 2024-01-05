// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IRMRKCatalog} from "../catalog/IRMRKCatalog.sol";
import {IERC6220} from "../equippable/IERC6220.sol";
import {IERC5773} from "../multiasset/IERC5773.sol";
import {IERC7401} from "../nestable/IERC7401.sol";
import {RMRKLib} from "../library/RMRKLib.sol";
import "../library/RMRKErrors.sol";

/**
 * @title RMRKCatalogUtils
 * @author RMRK team
 * @notice Smart contract of the RMRK Catalog utils module.
 * @dev Extra utility functions for RMRK contracts.
 */
contract RMRKCatalogUtils {
    using RMRKLib for uint64[];

    /**
     * @notice Used to store the core structure of the `Equippable` RMRK lego.
     * @return parentAssetId The ID of the parent asset equipping a child
     * @return slotId The ID of the slot part
     * @return childAddress Address of the collection to which the child asset belongs to
     * @return childId The ID of token that is equipped
     * @return childAssetId The ID of the asset used as equipment
     */
    struct ExtendedEquipment {
        uint64 parentAssetId;
        uint64 slotId;
        address childAddress;
        uint256 childId;
        uint64 childAssetId;
    }

    /**
     * @notice Structure used to represent the extended part data.
     * @return partId The part ID
     * @return itemType The item type
     * @return z The z index
     * @return equippable The array of equippable IDs
     * @return equippableToAll Whether the part is equippable to all, that is, any NFT can be equipped into it.
     * @return metadataURI The metadata URI
     */
    struct ExtendedPart {
        uint64 partId;
        IRMRKCatalog.ItemType itemType;
        uint8 z;
        address[] equippable;
        bool equippableToAll;
        string metadataURI;
    }

    /**
     * @notice Used to get the catalog data of a specified catalog in a single call.
     * @dev The owner might be address 0 if the catalog does not implement the `Ownable` interface.
     * @param catalog Address of the catalog to get the data from
     * @return owner The address of the owner of the catalog
     * @return type_ The type of the catalog
     * @return metadataURI The metadata URI of the catalog
     */
    function getCatalogData(
        address catalog
    )
        public
        view
        returns (address owner, string memory type_, string memory metadataURI)
    {
        IRMRKCatalog target = IRMRKCatalog(catalog);

        type_ = target.getType();
        metadataURI = target.getMetadataURI();

        try Ownable(catalog).owner() returns (address catalogOwner) {
            owner = catalogOwner;
        } catch {}
    }

    /**
     * @notice Used to get the extended part data of many parts from the specified catalog in a single call.
     * @param catalog Address of the catalog to get the data from
     * @param partIds Array of part IDs to get the data from
     * @return parts Array of extended part data structs containing the part data
     */
    function getExtendedParts(
        address catalog,
        uint64[] memory partIds
    ) public view returns (ExtendedPart[] memory parts) {
        uint256 length = partIds.length;
        IRMRKCatalog target = IRMRKCatalog(catalog);
        parts = new ExtendedPart[](length);
        for (uint256 i = 0; i < length; ) {
            uint64 partId = partIds[i];
            bool isEquippableToAll = target.checkIsEquippableToAll(partId);
            IRMRKCatalog.Part memory part = target.getPart(partId);
            parts[i] = ExtendedPart({
                partId: partId,
                itemType: part.itemType,
                z: part.z,
                equippable: part.equippable,
                equippableToAll: isEquippableToAll,
                metadataURI: part.metadataURI
            });
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Used to get the catalog data and the extended part data of many parts from the specified catalog in a single call.
     * @param catalog Address of the catalog to get the data from
     * @param partIds Array of part IDs to get the data from
     * @return owner The address of the owner of the catalog
     * @return type_ The type of the catalog
     * @return metadataURI The metadata URI of the catalog
     * @return parts Array of extended part data structs containing the part data
     */
    function getCatalogDataAndExtendedParts(
        address catalog,
        uint64[] memory partIds
    )
        public
        view
        returns (
            address owner,
            string memory type_,
            string memory metadataURI,
            ExtendedPart[] memory parts
        )
    {
        (owner, type_, metadataURI) = getCatalogData(catalog);
        parts = getExtendedParts(catalog, partIds);
    }

    /**
     * @notice Used to get data about children equipped to a specified token, where the parent asset has been replaced.
     * @param parentAddress Address of the collection smart contract of parent token
     * @param parentId ID of the parent token
     * @param catalogAddress Address of the catalog the slot part Ids belong to
     * @param slotPartIds Array of slot part IDs of the parent token's assets to search for orphan equipments
     * @return equipments Array of extended equipment data structs containing the equipment data, including the slot part ID
     */
    function getOrphanEquipmentsFromParentAsset(
        address parentAddress,
        uint256 parentId,
        address catalogAddress,
        uint64[] memory slotPartIds
    ) public view returns (ExtendedEquipment[] memory equipments) {
        uint256 length = slotPartIds.length;
        ExtendedEquipment[] memory tempEquipments = new ExtendedEquipment[](
            length
        );
        uint64[] memory parentAssetIds = IERC5773(parentAddress)
            .getActiveAssets(parentId);
        uint256 orphansFound;

        for (uint256 i; i < length; ) {
            uint64 slotPartId = slotPartIds[i];
            IERC6220.Equipment memory equipment = IERC6220(parentAddress)
                .getEquipment(parentId, catalogAddress, slotPartId);
            if (equipment.assetId != 0) {
                (, bool assetFound) = parentAssetIds.indexOf(equipment.assetId);
                if (!assetFound) {
                    tempEquipments[orphansFound] = ExtendedEquipment({
                        parentAssetId: equipment.assetId,
                        slotId: slotPartId,
                        childAddress: equipment.childEquippableAddress,
                        childId: equipment.childId,
                        childAssetId: equipment.childAssetId
                    });
                    unchecked {
                        ++orphansFound;
                    }
                }
            }
            unchecked {
                ++i;
            }
        }

        equipments = new ExtendedEquipment[](orphansFound);
        for (uint256 i; i < orphansFound; ) {
            equipments[i] = tempEquipments[i];
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Used to get data about children equipped to a specified token, where the child asset has been replaced.
     * @param parentAddress Address of the collection smart contract of parent token
     * @param parentId ID of the parent token
     * @return equipments Array of extended equipment data structs containing the equipment data, including the slot part ID
     */
    function getOrphanEquipmentsFromChildAsset(
        address parentAddress,
        uint256 parentId
    ) public view returns (ExtendedEquipment[] memory equipments) {
        uint64[] memory parentAssetIds = IERC5773(parentAddress)
            .getActiveAssets(parentId);

        // In practice, there could be more equips than children, but this is a decent approximate since the real number cannot be known, also we do not expect a lot of orphans
        uint256 totalChildren = IERC7401(parentAddress)
            .childrenOf(parentId)
            .length;
        ExtendedEquipment[] memory tempEquipments = new ExtendedEquipment[](
            totalChildren
        );
        uint256 orphansFound;

        uint256 totalParentAssets = parentAssetIds.length;
        for (uint256 i; i < totalParentAssets; ) {
            (
                uint64[] memory parentSlotPartIds,
                address catalogAddress
            ) = getSlotPartsAndCatalog(
                    parentAddress,
                    parentId,
                    parentAssetIds[i]
                );
            uint256 totalSlots = parentSlotPartIds.length;
            for (uint256 j; j < totalSlots; ) {
                IERC6220.Equipment memory equipment = IERC6220(parentAddress)
                    .getEquipment(
                        parentId,
                        catalogAddress,
                        parentSlotPartIds[j]
                    );
                if (equipment.assetId != 0) {
                    uint64[] memory childAssetIds = IERC5773(
                        equipment.childEquippableAddress
                    ).getActiveAssets(equipment.childId);
                    (, bool assetFound) = childAssetIds.indexOf(
                        equipment.childAssetId
                    );
                    if (!assetFound) {
                        tempEquipments[orphansFound] = ExtendedEquipment({
                            parentAssetId: equipment.assetId,
                            slotId: parentSlotPartIds[j],
                            childAddress: equipment.childEquippableAddress,
                            childId: equipment.childId,
                            childAssetId: equipment.childAssetId
                        });
                        unchecked {
                            ++orphansFound;
                        }
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

        equipments = new ExtendedEquipment[](orphansFound);
        for (uint256 i; i < orphansFound; ) {
            equipments[i] = tempEquipments[i];
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Used to retrieve the parent address and its slot part IDs for a given target child, and the catalog of the parent asset.
     * @param tokenAddress Address of the collection smart contract of parent token
     * @param tokenId ID of the parent token
     * @param assetId ID of the parent asset from which to get the slot parts
     * @return parentSlotPartIds Array of slot part IDs of the parent token's asset
     * @return catalogAddress Address of the catalog the parent asset belongs to
     */
    function getSlotPartsAndCatalog(
        address tokenAddress,
        uint256 tokenId,
        uint64 assetId
    )
        public
        view
        returns (uint64[] memory parentSlotPartIds, address catalogAddress)
    {
        uint64[] memory parentPartIds;
        (, , catalogAddress, parentPartIds) = IERC6220(tokenAddress)
            .getAssetAndEquippableData(tokenId, assetId);
        if (catalogAddress == address(0)) revert RMRKNotComposableAsset();

        (parentSlotPartIds, ) = splitSlotAndFixedParts(
            parentPartIds,
            catalogAddress
        );
    }

    /**
     * @notice Used to split slot and fixed parts.
     * @param allPartIds[] An array of `Part` IDs containing both, `Slot` and `Fixed` parts
     * @param catalogAddress An address of the catalog to which the given `Part`s belong to
     * @return slotPartIds An array of IDs of the `Slot` parts included in the `allPartIds`
     * @return fixedPartIds An array of IDs of the `Fixed` parts included in the `allPartIds`
     */
    function splitSlotAndFixedParts(
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
                unchecked {
                    ++fixedPartsIndex;
                }
            } else if (allParts[i].itemType == IRMRKCatalog.ItemType.Slot) {
                slotPartIds[slotPartsIndex] = allPartIds[i];
                unchecked {
                    ++slotPartsIndex;
                }
            }
            unchecked {
                ++i;
            }
        }
    }
}
