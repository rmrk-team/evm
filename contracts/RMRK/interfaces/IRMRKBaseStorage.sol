// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

interface IRMRKBaseStorage {

  /**
  * @dev emitted when one or more addresses are added for equippable status for partId.
  */
  event AddedEquippables(uint64 partId, address[] equippableAddresses);

  /**
  * @dev emitted when one or more addresses are whitelisted for equippable status for partId.
  * Overwrites previous equippable addresses.
  */
  event SetEquippables(uint64 partId, address[] equippableAddresses);

  /**
  * @dev emitted when a partId is flagged as equippable by any.
  */
  event SetEquippableToAll(uint64 partId);

  /**
  * @dev Item type enum for fixed and slot parts.
  */
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

  struct Part {
      ItemType itemType; //1 byte
      uint8 z; //1 byte
      address[] equippable; //n Collections that can be equipped into this slot
      string metadataURI; //n bytes 32+
  }

  /**
  * @dev Returns true if the part at partId is equippable by targetAddress.
  *
  * Requirements: None
  */
  function checkIsEquippable(uint64 partId, address targetAddress) external view returns (bool);

  /**
  * @dev Returns true if the part at partId is equippable by all addresses.
  *
  * Requirements: None
  */
  function checkIsEquippableToAll(uint64 partId) external view returns (bool);

  /**
  * @dev Returns the part object at reference partId.
  *
  * Requirements: None
  */
  function getPart(uint64 partId) external view returns (Part memory);

  /**
  * @dev Returns the part objects at reference partIds.
  * 
  * Requirements: None
  */
  function getParts(uint64[] calldata partIds) external view returns (Part[] memory);

}
