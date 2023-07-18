// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../abstract/RMRKAbstractNestableMultiAsset.sol";
import "../utils/RMRKTokenURIPerToken.sol";

contract RMRKNestableMultiAssetPreMint is
    RMRKTokenURIPerToken,
    RMRKAbstractNestableMultiAsset
{
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        uint256 maxSupply,
        address royaltyRecipient,
        uint16 royaltyPercentageBps
    )
        RMRKRoyalties(royaltyRecipient, royaltyPercentageBps)
        RMRKImplementationBase(name, symbol, collectionMetadata, maxSupply)
    {}

    /**
     * @notice Used to mint the desired number of tokens to the specified address.
     * @dev The `data` value of the `_safeMint` method is set to an empty value.
     * @dev Can only be called while the open sale is open.
     * @param to Address to which to mint the token
     * @param numToMint Number of tokens to mint
     * @param tokenURI URI assigned to all the minted tokens
     * @return The ID of the first token to be minted in the current minting cycle
     */
    function mint(
        address to,
        uint256 numToMint,
        string memory tokenURI
    ) public virtual onlyOwnerOrContributor returns (uint256) {
        (uint256 nextToken, uint256 totalSupplyOffset) = _prepareMint(
            numToMint
        );

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _setTokenURI(i, tokenURI);
            _safeMint(to, i, "");
            unchecked {
                ++i;
            }
        }

        return nextToken;
    }

    /**
     * @notice Used to mint a desired number of child tokens to a given parent token.
     * @dev The `data` value of the `_safeMint` method is set to an empty value.
     * @dev Can only be called while the open sale is open.
     * @param to Address of the collection smart contract of the token into which to mint the child token
     * @param numToMint Number of tokens to mint
     * @param destinationId ID of the token into which to mint the new child token
     * @param tokenURI URI assigned to all the minted tokens
     * @return The ID of the first token to be minted in the current minting cycle
     */
    function nestMint(
        address to,
        uint256 numToMint,
        uint256 destinationId,
        string memory tokenURI
    ) public virtual onlyOwnerOrContributor returns (uint256) {
        (uint256 nextToken, uint256 totalSupplyOffset) = _prepareMint(
            numToMint
        );

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _setTokenURI(i, tokenURI);
            _nestMint(to, i, destinationId, "");
            unchecked {
                ++i;
            }
        }

        return nextToken;
    }
}
