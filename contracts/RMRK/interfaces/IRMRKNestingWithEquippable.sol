// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

/**
 * @title ERC721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 * from ERC721 asset contracts.
 */
interface IRMRKNestingWithEquippable {

    function getEquippablesAddress() external view returns (address);

    function isApprovedOrOwner(address spender, uint256 tokenId) external view returns (bool);
}
