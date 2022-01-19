// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

//import "./IERC721.sol";

interface IRMRKCoreSimple {
  function ownerOf(uint256 tokenId) external view virtual returns(address owner);
  function rmrkOwnerOf(uint256 tokenId) external view virtual returns (address, uint256, bool);
  function setChild(IRMRKCoreSimple childAddress, uint tokenId, uint childTokenId) external;
  function isApprovedOrOwner(address addr, uint id) external view returns(bool);
  function _burnChildren(uint256 tokenId, address oldOwner) external;
  function getRoyaltyData() external view returns(address royaltyAddress, uint256 numerator, uint256 denominator);
  function isRMRKCore(address, address, uint256, bytes calldata) external returns (bytes4);

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
