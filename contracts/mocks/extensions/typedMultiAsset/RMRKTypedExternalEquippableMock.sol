// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/extension/typedMultiAsset/RMRKTypedMultiAsset.sol";
import "../../RMRKExternalEquipMock.sol";

error RMRKTokenHasNoAssetsWithType();

contract RMRKTypedExternalEquippableMock is
    RMRKExternalEquipMock,
    RMRKTypedMultiAsset
{
    constructor(
        address nestableAddress
    ) RMRKExternalEquipMock(nestableAddress) {}

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKExternalEquip, RMRKTypedMultiAsset)
        returns (bool)
    {
        return
            RMRKTypedMultiAsset.supportsInterface(interfaceId) ||
            RMRKExternalEquip.supportsInterface(interfaceId);
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
