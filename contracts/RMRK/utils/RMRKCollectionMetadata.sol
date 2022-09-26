// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

contract RMRKCollectionMetadata {

    string private _collectionMetadata;

    constructor(string memory collectionMetadata_) {
        _setCollectionMetadata(collectionMetadata_);
    }

    function _setCollectionMetadata(string memory newMetadata) internal {
        _collectionMetadata = newMetadata;
    }

    function collectionMetadata() public view returns(string memory) {
        return _collectionMetadata;
    }
}
