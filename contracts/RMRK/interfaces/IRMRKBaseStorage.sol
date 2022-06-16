// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

interface IRMRKBaseStorage {

  enum ItemType {
      None,
      Slot,
      Fixed
  }

  /**
  @dev Base struct for a standard RMRK base item. Requires a minimum of 3 storage slots per base item,
  * equivalent to roughly 60,000 gas as of Berlin hard fork (April 14, 2021), though 5-7 storage slots
  * is more realistic, given the standard length of an IPFS URI. This will result in between 25,000,000
  * and 35,000,000 gas per 250 resources--the maximum block size of ETH mainnet is 30M at peak usage.
  */

  struct Base {
      ItemType itemType; //1 byte
      uint8 z; //1 byte
      address[] equippable; //n bytes 32+
      string src; //n bytes 32+
      string fallbackSrc; //n bytes 32+
  }

  function checkIsEquippable(bytes8 baseId, address targetAddress) external view returns (bool);

}
