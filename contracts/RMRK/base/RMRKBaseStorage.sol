// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./IRMRKBaseStorage.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../library/RMRKErrors.sol";

/**
 * @title RMRKBaseStorage
 * @author RMRK team
 * @notice Base storage contract for RMRK equippable module.
 */
contract RMRKBaseStorage is IRMRKBaseStorage {
    using Address for address;

    /**
     * @dev Mapping of uint64 `partId` to IRMRKBaseStorage `Part` struct
     */
    mapping(uint64 => Part) private _parts;

    /**
     * @dev Mapping of uint64 `partId` to boolean flag, indicating that a given `Part` can be equippable by any address
     */
    mapping(uint64 => bool) private _isEquippableToAll;

    uint64[] private _partIds;

    string private _metadataURI;
    string private _type;

    constructor(string memory metadataURI, string memory type_) {
        _metadataURI = metadataURI;
        _type = type_;
    }

    /**
     * @notice Used to limit execution of functions intended for the `Slot` parts to only execute when used with such
     *  parts.
     * @dev Reverts execution of a function if the part with associated `partId` is uninitailized or is `Fixed`.
     * @param partId ID of the part that we want the function to interact with
     */
    modifier onlySlot(uint64 partId) {
        _onlySlot(partId);
        _;
    }

    function _onlySlot(uint64 partId) private view {
        ItemType itemType = _parts[partId].itemType;
        if (itemType == ItemType.None) revert RMRKPartDoesNotExist();
        if (itemType == ItemType.Fixed) revert RMRKPartIsNotSlot();
    }

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        returns (bool)
    {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IRMRKBaseStorage).interfaceId;
    }

    /**
     * @notice Used to return the metadata URI of the associated base.
     * @return string Base metadata URI
     */
    function getMetadataURI() external view returns (string memory) {
        return _metadataURI;
    }

    /**
     * @notice Used to return the `itemType` of the associated base
     * @return string `itemType` of the associated base
     */
    function getType() external view returns (string memory) {
        return _type;
    }

    /**
     * @dev Internal helper function that adds `Part` entries to storage.
     * @dev Delegates to { _addPart } below.
     * @param partIntake An array of `IntakeStruct` structs, consisting of `partId` and a nested `Part` struct
     */
    function _addPartList(IntakeStruct[] calldata partIntake) internal {
        uint256 len = partIntake.length;
        for (uint256 i; i < len; ) {
            _addPart(partIntake[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Internal function that adds a single `Part` to storage.
     * @param partIntake `IntakeStruct` struct consisting of `partId` and a nested `Part` struct
     *
     */
    function _addPart(IntakeStruct calldata partIntake) internal {
        uint64 partId = partIntake.partId;
        Part memory part = partIntake.part;

        if (partId == uint64(0)) revert RMRKIdZeroForbidden();
        if (_parts[partId].itemType != ItemType.None)
            revert RMRKPartAlreadyExists();
        if (part.itemType == ItemType.None) revert RMRKBadConfig();
        if (part.itemType == ItemType.Fixed && part.equippable.length != 0)
            revert RMRKBadConfig();

        _parts[partId] = part;
        _partIds.push(partId);

        emit AddedPart(
            partId,
            part.itemType,
            part.z,
            part.equippable,
            part.metadataURI
        );
    }

    /**
     * @dev Internal function used to add multiple `equippableAddresses` to a single base entry.
     * @dev Can only be called on `Slot` type of `Part`s.
     * @param partId ID of the `Part` that we are adding the equippable addresses to
     * @param equippableAddresses An array of addresses that can be equipped into the `Part` associated with the `partId`
     */
    function _addEquippableAddresses(
        uint64 partId,
        address[] memory equippableAddresses
    ) internal onlySlot(partId) {
        if (equippableAddresses.length <= 0) revert RMRKZeroLengthIdsPassed();

        uint256 len = equippableAddresses.length;
        for (uint256 i; i < len; ) {
            _parts[partId].equippable.push(equippableAddresses[i]);
            unchecked {
                ++i;
            }
        }
        delete _isEquippableToAll[partId];

        emit AddedEquippables(partId, equippableAddresses);
    }

    /**
     * @dev Internal function used to set the new list of `equippableAddresses`.
     * @dev Overwrites existing `equippableAddresses`.
     * @dev Can only be called on `Slot` type of `Part`s.
     * @param partId ID of the `Part`s that we are overwiting the `equippableAddresses` for
     * @param equippableAddresses A full array of addresses that can be equipped into this `Part`
     */
    function _setEquippableAddresses(
        uint64 partId,
        address[] memory equippableAddresses
    ) internal onlySlot(partId) {
        if (equippableAddresses.length <= 0) revert RMRKZeroLengthIdsPassed();
        _parts[partId].equippable = equippableAddresses;
        delete _isEquippableToAll[partId];

        emit SetEquippables(partId, equippableAddresses);
    }

    /**
     * @dev Internal function used to remove all of the `equippableAddresses` for a `Part` associated with the `partId`.
     * @dev Can only be called on `Slot` type of `Part`s.
     * @param partId ID of the part that we are clearing the `equippableAddresses` from
     */
    function _resetEquippableAddresses(uint64 partId)
        internal
        onlySlot(partId)
    {
        delete _parts[partId].equippable;
        delete _isEquippableToAll[partId];

        emit SetEquippables(partId, new address[](0));
    }

    /**
     * @dev Sets the isEquippableToAll flag to true, meaning that any collection may be equipped into the `Part` with this
     *  `partId`.
     * @dev Can only be called on `Slot` type of `Part`s.
     * @param partId ID of the `Part` that we are setting as equippable by any address
     */
    function _setEquippableToAll(uint64 partId) internal onlySlot(partId) {
        _isEquippableToAll[partId] = true;
        emit SetEquippableToAll(partId);
    }

    /**
     * @notice Used to check if the part is equippable by all addresses.
     * @dev Returns true if part is equippable to all.
     * @param partId ID of the part that we are checking
     * @return bool The status indicating whether the part with `partId` can be equipped by any address or not
     */
    function checkIsEquippableToAll(uint64 partId) public view returns (bool) {
        return _isEquippableToAll[partId];
    }

    /**
     * @notice Used to check whether the given address is allowed to equip the desired `Part`
     * @dev Returns true if a collection may equip asset with `partId`.
     * @param partId The ID of the part that we are checking
     * @param targetAddress The address that we are checking for whether the part can be equipped into it or not
     * @return bool The status indicating whether the `targetAddress` can be equipped into `Part` with `partId` or not
     */
    function checkIsEquippable(uint64 partId, address targetAddress)
        public
        view
        returns (bool)
    {
        // If this is equippable to all, we're good
        bool isEquippable = _isEquippableToAll[partId];

        // Otherwise, must check against each of the equippable for the part
        if (!isEquippable && _parts[partId].itemType == ItemType.Slot) {
            address[] memory equippable = _parts[partId].equippable;
            uint256 len = equippable.length;
            for (uint256 i; i < len; ) {
                if (targetAddress == equippable[i]) {
                    isEquippable = true;
                    break;
                }
                unchecked {
                    ++i;
                }
            }
        }
        return isEquippable;
    }

    /**
     * @notice Used to retrieve a `Part` with id `partId`
     * @param partId ID of the part that we are retrieving
     * @return struct The `Part` struct associated with given `partId`
     */
    function getPart(uint64 partId) public view returns (Part memory) {
        return (_parts[partId]);
    }

    /**
     * @notice Used to retrieve multiple parts at the same time.
     * @param partIds An array of part IDs that we want to retrieve
     * @return struct An array of `Part` structs associated with given `partIds`
     */
    function getParts(uint64[] calldata partIds)
        public
        view
        returns (Part[] memory)
    {
        uint256 numParts = partIds.length;
        Part[] memory parts = new Part[](numParts);

        for (uint256 i; i < numParts; ) {
            uint64 partId = partIds[i];
            parts[i] = _parts[partId];
            unchecked {
                ++i;
            }
        }

        return parts;
    }
}
