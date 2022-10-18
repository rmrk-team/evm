// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {CollectionMetadataStorage} from "./Storage.sol";

abstract contract RMRKCollectionMetadataInternal {
    function getCollectionMetadataState()
        internal
        pure
        returns (CollectionMetadataStorage.State storage)
    {
        return CollectionMetadataStorage.getState();
    }

    function _setCollectionMetadata(string memory newMetadata) internal {
        getCollectionMetadataState()._collectionMetadata = newMetadata;
    }
}
