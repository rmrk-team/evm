// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../RMRK/extension/RMRKRoyalties.sol";
import "../../RMRK/nestable/RMRKNestableMultiAsset.sol";
import "../../RMRK/utils/RMRKCollectionMetadata.sol";
import "../../RMRK/utils/RMRKMintingUtils.sol";

error RMRKMintZero();

abstract contract RMRKAbstractNestableMultiAssetImpl is
    RMRKMintingUtils,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKNestableMultiAsset
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
    ) public onlyOwnerOrContributor {
        _addAssetToToken(tokenId, assetId, replacesAssetWithId);
    }

    function addAssetEntry(string memory metadataURI)
        public
        virtual
        onlyOwnerOrContributor
        returns (uint256)
    {
        unchecked {
            _totalAssets += 1;
        }
        _addAssetEntry(uint64(_totalAssets), metadataURI);
        return _totalAssets;
    }

    function totalAssets() public view returns (uint256) {
        return _totalAssets;
    }

    function transfer(address to, uint256 tokenId) public virtual {
        transferFrom(_msgSender(), to, tokenId);
    }

    function nestTransfer(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) public virtual {
        nestTransferFrom(_msgSender(), to, tokenId, destinationId, "");
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
        override
        onlyOwner
    {
        _setRoyaltyRecipient(newRoyaltyRecipient);
    }

    function _setTokenURI(string memory tokenURI_) internal {
        _tokenURI = tokenURI_;
    }
}
