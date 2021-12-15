 // SPDX-License-Identifier: GNU GPL

pragma solidity ^0.8.0;

import "./IERC721.sol";

interface IRMRKCore is IERC721 {
  function setChild(IRMRKCore childAddress, uint tokenId, uint childTokenId) external;
  function nftOwnerOf(uint256 tokenId) external view returns (address, uint256);
}
