// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {OwnableLock} from "../RMRK/access/OwnableLock.sol";
import {RMRKCatalog} from "../RMRK/catalog/RMRKCatalog.sol";

/**
 * @title RMRKCatalogImpl
 * @author RMRK team
 * @notice Implementation of RMRK catalog.
 * @dev Contract for storing 'catalog' elements of NFTs to be accessed by instances of RMRKAsset implementing contracts.
 *  This default implementation includes an OwnableLock dependency, which allows the deployer to freeze the state of the
 *  catalog contract.
 */
contract RMRKCatalogImpl is OwnableLock, RMRKCatalog {
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
     * @notice Used to initialize the smart contract.
     * @param metadataURI Base metadata URI of the contract
     * @param type_ The type of the catalog
     */
    constructor(
        string memory metadataURI,
        string memory type_
    ) RMRKCatalog(metadataURI, type_) {}

    /**
     * @notice Used to add a single `Part` to storage.
     * @dev The full `IntakeStruct` looks like this:
     *  [
     *          partID,
     *      [
     *          itemType,
     *          z,
     *          [
     *               permittedCollectionAddress0,
     *               permittedCollectionAddress1,
     *               permittedCollectionAddress2
     *           ],
     *           metadataURI
     *       ]
     *   ]
     * @param intakeStruct `IntakeStruct` struct consisting of `partId` and a nested `Part` struct
     */
    function addPart(
        IntakeStruct memory intakeStruct
    ) public virtual onlyOwnerOrContributor notLocked {
        _addPart(intakeStruct);
    }

    /**
     * @notice Used to add multiple `Part`s to storage.
     * @dev The full `IntakeStruct` looks like this:
     *  [
     *          partID,
     *      [
     *          itemType,
     *          z,
     *          [
     *               permittedCollectionAddress0,
     *               permittedCollectionAddress1,
     *               permittedCollectionAddress2
     *           ],
     *           metadataURI
     *       ]
     *   ]
     * @param intakeStructs[] An array of `IntakeStruct` structs consisting of `partId` and a nested `Part` struct
     */
    function addPartList(
        IntakeStruct[] memory intakeStructs
    ) public virtual onlyOwnerOrContributor notLocked {
        _addPartList(intakeStructs);
    }

    /**
     * @notice Used to add multiple `equippableAddresses` to a single catalog entry.
     * @dev Can only be called on `Part`s of `Slot` type.
     * @param partId ID of the `Part` that we are adding the equippable addresses to
     * @param equippableAddresses An array of addresses that can be equipped into the `Part` associated with the `partId`
     */
    function addEquippableAddresses(
        uint64 partId,
        address[] memory equippableAddresses
    ) public virtual onlyOwnerOrContributor {
        _addEquippableAddresses(partId, equippableAddresses);
    }

    /**
     * @notice Function used to set the new list of `equippableAddresses`.
     * @dev Overwrites existing `equippableAddresses`.
     * @dev Can only be called on `Part`s of `Slot` type.
     * @param partId ID of the `Part`s that we are overwiting the `equippableAddresses` for
     * @param equippableAddresses A full array of addresses that can be equipped into this `Part`
     */
    function setEquippableAddresses(
        uint64 partId,
        address[] memory equippableAddresses
    ) public virtual onlyOwnerOrContributor {
        _setEquippableAddresses(partId, equippableAddresses);
    }

    /**
     * @notice Sets the isEquippableToAll flag to true, meaning that any collection may be equipped into the `Part` with
     *  this `partId`.
     * @dev Can only be called on `Part`s of `Slot` type.
     * @param partId ID of the `Part` that we are setting as equippable by any address
     */
    function setEquippableToAll(
        uint64 partId
    ) public virtual onlyOwnerOrContributor {
        _setEquippableToAll(partId);
    }

    /**
     * @notice Used to remove all of the `equippableAddresses` for a `Part` associated with the `partId`.
     * @dev Can only be called on `Part`s of `Slot` type.
     * @param partId ID of the part that we are clearing the `equippableAddresses` from
     */
    function resetEquippableAddresses(
        uint64 partId
    ) public virtual onlyOwnerOrContributor {
        _resetEquippableAddresses(partId);
    }

    /**
     * @notice Used to get all the part IDs in the catalog.
     * @dev Can get at least 10k parts. Higher limits were not tested.
     * @dev It may fail if there are too many parts, in that case use either `getPaginatedPartIds` or `getTotalParts` and `getPartByIndex`.
     * @return partIds An array of all the part IDs in the catalog
     */
    function getAllPartIds() public view returns (uint64[] memory partIds) {
        partIds = _partIds;
    }

    /**
     * @notice Used to get all the part IDs in the catalog.
     * @param offset The offset to start from
     * @param limit The maximum number of parts to return
     * @return partIds An array of all the part IDs in the catalog
     */
    function getPaginatedPartIds(
        uint256 offset,
        uint256 limit
    ) public view returns (uint64[] memory partIds) {
        if (offset >= _partIds.length) limit = 0; // Could revert but UI would have to handle it
        if (offset + limit > _partIds.length) limit = _partIds.length - offset;
        partIds = new uint64[](limit);
        for (uint256 i; i < limit; ) {
            partIds[i] = _partIds[offset + i];
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Used to get the total number of parts in the catalog.
     * @return totalParts The total number of parts in the catalog
     */
    function getTotalParts() public view returns (uint256 totalParts) {
        totalParts = _partIds.length;
    }

    /**
     * @notice Used to get a single `Part` by the index of its `partId`.
     * @param index The index of the `partId`.
     * @return part The `Part` struct associated with the `partId` at the given index
     */
    function getPartByIndex(
        uint256 index
    ) public view returns (Part memory part) {
        part = getPart(_partIds[index]);
    }

    function setMetadataURI(
        string memory newContractURI
    ) public virtual onlyOwnerOrContributor {
        _setMetadataURI(newContractURI);
        emit ContractURIUpdated();
    }

    function setType(
        string memory newType
    ) public virtual onlyOwnerOrContributor {
        _setType(newType);
        emit TypeUpdated(newType);
    }
}
