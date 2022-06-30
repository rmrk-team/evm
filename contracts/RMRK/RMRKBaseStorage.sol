// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./interfaces/IRMRKBaseStorage.sol";
import "@openzeppelin/contracts/utils/Address.sol";
//import "hardhat/console.sol";

error RMRKPartAlreadyExists();
error RMRKPartDoesNotExist();
error RMRKPartIsNotSlot();
error RMRKZeroLengthIdsPassed();

contract RMRKBaseStorage is IRMRKBaseStorage {
    using Address for address;
    /*
    REVIEW NOTES:

    This contract represents an initial working implementation for a representation of a single RMRK base.

    In its current implementation, the single base struct is overloaded to handle both fixed and slot-style
    assets. This implementation is simple but inefficient, as each stores a complete string representation.
    of each asset. Future implementations may want to include a mapping of common prefixes / suffixes and
    getters that recompose these assets on the fly.

    IntakeStruct currently requires the user to pass an id of type uint64 as an identifier. Other options
    include computing the id on-chain as a hash of attributes of the struct, or a simple incrementer. Passing
    an ID or an incrementer will likely be the cheapest in terms of gas cost.

    FIXME: This is not true at the moment:
    In its current implementation, all base asset entries MUST be passed via an array during contract construction.
    This is the only way to ensure contract immutability after deployment, though due to the gas costs of RMRK
    base assets it is highly recommended that developers are offered a commit > freeze pattern, by which developers
    are allowed multiple commits until a 'freeze' function is called, after which the base contract is no
    longer mutable.

    */


    //uint64 is sort of arbitrary here--resource IDs in RMRK substrate are uint64 for reference
    mapping(uint64 => Part) private _parts;
    mapping(uint64 => bool) private _isEquippableToAll;

    uint64[] private _partIds;

    string private _symbol;
    string private _type;

    event AddedEquippables(uint64 partId, address[] equippableAddresses);
    event SetEquippables(uint64 partId, address[] equippableAddresses);
    event SetEquippableToAll(uint64 partId);

    //Inquire about using an index instead of hashed ID to prevent any chance of collision
    //Consider moving to interface
    struct IntakeStruct {
        uint64 partId;
        Part part;
    }

    //Consider merkel tree for equippables validation?

    /**
    FIXME: This is not true at the moment:
    @dev Part items are only settable during contract deployment (with one exception, see addEquippableIds).
    * This may need to be changed for contracts which would reach the block gas limit.
    */

    constructor(string memory symbol_, string memory type__) {
        _symbol = symbol_;
        _type = type__;
    }

    function symbol() external view returns(string memory) {
        return _symbol;
    }

    function type_() external view returns(string memory) {
        return _type;
    }

    /**
    @dev Private function for handling an array of base item inputs. Takes an array of type IntakeStruct.
    */

    function _addPartList(IntakeStruct[] memory partIntake) internal {
        uint len = partIntake.length;
        for (uint256 i = 0; i < len;) {
            _addPart(partIntake[i]);
            unchecked {++i;}
        }
    }

    /**
    @dev Private function which writes base item entries to storage. partIntake takes the form of a struct containing
    * a uint64 identifier and a base struct object.
    */

    function _addPart(IntakeStruct memory partIntake) internal {
        if(_parts[partIntake.partId].itemType != ItemType.None)
            revert RMRKPartAlreadyExists();
        _parts[partIntake.partId] = partIntake.part;
        _partIds.push(partIntake.partId);
    }

    /**
    @dev Public function which adds a number of equippableAddresses to a single base entry. Only accessible by the contract
    * deployer or transferred Issuer, designated by the modifier onlyIssuer as per the inherited contract issuerControl.
    */

    function _addEquippableAddresses(
        uint64 partId,
        address[] memory equippableAddresses
    ) internal {
        if(equippableAddresses.length <= 0)
            revert RMRKZeroLengthIdsPassed();
        if(_parts[partId].itemType == ItemType.None)
            revert RMRKPartDoesNotExist();
        uint256 len = equippableAddresses.length;
        for (uint i; i<len;) {
            _parts[partId].equippable.push(equippableAddresses[i]);
            unchecked {++i;}
        }
        _isEquippableToAll[partId] = false;

        emit AddedEquippables(partId, equippableAddresses);
    }

    function _setEquippableAddresses(
        uint64 partId,
        address[] memory equippableAddresses
    ) internal {
        if(equippableAddresses.length <= 0)
            revert RMRKZeroLengthIdsPassed();
        if(_parts[partId].itemType == ItemType.None)
            revert RMRKPartDoesNotExist();
        _parts[partId].equippable = equippableAddresses;
        _isEquippableToAll[partId] = false;

        emit SetEquippables(partId, equippableAddresses);
    }

    function _resetEquippableAddresses( uint64 partId ) internal {
        if(_parts[partId].itemType == ItemType.None)
            revert RMRKPartDoesNotExist();
        delete _parts[partId].equippable;
        _isEquippableToAll[partId] = false;

        emit SetEquippables(partId, new address[](0));
    }

    /**
    @dev Public function which adds a single equippableId to every base item.
    * Handle this function with care, this function can be extremely gas-expensive. Only accessible by the contract
    * deployer or transferred Issuer, designated by the modifier onlyIssuer as per the inherited contract issuerControl.
    */

    function _setEquippableToAll(uint64 partId) internal {
        if(_parts[partId].itemType == ItemType.None)
            revert RMRKPartDoesNotExist();

        _isEquippableToAll[partId] = true;
        emit SetEquippableToAll(partId);
    }

    function checkIsEquippable(uint64 partId, address targetAddress) public view returns (bool isEquippable) {
        // If this is equippable to all, we're good
        isEquippable = _isEquippableToAll[partId];

        // Otherwise, must check against each of the equippable for the part
        if (!isEquippable && _parts[partId].itemType == ItemType.Slot) {
            address[] memory equippable = _parts[partId].equippable;
            uint256 len = equippable.length;
            for (uint256 i = 0; i < len;) {
                if (targetAddress == equippable[i]) {
                    isEquippable = true;
                    break;
                }
                unchecked {++i;}
            }
        }
    }

    /**
    @dev Getter for a single base part.
    */

    function getPart(uint64 partId) external view returns (Part memory) {
        return (_parts[partId]);
    }

    /**
    @dev Getter for multiple base item entries.
    */

    function getParts(uint64[] calldata partIds)
        external
        view
        returns (Part[] memory)
    {
        uint256 numParts = partIds.length;
        Part[] memory parts = new Part[](numParts);

        for(uint i; i<numParts;) {
            uint64 partId = partIds[i];
            parts[i] = _parts[partId];
            unchecked { ++i; }
        }

        return parts;
    }
}
