// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRMRKCollectionMetadata is IERC165 {
    function collectionMetadata() external returns (string memory);
}
