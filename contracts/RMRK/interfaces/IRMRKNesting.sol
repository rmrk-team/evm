// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

interface IRMRKNesting {

  function acceptChildFromPending(uint256 index, uint256 _tokenId) external;

  function rejectAllChildren(uint256 _tokenId) external;

  function rejectChild(uint256 index, uint256 _tokenId) external;

  function deleteChildFromChildren(uint256 index, uint256 _tokenId) external;
}
