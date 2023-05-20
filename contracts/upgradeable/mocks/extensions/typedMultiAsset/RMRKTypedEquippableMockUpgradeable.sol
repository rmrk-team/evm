// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/extension/typedMultiAsset/RMRKTypedMultiAssetUpgradeable.sol";
import "../../RMRKEquippableMockUpgradeable.sol";
import "../../../RMRK/security/InitializationGuard.sol";

error RMRKTokenHasNoAssetsWithType();

contract RMRKTypedEquippableMockUpgradeable is InitializationGuard, RMRKEquippableMockUpgradeable, RMRKTypedMultiAssetUpgradeable {
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
        override(RMRKEquippableUpgradeable, RMRKTypedMultiAssetUpgradeable)
        returns (bool)
    {
        return
            RMRKTypedMultiAssetUpgradeable.supportsInterface(interfaceId) ||
            RMRKEquippableUpgradeable.supportsInterface(interfaceId);
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
