// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../abstracts/RMRKAbstractMultiResourceImpl.sol";
import "../IRMRKInitData.sol";
import "./RMRKErc20Pay.sol";

contract RMRKMultiResourceImplErc20Pay is
    IRMRKInitData,
    RMRKErc20Pay,
    RMRKAbstractMultiResourceImpl
{
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata_,
        string memory tokenURI_,
        InitData memory data
    )
        RMRKMintingUtils(data.maxSupply, data.pricePerMint)
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(data.royaltyRecipient, data.royaltyPercentageBps)
        RMRKErc20Pay(data.erc20TokenAddress)
        RMRKMultiResource(name, symbol)
    {
        _setTokenURI(tokenURI_);
    }

    function mint(address to, uint256 numToMint) external saleIsOpen notLocked {
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
            _safeMint(to, i);
            unchecked {
                ++i;
            }
        }
    }
}
