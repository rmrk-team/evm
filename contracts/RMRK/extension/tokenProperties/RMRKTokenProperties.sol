// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./IRMRKTokenProperties.sol";

/**
 * @title RMRKTokenProperties
 * @author RMRK team
 * @notice Smart contract of the RMRK Token properties module.
 */
abstract contract RMRKTokenProperties is IRMRKTokenProperties {
    // For keys, we use a mapping from strings to Ids.
    // The purpose is to store unique string keys only once, since they are more expensive,
    mapping(string => uint256) private _keysToIds;
    uint256 private _totalProperties;

    // For strings, we also use a mapping from strings to Ids, together with a reverse mapping
    // The purpose is to store unique string values only once, since they are more expensive,
    // and storing only ids.
    uint256 private _totalStringValues;
    mapping(string => uint256) private _stringValueToId;
    mapping(uint256 => string) private _stringIdToValue;
    mapping(uint256 => mapping(uint256 => uint256)) private _stringValueIds;

    mapping(uint256 => mapping(uint256 => address)) private _addressValues;
    mapping(uint256 => mapping(uint256 => bytes)) private _bytesValues;
    mapping(uint256 => mapping(uint256 => uint256)) private _uintValues;
    mapping(uint256 => mapping(uint256 => bool)) private _boolValues;

    /**
     * @inheritdoc IRMRKTokenProperties
     */
    function getStringTokenProperty(
        uint256 tokenId,
        string memory key
    ) external view returns (string memory) {
        uint256 idForValue = _stringValueIds[tokenId][_keysToIds[key]];
        return _stringIdToValue[idForValue];
    }

    /**
     * @inheritdoc IRMRKTokenProperties
     */
    function getUintTokenProperty(
        uint256 tokenId,
        string memory key
    ) external view returns (uint256) {
        return _uintValues[tokenId][_keysToIds[key]];
    }

    /**
     * @inheritdoc IRMRKTokenProperties
     */
    function getBoolTokenProperty(
        uint256 tokenId,
        string memory key
    ) external view returns (bool) {
        return _boolValues[tokenId][_keysToIds[key]];
    }

    /**
     * @inheritdoc IRMRKTokenProperties
     */
    function getAddressTokenProperty(
        uint256 tokenId,
        string memory key
    ) external view returns (address) {
        return _addressValues[tokenId][_keysToIds[key]];
    }

    /**
     * @inheritdoc IRMRKTokenProperties
     */
    function getBytesTokenProperty(
        uint256 tokenId,
        string memory key
    ) external view returns (bytes memory) {
        return _bytesValues[tokenId][_keysToIds[key]];
    }

    /**
     * @notice Used to set a number property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function _setUintProperty(
        uint256 tokenId,
        string memory key,
        uint256 value
    ) internal {
        _uintValues[tokenId][_getIdForKey(key)] = value;
    }

    /**
     * @notice Used to set a string property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function _setStringProperty(
        uint256 tokenId,
        string memory key,
        string memory value
    ) internal {
        _stringValueIds[tokenId][_getIdForKey(key)] = _getStringIdForValue(
            value
        );
    }

    /**
     * @notice Used to set a boolean property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function _setBoolProperty(
        uint256 tokenId,
        string memory key,
        bool value
    ) internal {
        _boolValues[tokenId][_getIdForKey(key)] = value;
    }

    /**
     * @notice Used to set an bytes property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function _setBytesProperty(
        uint256 tokenId,
        string memory key,
        bytes memory value
    ) internal {
        _bytesValues[tokenId][_getIdForKey(key)] = value;
    }

    /**
     * @notice Used to set an address property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function _setAddressProperty(
        uint256 tokenId,
        string memory key,
        address value
    ) internal {
        _addressValues[tokenId][_getIdForKey(key)] = value;
    }

    /**
     * @notice Used to get the Id for a key. If the key does not exist, a new Id is created.
     *  Ids are shared among all tokens and types
     * @param key The property key
     * @return uint256 The id for the key
     */
    function _getIdForKey(string memory key) internal returns (uint256) {
        if (_keysToIds[key] == 0) {
            _totalProperties++;
            _keysToIds[key] = _totalProperties;
            return _totalProperties;
        } else {
            return _keysToIds[key];
        }
    }

    /**
     * @notice Used to get the Id for a string value. If the value does not exist, a new Id is created.
     *  Ids are shared among all tokens and used only for strings.
     * @param value The property value
     * @return uint256 The id for the value
     */
    function _getStringIdForValue(
        string memory value
    ) internal returns (uint256) {
        if (_stringValueToId[value] == 0) {
            _totalStringValues++;
            _stringValueToId[value] = _totalStringValues;
            _stringIdToValue[_totalStringValues] = value;
            return _totalStringValues;
        } else {
            return _stringValueToId[value];
        }
    }

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == type(IRMRKTokenProperties).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
