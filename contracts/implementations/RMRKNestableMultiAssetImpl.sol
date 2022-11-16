// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./abstracts/RMRKAbstractNestableMultiAssetImpl.sol";

error RMRKMintUnderpriced();

contract RMRKNestableMultiAssetImpl is RMRKAbstractNestableMultiAssetImpl {
    constructor(
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 pricePerMint,
        string memory collectionMetadata_,
        string memory tokenURI_,
        address royaltyRecipient,
        uint256 royaltyPercentageBps //in basis points
    )
        RMRKMintingUtils(maxSupply, pricePerMint)
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(royaltyRecipient, royaltyPercentageBps)
        RMRKNestableMultiAsset(name, symbol)
    {
        _setTokenURI(tokenURI_);
    }

    function mint(address to, uint256 numToMint)
        public
        payable
        virtual
        saleIsOpen
    {
        (uint256 nextToken, uint256 totalSupplyOffset) = _preMint(numToMint);

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _safeMint(to, i);
            unchecked {
                ++i;
            }
        }
    }

    function nestMint(
        address to,
        uint256 numToMint,
        uint256 destinationId
    ) public payable virtual saleIsOpen {
        (uint256 nextToken, uint256 totalSupplyOffset) = _preMint(numToMint);

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _nestMint(to, i, destinationId);
            unchecked {
                ++i;
            }
        }
    }

    function _charge(uint256 value) internal virtual override {
        if (value != msg.value) revert RMRKMintUnderpriced();
    }
}
