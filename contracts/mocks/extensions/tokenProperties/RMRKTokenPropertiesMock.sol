// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/extension/tokenProperties/RMRKTokenProperties.sol";

/**
 * @title RMRKTokenPropertiesMock
 * @author RMRK team
 * @notice Smart contract of the RMRK Token properties module.
 */
contract RMRKTokenPropertiesMock is RMRKTokenProperties {
    /**
     * @notice Used to set a number property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setUintProperty(
        uint256 tokenId,
        string memory key,
        uint256 value
    ) external {
        _setUintProperty(tokenId, key, value);
    }

    /**
     * @notice Used to set a string property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setStringProperty(
        uint256 tokenId,
        string memory key,
        string memory value
    ) external {
        _setStringProperty(tokenId, key, value);
    }

    /**
     * @notice Used to set a boolean property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setBoolProperty(
        uint256 tokenId,
        string memory key,
        bool value
    ) external {
        _setBoolProperty(tokenId, key, value);
    }

    /**
     * @notice Used to set an bytes property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setBytesProperty(
        uint256 tokenId,
        string memory key,
        bytes memory value
    ) external {
        _setBytesProperty(tokenId, key, value);
    }

    /**
     * @notice Used to set an address property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setAddressProperty(
        uint256 tokenId,
        string memory key,
        address value
    ) external {
        _setAddressProperty(tokenId, key, value);
    }
}
