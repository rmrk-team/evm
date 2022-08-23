// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/access/OwnableLock.sol";
import "../RMRK/utils/RMRKMintingUtils.sol";
import "../RMRK/RMRKMultiResource.sol";

//import "hardhat/console.sol";

error RMRKMintUnderpriced();
error RMRKMintZero();

contract RMRKMultiResourceImpl is OwnableLock, RMRKMintingUtils, RMRKMultiResource {

    /*
    Top-level structures
    */

    // Manage resources via increment
    uint256 private _totalResources;

    constructor(
        string memory name,
        string memory symbol,
        uint256 maxSupply_,
        uint256 pricePerMint_ //in WEI
    )
    RMRKMultiResource(name, symbol)
    RMRKMintingUtils(maxSupply_, pricePerMint_)
    {
    }

    /*
    Template minting logic
    */
    function mint(address to, uint256 numToMint) external payable saleIsOpen notLocked {
        if (numToMint == uint256(0)) revert RMRKMintZero();
        if (numToMint + _totalSupply > _maxSupply) revert RMRKMintOverMax();

        uint256 mintPriceRequired = numToMint * _pricePerMint;
        if (mintPriceRequired != msg.value) 
            revert RMRKMintUnderpriced();

        uint256 nextToken = _totalSupply+1;
        _totalSupply += numToMint;
        uint256 totalSupplyOffset = _totalSupply+1;

        for(uint i = nextToken; i < totalSupplyOffset;) {
            _safeMint(to, i);
            unchecked {++i;}
        }
    }

    function setFallbackURI(string memory fallbackURI) external onlyOwner {
        _setFallbackURI(fallbackURI);
    }

    function setTokenEnumeratedResource(
        uint64 resourceId,
        bool state
    ) external onlyOwner {
        _setTokenEnumeratedResource(resourceId, state);
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external onlyOwner {
        if(ownerOf(tokenId) == address(0)) revert ERC721InvalidTokenId();
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(
        string memory metadataURI
    ) external onlyOwner {
        unchecked {_totalResources += 1;}
        _addResourceEntry(uint64(_totalResources), metadataURI);
    }

    function totalResources() external view returns(uint256) {
        return _totalResources;
    }

}
