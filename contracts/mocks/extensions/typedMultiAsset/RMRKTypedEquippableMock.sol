// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "../../../RMRK/extension/typedMultiAsset/RMRKTypedMultiAsset.sol";
import "../../RMRKEquippableMock.sol";

error RMRKTokenHasNoAssetsWithType();

contract RMRKTypedEquippableMock is RMRKEquippableMock, RMRKTypedMultiAsset {
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKEquippable, RMRKTypedMultiAsset)
        returns (bool)
    {
        return
            RMRKTypedMultiAsset.supportsInterface(interfaceId) ||
            RMRKEquippable.supportsInterface(interfaceId);
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
