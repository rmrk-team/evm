// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IRMRKTokenPropertiesRepository
 * @author RMRK team
 * @notice Interface smart contract of the RMRK token properties extension.
 */
interface IRMRKTokenPropertiesRepository is IERC165 {
    /**
     * @notice Used to notify listeners that a string property has been updated.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @param value The new value of the property
     */
    event StringPropertyUpdated(
        address indexed collection,
        uint256 indexed tokenId,
        string key,
        string value
    );

    /**
     * @notice Used to notify listeners that an uint property has been updated.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @param value The new value of the property
     */
    event UintPropertyUpdated(
        address indexed collection,
        uint256 indexed tokenId,
        string key,
        uint256 value
    );

    /**
     * @notice Used to notify listeners that a boolean property has been updated.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @param value The new value of the property
     */
    event BoolPropertyUpdated(
        address indexed collection,
        uint256 indexed tokenId,
        string key,
        bool value
    );

    /**
     * @notice Used to notify listeners that an address property has been updated.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @param value The new value of the property
     */
    event AddressPropertyUpdated(
        address indexed collection,
        uint256 indexed tokenId,
        string key,
        address value
    );

    /**
     * @notice Used to notify listeners that a bytes property has been updated.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @param value The new value of the property
     */
    event BytesPropertyUpdated(
        address indexed collection,
        uint256 indexed tokenId,
        string key,
        bytes value
    );

    /**
     * @notice Used to retrieve the string type token properties.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the string property
     */
    function getStringTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (string memory);

    /**
     * @notice Used to retrieve the uint type token properties.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the uint property
     */
    function getUintTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (uint256);

    /**
     * @notice Used to retrieve the bool type token properties.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the bool property
     */
    function getBoolTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (bool);

    /**
     * @notice Used to retrieve the address type token properties.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the address property
     */
    function getAddressTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (address);

    /**
     * @notice Used to retrieve the bytes type token properties.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the bytes property
     */
    function getBytesTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (bytes memory);
}
