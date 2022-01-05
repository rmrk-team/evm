 // SPDX-License-Identifier: GNU GPL

pragma solidity ^0.8.0;

//import "./IERC721.sol";

interface IRMRKCore {
  function setChild(IRMRKCore childAddress, uint tokenId, uint childTokenId, bool pending) external;
  function nftOwnerOf(uint256 tokenId) external view returns (address, uint256);
  function ownerOf(uint256 tokenId) external view returns(address);
  function isRMRKCore() external pure returns(bool);
  function findRootOwner(uint id) external view returns(address);
  function isApprovedOrOwner(address addr, uint id) external view returns(bool);
  function removeChild(uint256 tokenId, address childAddress, uint256 childTokenId) external;
  function _updateRootOwner(uint tokenId, address oldOwner, address newOwner) external;

  /**
   * @dev Returns the token collection name.
   */
  function name() external view returns (string memory);

  /**
   * @dev Returns the token collection symbol.
   */
  function symbol() external view returns (string memory);

  /**
   * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
   */
  function tokenURI(uint256 tokenId) external view returns (string memory);

  event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
  event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
}
