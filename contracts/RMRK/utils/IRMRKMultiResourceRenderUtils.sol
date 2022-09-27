// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "contracts/RMRK/multiresource/IRMRKMultiResource.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRMRKMultiResourceRenderUtils is IERC165 {
    /**
     * @notice Returns resource meta at `index` of active resource array on `tokenId`
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     * - `index` must be inside the range of active resource array
     */
    function getResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view returns (string memory);

    /**
     * @notice Returns resource meta at `index` of pending resource array on `tokenId`
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
     * @notice Returns resource meta strings for the given ids
     *
     * Requirements:
     *
     * - `resourceIds` must exist.
     */
    function getResourcesById(address target, uint64[] calldata resourceIds)
        external
        view
        returns (string[] memory);

    /**
     * @notice Returns the resource meta with the highest priority for the given token
     */
    function getTopResourceMetaForToken(address target, uint256 tokenId)
        external
        view
        returns (string memory);
}
