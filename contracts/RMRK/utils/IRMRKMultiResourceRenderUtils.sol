// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "contracts/RMRK/multiresource/IRMRKMultiResource.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRMRKMultiResourceRenderUtils is IERC165 {
    /**
     * @notice Returns `Resource` object associated with `resourceId`
     *
     * Requirements:
     *
     * - `resourceId` must exist.
     *
     */
    function getResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view returns (string memory);

    /**
     * @notice Returns `Resource` object at `index` of active resource array on `tokenId`
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     * - `index` must be inside the range of active resource array
     */
    function getPendingResourceByIndex(
        address target,
        uint256 tokenId,
        uint256 index
    ) external view returns (string memory);

    /**
     * @notice Returns `Resource` objects for the given ids
     *
     * Requirements:
     *
     * - `resourceIds` must exist.
     */
    function getResourcesById(address target, uint64[] calldata resourceIds)
        external
        view
        returns (string[] memory);
}
