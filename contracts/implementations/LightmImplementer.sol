// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/library/LibDiamond.sol";
import "../RMRK/internalFunctionSet/LightmEquippableInternal.sol";
import "../RMRK/internalFunctionSet/RMRKCollectionMetadataInternal.sol";
import "../RMRK/internalFunctionSet/LightmImplInternal.sol";
import "@openzeppelin/contracts/utils/Multicall.sol";

contract LightmImpl is
    LightmEquippableInternal,
    RMRKCollectionMetadataInternal,
    LightmImplInternal,
    Multicall
{
    function getCollectionOwner() public view returns (address owner) {
        owner = getLightmImplState()._owner;
    }

    function mint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }

    function setCollectionMetadata(string calldata newMetadata)
        external
        onlyOwner
    {
        _setCollectionMetadata(newMetadata);
    }

    function setFallbackURI(string calldata fallbackURI) external onlyOwner {
        _setFallbackURI(fallbackURI);
    }

    function addBaseRelatedResourceEntry(
        uint64 id,
        BaseRelatedData calldata baseRelatedResourceData,
        string memory metadataURI
    ) external onlyOwner {
        _addBaseRelatedResourceEntry(id, baseRelatedResourceData, metadataURI);
    }

    function addResourceEntry(uint64 id, string memory metadataURI)
        external
        onlyOwner
    {
        _addResourceEntry(id, metadataURI);
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external onlyApprovedForResourcesOrOwner(tokenId) {
        _addResourceToToken(tokenId, resourceId, overwrites);
    }
}
