// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {RMRKMinifiedEquippable} from "../../RMRK/equippable/RMRKMinifiedEquippable.sol";
import {RMRKImplementationBase} from "../utils/RMRKImplementationBase.sol";

/**
 * @title RMRKAbstractEquippable
 * @author RMRK team
 * @notice Abstract implementation of RMRK equipable module.
 */
abstract contract RMRKAbstractEquippable is
    RMRKImplementationBase,
    RMRKMinifiedEquippable
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
     * @notice Used to add an equippable asset entry.
     * @dev The ID of the asset is automatically assigned to be the next available asset ID.
     * @param equippableGroupId ID of the equippable group
     * @param catalogAddress Address of the `Catalog` smart contract this asset belongs to
     * @param metadataURI Metadata URI of the asset
     * @param partIds An array of IDs of fixed and slot parts to be included in the asset
     * @return assetId The ID of the newly added asset
     */
    function addEquippableAssetEntry(
        uint64 equippableGroupId,
        address catalogAddress,
        string memory metadataURI,
        uint64[] memory partIds
    ) public virtual onlyOwnerOrContributor returns (uint256 assetId) {
        unchecked {
            ++_totalAssets;
        }
        _addAssetEntry(
            uint64(_totalAssets),
            equippableGroupId,
            catalogAddress,
            metadataURI,
            partIds
        );
        assetId = _totalAssets;
    }

    /**
     * @notice Used to add a asset entry.
     * @dev The ID of the asset is automatically assigned to be the next available asset ID.
     * @param metadataURI Metadata URI of the asset
     * @return assetId ID of the newly added asset
     */
    function addAssetEntry(
        string memory metadataURI
    ) public virtual onlyOwnerOrContributor returns (uint256 assetId) {
        unchecked {
            ++_totalAssets;
        }
        _addAssetEntry(uint64(_totalAssets), metadataURI);
        assetId = _totalAssets;
    }

    /**
     * @notice Used to declare that the assets belonging to a given `equippableGroupId` are equippable into the `Slot`
     *  associated with the `partId` of the collection at the specified `parentAddress`
     * @param equippableGroupId ID of the equippable group
     * @param parentAddress Address of the parent into which the equippable group can be equipped into
     * @param partId ID of the `Slot` that the items belonging to the equippable group can be equipped into
     */
    function setValidParentForEquippableGroup(
        uint64 equippableGroupId,
        address parentAddress,
        uint64 partId
    ) public virtual onlyOwnerOrContributor {
        _setValidParentForEquippableGroup(
            equippableGroupId,
            parentAddress,
            partId
        );
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
            interfaceId == RMRK_INTERFACE();
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
