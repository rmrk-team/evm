// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

/**
 * @title RMRKTokenProperties
 * @author RMRK team
 * @notice Smart contract of the RMRK Token properties module.
 */
contract RMRKTokenProperties {

    mapping(uint256 => mapping(uint256 => string)) private _stringProperties;
    mapping(uint256 => mapping(uint256 => uint256)) private _uintProperties;
    mapping(uint256 => mapping(uint256 => bool)) private _boolProperties;
    mapping(uint256 => mapping(uint256 => address)) private _addressProperties;
    mapping(uint256 => mapping(uint256 => bytes)) private _bytesProperties;

    /**
     * @notice Used to retrieve the token properties.
     * @param tokenId The token ID
     * @param index The index of the property
     * @return string The value of the string property
     */
    function getStringTokenProperty(uint256 tokenId, uint256 index) external view returns (string memory) {
        return _stringProperties[tokenId][index];
    }

    /**
     * @notice Used to retrieve the token properties.
     * @param tokenId The token ID
     * @param index The index of the property
     * @return uint256 The value of the uint property
     */
    function getUintTokenProperty(uint256 tokenId, uint256 index) external view returns (uint256) {
        return _uintProperties[tokenId][index];
    }

    /**
     * @notice Used to retrieve the token properties.
     * @param tokenId The token ID
     * @param index The index of the property
     * @return bool The value of the bool property
     */
    function getBoolTokenProperty(uint256 tokenId, uint256 index) external view returns (bool) {
        return _boolProperties[tokenId][index];
    }

    /**
     * @notice Used to retrieve the token properties.
     * @param tokenId The token ID
     * @param index The index of the property
     * @return address The value of the address property
     */
    function getAddressTokenProperty(uint256 tokenId, uint256 index) external view returns (address) {
        return _addressProperties[tokenId][index];
    }

    /**
     * @notice Used to retrieve the token properties.
     * @param tokenId The token ID
     * @param index The index of the property
     * @return bytes The value of the bytes property
     */
    function getBytesTokenProperty(uint256 tokenId, uint256 index) external view returns (bytes memory) {
        return _bytesProperties[tokenId][index];
    }

    /**
     * @notice Used to set a number property.
     * @param tokenId The token ID
     * @param index The property index
     * @param value The property value
     */
    function setIntProperty(uint256 tokenId, uint256 index, uint256 value) external {
        _uintProperties[tokenId][index] = value;
    }

    /**
    * @notice Used to set a string property.
    * @param tokenId The token ID
    * @param index The property index
    * @param value The property value
    */
    function setStringProperty(uint256 tokenId, uint256 index, string memory value) external {
        _stringProperties[tokenId][index] = value;
    }

    /**
     * @notice Used to set a boolean property.
     * @param tokenId The token ID
     * @param index The property index
     * @param value The property value
     */
    function setBoolProperty(uint256 tokenId, uint256 index, bool value) external {
        _boolProperties[tokenId][index] = value;
    }

    /**
     * @notice Used to set an bytes property.
     * @param tokenId The token ID
     * @param index The property index
     * @param value The property value
     */
    function setBytesProperty(uint256 tokenId, uint256 index, bytes memory value) external {
        _bytesProperties[tokenId][index] = value;
    }

    /**
    * @notice Used to set an address property.
     * @param tokenId The token ID
     * @param index The property index
     * @param value The property value
     */
    function setAddressProperty(uint256 tokenId, uint256 index, address value) external {
        _addressProperties[tokenId][index] = value;
    }

}
