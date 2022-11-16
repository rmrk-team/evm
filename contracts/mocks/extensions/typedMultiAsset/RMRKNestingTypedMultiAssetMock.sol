// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../../RMRK/extension/typedMultiAsset/RMRKTypedMultiAsset.sol";
import "../../RMRKNestingMultiAssetMock.sol";

error RMRKTokenHasNoAssetsWithType();

contract RMRKNestingTypedMultiAssetMock is
    RMRKNestingMultiAssetMock,
    RMRKTypedMultiAsset
{
    constructor(string memory name, string memory symbol)
        RMRKNestingMultiAssetMock(name, symbol)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(RMRKNestingMultiAsset, RMRKTypedMultiAsset)
        returns (bool)
    {
        return
            RMRKTypedMultiAsset.supportsInterface(interfaceId) ||
            RMRKNestingMultiAsset.supportsInterface(interfaceId);
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
