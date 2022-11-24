// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../../RMRK/extension/typedMultiAsset/RMRKTypedMultiAsset.sol";
import "../../RMRKExternalEquipMock.sol";

error RMRKTokenHasNoAssetsWithType();

contract RMRKTypedExternalEquippableMock is
    RMRKExternalEquipMock,
    RMRKTypedMultiAsset
{
    constructor(address nestableAddress)
        RMRKExternalEquipMock(nestableAddress)
    {}

    function supportsInterface(bytes4 interfaceId)
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
        address baseAddress,
        string memory metadataURI,
        uint64[] memory partIds,
        string memory type_
    ) external {
        _addAssetEntry(
            id,
            equippableGroupId,
            baseAddress,
            metadataURI,
            partIds
        );
        _setAssetType(id, type_);
    }
}
