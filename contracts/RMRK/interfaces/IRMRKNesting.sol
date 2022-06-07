// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "./IERC721.sol";

interface IRMRKNesting is IERC721 {

  function acceptChild(uint256 _tokenId, uint256 index) external;

  function rejectAllChildren(uint256 _tokenId) external;

  function rejectChild(uint256 _tokenId, uint256 index) external;

  function removeChild(uint256 _tokenId, uint256 index) external;

  function unnestChild(uint256 tokenId, uint256 index) external;

  function unnestToken(uint256 tokenId, uint256 parentId, address newOwner) external;
}
