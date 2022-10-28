// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../RMRK/extension/RMRKRoyalties.sol";
import "../../RMRK/nesting/RMRKNestingMultiResource.sol";
import "../../RMRK/utils/RMRKCollectionMetadata.sol";
import "../../RMRK/utils/RMRKMintingUtils.sol";

error RMRKMintZero();

abstract contract RMRKAbstractNestingMultiResourceImpl is
    RMRKMintingUtils,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKNestingMultiResource
{
    uint256 private _totalResources;
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

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external onlyOwnerOrContributor {
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(string memory metadataURI)
        external
        onlyOwnerOrContributor
    {
        unchecked {
            _totalResources += 1;
        }
        _addResourceEntry(uint64(_totalResources), metadataURI);
    }

    function totalResources() external view returns (uint256) {
        return _totalResources;
    }

    function transfer(address to, uint256 tokenId) public virtual {
        transferFrom(_msgSender(), to, tokenId);
    }

    function nestTransfer(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) public virtual {
        nestTransferFrom(_msgSender(), to, tokenId, destinationId);
    }

    function tokenURI(uint256) public view override returns (string memory) {
        return _tokenURI;
    }

    function updateRoyaltyRecipient(address newRoyaltyRecipient)
        external
        override
    {
        _setRoyaltyRecipient(newRoyaltyRecipient);
    }

    function _setTokenURI(string memory tokenURI_) internal {
        _tokenURI = tokenURI_;
    }

    function _charge(uint256 value) internal virtual;
}
