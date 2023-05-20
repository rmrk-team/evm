// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/extension/typedMultiAsset/RMRKTypedMultiAssetUpgradeable.sol";
import "../../RMRKMultiAssetMockUpgradeable.sol";
import "../../../RMRK/security/InitializationGuard.sol";

error RMRKTokenHasNoAssetsWithType();

contract RMRKTypedMultiAssetMockUpgradeable is InitializationGuard, RMRKMultiAssetMockUpgradeable, RMRKTypedMultiAssetUpgradeable {
    uint64 private constant _LOWEST_POSSIBLE_PRIORITY = 2 ** 64 - 1;

    function initialize(
        string memory name,
        string memory symbol
    ) public override initializable {
        super.initialize(name, symbol);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKMultiAssetUpgradeable, RMRKTypedMultiAssetUpgradeable)
        returns (bool)
    {
        return
            RMRKTypedMultiAssetUpgradeable.supportsInterface(interfaceId) ||
            RMRKMultiAssetUpgradeable.supportsInterface(interfaceId);
    }

    function addTypedAssetEntry(
        uint64 assetId,
        string memory metadataURI,
        string memory type_
    ) external {
        _addAssetEntry(assetId, metadataURI);
        _setAssetType(assetId, type_);
    }

    function getTopAssetMetaForTokenWithType(
        uint256 tokenId,
        string memory type_
    ) external view returns (string memory) {
        uint64[] memory priorities = getActiveAssetPriorities(tokenId);
        uint64[] memory assets = getActiveAssets(tokenId);
        uint256 len = priorities.length;

        uint64 maxPriority = _LOWEST_POSSIBLE_PRIORITY;
        uint64 maxPriorityAsset;
        bytes32 targetTypeEncoded = keccak256(bytes(type_));
        for (uint64 i; i < len; ) {
            uint64 currentPrio = priorities[i];
            bytes32 assetTypeEncoded = keccak256(
                bytes(getAssetType(assets[i]))
            );
            if (
                assetTypeEncoded == targetTypeEncoded &&
                currentPrio < maxPriority
            ) {
                maxPriority = currentPrio;
                maxPriorityAsset = assets[i];
            }
            unchecked {
                ++i;
            }
        }
        if (maxPriority == _LOWEST_POSSIBLE_PRIORITY)
            revert RMRKTokenHasNoAssetsWithType();
        return getAssetMetadata(tokenId, maxPriorityAsset);
    }
}
