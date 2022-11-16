// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../multiasset/IRMRKMultiAsset.sol";
import "../library/RMRKErrors.sol";

/**
 * @title RMRKMultiAssetRenderUtils
 * @author RMRK team
 */
contract RMRKMultiAssetRenderUtils {
    uint16 private constant _LOWEST_POSSIBLE_PRIORITY = 2**16 - 1;

    /**
     * @notice The structure used to display information about an active asset.
     * @return id ID of the asset
     * @return priority The priority assigned to the asset
     * @return metadata The metadata URI of the asset
     */
    struct ActiveAsset {
        uint64 id;
        uint16 priority;
        string metadata;
    }

    /**
     * @notice The structure used to display information about a pending asset.
     * @return id ID of the asset
     * @return acceptRejectIndex An index to use in order to accept or reject the given asset
     * @return overwritesAssetWithId ID of the asset that would be overwritten if this asset gets accepted
     * @return metadata The metadata URI of the asset
     */
    struct PendingAsset {
        uint64 id;
        uint128 acceptRejectIndex;
        uint64 overwritesAssetWithId;
        string metadata;
    }

    /**
     * @notice Used to get the active assets of the given token.
     * @dev The full `ActiveAsset` looks like this:
     *  [
     *      id,
     *      priority,
     *      metadata
     *  ]
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token to retrieve the active assets for
     * @return struct[] An array of ActiveAssets present on the given token
     */
    function getActiveAssets(address target, uint256 tokenId)
        public
        view
        virtual
        returns (ActiveAsset[] memory)
    {
        IRMRKMultiAsset target_ = IRMRKMultiAsset(target);

        uint64[] memory assets = target_.getActiveAssets(tokenId);
        uint16[] memory priorities = target_.getActiveAssetPriorities(tokenId);
        uint256 len = assets.length;
        if (len == 0) {
            revert RMRKTokenHasNoAssets();
        }

        ActiveAsset[] memory activeAssets = new ActiveAsset[](len);
        string memory metadata;
        for (uint256 i; i < len; ) {
            metadata = target_.getAssetMetadata(tokenId, assets[i]);
            activeAssets[i] = ActiveAsset({
                id: assets[i],
                priority: priorities[i],
                metadata: metadata
            });
            unchecked {
                ++i;
            }
        }
        return activeAssets;
    }

    /**
     * @notice Used to get the pending assets of the given token.
     * @dev The full `PendingAsset` looks like this:
     *  [
     *      id,
     *      acceptRejectIndex,
     *      overwritesAssetWithId,
     *      metadata
     *  ]
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token to retrieve the pending assets for
     * @return struct[] An array of PendingAssets present on the given token
     */
    function getPendingAssets(address target, uint256 tokenId)
        public
        view
        virtual
        returns (PendingAsset[] memory)
    {
        IRMRKMultiAsset target_ = IRMRKMultiAsset(target);

        uint64[] memory assets = target_.getPendingAssets(tokenId);
        uint256 len = assets.length;
        if (len == 0) {
            revert RMRKTokenHasNoAssets();
        }

        PendingAsset[] memory pendingAssets = new PendingAsset[](len);
        string memory metadata;
        uint64 overwritesAssetWithId;
        for (uint256 i; i < len; ) {
            metadata = target_.getAssetMetadata(tokenId, assets[i]);
            overwritesAssetWithId = target_.getAssetOverwrites(
                tokenId,
                assets[i]
            );
            pendingAssets[i] = PendingAsset({
                id: assets[i],
                acceptRejectIndex: uint128(i),
                overwritesAssetWithId: overwritesAssetWithId,
                metadata: metadata
            });
            unchecked {
                ++i;
            }
        }
        return pendingAssets;
    }

    /**
     * @notice Used to retrieve the metadata URI of specified assets in the specified token.
     * @dev Requirements:
     *
     *  - `assetIds` must exist.
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token to retrieve the specified assets for
     * @param assetIds[] An array of asset IDs for which to retrieve the metadata URIs
     * @return string[] An array of metadata URIs belonging to specified assets
     */
    function getAssetsById(
        address target,
        uint256 tokenId,
        uint64[] calldata assetIds
    ) public view virtual returns (string[] memory) {
        IRMRKMultiAsset target_ = IRMRKMultiAsset(target);
        uint256 len = assetIds.length;
        string[] memory assets = new string[](len);
        for (uint256 i; i < len; ) {
            assets[i] = target_.getAssetMetadata(tokenId, assetIds[i]);
            unchecked {
                ++i;
            }
        }
        return assets;
    }

    /**
     * @notice Used to retrieve the metadata URI of the specified token's asset with the highest priority.
     * @param target Address of the smart contract of the given token
     * @param tokenId ID of the token for which to retrieve the metadata URI of the asset with the highest priority
     * @return string The metadata URI of the asset with the highest priority
     */
    function getTopAssetMetaForToken(address target, uint256 tokenId)
        external
        view
        returns (string memory)
    {
        IRMRKMultiAsset target_ = IRMRKMultiAsset(target);
        uint16[] memory priorities = target_.getActiveAssetPriorities(tokenId);
        uint64[] memory assets = target_.getActiveAssets(tokenId);
        uint256 len = priorities.length;
        if (len == 0) {
            revert RMRKTokenHasNoAssets();
        }

        uint16 maxPriority = _LOWEST_POSSIBLE_PRIORITY;
        uint64 maxPriorityAsset;
        for (uint64 i; i < len; ) {
            uint16 currentPrio = priorities[i];
            if (currentPrio < maxPriority) {
                maxPriority = currentPrio;
                maxPriorityAsset = assets[i];
            }
            unchecked {
                ++i;
            }
        }
        return target_.getAssetMetadata(tokenId, maxPriorityAsset);
    }
}
