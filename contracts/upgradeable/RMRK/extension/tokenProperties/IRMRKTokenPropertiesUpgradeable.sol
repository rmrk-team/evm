// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";

/**
 * @title IRMRKTokenPropertiesUpgradeable
 * @author RMRK team
 * @notice Interface smart contract of the upgradeable RMRK token properties extension.
 */
interface IRMRKTokenPropertiesUpgradeable is IERC165Upgradeable {
    /**
     * @notice Used to retrieve the string type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the string property
     */
    function getStringTokenProperty(
        uint256 tokenId,
        string memory key
    ) external view returns (string memory);

    /**
     * @notice Used to retrieve the uint type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the uint property
     */
    function getUintTokenProperty(
        uint256 tokenId,
        string memory key
    ) external view returns (uint256);

    /**
     * @notice Used to retrieve the bool type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the bool property
     */
    function getBoolTokenProperty(
        uint256 tokenId,
        string memory key
    ) external view returns (bool);

    /**
     * @notice Used to retrieve the address type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the address property
     */
    function getAddressTokenProperty(
        uint256 tokenId,
        string memory key
    ) external view returns (address);

    /**
     * @notice Used to retrieve the bytes type token properties.
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the bytes property
     */
    function getBytesTokenProperty(
        uint256 tokenId,
        string memory key
    ) external view returns (bytes memory);
}
