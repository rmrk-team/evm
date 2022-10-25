// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRMRKReclaimableChild is IERC165 {
    /**
     * @dev Function called to reclaim an abandoned child created by unnesting with `to` as the zero
     * address or by rejecting children. This function will set the child's owner to the rootOwner
     * of the caller, allowing the rootOwner management permissions for the child.
     *
     * Requirements:
     *
     * - `tokenId` must exist
     *
     */
    function reclaimChild(
        uint256 tokenId,
        address childAddress,
        uint256 childTokenId
    ) external;
}
