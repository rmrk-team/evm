// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./IRMRKMultiAsset.sol";
import "../library/RMRKLib.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "../library/RMRKErrors.sol";

/**
 * @title AbstractMultiAsset
 * @author RMRK team
 * @notice Abstract Smart contract implementing most of the common logic for contracts implementing IRMRKMultiAsset
 */
abstract contract AbstractMultiAsset is Context, IRMRKMultiAsset {
    using RMRKLib for uint64[];

    /// Mapping of uint64 Ids to asset metadata
    mapping(uint64 => string) private _assets;

    /// Mapping of tokenId to new asset, to asset to be replaced
    mapping(uint256 => mapping(uint64 => uint64)) private _assetReplacements;

    /// Mapping of tokenId to an array of active assets
    /// @dev Active recurses is unbounded, getting all would reach gas limit at around 30k items
    /// so we leave this as internal in case a custom implementation needs to implement pagination
    mapping(uint256 => uint64[]) internal _activeAssets;

    /// Mapping of tokenId to an array of pending assets
    mapping(uint256 => uint64[]) private _pendingAssets;

    /// Mapping of tokenId to an array of priorities for active assets
    mapping(uint256 => uint16[]) private _activeAssetPriorities;

    /// Mapping of tokenId to assetId to whether the token has this asset assigned
    mapping(uint256 => mapping(uint64 => bool)) private _tokenAssets;

    /// Mapping from owner to operator approvals for assets
    mapping(address => mapping(address => bool))
        private _operatorApprovalsForAssets;

    /**
     * @notice Used to fetch the asset metadata of the specified token's for given asset.
     * @dev Assets are stored by reference mapping `_assets[assetId]`.
     * @dev Can be overriden to implement enumerate, fallback or other custom logic.
     * @param tokenId ID of the token to query
     * @param assetId Asset Id, must be in the pending or active assets array
     * @return string Metadata of the asset
     */
    function getAssetMetadata(uint256 tokenId, uint64 assetId)
        public
        view
        virtual
        returns (string memory)
    {
        if (!_tokenAssets[tokenId][assetId]) revert RMRKTokenDoesNotHaveAsset();
        return _assets[assetId];
    }

    /**
     * @notice Used to retrieve the active asset IDs of a given token.
     * @dev Assets metadata is stored by reference mapping `_asset[assetId]`.
     * @param tokenId ID of the token to query
     * @return uint64[] Array of active asset IDs
     */
    function getActiveAssets(uint256 tokenId)
        public
        view
        virtual
        returns (uint64[] memory)
    {
        return _activeAssets[tokenId];
    }

    /**
     * @notice Returns pending asset IDs for a given token
     * @dev Pending assets metadata is stored by reference mapping _pendingAsset[assetId]
     * @param tokenId the token ID to query
     * @return uint64[] pending asset IDs
     */
    function getPendingAssets(uint256 tokenId)
        public
        view
        virtual
        returns (uint64[] memory)
    {
        return _pendingAssets[tokenId];
    }

    /**
     * @notice Used to retrieve active asset priorities of a given token.
     * @dev Asset priorities are a non-sequential array of uint16 values with an array size equal to active asset
     *  priorites.
     * @param tokenId ID of the token to query
     * @return uint16[] Array of active asset priorities
     */
    function getActiveAssetPriorities(uint256 tokenId)
        public
        view
        virtual
        returns (uint16[] memory)
    {
        return _activeAssetPriorities[tokenId];
    }

    /**
     * @notice Used to retrieve the asset ID that will be replaced (if any) if a given assetID is accepted from
     *  the pending assets array.
     * @param tokenId ID of the token to query
     * @param newAssetId ID of the pending asset which will be accepted
     * @return uint64 ID of the asset which will be replaced
     */
    function getAssetReplacements(uint256 tokenId, uint64 newAssetId)
        public
        view
        virtual
        returns (uint64)
    {
        return _assetReplacements[tokenId][newAssetId];
    }

    /**
     * @notice Used to check whether the address has been granted the operator role by a given address or not.
     * @dev See {setApprovalForAllForAssets}.
     * @param owner Address of the account that we are checking for whether it has granted the operator role
     * @param operator Address of the account that we are checking whether it has the operator role or not
     * @return bool The boolean value indicating wehter the account we are checking has been granted the operator role
     */
    function isApprovedForAllForAssets(address owner, address operator)
        public
        view
        virtual
        returns (bool)
    {
        return _operatorApprovalsForAssets[owner][operator];
    }

    /**
     * @notice Used to add or remove an operator of assets for the caller.
     * @dev Operators can call {acceptAsset}, {rejectAsset}, {rejectAllAssets} or {setPriority} for any token
     *  owned by the caller.
     * @dev Requirements:
     *
     *  - The `operator` cannot be the caller.
     * @dev Emits an {ApprovalForAllForAssets} event.
     * @param operator Address of the account to which the operator role is granted or revoked from
     * @param approved The boolean value indicating whether the operator role is being granted (`true`) or revoked
     *  (`false`)
     */
    function setApprovalForAllForAssets(address operator, bool approved)
        public
        virtual
    {
        address owner = _msgSender();
        if (owner == operator) revert RMRKApprovalForAssetsToCurrentOwner();

        _operatorApprovalsForAssets[owner][operator] = approved;
        emit ApprovalForAllForAssets(owner, operator, approved);
    }

    /**
     * @notice Used to accept a pending asset.
     * @dev The call is reverted if there is no pending asset at a given index.
     * @param tokenId ID of the token for which to accept the pending asset
     * @param index Index of the asset in the pending array to accept
     * @param assetId Id of the asset expected to be in the index
     */
    function _acceptAsset(
        uint256 tokenId,
        uint256 index,
        uint64 assetId
    ) internal virtual {
        _validatePendingAssetAtIndex(tokenId, index, assetId);
        _beforeAcceptAsset(tokenId, index, assetId);

        uint64 replaces = _assetReplacements[tokenId][assetId];
        if (replaces != uint64(0)) {
            // It could have been replaced previously so it's fine if it's not found.
            // If it's not deleted (not found), we don't want to send it on the event
            if (!_activeAssets[tokenId].removeItemByValue(replaces))
                replaces = uint64(0);
            else delete _tokenAssets[tokenId][replaces];
        }
        _removePendingAsset(tokenId, index, assetId);

        _activeAssets[tokenId].push(assetId);
        //Push 0 value of uint16 to array, e.g., uninitialized
        _activeAssetPriorities[tokenId].push(uint16(0));
        emit AssetAccepted(tokenId, assetId, replaces);
        _afterAcceptAsset(tokenId, index, assetId);
    }

    /**
     * @notice Used to reject the specified asset from the pending array.
     * @dev The call is reverted if there is no pending asset at a given index.
     * @param tokenId ID of the token that the asset is being rejected from
     * @param index Index of the asset in the pending array to be rejected
     * @param assetId Id of the asset expected to be in the index
     */
    function _rejectAsset(
        uint256 tokenId,
        uint256 index,
        uint64 assetId
    ) internal virtual {
        _validatePendingAssetAtIndex(tokenId, index, assetId);
        _beforeRejectAsset(tokenId, index, assetId);

        _removePendingAsset(tokenId, index, assetId);
        delete _tokenAssets[tokenId][assetId];

        emit AssetRejected(tokenId, assetId);
        _afterRejectAsset(tokenId, index, assetId);
    }

    /**
     * @notice Used to validate the index on the pending assets array
     * @dev The call is reverted if the index is out of range or the asset Id is not present at the index.
     * @param tokenId ID of the token that the asset is validated from
     * @param index Index of the asset in the pending array
     * @param assetId Id of the asset expected to be in the index
     */
    function _validatePendingAssetAtIndex(
        uint256 tokenId,
        uint256 index,
        uint64 assetId
    ) private view {
        if (index >= _pendingAssets[tokenId].length)
            revert RMRKIndexOutOfRange();
        if (assetId != _pendingAssets[tokenId][index])
            revert RMRKUnexpectedAssetId();
    }

    /**
     * @notice Used to remove the asset at the index on the pending assets array
     * @param tokenId ID of the token that the asset is being removed from
     * @param index Index of the asset in the pending array
     * @param assetId Id of the asset expected to be in the index
     */
    function _removePendingAsset(
        uint256 tokenId,
        uint256 index,
        uint64 assetId
    ) private {
        _pendingAssets[tokenId].removeItemByIndex(index);
        delete _assetReplacements[tokenId][assetId];
    }

    /**
     * @notice Used to reject all of the pending assets for the given token.
     * @param tokenId ID of the token to reject all of the pending assets.
     * @param maxRejections Maximum number of expected assets to reject, used to prevent from
     *  rejecting assets which arrive just before this operation.
     */
    function _rejectAllAssets(uint256 tokenId, uint256 maxRejections)
        internal
        virtual
    {
        uint256 len = _pendingAssets[tokenId].length;
        if (len > maxRejections) revert RMRKUnexpectedNumberOfAssets();

        _beforeRejectAllAssets(tokenId);

        for (uint256 i; i < len; ) {
            uint64 assetId = _pendingAssets[tokenId][i];
            delete _assetReplacements[tokenId][assetId];
            unchecked {
                ++i;
            }
        }
        delete (_pendingAssets[tokenId]);

        emit AssetRejected(tokenId, uint64(0));
        _afterRejectAllAssets(tokenId);
    }

    /**
     * @notice Used to specify the priorities for a given token's active assets.
     * @dev If the length of the priorities array doesn't match the length of the active assets array, the execution
     *  will be reverted.
     * @dev The position of the priority value in the array corresponds the position of the asset in the active
     *  assets array it will be applied to.
     * @param tokenId ID of the token for which the priorities are being set
     * @param priorities Array of priorities for the assets
     */
    function _setPriority(uint256 tokenId, uint16[] memory priorities)
        internal
        virtual
    {
        uint256 length = priorities.length;
        if (length != _activeAssets[tokenId].length)
            revert RMRKBadPriorityListLength();

        _beforeSetPriority(tokenId, priorities);
        _activeAssetPriorities[tokenId] = priorities;

        emit AssetPrioritySet(tokenId);
        _afterSetPriority(tokenId, priorities);
    }

    /**
     * @notice Used to add a asset entry.
     * @dev If the specified ID is already used by another asset, the execution will be reverted.
     * @param id ID of the asset to assign to the new asset
     * @param metadataURI Metadata URI of the asset
     */
    function _addAssetEntry(uint64 id, string memory metadataURI)
        internal
        virtual
    {
        if (id == uint64(0)) revert RMRKIdZeroForbidden();
        if (bytes(_assets[id]).length > 0) revert RMRKAssetAlreadyExists();

        _beforeAddAsset(id, metadataURI);
        _assets[id] = metadataURI;

        emit AssetSet(id);
        _afterAddAsset(id, metadataURI);
    }

    /**
     * @notice Used to add a asset to a token.
     * @dev If the given asset is already added to the token, the execution will be reverted.
     * @dev If the asset ID is invalid, the execution will be reverted.
     * @dev If the token already has the maximum amount of pending assets (128), the execution will be
     *  reverted.
     * @param tokenId ID of the token to add the asset to
     * @param assetId ID of the asset to add to the token
     * @param replacesAssetWithId ID of the asset to replace from the token's list of active assets
     */
    function _addAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 replacesAssetWithId
    ) internal virtual {
        if (_tokenAssets[tokenId][assetId]) revert RMRKAssetAlreadyExists();

        if (bytes(_assets[assetId]).length == 0) revert RMRKNoAssetMatchingId();

        if (_pendingAssets[tokenId].length >= 128)
            revert RMRKMaxPendingAssetsReached();

        _beforeAddAssetToToken(tokenId, assetId, replacesAssetWithId);
        _tokenAssets[tokenId][assetId] = true;
        _pendingAssets[tokenId].push(assetId);

        if (replacesAssetWithId != uint64(0)) {
            _assetReplacements[tokenId][assetId] = replacesAssetWithId;
        }

        emit AssetAddedToToken(tokenId, assetId, replacesAssetWithId);
        _afterAddAssetToToken(tokenId, assetId, replacesAssetWithId);
    }

    function _beforeAddAsset(uint64 id, string memory metadataURI)
        internal
        virtual
    {}

    function _afterAddAsset(uint64 id, string memory metadataURI)
        internal
        virtual
    {}

    function _beforeAddAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 replacesAssetWithId
    ) internal virtual {}

    function _afterAddAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 replacesAssetWithId
    ) internal virtual {}

    function _beforeAcceptAsset(
        uint256 tokenId,
        uint256 index,
        uint256 assetId
    ) internal virtual {}

    function _afterAcceptAsset(
        uint256 tokenId,
        uint256 index,
        uint256 assetId
    ) internal virtual {}

    function _beforeRejectAsset(
        uint256 tokenId,
        uint256 index,
        uint256 assetId
    ) internal virtual {}

    function _afterRejectAsset(
        uint256 tokenId,
        uint256 index,
        uint256 assetId
    ) internal virtual {}

    function _beforeRejectAllAssets(uint256 tokenId) internal virtual {}

    function _afterRejectAllAssets(uint256 tokenId) internal virtual {}

    function _beforeSetPriority(uint256 tokenId, uint16[] memory priorities)
        internal
        virtual
    {}

    function _afterSetPriority(uint256 tokenId, uint16[] memory priorities)
        internal
        virtual
    {}
}
