// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./abstracts/RMRKAbstractEquippableImpl.sol";

error RMRKMintUnderpriced();

/**
 * @title RMRKEquippableImpl
 * @author RMRK team
 * @notice Implementation of RMRK equippable module.
 */
contract RMRKEquippableImpl is RMRKAbstractEquippableImpl {
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
        RMRKEquippable(name, symbol)
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
    function mint(address to, uint256 numToMint)
        public
        payable
        virtual
        notLocked
        saleIsOpen
    {
        (uint256 nextToken, uint256 totalSupplyOffset) = _preMint(numToMint);

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _safeMint(to, i, "");
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Used to mint a desired number of child tokens to a given parent token.
     * @dev The `data` value of the `_safeMint` method is set to an empty value.
     * @dev Can only be called while the open sale is open.
     * @param to Address of the collection smart contract of the token into which to mint the child token
     * @param numToMint Number of tokens to mint
     * @param destinationId ID of the token into which to mint the new child token
     */
    function nestMint(
        address to,
        uint256 numToMint,
        uint256 destinationId
    ) public payable virtual notLocked saleIsOpen {
        (uint256 nextToken, uint256 totalSupplyOffset) = _preMint(numToMint);

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _nestMint(to, i, destinationId, "");
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Used to verify that the amount of native currency accompanying the transaction equals the expected value.
     * @param value The expected amount of native currency to accompany the transaction
     */
    function _charge(uint256 value) internal virtual override {
        if (value != msg.value) revert RMRKMintUnderpriced();
    }
}
