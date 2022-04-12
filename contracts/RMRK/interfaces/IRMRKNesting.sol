// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

interface IRMRKNesting {

  function acceptChild(uint256 _tokenId, uint256 index) external;

  function rejectAllChildren(uint256 _tokenId) external;

  function rejectChild(uint256 _tokenId, uint256 index) external;

  function removeChild(uint256 _tokenId, uint256 index) external;
}
