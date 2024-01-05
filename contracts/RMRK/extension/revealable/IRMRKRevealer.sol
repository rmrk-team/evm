// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

interface IRMRKRevealer {
    event Revealed(
        uint256[] indexed tokenIds,
        uint64[] revealedAssetsIds,
        uint64[] assetsToReplaceIds
    );

    /**
     * @notice For each `tokenId` in `tokenIds` returns whether it can be revealed or not
     * @param tokenIds The `tokenIds` to check
     * @return revealable The array of booleans indicating whether each `tokenId` can be revealed or not
     */
    function getRevealableTokens(
        uint256[] memory tokenIds
    ) external view returns (bool[] memory revealable);

    /**
     * @notice Returns the revealed `assetIds` for the given `tokenIds` and marks them as revealed.
     * @param tokenIds The `tokenIds` to reveal
     * @dev This CAN add new assets to the original contract if necessary, in which case it SHOULD have the necessary permissions
     * @dev This method MUST only return existing `assetIds`
     * @dev This method MUST be called only by the contract implementing the `IRMRKRevealable` interface, during the `reveal` method
     * @dev This method MUST return the same amount of `revealedAssetsIds` and `assetsToReplaceIds`  as `tokenIds`
     * @return revealedAssetsIds The revealed `assetIds`
     * @return assetsToReplaceIds The `assetIds` to replace
     */
    function reveal(
        uint256[] memory tokenIds
    )
        external
        returns (
            uint64[] memory revealedAssetsIds,
            uint64[] memory assetsToReplaceIds
        );
}
