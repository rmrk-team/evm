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

    function markSelfEquipped(
        uint tokenId,
        address equippingParent,
        uint64 resourceId,
        uint64 slotId,
        bool equipped
    ) external;

    function markChildEquipped(
        address childAddress,
        uint tokenId,
        uint64 resourceId,
        uint64 slotId,
        bool equipped
    ) external;
}
