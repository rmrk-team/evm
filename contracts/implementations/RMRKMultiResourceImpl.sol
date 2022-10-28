// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./abstracts/RMRKAbstractMultiResourceImpl.sol";

error RMRKMintUnderpriced();

contract RMRKMultiResourceImpl is RMRKAbstractMultiResourceImpl {
    constructor(
        string memory name,
        string memory symbol,
        uint256 maxSupply_,
        uint256 pricePerMint_, //in WEI
        string memory collectionMetadata_,
        string memory tokenURI_,
        address royaltyRecipient,
        uint256 royaltyPercentageBps //in basis points
    )
        RMRKMintingUtils(maxSupply_, pricePerMint_)
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(royaltyRecipient, royaltyPercentageBps)
        RMRKMultiResource(name, symbol)
    {
        _setTokenURI(tokenURI_);
    }

    function mint(address to, uint256 numToMint)
        external
        payable
        saleIsOpen
        notLocked
    {
        if (numToMint == uint256(0)) revert RMRKMintZero();
        if (numToMint + _totalSupply > _maxSupply) revert RMRKMintOverMax();

        uint256 mintPriceRequired = numToMint * _pricePerMint;
        if (mintPriceRequired != msg.value) revert RMRKMintUnderpriced();

        uint256 nextToken = _totalSupply + 1;
        unchecked {
            _totalSupply += numToMint;
        }
        uint256 totalSupplyOffset = _totalSupply + 1;

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _safeMint(to, i);
            unchecked {
                ++i;
            }
        }
    }
}
