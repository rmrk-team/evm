// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/RMRKMultiResource.sol";

contract RMRKMultiResourceMock is RMRKMultiResource {

    constructor(string memory name, string memory symbol)
        RMRKMultiResource(name, symbol) {}

    function setFallbackURI(string memory fallbackURI) external {
        _setFallbackURI(fallbackURI);
    }

    function setTokenEnumeratedResource(
        uint64 resourceId,
        bool state
    ) external {
        _setTokenEnumeratedResource(resourceId, state);
    }

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external {
        if(ownerOf(tokenId) == address(0)) revert ERC721InvalidTokenId();
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(
        uint64 id,
        string memory metadataURI,
        uint128[] memory custom
    ) external {
        _addResourceEntry(id, metadataURI, custom);
    }

    function setCustomResourceData(
        uint64 resourceId,
        uint128 customResourceId,
        bytes memory data
    ) external {
        _setCustomResourceData(resourceId, customResourceId, data);
    }

    function addCustomDataToResource(
        uint64 resourceId,
        uint128 customResourceId
    ) external {
        _addCustomDataToResource(resourceId, customResourceId);
    }

    function removeCustomDataFromResource(
        uint64 resourceId,
        uint256 index
    ) external {
        _removeCustomDataFromResource(resourceId, index);
    }

}
