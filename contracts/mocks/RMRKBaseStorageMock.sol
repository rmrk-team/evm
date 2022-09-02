// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/RMRKBaseStorage.sol";

contract RMRKBaseStorageMock is RMRKBaseStorage {
    constructor(string memory symbol_, string memory type__)
        RMRKBaseStorage(symbol_, type__)
    {}

    function addPart(IntakeStruct calldata intakeStruct) external {
        _addPart(intakeStruct);
    }

    function addPartList(IntakeStruct[] calldata intakeStructs) external {
        _addPartList(intakeStructs);
    }

    function addEquippableAddresses(
        uint64 partId,
        address[] memory equippableAddresses
    ) external {
        _addEquippableAddresses(partId, equippableAddresses);
    }

    function setEquippableAddresses(
        uint64 partId,
        address[] memory equippableAddresses
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
