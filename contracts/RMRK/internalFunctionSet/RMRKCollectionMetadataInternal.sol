// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {RMRKCollectionMetadataStorage} from "./Storage.sol";

abstract contract RMRKCollectionMetadataInternal {
    function getCollectionMetadataState()
        internal
        pure
        returns (RMRKCollectionMetadataStorage.State storage)
    {
        return RMRKCollectionMetadataStorage.getState();
    }

    function _setCollectionMetadata(string memory newMetadata) internal {
        getCollectionMetadataState()._collectionMetadata = newMetadata;
    }
}
