// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../RMRK/extension/multiAssetAutoIndex/RMRKMultiAssetAutoIndexUpgradeable.sol";

contract RMRKMultiAssetAutoIndexMockUpgradeable is
    RMRKMultiAssetAutoIndexUpgradeable
{
    function __RMRKMultiAssetAutoIndexMockUpgradeable_init(
        string memory name_,
        string memory symbol_
    ) public onlyInitializing {
        __RMRKMultiAssetAutoIndexUpgradeable_init(name_, symbol_);
    }

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
