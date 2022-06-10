// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "../RMRK/RMRKBaseStorage.sol";

contract RMRKBaseStorageMock is RMRKBaseStorage {
  constructor(string memory _baseName)
  RMRKBaseStorage(_baseName)
  {}

  function addBaseEntry(IntakeStruct memory intakeStruct) public {
    _addBaseEntry(intakeStruct);
  }

  function addBaseEntryList(IntakeStruct[] memory intakeStructs) public {
    _addBaseEntryList(intakeStructs);
  }
}
