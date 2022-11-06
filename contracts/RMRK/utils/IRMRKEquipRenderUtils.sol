// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../equippable/IRMRKEquippable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRMRKEquipRenderUtils is IERC165 {
    /**
     * @notice Returns `ExtendedResource` object associated with `resourceId`
     *
     * Requirements:
     *
     * - `resourceId` must exist.
     *
     */
    function getActiveExtendedResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view returns (IRMRKEquippable.ExtendedResource memory);

    /**
     * @notice Returns `ExtendedResource` object at `index` of active resource array on `tokenId`
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     * - `index` must be inside the range of active resource array
     */
    function getPendingExtendedResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view returns (IRMRKEquippable.ExtendedResource memory);

    /**
     * @notice Returns `ExtendedResource` objects for the given ids
     *
     * Requirements:
     *
     * - `resourceIds` must exist.
     */
    function getExtendedResourcesById(
        address target,
        uint256 tokenId,
        uint64[] calldata resourceIds
    ) external view returns (IRMRKEquippable.ExtendedResource[] memory);

    function getEquipped(
        address target,
        uint64 tokenId,
        uint64 resourceId
    )
        external
        view
        returns (
            uint64[] memory slotParts,
            IRMRKEquippable.Equipment[] memory childrenEquipped
        );

    function composeEquippables(
        address target,
        uint256 tokenId,
        uint64 resourceId
    )
        external
        view
        returns (
            IRMRKEquippable.ExtendedResource memory resource,
            IRMRKEquippable.FixedPart[] memory fixedParts,
            IRMRKEquippable.SlotPart[] memory slotParts
        );
}
