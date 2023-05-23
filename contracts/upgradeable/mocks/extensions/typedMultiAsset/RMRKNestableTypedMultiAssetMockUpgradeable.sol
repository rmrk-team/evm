// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/extension/typedMultiAsset/RMRKTypedMultiAssetUpgradeable.sol";
import "../../RMRKNestableMultiAssetMockUpgradeable.sol";

error RMRKTokenHasNoAssetsWithType();

contract RMRKNestableTypedMultiAssetMockUpgradeable is
    RMRKNestableMultiAssetMockUpgradeable,
    RMRKTypedMultiAssetUpgradeable
{
    function __RMRKNestableTypedMultiAssetMockUpgradeable_init(
        string memory name,
        string memory symbol
    ) public onlyInitializing {
        __RMRKNestableMultiAssetMockUpgradeable_init(name, symbol);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            RMRKNestableMultiAssetUpgradeable,
            RMRKTypedMultiAssetUpgradeable
        )
        returns (bool)
    {
        return
            RMRKTypedMultiAssetUpgradeable.supportsInterface(interfaceId) ||
            RMRKNestableMultiAssetUpgradeable.supportsInterface(interfaceId);
    }

    function addTypedAssetEntry(
        uint64 assetId,
        string memory metadataURI,
        string memory type_
    ) external {
        _addAssetEntry(assetId, metadataURI);
        _setAssetType(assetId, type_);
    }
}
