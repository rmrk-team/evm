// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "./access/AccessControl.sol";
import "./utils/Address.sol";

contract RMRKBaseStorage is AccessControl {
  using Address for address;
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
    mapping(bytes8 => mapping(address => bool)) private isEquippable;

    bytes8[] private baseIds;

    bytes32 public constant issuer = keccak256("ISSUER");

    //TODO: Make private
    string public name;

    enum ItemType {
        Slot,
        Fixed
    }

    event AddedEquippablesToEntry(bytes8 baseId, address[] equippableAddresses);
    event AddedEquippableToAll(address equippableAddress);

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
        address[] equippable; //n bytes 32+
        string src; //n bytes 32+
        string fallbackSrc; //n bytes 32+
    }

    /**
  @dev Base items are only settable during contract deployment (with one exception, see addequippableAddresses).
  * This may need to be changed for contracts which would reach the block gas limit.
  */

    constructor(string memory _name) {
        _grantRole(issuer, msg.sender);
        _setRoleAdmin(issuer, issuer);
        name = _name;
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
  @dev Public function which adds a number of equippableAddresses to a single base entry. Only accessible by the contract
  * deployer or transferred Issuer, designated by the modifier onlyIssuer as per the inherited contract issuerControl.
  */

    function addEquippableAddresses(
        bytes8 _baseId,
        address[] memory _equippableAddresses
    ) public onlyRole(issuer) {
        require(_equippableAddresses.length > 0, "RMRK: Zero-length ids passed.");
        require(bases[_baseId].exists, "RMRK: Base entry does not exist.");
        for (uint256 i = 0; i < _equippableAddresses.length;) {
            if (bases[_baseId].itemType == ItemType.Slot) {
                isEquippable[_baseId][_equippableAddresses[i]] = true;
            }
            unchecked {++i;}
        }
        emit AddedEquippablesToEntry(_baseId, _equippableAddresses);
    }

    /**
  @dev Public function which adds a single equippableId to every base item.
  * Handle this function with care, this function can be extremely gas-expensive. Only accessible by the contract
  * deployer or transferred Issuer, designated by the modifier onlyIssuer as per the inherited contract issuerControl.
  */

    function addEquippableIdToAll(address _equippableAddress)
        public
        onlyRole(issuer)
    {
        for (uint256 i = 0; i < baseIds.length;) {
            bytes8 baseId_ = baseIds[i];
            if (bases[baseId_].itemType == ItemType.Slot) {
                isEquippable[baseId_][_equippableAddress] = true;
            }
            unchecked {++i;}
        }
        emit AddedEquippableToAll(_equippableAddress);
    }

    /**
  @dev Getter for a single base item entry.
  */

    function getBaseEntry(bytes8 _id) external view returns (Base memory) {
        if(msg.sender.isContract()) {
          require(isEquippable[_id][msg.sender], "RMRK Equippable: read not whitelisted");
        }
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
        bool isContract;
        Base[] memory baseEntries;
        for (uint256 i = 0; i < _ids.length;) {
            if(isContract) {
              require(isEquippable[_ids[i]][msg.sender], "RMRK Equippable: read not whitelisted");
            }
            baseEntries[i] = bases[_ids[i]];
            unchecked {++i;}
        }
        return baseEntries;
    }
}
