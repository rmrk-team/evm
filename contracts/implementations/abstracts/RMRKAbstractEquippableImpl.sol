// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../RMRK/equippable/RMRKEquippable.sol";
import "../../RMRK/extension/RMRKRoyalties.sol";
import "../../RMRK/utils/RMRKCollectionMetadata.sol";
import "../../RMRK/utils/RMRKMintingUtils.sol";
import "../../RMRK/utils/RMRKTokenURI.sol";
import "../IRMRKInitData.sol";

error RMRKMintZero();

/**
 * @title RMRKAbstractEquippableImpl
 * @author RMRK team
 * @notice Abstract implementation of RMRK equippable module.
 * @dev This is an abstract implementation to combine the common functionality of `RMRKEquippableImpl` and
 * `RMRKEquippableImplErc20Pay`.
 */
abstract contract RMRKAbstractEquippableImpl is
    IRMRKInitData,
    RMRKMintingUtils,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKTokenURI,
    RMRKEquippable
{
    uint256 private _totalAssets;

    /**
     * @notice Used to calculate the token IDs of tokens to be minted.
     * @param numToMint Amount of tokens to be minted
     * @return uint256 The ID of the first token to be minted in the current minting cycle
     * @return uint256 The ID of the last token to be minted in the current minting cycle
     */
    function _preMint(uint256 numToMint) internal returns (uint256, uint256) {
        if (numToMint == uint256(0)) revert RMRKMintZero();
        if (numToMint + _totalSupply > _maxSupply) revert RMRKMintOverMax();

        uint256 mintPriceRequired = numToMint * _pricePerMint;
        _charge(mintPriceRequired);

        uint256 nextToken = _totalSupply + 1;
        unchecked {
            _totalSupply += numToMint;
        }
        uint256 totalSupplyOffset = _totalSupply + 1;

        return (nextToken, totalSupplyOffset);
    }

    /**
     * @notice Used to verify and/or receive the payment for the mint.
     * @param value The expected amount to be received for the mint
     */
    function _charge(uint256 value) internal virtual;

    /**
     * @notice Used to add an asset to a token.
     * @dev If the given asset is already added to the token, the execution will be reverted.
     * @dev If the asset ID is invalid, the execution will be reverted.
     * @dev If the token already has the maximum amount of pending assets (128), the execution will be
     *  reverted.
     * @dev If the asset is being added by the current root owner of the token, the asset will be automatically
     *  accepted.
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
        if (_msgSender() == ownerOf(tokenId)) {
            _acceptAsset(tokenId, _pendingAssets[tokenId].length - 1, assetId);
        }
    }

    /**
     * @notice Used to add an equippable asset entry.
     * @dev The ID of the asset is automatically assigned to be the next available asset ID.
     * @param equippableGroupId ID of the equippable group
     * @param baseAddress Address of the `Base` smart contract this asset belongs to
     * @param metadataURI Metadata URI of the asset
     * @param partIds An array of IDs of fixed and slot parts to be included in the asset
     * @return uint256 The total number of assets after this asset has been added
     */
    function addEquippableAssetEntry(
        uint64 equippableGroupId,
        address baseAddress,
        string memory metadataURI,
        uint64[] calldata partIds
    ) public virtual onlyOwnerOrContributor returns (uint256) {
        unchecked {
            _totalAssets += 1;
        }
        _addAssetEntry(
            uint64(_totalAssets),
            equippableGroupId,
            baseAddress,
            metadataURI,
            partIds
        );
        return _totalAssets;
    }

    /**
     * @notice Used to add a asset entry.
     * @dev The ID of the asset is automatically assigned to be the next available asset ID.
     * @param metadataURI Metadata URI of the asset
     */
    function addAssetEntry(
        string memory metadataURI
    ) public virtual onlyOwnerOrContributor returns (uint256) {
        unchecked {
            _totalAssets += 1;
        }
        _addAssetEntry(uint64(_totalAssets), metadataURI);
        return _totalAssets;
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
     * @notice Used to retrieve the total number of assets.
     * @return uint256 The total number of assets
     */
    function totalAssets() public view virtual returns (uint256) {
        return _totalAssets;
    }

    /**
     * @inheritdoc RMRKRoyalties
     */
    function updateRoyaltyRecipient(
        address newRoyaltyRecipient
    ) public virtual override onlyOwner {
        _setRoyaltyRecipient(newRoyaltyRecipient);
    }
}
