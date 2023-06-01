// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../../RMRK/extension/multiAssetAutoIndex/IRMRKMultiAssetAutoIndex.sol";
import "../../multiasset/RMRKMultiAssetUpgradeable.sol";

/**
 * @title RMRKMultiAssetAutoIndexUpgradeable
 * @author RMRK team
 * @notice Smart contract of the upgradeable RMRK MultiAsset AutoIndex module.
 */
contract RMRKMultiAssetAutoIndexUpgradeable is
    IRMRKMultiAssetAutoIndex,
    RMRKMultiAssetUpgradeable
{
    // Mapping of tokenId to assetId to index on the _pendingAssetIndex array
    mapping(uint256 => mapping(uint256 => uint256)) private _pendingAssetIndex;

    /**
     * @notice Initializes the contract and the inherited contracts.
     * @param name_ Name of the token collection
     * @param symbol_ Symbol of the token collection
     */
    function __RMRKMultiAssetAutoIndexUpgradeable_init(
        string memory name_,
        string memory symbol_
    ) internal onlyInitializing {
        __RMRKMultiAssetAutoIndexUpgradeable_init_unchained();
        __RMRKMultiAssetUpgradeable_init(name_, symbol_);
    }

    /**
     * @notice Initializes the contract without the inherited contracts.
     */
    function __RMRKMultiAssetAutoIndexUpgradeable_init_unchained()
        internal
        initializer
    {}

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(IERC165, RMRKMultiAssetUpgradeable)
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
     * @inheritdoc AbstractMultiAssetUpgradeable
     */
    function _afterAcceptAsset(
        uint256 tokenId,
        uint256 index,
        uint64 assetId
    ) internal override {
        _removePendingIndex(tokenId, index, assetId);
    }

    /**
     * @inheritdoc AbstractMultiAssetUpgradeable
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
     * @inheritdoc AbstractMultiAssetUpgradeable
     */
    function _beforeAddAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64
    ) internal virtual override {
        // The asset has already been put into the pending asset list
        _pendingAssetIndex[tokenId][assetId] = _pendingAssets[tokenId].length;
    }

    uint256[50] private __gap;
}
