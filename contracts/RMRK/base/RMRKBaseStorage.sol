// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./IRMRKBaseStorage.sol";
import "@openzeppelin/contracts/utils/Address.sol";
// import "hardhat/console.sol";

error RMRKBadConfig();
error RMRKIdZeroForbidden();
error RMRKPartAlreadyExists();
error RMRKPartDoesNotExist();
error RMRKPartIsNotSlot();
error RMRKZeroLengthIdsPassed();

/**
 * @dev Base storage contract for RMRK equippable module.
 */
contract RMRKBaseStorage is IRMRKBaseStorage {
    using Address for address;

    /**
     * @dev Mapping of uint64 partId to IRMRKBaseStorage Part struct
     */
    mapping(uint64 => Part) private _parts;

    /**
     * @dev Mapping of uint64 partId to flag to set partd to be equippable by any
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
     * @dev Throws if the partId is uninitailized or is Fixed.
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
     * @dev See {IERC165-supportsInterface}.
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
     * @dev Returns symbol of associated collection
     * @return string base contract symbol
     */
    function getMetadataURI() external view returns (string memory) {
        return _metadataURI;
    }

    /**
     * @dev Returns type of data of associated base
     * @return string data type
     */
    function getType() external view returns (string memory) {
        return _type;
    }

    /**
     * @dev Private helper function which writes n base item entries to storage.
     * Delegates to { _addPart } below.
     * @param partIntake array of structs of type IntakeStruct, which consists of partId and a nested part struct.
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
     * @dev Private function which writes a single base item entry to storage.
     * @param partIntake struct of type IntakeStruct, which consists of partId and a nested part struct.
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
     * @dev Function which adds a number of equippableAddresses to a single base entry.
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
     * @dev Public function which sets a number of equippableAddresses, overwrites existing addresses.
     *
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
     * @dev Public function which removes all equippableAddresses for a partId.
     *
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
     * @dev Sets the isEquippableToAll flag to true, meaning that any collection may equip this partId.
     */
    function _setEquippableToAll(uint64 partId) internal onlySlot(partId) {
        _isEquippableToAll[partId] = true;
        emit SetEquippableToAll(partId);
    }

    /**
     * @dev Returns true if part is equippable to all.
     */
    function checkIsEquippableToAll(uint64 partId) public view returns (bool) {
        return _isEquippableToAll[partId];
    }

    /**
     * @dev Returns true if a collection may equip resource with partId.
     */
    function checkIsEquippable(uint64 partId, address targetAddress)
        public
        view
        returns (bool isEquippable)
    {
        // If this is equippable to all, we're good
        isEquippable = _isEquippableToAll[partId];

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
    }

    /**
    @dev Getter for a single base part.
    */
    function getPart(uint64 partId) public view returns (Part memory) {
        return (_parts[partId]);
    }

    /**
    @dev Getter for multiple base item entries.
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
