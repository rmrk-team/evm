// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../RMRK/equippable/RMRKNestableExternalEquip.sol";
import "../../RMRK/extension/RMRKRoyalties.sol";
import "../../RMRK/utils/RMRKCollectionMetadata.sol";
import "../../RMRK/utils/RMRKMintingUtils.sol";
import "../../RMRK/utils/RMRKTokenURI.sol";
import "../IRMRKInitData.sol";

error RMRKMintUnderpriced();
error RMRKMintZero();

/**
 * @title RMRKNestableExternalEquipImpl
 * @author RMRK team
 * @notice Implementation of RMRK nestable external equip module.
 */
contract RMRKNestableExternalEquipImpl is
    IRMRKInitData,
    RMRKMintingUtils,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKTokenURI,
    RMRKNestableExternalEquip
{
    address private _equippableAddress;

    /**
     * @notice Used to initialize the smart contract.
     * @dev The full `InitData` looks like this:
     *  [
     *      erc20TokenAddress,
     *      tokenUriIsEnumerable,
     *      royaltyRecipient,
     *      royaltyPercentageBps,
     *      maxSupply,
     *      pricePerMint
     *  ]
     * @param name_ Name of the token collection
     * @param symbol_ Symbol of the token collection
     * @param collectionMetadata_ The collection metadata URI
     * @param tokenURI_ The base URI of the token metadata
     * @param data The `InitData` struct containing additional initialization data
     */
    constructor(
        address equippableAddress_,
        string memory name_,
        string memory symbol_,
        string memory collectionMetadata_,
        string memory tokenURI_,
        InitData memory data
    )
        RMRKMintingUtils(data.maxSupply, data.pricePerMint)
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(data.royaltyRecipient, data.royaltyPercentageBps)
        RMRKTokenURI(tokenURI_, data.tokenUriIsEnumerable)
        RMRKNestableExternalEquip(name_, symbol_)
    {
        // Can't add an equippable deployment here due to contract size, for factory
        // pattern can use OZ clone
        _equippableAddress = equippableAddress_;
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
    ) public payable virtual notLocked {
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
    ) public payable virtual notLocked {
        (uint256 nextToken, uint256 totalSupplyOffset) = _preMint(numToMint);

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _nestMint(to, i, destinationId, "");
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Used to calculate the token IDs of tokens to be minted.
     * @param numToMint Amount of tokens to be minted
     * @return The ID of the first token to be minted in the current minting cycle
     * @return The ID of the last token to be minted in the current minting cycle
     */
    function _preMint(uint256 numToMint) private returns (uint256, uint256) {
        if (numToMint == uint256(0)) revert RMRKMintZero();
        if (numToMint + _totalSupply > _maxSupply) revert RMRKMintOverMax();

        uint256 mintPriceRequired = numToMint * _pricePerMint;
        if (mintPriceRequired != msg.value) revert RMRKMintUnderpriced();

        uint256 nextToken = _totalSupply + 1;
        unchecked {
            _totalSupply += numToMint;
        }
        uint256 totalSupplyOffset = _totalSupply + 1;

        return (nextToken, totalSupplyOffset);
    }

    /**
     * @notice Used to set the address of the `Equippable` smart contract.
     * @param equippable Address of the `Equippable` smart contract
     */
    function setEquippableAddress(address equippable) public virtual onlyOwner {
        //TODO: should we add a check if passed address supports IRMRKNestableExternalEquip
        _setEquippableAddress(equippable);
    }

    /**
     * @inheritdoc RMRKRoyalties
     */
    function updateRoyaltyRecipient(
        address newRoyaltyRecipient
    ) public virtual override onlyOwner {
        _setRoyaltyRecipient(newRoyaltyRecipient);
    }
}
