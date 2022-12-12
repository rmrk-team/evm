// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../../RMRK/extension/tokenProperties/IRMRKTokenProperties.sol";

/**
 * @title RMRKTokenProperties
 * @author RMRK team
 * @notice Smart contract of the RMRK Token properties module.
 */
contract RMRKTokenPropertiesMock is IRMRKTokenProperties {

    mapping(string => uint256) private _keysToIds;
    uint256 private _totalProperties = 0;

    mapping(string => uint256) private _stringValuesToIds;
    mapping(uint256 => mapping(uint256 => string)) private _stringValues;

    mapping(uint256 => mapping(uint256 => address)) private _addressValues;
    mapping(uint256 => mapping(uint256 => bytes)) private _bytesValues;
    mapping(uint256 => mapping(uint256 => uint256)) private _uintValues;
    mapping(uint256 => mapping(uint256 => bool)) private _boolValues;

    /**
    * @notice Used to retrieve the string type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return string The value of the string property
     */
    function getStringTokenProperty(uint256 tokenId, string memory key) external view returns (string memory) {
        return _stringValues[tokenId][_keysToIds[key]];
    }

    /**
     * @notice Used to retrieve the uint type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return uint256 The value of the uint property
     */
    function getUintTokenProperty(uint256 tokenId, string memory key) external view returns (uint256) {
        return _uintValues[tokenId][_keysToIds[key]];
    }

    /**
     * @notice Used to retrieve the bool type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return bool The value of the bool property
     */
    function getBoolTokenProperty(uint256 tokenId, string memory key) external view returns (bool) {
        return _boolValues[tokenId][_keysToIds[key]];
    }

    /**
     * @notice Used to retrieve the address type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return address The value of the address property
     */
    function getAddressTokenProperty(uint256 tokenId, string memory key) external view returns (address) {
        return _addressValues[tokenId][_keysToIds[key]];
    }

    /**
     * @notice Used to retrieve the bytes type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return bytes The value of the bytes property
     */
    function getBytesTokenProperty(uint256 tokenId, string memory key) external view returns (bytes memory) {
        return _bytesValues[tokenId][_keysToIds[key]];
    }

    /**
     * @notice Used to set a number property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setUintProperty(uint256 tokenId, string memory key, uint256 value) external {
        _uintValues[tokenId][_getIdForKey(key)] = value;
    }

    /**
    * @notice Used to set a string property.
    * @param tokenId The token ID
    * @param key The property key
    * @param value The property value
    */
    function setStringProperty(uint256 tokenId, string memory key, string memory value) external {

        if (_stringValuesToIds[value] == 0 && _keysToIds[key] == 0) {
            _keysToIds[key] = _totalProperties;
            _stringValues[tokenId][_keysToIds[key]] = value;
            _stringValuesToIds[value] = _totalProperties;
            _totalProperties++;
        }
        else {
            //prevents storing duplicate string values and keys
            if (_stringValuesToIds[value] > 0 && _keysToIds[key] == 0) {
                _keysToIds[key] = _stringValuesToIds[value];
            }
            else {
                _stringValuesToIds[value] = _keysToIds[key];
            }
        }
    }

    /**
     * @notice Used to set a boolean property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setBoolProperty(uint256 tokenId, string memory key, bool value) external {
        _boolValues[tokenId][_getIdForKey(key)] = value;
    }

    /**
     * @notice Used to set an bytes property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setBytesProperty(uint256 tokenId, string memory key, bytes memory value) external {
        _bytesValues[tokenId][_getIdForKey(key)] = value;
    }

    /**
    * @notice Used to set an address property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setAddressProperty(uint256 tokenId, string memory key, address value) external {
        _addressValues[tokenId][_getIdForKey(key)] = value;
    }

    function _getIdForKey(string memory key) internal returns (uint256) {
        if (_keysToIds[key] == 0) {
            _totalProperties++;
            _keysToIds[key] = _totalProperties;
            return _totalProperties;
        }
        else {
            return _keysToIds[key];
        }
    }

    /**
    * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return interfaceId == type(IRMRKTokenProperties).interfaceId || interfaceId == type(IERC165).interfaceId;
    }

}
