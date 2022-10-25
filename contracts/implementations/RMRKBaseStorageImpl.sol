// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/access/OwnableLock.sol";
import "../RMRK/base/RMRKBaseStorage.sol";

/**
 * @dev Contract for storing 'base' elements of NFTs to be accessed
 * by instances of RMRKResource implementing contracts. This default
 * implementation includes an OwnableLock dependency, which allows
 * the deployer to freeze the state of the base contract.
 *
 * In addition, this implementation treats the base registry as an
 * append-only ledger, so
 */

contract RMRKBaseStorageImpl is OwnableLock, RMRKBaseStorage {
    constructor(string memory metadataURI, string memory type_)
        RMRKBaseStorage(metadataURI, type_)
    {}

    function addPart(IntakeStruct calldata intakeStruct)
        external
        onlyOwnerOrContributor
        notLocked
    {
        _addPart(intakeStruct);
    }

    function addPartList(IntakeStruct[] calldata intakeStructs)
        external
        onlyOwnerOrContributor
        notLocked
    {
        _addPartList(intakeStructs);
    }

    function addEquippableAddresses(
        uint64 partId,
        address[] memory equippableAddresses
    ) external onlyOwnerOrContributor {
        _addEquippableAddresses(partId, equippableAddresses);
    }

    function setEquippableAddresses(
        uint64 partId,
        address[] memory equippableAddresses
    ) external onlyOwnerOrContributor {
        _setEquippableAddresses(partId, equippableAddresses);
    }

    function setEquippableToAll(uint64 partId) external onlyOwnerOrContributor {
        _setEquippableToAll(partId);
    }

    function resetEquippableAddresses(uint64 partId)
        external
        onlyOwnerOrContributor
    {
        _resetEquippableAddresses(partId);
    }
}
