// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../RMRK/equippable/RMRKExternalEquipUpgradeable.sol";

/* import "hardhat/console.sol"; */

//Minimal public upgradeable implementation of RMRKEquippableWithNestable for testing.
contract RMRKExternalEquipMockUpgradeable is RMRKExternalEquipUpgradeable {
    function initialize(address nestableAddress) public virtual initializer {
        __RMRKExternalEquipUpgradeable_init(nestableAddress);
    }

    function setNestableAddress(address nestableAddress) external {
        _setNestableAddress(nestableAddress);
    }

    function addAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 replacesAssetWithId
    ) external {
        _addAssetToToken(tokenId, assetId, replacesAssetWithId);
    }

    function addEquippableAssetEntry(
        uint64 id,
        uint64 equippableGroupId,
        address catalogAddress,
        string memory metadataURI,
        uint64[] calldata partIds
    ) external {
        _addAssetEntry(
            id,
            equippableGroupId,
            catalogAddress,
            metadataURI,
            partIds
        );
    }

    function setValidParentForEquippableGroup(
        uint64 equippableGroupId,
        address parentAddress,
        uint64 partId
    ) external {
        _setValidParentForEquippableGroup(
            equippableGroupId,
            parentAddress,
            partId
        );
    }
}
