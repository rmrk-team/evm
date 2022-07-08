// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/RMRKBaseStorage.sol";
import "../RMRK/access/OwnableLock.sol";

contract RMRKBaseStorageImpl is OwnableLock, RMRKBaseStorage {
    constructor(string memory symbol_, string memory type__)
    RMRKBaseStorage(symbol_, type__) {}

    function addPart(IntakeStruct memory intakeStruct) external onlyOwner notLocked {
        _addPart(intakeStruct);
    }

    function addPartList(IntakeStruct[] memory intakeStructs) external onlyOwner notLocked {
        _addPartList(intakeStructs);
    }

    function addEquippableAddresses(
        uint64 partId,
        address[] memory equippableAddresses
    ) external onlyOwner {
        _addEquippableAddresses(partId, equippableAddresses);
    }

    function setEquippableAddresses(
        uint64 partId,
        address[] memory equippableAddresses
    ) external onlyOwner {
        _setEquippableAddresses(partId, equippableAddresses);
    }

    function setEquippableToAll(uint64 partId) external onlyOwner {
        _setEquippableToAll(partId);
    }

    function resetEquippableAddresses(uint64 partId) external onlyOwner {
        _resetEquippableAddresses(partId);
    }

}
