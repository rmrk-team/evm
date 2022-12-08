// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../abstracts/RMRKAbstractMultiAssetImpl.sol";
import "../IRMRKInitData.sol";
import "./RMRKErc20Pay.sol";

/**
 * @title RMRKMultiAssetImplErc20Pay
 * @author RMRK team
 * @notice Implementation of RMRK multi asset module with ERC20 pay.
 */
contract RMRKMultiAssetImplErc20Pay is
    IRMRKInitData,
    RMRKErc20Pay,
    RMRKAbstractMultiAssetImpl
{
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
        RMRKErc20Pay(data.erc20TokenAddress)
        RMRKMultiAsset(name_, symbol_)
    {}

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
    ) public virtual saleIsOpen notLocked {
        if (numToMint == uint256(0)) revert RMRKMintZero();
        if (numToMint + _totalSupply > _maxSupply) revert RMRKMintOverMax();

        uint256 mintPriceRequired = numToMint * _pricePerMint;
        _chargeFromToken(msg.sender, address(this), mintPriceRequired);
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
