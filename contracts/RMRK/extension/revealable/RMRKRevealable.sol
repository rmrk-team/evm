// SPDX-License-Identifier: MIT

import "./IRMRKRevealable.sol";
import "./IRMRKRevealer.sol";
import "hardhat/console.sol";

pragma solidity ^0.8.21;

/**
 * @title IRMRKRevealable
 * @author RMRK team
 * @notice Interface smart contract of the RMRK Revealable extension. This extension simplifies the process of revealing.
 */
abstract contract RMRKRevealable is IRMRKRevealable {
    address private _revealer;

    /**
     * @notice Returns the address of the revealer contract
     */
    function getRevealer() external view returns (address) {
        return _revealer;
    }

    /**
     * @notice Sets the revealer contract address
     */
    function _setRevealer(address revealer) internal {
        _revealer = revealer;
    }

    /**
     * @notice Reveals the assets for the given tokenIds
     * @param tokenIds The tokenIds to reveal
     * @dev This method SHOULD be called by the owner or approved for assets
     * @dev This method SHOULD add the asset to the token and accept it
     * @dev This method SHOULD get the `assetId` to add and replace from the revealer contract
     * @dev This `assetId` to replace CAN be 0, meaning that the asset is added to the token without replacing anything
     * @dev The revealer contract MUST take care of ensuring the `assetId` exists on the contract implementating this interface
     */
    function reveal(uint256[] memory tokenIds) external {
        _checkRevealPermissions(tokenIds);
        uint256 length = tokenIds.length;
        (
            uint64[] memory revealedAssetIds,
            uint64[] memory assetToReplaceIds
        ) = IRMRKRevealer(_revealer).getRevealedAssets(tokenIds);
        for (uint256 i; i < length; ) {
            _addAndAcceptAssetToToken(
                tokenIds[i],
                revealedAssetIds[i],
                assetToReplaceIds[i]
            );
            unchecked {
                ++i;
            }
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        console.logBytes4(type(IRMRKRevealable).interfaceId);
        return interfaceId == type(IRMRKRevealable).interfaceId;
    }

    /**
     * @notice Adds the asset to the token and accepts it.
     * @param tokenId The tokenId to add the asset to
     * @param newAssetId The assetId to add
     * @param assetToReplaceId The assetId to replace. Might be 0, meaning that the asset is added to the token without replacing anything
     */
    function _addAndAcceptAssetToToken(
        uint256 tokenId,
        uint64 newAssetId,
        uint64 assetToReplaceId
    ) internal virtual {
        // Expected implementation:
        // _addAssetToToken(tokenId, newAssetId, assetToReplaceId);
        // _acceptAsset(tokenId, _pendingAssets[tokenId].length - 1, newAssetId);
    }

    /**
     * @notice Checks that the msg sender has permissions to reveal the given tokenIds
     * @dev The caller SHOULD be either the owner or approved for assets.
     * @param tokenIds The tokenIds to reveal
     */
    function _checkRevealPermissions(
        uint256[] memory tokenIds
    ) internal view virtual {
        // Expected implementation:
        // uint256 length = tokenIds.length;
        // for (uint256 i; i < length; ) {
        //     _onlyApprovedForAssetsOrOwner(tokenIds[i]);
        //     unchecked {
        //         ++i;
        //     }
        // }
    }
}
