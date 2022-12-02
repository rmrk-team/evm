// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/multiasset/RMRKMultiAsset.sol";

contract RMRKMultiAssetMock is RMRKMultiAsset {
    constructor(
        string memory name,
        string memory symbol
    ) RMRKMultiAsset(name, symbol) {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function safeMint(address to, uint256 tokenId) external {
        _safeMint(to, tokenId, "");
    }

    function safeMint(address to, uint256 tokenId, bytes memory data) external {
        _safeMint(to, tokenId, data);
    }

    function transfer(address to, uint256 tokenId) external {
        _transfer(_msgSender(), to, tokenId);
    }

    function burn(uint256 tokenId) external {
        _burn(tokenId);
    }

    function addAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 replacesAssetWithId
    ) external {
        _addAssetToToken(tokenId, assetId, replacesAssetWithId);
    }

    function addAssetEntry(uint64 id, string memory metadataURI) external {
        _addAssetEntry(id, metadataURI);
    }
}
