// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../../RMRK/extension/tokenProperties/RMRKTokenProperties.sol";

/**
 * @title RMRKTokenPropertiesMock
 * @author RMRK team
 * @notice Smart contract of the RMRK Token properties module.
 */
contract RMRKTokenPropertiesMock is RMRKTokenProperties {
    /**
     * @inheritdoc IRMRKTokenProperties
     */
    function setUintProperty(
        uint256 tokenId,
        string memory key,
        uint256 value
    ) external {
        _setUintProperty(tokenId, key, value);
    }

    /**
     * @inheritdoc IRMRKTokenProperties
     */
    function setStringProperty(
        uint256 tokenId,
        string memory key,
        string memory value
    ) external {
        _setStringProperty(tokenId, key, value);
    }

    /**
     * @inheritdoc IRMRKTokenProperties
     */
    function setBoolProperty(
        uint256 tokenId,
        string memory key,
        bool value
    ) external {
        _setBoolProperty(tokenId, key, value);
    }

    /**
     * @inheritdoc IRMRKTokenProperties
     */
    function setBytesProperty(
        uint256 tokenId,
        string memory key,
        bytes memory value
    ) external {
        _setBytesProperty(tokenId, key, value);
    }

    /**
     * @inheritdoc IRMRKTokenProperties
     */
    function setAddressProperty(
        uint256 tokenId,
        string memory key,
        address value
    ) external {
        _setAddressProperty(tokenId, key, value);
    }
}
