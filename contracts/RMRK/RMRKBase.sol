// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "./access/AccessControl.sol";

contract RMRKBase is AccessControl {
    /*
  REVIEW NOTES:

  This contract represents an initial working implementation for a representation of a single RMRK base.

  In its current implementation, the single base struct is overloaded to handle both fixed and slot-style
  assets. This implementation is simple but inefficient, as each stores a complete string representation.
  of each asset. Future implementations may want to include a mapping of common prefixes / suffixes and
  getters that recompose these assets on the fly.

  IntakeStruct currently requires the user to pass an id of type bytes8 as an identifier. Other options
  include computing the id on-chain as a hash of attributes of the struct, or a simple incrementer. Passing
  an ID or an incrementer will likely be the cheapest in terms of gas cost.

  In its current implementation, all base asset entries MUST be passed via an array during contract construction.
  This is the only way to ensure contract immutability after deployment, though due to the gas costs of RMRK
  base assets it is hightly recommended that developers are offered a commit > freeze pattern, by which developers
  are allowed multiple commits until a 'freeze' function is called, after which the base contract is no
  longer mutable.

  */

    //bytes8 is sort of arbitrary here--resource IDs in RMRK substrate are bytes8 for reference
    mapping(bytes8 => Base) private bases;

    bytes8[] private baseIds;

    bytes32 public constant issuer = keccak256("ISSUER");

    enum ItemType {
        Slot,
        Fixed
    }

    event AddedEquippablesToEntry(bytes8 baseId, bytes8[] equippableIds);
    event AddedEquippableToAll(bytes8 equippableId);

    //Inquire about using an index instead of hashed ID to prevent any chance of collision
    struct IntakeStruct {
        bytes8 id;
        Base base;
    }

    //Consider merkel tree for equippables array if stuff gets crazy

    /**
  @dev Base struct for a standard RMRK base item. Requires a minimum of 3 storage slots per base item,
  * equivalent to roughly 60,000 gas as of Berlin hard fork (April 14, 2021), though 5-7 storage slots
  * is more realistic, given the standard length of an IPFS URI. This will result in between 25,000,000
  * and 35,000,000 gas per 250 resources--the maximum block size of ETH mainnet is 30M at peak usage.
  */

    struct Base {
        ItemType itemType; //1 byte
        uint8 z; //1 byte
        bool exists; //1 byte
        bytes8[] equippableIds; //n bytes 32+
        string src; //n bytes 32+
        string fallbackSrc; //n bytes 32+
    }

    /**
  @dev Base items are only settable during contract deployment (with one exception, see addEquippableIds).
  * This may need to be changed for contracts which would reach the block gas limit.
  */

    constructor(IntakeStruct[] memory intakeStruct) {
        _grantRole(issuer, msg.sender);
        _setRoleAdmin(issuer, issuer);
        addBaseEntryList(intakeStruct);
    }

    /**
  @dev Private function for handling an array of base item inputs. Takes an array of type IntakeStruct.
  */

    function addBaseEntryList(IntakeStruct[] memory intakeStruct) private {
        for (uint256 i = 0; i < intakeStruct.length; i++) {
            addBaseEntry(intakeStruct[i]);
        }
    }

    /**
  @dev Private function which writes base item entries to storage. intakeStruct takes the form of a struct containing
  * a bytes8 identifier and a base struct object.
  */

    function addBaseEntry(IntakeStruct memory intakeStruct) private {
        require(!bases[intakeStruct.id].exists, "Base already exists");
        intakeStruct.base.exists = true; //enforce exists, can swap to require if need be.
        bases[intakeStruct.id] = intakeStruct.base;
        baseIds.push(intakeStruct.id);
    }

    /**
  @dev Public function which adds a number of equippableIds to a single base entry. Only accessible by the contract
  * deployer or transferred Issuer, designated by the modifier onlyIssuer as per the inherited contract issuerControl.
  */

    function addEquippableIds(
        bytes8 _baseEntryid,
        bytes8[] memory _equippableIds
    ) public onlyRole(issuer) {
        require(_equippableIds.length > 0, "RMRK: Zero-length ids passed.");
        require(bases[_baseEntryid].exists, "RMRK: Base entry does not exist.");
        bases[_baseEntryid].equippableIds = _equippableIds;
        emit AddedEquippablesToEntry(_baseEntryid, _equippableIds);
    }

    /**
  @dev Public function which adds a single equippableId to every base item.
  * Handle this function with care, this function can be extremely gas-expensive. Only accessible by the contract
  * deployer or transferred Issuer, designated by the modifier onlyIssuer as per the inherited contract issuerControl.
  */

    function addEquippableIdToAll(bytes8 _equippableId)
        public
        onlyRole(issuer)
    {
        for (uint256 i = 0; i < baseIds.length; i++) {
            bytes8 baseId_ = baseIds[i];
            if (bases[baseId_].itemType == ItemType.Slot) {
                bases[baseId_].equippableIds.push(_equippableId);
            }
        }
        emit AddedEquippableToAll(_equippableId);
    }

    /**
  @dev Getter for a single base item entry.
  */

    function getBaseEntry(bytes8 _id) external view returns (Base memory) {
        return (bases[_id]);
    }

    /**
  @dev Getter for multiple base item entries.
  */

    function getBaseEntries(bytes8[] calldata _ids)
        external
        view
        returns (Base[] memory)
    {
        Base[] memory baseEntries;
        for (uint256 i = 0; i < _ids.length; i++) {
            baseEntries[i] = bases[_ids[i]];
        }
        return baseEntries;
    }
}
