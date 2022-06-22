// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/access/RMRKIssuable.sol";
import "../RMRK/RMRKBaseStorage.sol";

contract RMRKBaseStorageMock is RMRKIssuable, RMRKBaseStorage {
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
