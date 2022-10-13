// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./interfaces/IRMRKCollectionMetadata.sol";
import "./internalFunctionSet/RMRKCollectionMetadataInternal.sol";

contract RMRKCollectionMetadataFacet is
    IRMRKCollectionMetadata,
    RMRKCollectionMetadataInternal
{
    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return
            interfaceId == type(IRMRKCollectionMetadata).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }

    function collectionMetadata() public view returns (string memory) {
        return getCollectionMetadataState()._collectionMetadata;
    }
}
