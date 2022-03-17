// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

interface IRMRKMultiResource {
  function acceptResource(uint256 _tokenId, uint256 index) external;
}
