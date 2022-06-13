// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

interface IRMRKBaseStorage {

  enum ItemType {
      Slot,
      Fixed
  }

  struct Base {
      ItemType itemType; //1 byte
      uint8 z; //1 byte
      bool exists; //1 byte
      address[] equippable; //n bytes 32+
      string src; //n bytes 32+
      string fallbackSrc; //n bytes 32+
  }

  function checkIsEquippable(bytes8 baseId, address targetAddress) external view returns (bool);

}
