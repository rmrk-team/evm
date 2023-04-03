// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/extension/tokenProperties/RMRKTokenPropertiesRepository.sol";

/**
 * @title RMRKTokenPropertiesRepositoryMock
 * @author RMRK team
 * @notice Smart contract of the RMRK Token properties module.
 */
contract RMRKTokenPropertiesRepositoryMock is RMRKTokenPropertiesRepository {
    /**
     * @notice Used to set a number property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setUintProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        uint256 value
    ) external {
        _setUintProperty(collection, tokenId, key, value);
    }

    /**
     * @notice Used to set a string property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setStringProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        string memory value
    ) external {
        _setStringProperty(collection, tokenId, key, value);
    }

    /**
     * @notice Used to set a boolean property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setBoolProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        bool value
    ) external {
        _setBoolProperty(collection, tokenId, key, value);
    }

    /**
     * @notice Used to set an bytes property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setBytesProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        bytes memory value
    ) external {
        _setBytesProperty(collection, tokenId, key, value);
    }

    /**
     * @notice Used to set an address property.
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setAddressProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        address value
    ) external {
        _setAddressProperty(collection, tokenId, key, value);
    }
}
