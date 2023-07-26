// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "../RMRK/catalog/RMRKCatalog.sol";

contract RMRKCatalogMock is RMRKCatalog {
    constructor(
        string memory metadataURI,
        string memory type_
    ) RMRKCatalog(metadataURI, type_) {}

    function addPart(IntakeStruct calldata intakeStruct) external {
        _addPart(intakeStruct);
    }

    function addPartList(IntakeStruct[] calldata intakeStructs) external {
        _addPartList(intakeStructs);
    }

    function addEquippableAddresses(
        uint64 partId,
        address[] calldata equippableAddresses
    ) external {
        _addEquippableAddresses(partId, equippableAddresses);
    }

    function setEquippableAddresses(
        uint64 partId,
        address[] calldata equippableAddresses
    ) external {
        _setEquippableAddresses(partId, equippableAddresses);
    }

    function setEquippableToAll(uint64 partId) external {
        _setEquippableToAll(partId);
    }

    function resetEquippableAddresses(uint64 partId) external {
        _resetEquippableAddresses(partId);
    }
}
