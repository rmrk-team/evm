// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/extension/typedMultiAsset/RMRKTypedMultiAssetUpgradeable.sol";
import "../../RMRKExternalEquipMockUpgradeable.sol";
import "../../../RMRK/security/InitializationGuard.sol";

error RMRKTokenHasNoAssetsWithType();

contract RMRKTypedExternalEquippableMockUpgradeable is
    InitializationGuard,
    RMRKExternalEquipMockUpgradeable,
    RMRKTypedMultiAssetUpgradeable
{
    function initialize(
        address nestableAddress
    ) public override initializable {
        super.initialize(nestableAddress);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKExternalEquipUpgradeable, RMRKTypedMultiAssetUpgradeable)
        returns (bool)
    {
        return
            RMRKTypedMultiAssetUpgradeable.supportsInterface(interfaceId) ||
            RMRKExternalEquipUpgradeable.supportsInterface(interfaceId);
    }

    function addTypedAssetEntry(
        uint64 id,
        uint64 equippableGroupId,
        address catalogAddress,
        string memory metadataURI,
        uint64[] calldata partIds,
        string memory type_
    ) external {
        _addAssetEntry(
            id,
            equippableGroupId,
            catalogAddress,
            metadataURI,
            partIds
        );
        _setAssetType(id, type_);
    }
}
