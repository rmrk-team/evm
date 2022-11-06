// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "contracts/RMRK/multiresource/IRMRKMultiResource.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRMRKMultiResourceRenderUtils is IERC165 {
    /**
     * @notice Returns resource metadata at `index` of active resource array on `tokenId`
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     * - `index` must be inside the range of active resource array
     */
    function getActiveResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view returns (string memory);

    /**
     * @notice Returns resource metadata at `index` of pending resource array on `tokenId`
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     * - `index` must be inside the range of pending resource array
     */
    function getPendingResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view returns (string memory);

    /**
     * @notice Returns resource metadata strings for the given ids
     *
     * Requirements:
     *
     * - `resourceIds` must exist.
     */
    function getResourcesById(
        address target,
        uint256 tokenId,
        uint64[] calldata resourceIds
    ) external view returns (string[] memory);

    /**
     * @notice Returns the resource metadata with the highest priority for the given token
     */
    function getTopResourceMetaForToken(address target, uint256 tokenId)
        external
        view
        returns (string memory);
}
