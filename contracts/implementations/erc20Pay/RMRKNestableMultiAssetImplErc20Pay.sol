// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../abstracts/RMRKAbstractNestableMultiAssetImpl.sol";
import "../IRMRKInitData.sol";
import "./RMRKErc20Pay.sol";

contract RMRKNestableMultiAssetImplErc20Pay is
    IRMRKInitData,
    RMRKErc20Pay,
    RMRKAbstractNestableMultiAssetImpl
{
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
        RMRKErc20Pay(data.erc20TokenAddress)
        RMRKNestableMultiAsset(name_, symbol_)
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
            _nestMint(to, i, destinationId, "");
            unchecked {
                ++i;
            }
        }
    }

    function _charge(uint256 value) internal virtual override {
        _chargeFromToken(msg.sender, address(this), value);
    }
}
