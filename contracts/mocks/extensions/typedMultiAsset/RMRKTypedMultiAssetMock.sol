// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {
    RMRKTypedMultiAsset
} from "../../../RMRK/extension/typedMultiAsset/RMRKTypedMultiAsset.sol";
import {RMRKMultiAssetMock} from "../../RMRKMultiAssetMock.sol";
import {RMRKMultiAsset} from "../../../RMRK/multiasset/RMRKMultiAsset.sol";

error RMRKTokenHasNoAssetsWithType();

contract RMRKTypedMultiAssetMock is RMRKMultiAssetMock, RMRKTypedMultiAsset {
    uint64 private constant _LOWEST_POSSIBLE_PRIORITY = 2 ** 64 - 1;

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKMultiAsset, RMRKTypedMultiAsset)
        returns (bool)
    {
        return
            RMRKTypedMultiAsset.supportsInterface(interfaceId) ||
            RMRKMultiAsset.supportsInterface(interfaceId);
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
