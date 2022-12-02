// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/access/OwnableLock.sol";
import "../RMRK/base/RMRKBaseStorage.sol";

/**
 * @title RMRKBaseStorageImpl
 * @author RMRK team
 * @notice Implementation of RMRK base storage.
 * @dev Contract for storing 'base' elements of NFTs to be accessed by instances of RMRKAsset implementing contracts.
 *  This default implementation includes an OwnableLock dependency, which allows the deployer to freeze the state of the
 *  base contract.
 */
contract RMRKBaseStorageImpl is OwnableLock, RMRKBaseStorage {
    constructor(
        string memory metadataURI,
        string memory type_
    ) RMRKBaseStorage(metadataURI, type_) {}

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
        IntakeStruct calldata intakeStruct
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
        IntakeStruct[] calldata intakeStructs
    ) public virtual onlyOwnerOrContributor notLocked {
        _addPartList(intakeStructs);
    }

    /**
     * @notice Used to add multiple `equippableAddresses` to a single base entry.
     * @dev Can only be called on `Part`s of `Slot` type.
     * @param partId ID of the `Part` that we are adding the equippable addresses to
     * @param equippableAddresses An array of addresses that can be equipped into the `Part` associated with the `partId`
     */
    function addEquippableAddresses(
        uint64 partId,
        address[] calldata equippableAddresses
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
        address[] calldata equippableAddresses
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
}
