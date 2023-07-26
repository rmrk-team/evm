// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "../abstract/RMRKAbstractMultiAsset.sol";
import "../utils/RMRKTokenURIPerToken.sol";

contract RMRKMultiAssetPreMint is RMRKTokenURIPerToken, RMRKAbstractMultiAsset {
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        uint256 maxSupply,
        address royaltyRecipient,
        uint16 royaltyPercentageBps
    )
        RMRKImplementationBase(
            name,
            symbol,
            collectionMetadata,
            maxSupply,
            royaltyRecipient,
            royaltyPercentageBps
        )
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
}
