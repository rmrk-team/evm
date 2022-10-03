// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/utils/RMRKMintingUtils.sol";
import "../RMRK/utils/RMRKCollectionMetadata.sol";
import "../RMRK/multiresource/RMRKMultiResource.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

//import "hardhat/console.sol";

error RMRKMintUnderpriced();
error RMRKMintZero();

contract RMRKMultiResourceImpl is
    RMRKMintingUtils,
    RMRKCollectionMetadata,
    RMRKMultiResource
{
    using Strings for uint256;

    /*
    Top-level structures
    */

    // Manage resources via increment
    uint256 private _totalResources;
    string private _tokenURI;

    constructor(
        string memory name,
        string memory symbol,
        uint256 maxSupply_,
        uint256 pricePerMint_, //in WEI
        string memory collectionMetadata_,
        string memory tokenURI_
    )
        RMRKMultiResource(name, symbol)
        RMRKMintingUtils(maxSupply_, pricePerMint_)
        RMRKCollectionMetadata(collectionMetadata_)
    {
        _tokenURI = tokenURI_;
    }

    /*
    Template minting logic
    */
    function mint(address to, uint256 numToMint)
        external
        payable
        saleIsOpen
        notLocked
    {
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

    function addResourceEntry(string memory metadataURI) external onlyOwnerOrContributor {
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
}
