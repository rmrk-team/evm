// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/access/RMRKIssuable.sol";
import "../RMRK/RMRKMultiResource.sol";

contract RMRKMultiResourceMock is RMRKIssuable, RMRKMultiResource {

    address private _issuer;

    constructor(string memory name, string memory symbol)
        RMRKMultiResource(name, symbol) {}

    function setFallbackURI(string memory fallbackURI) external onlyIssuer {
        _setFallbackURI(fallbackURI);
    }

    function setTokenEnumeratedResource(
        uint64 resourceId,
        bool state
    ) external onlyIssuer {
        _setTokenEnumeratedResource(resourceId, state);
    }

    function mint(address to, uint256 tokenId) external onlyIssuer {
        _mint(to, tokenId);
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external onlyIssuer {
        if(ownerOf(tokenId) == address(0)) revert ERC721OwnerQueryForNonexistentToken();
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(
        uint64 id,
        string memory metadataURI,
        uint128[] memory custom
    ) external onlyIssuer {
        _addResourceEntry(id, metadataURI, custom);
    }

    function setCustomResourceData(
        uint64 resourceId,
        uint128 customResourceId,
        bytes memory data
    ) external onlyIssuer {
        _setCustomResourceData(resourceId, customResourceId, data);
    }

    function addCustomDataToResource(
        uint64 resourceId,
        uint128 customResourceId
    ) external onlyIssuer {
        _addCustomDataToResource(resourceId, customResourceId);
    }

    function removeCustomDataFromResource(
        uint64 resourceId,
        uint256 index
    ) external onlyIssuer {
        _removeCustomDataFromResource(resourceId, index);
    }

}
