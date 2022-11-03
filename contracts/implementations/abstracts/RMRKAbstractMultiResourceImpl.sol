// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../RMRK/extension/RMRKRoyalties.sol";
import "../../RMRK/multiresource/RMRKMultiResource.sol";
import "../../RMRK/utils/RMRKCollectionMetadata.sol";
import "../../RMRK/utils/RMRKMintingUtils.sol";

error RMRKMintZero();

abstract contract RMRKAbstractMultiResourceImpl is
    RMRKMintingUtils,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKMultiResource
{
    uint256 private _totalResources;
    string private _tokenURI;

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) public virtual onlyOwnerOrContributor {
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(string memory metadataURI)
        public
        virtual
        onlyOwnerOrContributor
    {
        unchecked {
            _totalResources += 1;
        }
        _addResourceEntry(uint64(_totalResources), metadataURI);
    }

    function totalResources() public view virtual returns (uint256) {
        return _totalResources;
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
