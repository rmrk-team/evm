// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./IRMRKMultiAssetAutoIndex.sol";
import "../../multiasset/RMRKMultiAsset.sol";

/**
 * @title RMRKMultiAssetAutoIndex
 * @author RMRK team
 * @notice Smart contract of the RMRK MultiAsset AutoIndex module.
 */
contract RMRKMultiAssetAutoIndex is IRMRKMultiAssetAutoIndex, RMRKMultiAsset {
    // Mapping of tokenId to assetId to index on the _pendingAssetIndex array
    mapping(uint256 => mapping(uint256 => uint256)) private _pendingAssetIndex;

    /**
     * @notice Initializes the contract by setting a name and a symbol to the token collection.
     * @param name_ Name of the token collection
     * @param symbol_ Symbol of the token collection
     */
    constructor(
        string memory name_,
        string memory symbol_
    ) RMRKMultiAsset(name_, symbol_) {}

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, RMRKMultiAsset) returns (bool) {
        return
            interfaceId == type(IRMRKMultiAssetAutoIndex).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc IRMRKMultiAssetAutoIndex
     */
    function acceptAsset(uint256 tokenId, uint64 assetId) public {
        _acceptAsset(tokenId, _getIndex(tokenId, assetId), assetId);
    }

    /**
     * @inheritdoc IRMRKMultiAssetAutoIndex
     */
    function rejectAsset(uint256 tokenId, uint64 assetId) public {
        _rejectAsset(tokenId, _getIndex(tokenId, assetId), assetId);
    }

    /**
     * @notice Returns the index of the asset in the pending asset list for the token
     * @param tokenId The token to get the index for
     * @param assetId The asset to get the index for
     */
    function _getIndex(
        uint256 tokenId,
        uint64 assetId
    ) internal view returns (uint256) {
        return _pendingAssetIndex[tokenId][assetId];
    }

    /**
     * @inheritdoc AbstractMultiAsset
     */
    function _afterAcceptAsset(
        uint256 tokenId,
        uint256 index,
        uint64 assetId
    ) internal override {
        _removePendingIndex(tokenId, index, assetId);
    }

    /**
     * @inheritdoc AbstractMultiAsset
     */
    function _afterRejectAsset(
        uint256 tokenId,
        uint256 index,
        uint64 assetId
    ) internal override {
        _removePendingIndex(tokenId, index, assetId);
    }

    /**
     * @notice Removes the index for the asset on the pending asset list for the token
     * @param tokenId The token to remove the index for
     * @param index The index of the asset in the pending asset list
     * @param assetId The asset to remove the index for
     */
    function _removePendingIndex(
        uint256 tokenId,
        uint256 index,
        uint64 assetId
    ) private {
        if (_pendingAssets[tokenId].length != index) {
            // Rejected intermediate asset --> update indexes
            uint256 replacingAssetId = _pendingAssets[tokenId][index];
            _pendingAssetIndex[tokenId][replacingAssetId] = _getIndex(
                tokenId,
                assetId
            );
        }
        delete _pendingAssetIndex[tokenId][assetId];
    }

    /**
     * @inheritdoc AbstractMultiAsset
     */
    function _beforeAddAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64
    ) internal virtual override {
        // The asset has already been put into the pending asset list
        _pendingAssetIndex[tokenId][assetId] = _pendingAssets[tokenId].length;
    }
}
