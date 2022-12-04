// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./abstracts/RMRKAbstractMultiAssetImpl.sol";

error RMRKMintUnderpriced();

/**
 * @title RMRKMultiAssetImpl
 * @author RMRK team
 * @notice Implementation of RMRK multi asset module.
 */
contract RMRKMultiAssetImpl is RMRKAbstractMultiAssetImpl {
    /**
     * @notice Used to initialize the smart contract.
     * @param name Name of the token collection
     * @param symbol Symbol of the token collection
     * @param maxSupply_ Maximum supply of tokens in the collection
     * @param pricePerMint_ Minting price of a token represented in the smallest denomination of the native currency
     * @param collectionMetadata_ The collection metadata URI
     * @param tokenURI_ The base URI of the token metadata
     * @param royaltyRecipient The recipient of resale royalties
     * @param royaltyPercentageBps The percentage of resale value to be allocated to the `royaltyRecipient` expressed in
     *  the basis points
     */
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
        RMRKMultiAsset(name, symbol)
    {
        _setTokenURI(tokenURI_);
    }

    /**
     * @notice Used to mint the desired number of tokens to the specified address.
     * @dev The `data` value of the `_safeMint` method is set to an empty value.
     * @dev Can only be called while the open sale is open.
     * @param to Address to which to mint the token
     * @param numToMint Number of tokens to mint
     */
    function mint(
        address to,
        uint256 numToMint
    ) public payable virtual saleIsOpen notLocked {
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
            _safeMint(to, i, "");
            unchecked {
                ++i;
            }
        }
    }
}
