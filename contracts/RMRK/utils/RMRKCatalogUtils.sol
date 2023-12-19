// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IRMRKCatalog} from "../catalog/IRMRKCatalog.sol";

/**
 * @title RMRKCatalogUtils
 * @author RMRK team
 * @notice Smart contract of the RMRK Catalog utils module.
 * @dev Extra utility functions for RMRK contracts.
 */
contract RMRKCatalogUtils {
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
}
