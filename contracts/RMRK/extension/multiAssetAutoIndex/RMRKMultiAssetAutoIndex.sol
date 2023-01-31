// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./IRMRKMultiAssetAutoIndex.sol";
import "../../multiasset/RMRKMultiAsset.sol";
import "hardhat/console.sol";

contract RMRKMultiAssetAutoIndex is IRMRKMultiAssetAutoIndex, RMRKMultiAsset {
    // Mapping of tokenId to assetId to index on the _pendingAssetIndex array
    mapping(uint256 => mapping(uint256 => uint256)) private _pendingAssetIndex;

    constructor(string memory name_, string memory symbol_)
        RMRKMultiAsset(name_, symbol_)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, RMRKMultiAsset)
        returns (bool)
    {
        return
            interfaceId == type(IRMRKMultiAssetAutoIndex).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc IRMRKMultiAssetAutoIndex
     */
    function acceptAsset(uint256 tokenId, uint64 assetId) public {
        uint256 index = _pendingAssetIndex[tokenId][assetId];
        _acceptAsset(tokenId, index, assetId);
    }

    /**
     * @inheritdoc IRMRKMultiAssetAutoIndex
     */
    function rejectAsset(uint256 tokenId, uint64 assetId) public {
        uint256 index = _pendingAssetIndex[tokenId][assetId];
        _rejectAsset(tokenId, index, assetId);
    }

    /**
     * @inheritdoc AbstractMultiAsset
     */
    function _afterAcceptAsset(
        uint256 tokenId,
        uint256 index,
        uint256 assetId
    ) internal override {
        require(
            _pendingAssetIndex[tokenId][assetId] == index,
            "Trying to delete asset at the wrong index"
        );

        uint64[] memory pendingAssetsIds = getPendingAssets(tokenId);

        if (pendingAssetsIds.length == index) {
            // Rejected last pending asset
            delete _pendingAssetIndex[tokenId][assetId];
        } else {
            // Rejected intermediate asset --> update indexes
            uint256 replacingAssetId = pendingAssetsIds[index];
            _pendingAssetIndex[tokenId][replacingAssetId] = _pendingAssetIndex[tokenId][assetId];
            delete _pendingAssetIndex[tokenId][assetId];
        }
    }

    /**
     * @inheritdoc AbstractMultiAsset
     */
    function _afterRejectAsset(
        uint256 tokenId,
        uint256 index,
        uint256 assetId
    ) internal override {
        require(
            _pendingAssetIndex[tokenId][assetId] == index,
            "Trying to delete asset at the wrong index"
        );

        uint64[] memory pendingAssetsIds = getPendingAssets(tokenId);

        if (pendingAssetsIds.length == index) {
            // Rejected last pending asset
            delete _pendingAssetIndex[tokenId][assetId];
        } else {
            // Rejected intermediate asset --> update indexes
            uint256 replacingAssetId = pendingAssetsIds[index];
            _pendingAssetIndex[tokenId][replacingAssetId] = _pendingAssetIndex[tokenId][assetId];
            delete _pendingAssetIndex[tokenId][assetId];
        }
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
