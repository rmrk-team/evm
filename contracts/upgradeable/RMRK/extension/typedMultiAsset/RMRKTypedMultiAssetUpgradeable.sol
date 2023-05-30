// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./IRMRKTypedMultiAssetUpgradeable.sol";

/**
 * @title RMRKTypedMultiAsset
 * @author RMRK team
 * @notice Smart contract of the RMRK Typed multi asset module.
 */
contract RMRKTypedMultiAssetUpgradeable is IRMRKTypedMultiAssetUpgradeable {
    mapping(uint64 => string) private _assetTypes;

    /**
     * @inheritdoc IERC165Upgradeable
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return interfaceId == type(IRMRKTypedMultiAssetUpgradeable).interfaceId;
    }

    /**
     * @inheritdoc IRMRKTypedMultiAssetUpgradeable
     */
    function getAssetType(uint64 assetId) public view returns (string memory) {
        return _assetTypes[assetId];
    }

    /**
     * @notice Used to set the type of the asset.
     * @param assetId ID of the asset for which the type is being set
     * @param type_ The type of the asset
     */
    function _setAssetType(uint64 assetId, string memory type_) internal {
        _assetTypes[assetId] = type_;
    }

    uint256[50] private __gap;
}
