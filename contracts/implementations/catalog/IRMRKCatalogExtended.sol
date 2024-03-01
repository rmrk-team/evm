// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {IRMRKCatalog} from "../../RMRK/catalog/IRMRKCatalog.sol";

/**
 * @title IRMRKCatalogExtended
 * @author RMRK team
 * @notice An extended interface for Catalog for RMRK equippable module.
 */
interface IRMRKCatalogExtended is IRMRKCatalog {
    /**
     * @notice From ERC7572 (Draft) Emitted when the contract-level metadata is updated
     */
    event ContractURIUpdated();

    /**
     * @notice Emited when the type of the catalog is updated
     * @param newType The new type of the catalog
     */
    event TypeUpdated(string newType);

    /**
     * @notice Used to get all the part IDs in the catalog.
     * @dev Can get at least 10k parts. Higher limits were not tested.
     * @dev It may fail if there are too many parts, in that case use either `getPaginatedPartIds` or `getTotalParts` and `getPartByIndex`.
     * @return partIds An array of all the part IDs in the catalog
     */
    function getAllPartIds() external view returns (uint64[] memory partIds);

    /**
     * @notice Used to get all the part IDs in the catalog.
     * @param offset The offset to start from
     * @param limit The maximum number of parts to return
     * @return partIds An array of all the part IDs in the catalog
     */
    function getPaginatedPartIds(
        uint256 offset,
        uint256 limit
    ) external view returns (uint64[] memory partIds);

    /**
     * @notice Used to get the total number of parts in the catalog.
     * @return totalParts The total number of parts in the catalog
     */
    function getTotalParts() external view returns (uint256 totalParts);

    /**
     * @notice Used to get a single `Part` by the index of its `partId`.
     * @param index The index of the `partId`.
     * @return part The `Part` struct associated with the `partId` at the given index
     */
    function getPartByIndex(
        uint256 index
    ) external view returns (Part memory part);

    /**
     * @notice Used to set the metadata URI of the catalog.
     * @param newContractURI The new metadata URI
     * @dev emits `ContractURIUpdated` event
     */
    function setMetadataURI(string memory newContractURI) external;

    /**
     * @notice Used to set the type of the catalog.
     * @param newType The new type of the catalog
     * @dev emits `TypeUpdated` event
     */
    function setType(string memory newType) external;
}
