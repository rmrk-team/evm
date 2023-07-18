// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../RMRK/extension/multiAssetAutoIndex/RMRKMultiAssetAutoIndex.sol";

contract RMRKMultiAssetAutoIndexMock is RMRKMultiAssetAutoIndex {
    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
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
