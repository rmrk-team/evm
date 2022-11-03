// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/nesting/RMRKNestingMultiResource.sol";

// import "hardhat/console.sol";

//Minimal public implementation of RMRKNestingMultiResource for testing.
contract RMRKNestingMultiResourceMock is RMRKNestingMultiResource {
    constructor(string memory name, string memory symbol)
        RMRKNestingMultiResource(name, symbol)
    {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }

    function safeMint(
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public {
        _safeMint(to, tokenId, _data);
    }

    function nestMint(
        address to,
        uint256 tokenId,
        uint256 destId
    ) external {
        _nestMint(to, tokenId, destId);
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
}
