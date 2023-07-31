// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "../../RMRK/nestable/RMRKNestableMultiAsset.sol";
import "../utils/RMRKImplementationBase.sol";

/**
 * @title RMRKAbstractNestableMultiAsset
 * @author RMRK team
 * @notice Abstract implementation of joined RMRK nestable and multi-asset module.
 */
 abstract contract RMRKAbstractNestableMultiAsset is
    RMRKImplementationBase,
    RMRKNestableMultiAsset
{
    /**
     * @notice Used to add an asset to a token.
     * @dev If the given asset is already added to the token, the execution will be reverted.
     * @dev If the asset ID is invalid, the execution will be reverted.
     * @dev If the token already has the maximum amount of pending assets (128), the execution will be
     *  reverted.
     * @param tokenId ID of the token to add the asset to
     * @param assetId ID of the asset to add to the token
     * @param replacesAssetWithId ID of the asset to replace from the token's list of active assets
     */
    function addAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 replacesAssetWithId
    ) public virtual onlyOwnerOrContributor {
        _addAssetToToken(tokenId, assetId, replacesAssetWithId);
    }

    /**
     * @notice Used to add a asset entry.
     * @dev The ID of the asset is automatically assigned to be the next available asset ID.
     * @param metadataURI Metadata URI of the asset
     * @return ID of the newly added asset
     */
    function addAssetEntry(
        string memory metadataURI
    ) public virtual onlyOwnerOrContributor returns (uint256) {
        unchecked {
            ++_totalAssets;
        }
        _addAssetEntry(uint64(_totalAssets), metadataURI);
        return _totalAssets;
    }

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            super.supportsInterface(interfaceId) ||
            interfaceId == type(IERC2981).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == RMRK_INTERFACE;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);
        if (to == address(0)) {
            unchecked {
                _totalSupply -= 1;
            }
        }
    }

    function _afterAddAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 replacesAssetWithId
    ) internal virtual override {
        super._afterAddAssetToToken(tokenId, assetId, replacesAssetWithId);
        // This relies on no other auto accept mechanism being in place.
        // We auto accept the first ever asset or any asset added by the token owner.
        // This is done to allow a meta factory to mint, add assets and accept them in one transaction.
        if (
            _activeAssets[tokenId].length == 0 ||
            _msgSender() == ownerOf(tokenId)
        ) {
            _acceptAsset(tokenId, _pendingAssets[tokenId].length - 1, assetId);
        }
    }
}
