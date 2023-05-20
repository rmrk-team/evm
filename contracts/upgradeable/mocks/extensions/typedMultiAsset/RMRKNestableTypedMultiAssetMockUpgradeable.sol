// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/extension/typedMultiAsset/RMRKTypedMultiAssetUpgradeable.sol";
import "../../RMRKNestableMultiAssetMockUpgradeable.sol";
import "../../../RMRK/security/InitializationGuard.sol";

error RMRKTokenHasNoAssetsWithType();

contract RMRKNestableTypedMultiAssetMockUpgradeable is
    InitializationGuard,
    RMRKNestableMultiAssetMockUpgradeable,
    RMRKTypedMultiAssetUpgradeable
{
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
        override(RMRKNestableMultiAssetUpgradeable, RMRKTypedMultiAssetUpgradeable)
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
