// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "../../multiasset/IERC5773.sol";

/**
 * @title RMRKMultiAssetAutoIndex
 * @author RMRK team
 * @notice Interface smart contract of the RMRK MultiAsset AutoIndex module.
 */
interface IRMRKMultiAssetAutoIndex is IERC5773 {
    /**
     * @notice Accepts an asset from the pending array of given token.
     * @dev Migrates the asset from the token's pending asset array to the token's active asset array.
     * @dev An active asset cannot be removed by anyone, but can be replaced by a new asset.
     * @dev Requirements:
     *
     *  - The caller must own the token or be approved to manage the token's assets
     *  - `tokenId` must exist.
     * @dev Emits an {AssetAccepted} event.
     * @param tokenId ID of the token for which to accept the pending asset
     * @param assetId Id of the pending asset
     */
    function acceptAsset(uint256 tokenId, uint64 assetId) external;

    /**
     * @notice Rejects an asset from the pending array of given token.
     * @dev Removes the asset from the token's pending asset array.
     * @dev Requirements:
     *
     *  - The caller must own the token or be approved to manage the token's assets
     *  - `tokenId` must exist.
     * @dev Emits a {AssetRejected} event.
     * @param tokenId ID of the token that the asset is being rejected from
     * @param assetId Id of the pending asset
     */
    function rejectAsset(uint256 tokenId, uint64 assetId) external;
}
