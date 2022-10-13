// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/library/LibDiamond.sol";
import "../RMRK/internalFunctionSet/RMRKEquippableInternal.sol";
import "../RMRK/internalFunctionSet/RMRKCollectionMetadataInternal.sol";
import "@openzeppelin/contracts/utils/Multicall.sol";

contract RMRKEquippableImpl is
    RMRKEquippableInternal,
    RMRKCollectionMetadataInternal,
    Multicall
{
    function mint(address to, uint256 tokenId) public {
        LibDiamond.enforceIsContractOwner();

        _safeMint(to, tokenId);
    }

    function setCollectionMetadata(string calldata newMetadata) external {
        LibDiamond.enforceIsContractOwner();

        _setCollectionMetadata(newMetadata);
    }

    function addBaseRelatedResourceEntry(
        uint64 id,
        BaseRelatedData calldata baseRelatedResourceData,
        string memory metadataURI
    ) external {
        LibDiamond.enforceIsContractOwner();

        _addBaseRelatedResourceEntry(id, baseRelatedResourceData, metadataURI);
    }

    function addResourceEntry(uint64 id, string memory metadataURI) external {
        LibDiamond.enforceIsContractOwner();

        _addResourceEntry(id, metadataURI);
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external {
        _addResourceToToken(tokenId, resourceId, overwrites);
    }
}
