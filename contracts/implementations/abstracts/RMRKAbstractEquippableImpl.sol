// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../RMRK/equippable/RMRKEquippable.sol";
import "../../RMRK/extension/RMRKRoyalties.sol";
import "../../RMRK/utils/RMRKCollectionMetadata.sol";
import "../../RMRK/utils/RMRKMintingUtils.sol";

error RMRKMintZero();

// Abstract implementations to reduce duplication amont implementations: RMRKEquippableImpl and RMRKEquippableImplErc20Pay
// Having RMRKEquippableImplErc20Pay inherit and override RMRKEquippableImpl was discarded since it added a lot of size to the contract
abstract contract RMRKAbstractEquippableImpl is
    RMRKMintingUtils,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKEquippable
{
    uint256 private _totalAssets;
    string private _tokenURI;

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

    function _charge(uint256 value) internal virtual;

    function addAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 replacesAssetWithId
    ) public virtual onlyOwnerOrContributor {
        _addAssetToToken(tokenId, assetId, replacesAssetWithId);
    }

    function addAssetEntry(
        uint64 equippableGroupId,
        address baseAddress,
        string memory metadataURI,
        uint64[] memory fixedPartIds,
        uint64[] memory slotPartIds
    ) public virtual onlyOwnerOrContributor returns (uint256) {
        unchecked {
            _totalAssets += 1;
        }
        _addAssetEntry(
            uint64(_totalAssets),
            equippableGroupId,
            baseAddress,
            metadataURI,
            fixedPartIds,
            slotPartIds
        );
        return _totalAssets;
    }

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

    function totalAssets() public view virtual returns (uint256) {
        return _totalAssets;
    }

    function tokenURI(uint256)
        public
        view
        virtual
        override
        returns (string memory)
    {
        return _tokenURI;
    }

    function updateRoyaltyRecipient(address newRoyaltyRecipient)
        public
        virtual
        override
        onlyOwner
    {
        _setRoyaltyRecipient(newRoyaltyRecipient);
    }

    function _setTokenURI(string memory tokenURI_) internal virtual {
        _tokenURI = tokenURI_;
    }
}
