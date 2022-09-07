// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

contract RMRKCollectionMetadata {
    constructor(string memory collectionMetadata_) {
        collectionMetadata = collectionMetadata_;
    }
    string public collectionMetadata;

    function _setCollectionMetadata(string memory newMetadata) internal {
        collectionMetadata = newMetadata;
    }
}
