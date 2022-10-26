// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../RMRK/extension/RMRKRoyalties.sol";
import "../../RMRK/multiresource/RMRKMultiResource.sol";
import "../../RMRK/utils/RMRKCollectionMetadata.sol";
import "../../RMRK/utils/RMRKMintingUtilsErc20Pay.sol";

error RMRKMintZero();
error RMRKNotEnoughAllowance();

contract RMRKMultiResourceImplErc20Pay is
    RMRKMintingUtilsErc20Pay,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKMultiResource
{
    struct InitData {
        address tokenAddress; // 20 bytes
        uint64 maxSupply; // 8 bytes
        uint16 royaltyPercentageBps; // 2 bytes
        // 30 bytes so far
        address royaltyRecipient; // 20 bytes
        uint96 pricePerMint; //  12 bytes
        // another 32 bytes
    }

    // Manage resources via increment
    uint256 private _totalResources;
    string private _tokenURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata_,
        string memory tokenURI_,
        InitData memory data
    )
        RMRKMultiResource(name, symbol)
        RMRKMintingUtilsErc20Pay(
            data.tokenAddress,
            data.maxSupply,
            data.pricePerMint
        )
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(data.royaltyRecipient, data.royaltyPercentageBps)
    {
        _tokenURI = tokenURI_;
    }

    /*
    Template minting logic
    */
    function mint(address to, uint256 numToMint) external saleIsOpen notLocked {
        if (numToMint == uint256(0)) revert RMRKMintZero();
        if (numToMint + _totalSupply > _maxSupply) revert RMRKMintOverMax();

        uint256 mintPriceRequired = numToMint * _pricePerMint;

        if (
            IERC20(_tokenAddress).allowance(msg.sender, address(this)) <
            mintPriceRequired
        ) revert RMRKNotEnoughAllowance();
        IERC20(_tokenAddress).transferFrom(
            msg.sender,
            address(this),
            mintPriceRequired
        );

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

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external onlyOwnerOrContributor {
        _requireMinted(tokenId);
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(string memory metadataURI)
        external
        onlyOwnerOrContributor
    {
        unchecked {
            _totalResources += 1;
        }
        _addResourceEntry(uint64(_totalResources), metadataURI);
    }

    function totalResources() external view returns (uint256) {
        return _totalResources;
    }

    function tokenURI(uint256) public view override returns (string memory) {
        return _tokenURI;
    }

    function updateRoyaltyRecipient(address newRoyaltyRecipient)
        external
        override
    {
        _setRoyaltyRecipient(newRoyaltyRecipient);
    }
}
