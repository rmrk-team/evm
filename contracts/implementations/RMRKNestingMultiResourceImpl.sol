// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/extension/RMRKRoyalties.sol";
import "../RMRK/nesting/RMRKNestingMultiResource.sol";
import "../RMRK/utils/RMRKCollectionMetadata.sol";
import "../RMRK/utils/RMRKMintingUtils.sol";

error RMRKMintUnderpriced();
error RMRKMintZero();

contract RMRKNestingMultiResourceImpl is
    RMRKMintingUtils,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKNestingMultiResource
{
    // Manage resources via increment
    uint256 private _totalResources;
    string private _tokenURI;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 pricePerMint_,
        string memory collectionMetadata_,
        string memory tokenURI_,
        address royaltyRecipient,
        uint256 royaltyPercentageBps //in basis points
    )
        RMRKNestingMultiResource(name_, symbol_)
        RMRKMintingUtils(maxSupply_, pricePerMint_)
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(royaltyRecipient, royaltyPercentageBps)
    {
        _tokenURI = tokenURI_;
    }

    /*
    Template minting logic
    */
    function mint(address to, uint256 numToMint) external payable saleIsOpen {
        (uint256 nextToken, uint256 totalSupplyOffset) = _preMint(numToMint);

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _safeMint(to, i);
            unchecked {
                ++i;
            }
        }
    }

    /*
    Template minting logic
    */
    function mintNesting(
        address to,
        uint256 numToMint,
        uint256 destinationId
    ) external payable saleIsOpen {
        (uint256 nextToken, uint256 totalSupplyOffset) = _preMint(numToMint);

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _nestMint(to, i, destinationId);
            unchecked {
                ++i;
            }
        }
    }

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

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external onlyOwnerOrContributor {
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

    function transfer(address to, uint256 tokenId) public virtual {
        transferFrom(_msgSender(), to, tokenId);
    }

    function nestTransfer(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) public virtual {
        nestTransferFrom(_msgSender(), to, tokenId, destinationId);
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
