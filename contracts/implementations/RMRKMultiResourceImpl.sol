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

    //Mapping of uint64 resource ID to tokenEnumeratedResource for tokenURI
    mapping(uint64 => bool) internal _tokenEnumeratedResource;

    //fallback URI
    string internal _fallbackURI;

    constructor(
        string memory name,
        string memory symbol,
        uint256 maxSupply_,
        uint256 pricePerMint_, //in WEI
        string memory collectionMetadata_
    )
        RMRKMultiResource(name, symbol)
        RMRKMintingUtils(maxSupply_, pricePerMint_)
        RMRKCollectionMetadata(collectionMetadata_)
    {}

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

    function getFallbackURI() external view virtual returns (string memory) {
        return _fallbackURI;
    }

    function setFallbackURI(string memory fallbackURI) external onlyOwner {
        _fallbackURI = fallbackURI;
    }

    function isTokenEnumeratedResource(uint64 resourceId)
        public
        view
        virtual
        returns (bool)
    {
        return _tokenEnumeratedResource[resourceId];
    }

    function setTokenEnumeratedResource(uint64 resourceId, bool state)
        external
        onlyOwner
    {
        _tokenEnumeratedResource[resourceId] = state;
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external onlyOwner {
        _requireMinted(tokenId);
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(string memory metadataURI) external onlyOwner {
        unchecked {
            _totalResources += 1;
        }
        _addResourceEntry(uint64(_totalResources), metadataURI);
    }

    function totalResources() external view returns (uint256) {
        return _totalResources;
    }

    function _tokenURIAtIndex(uint256 tokenId, uint256 index)
        internal
        view
        override
        returns (string memory)
    {
        _requireMinted(tokenId);
        if (_activeResources[tokenId].length > index) {
            uint64 activeResId = _activeResources[tokenId][index];
            Resource memory _activeRes = getResource(activeResId);
            string memory uri = string(
                abi.encodePacked(
                    _baseURI(),
                    _activeRes.metadataURI,
                    _tokenEnumeratedResource[activeResId]
                        ? tokenId.toString()
                        : ""
                )
            );

            return uri;
        } else {
            return _fallbackURI;
        }
    }
}
