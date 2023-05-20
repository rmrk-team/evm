// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../RMRK/extension/multiAssetAutoIndex/RMRKMultiAssetAutoIndexUpgradeable.sol";
import "../RMRK/security/InitializationGuard.sol";

contract RMRKMultiAssetAutoIndexMockUpgradeable is InitializationGuard, RMRKMultiAssetAutoIndexUpgradeable {
    function initialize(
        string memory name_,
        string memory symbol_
    ) public initializable {
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
