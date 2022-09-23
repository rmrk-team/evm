// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../RMRK/extension/typedMultiResource/RMRKNestingTypedMultiResource.sol";
import "hardhat/console.sol";

error RMRKTokenHasNoResourcesWithType();

contract RMRKNestingTypedMultiResourceMock is RMRKNestingTypedMultiResource {
    constructor(string memory name, string memory symbol)
        RMRKNestingTypedMultiResource(name, symbol)
    {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external {
        _requireMinted(tokenId);
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addTypedResourceEntry(
        uint64 id,
        string memory metadataURI,
        string memory type_
    ) external {
        _addTypedResourceEntry(id, metadataURI, type_);
    }
}
