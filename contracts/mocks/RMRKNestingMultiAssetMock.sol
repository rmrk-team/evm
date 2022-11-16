// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/nesting/RMRKNestingMultiAsset.sol";

//Minimal public implementation of RMRKNestingMultiAsset for testing.
contract RMRKNestingMultiAssetMock is RMRKNestingMultiAsset {
    constructor(string memory name, string memory symbol)
        RMRKNestingMultiAsset(name, symbol)
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

    function addAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 overwrites
    ) external {
        _addAssetToToken(tokenId, assetId, overwrites);
    }

    function addAssetEntry(uint64 id, string memory metadataURI) external {
        _addAssetEntry(id, metadataURI);
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
