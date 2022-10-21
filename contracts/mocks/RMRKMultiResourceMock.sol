// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/multiresource/RMRKMultiResource.sol";

contract RMRKMultiResourceMock is RMRKMultiResource {
    constructor(string memory name, string memory symbol)
        RMRKMultiResource(name, symbol)
    {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function safeMint(address to, uint256 tokenId) external {
        _safeMint(to, tokenId);
    }

    function safeMint(
        address to,
        uint256 tokenId,
        bytes memory data
    ) external {
        _safeMint(to, tokenId, data);
    }

    function transfer(address to, uint256 tokenId) external {
        _transfer(_msgSender(), to, tokenId);
    }

    function burn(uint256 tokenId) external {
        _burn(tokenId);
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external {
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(uint64 id, string memory metadataURI) external {
        _addResourceEntry(id, metadataURI);
    }
}
