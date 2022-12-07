// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./IRMRKTokenProperties.sol";

/**
 * @title RMRKTokenProperties
 * @author RMRK team
 * @notice Smart contract of the RMRK Token properties module.
 */
contract RMRKTokenProperties is IRMRKTokenProperties {

    mapping(uint256 => mapping(string => string)) private _stringProperties;
    mapping(uint256 => mapping(string => address)) private _addressProperties;
    mapping(uint256 => mapping(string => bytes)) private _bytesProperties;
    mapping(uint256 => mapping(string => uint256)) private _uintProperties;
    mapping(uint256 => mapping(string => bool)) private _boolProperties;

    /**
    * @notice Used to retrieve the string type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return string The value of the string property
     */
    function getStringTokenProperty(uint256 tokenId, string memory key) external view returns (string memory) {
        return _stringProperties[tokenId][key];
    }

    /**
     * @notice Used to retrieve the uint type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return uint256 The value of the uint property
     */
    function getUintTokenProperty(uint256 tokenId, string memory key) external view returns (uint256) {
        return _uintProperties[tokenId][key];
    }

    /**
     * @notice Used to retrieve the bool type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return bool The value of the bool property
     */
    function getBoolTokenProperty(uint256 tokenId, string memory key) external view returns (bool) {
        return _boolProperties[tokenId][key];
    }

    /**
     * @notice Used to retrieve the address type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return address The value of the address property
     */
    function getAddressTokenProperty(uint256 tokenId, string memory key) external view returns (address) {
        return _addressProperties[tokenId][key];
    }

    /**
     * @notice Used to retrieve the bytes type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return bytes The value of the bytes property
     */
    function getBytesTokenProperty(uint256 tokenId, string memory key) external view returns (bytes memory) {
        return _bytesProperties[tokenId][key];
    }

    /**
     * @notice Used to set a number property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setUintProperty(uint256 tokenId, string memory key, uint256 value) external {
        _uintProperties[tokenId][key] = value;
    }

    /**
    * @notice Used to set a string property.
    * @param tokenId The token ID
    * @param key The property key
    * @param value The property value
    */
    function setStringProperty(uint256 tokenId, string memory key, string memory value) external {
        _stringProperties[tokenId][key] = value;
    }

    /**
     * @notice Used to set a boolean property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setBoolProperty(uint256 tokenId, string memory key, bool value) external {
        _boolProperties[tokenId][key] = value;
    }

    /**
     * @notice Used to set an bytes property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setBytesProperty(uint256 tokenId, string memory key, bytes memory value) external {
        _bytesProperties[tokenId][key] = value;
    }

    /**
    * @notice Used to set an address property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setAddressProperty(uint256 tokenId, string memory key, address value) external {
        _addressProperties[tokenId][key] = value;
    }

    /**
    * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return interfaceId == type(IRMRKTokenProperties).interfaceId;
    }

}
