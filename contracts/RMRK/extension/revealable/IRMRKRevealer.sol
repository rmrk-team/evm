// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

interface IRMRKRevealer {
    /**
     * @notice Returns the assetIds to reveal for the given tokenIds
     * @param tokenIds The tokenIds to reveal
     * @dev This method MUST only return existing assetIds
     * @dev This method MUST return the same amount of assetIds as tokenIds
     * @return revealedAssetIds The assetIds to reveal
     * @return assetToReplaceIds The assetIds to replace
     */
    function getRevealedAssets(
        uint256[] memory tokenIds
    )
        external
        view
        returns (
            uint64[] memory revealedAssetIds,
            uint64[] memory assetToReplaceIds
        );
}
