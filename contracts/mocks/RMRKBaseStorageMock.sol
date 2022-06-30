// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/access/RMRKIssuable.sol";
import "../RMRK/RMRKBaseStorage.sol";

contract RMRKBaseStorageMock is RMRKIssuable, RMRKBaseStorage {
    constructor(string memory symbol_, string memory type__)
    RMRKBaseStorage(symbol_, type__) {}

    function addPart(IntakeStruct memory intakeStruct) external onlyIssuer {
        _addPart(intakeStruct);
    }

    function addPartList(IntakeStruct[] memory intakeStructs) external onlyIssuer {
        _addPartList(intakeStructs);
    }

    function addEquippableAddresses(
        uint64 partId,
        address[] memory equippableAddresses
    ) external onlyIssuer {
        _addEquippableAddresses(partId, equippableAddresses);
    }

    function setEquippableAddresses(
        uint64 partId,
        address[] memory equippableAddresses
    ) external onlyIssuer {
        _setEquippableAddresses(partId, equippableAddresses);
    }

    function setEquippableToAll(uint64 partId) external onlyIssuer {
        _setEquippableToAll(partId);
    }

    function resetEquippableAddresses(uint64 partId) external onlyIssuer {
        _resetEquippableAddresses(partId);
    }

}
