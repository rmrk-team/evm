// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../RMRK/extension/RMRKRoyalties.sol";
import "../../RMRK/nestable/RMRKNestable.sol";
import "../../RMRK/utils/RMRKCollectionMetadata.sol";
import "../../RMRK/utils/RMRKMintingUtils.sol";

error RMRKMintZero();

abstract contract RMRKAbstractNestableImpl is
    RMRKMintingUtils,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKNestable
{
    string private _tokenURI;

    function _preMint(uint256 numToMint)
        internal
        virtual
        returns (uint256, uint256)
    {
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
