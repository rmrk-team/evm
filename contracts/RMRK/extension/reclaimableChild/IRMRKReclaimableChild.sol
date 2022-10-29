// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IRMRKReclaimableChild
 * @author RMRK team
 * @notice Interface smart contract of the RMRK Reclaimable child module.
 */
interface IRMRKReclaimableChild is IERC165 {
    /**
     * @notice Used to reclaim an abandoned child token.
     * @dev Child token is created by unnesting with `to` as the `0x0` address or by rejecting children.
     * @dev This function will set the child's owner to the `rootOwner` of the caller, allowing the `rootOwner`
     * management permissions for the child.
     * @dev Requirements:
     *
     *  - `tokenId` must exist
     * @param tokenId ID of the last parent token of the child token being recovered
     * @param childAddress Address of the child token's smart contract
     * @param childTokenId ID of the child token being reclaimed
     */
    function reclaimChild(
        uint256 tokenId,
        address childAddress,
        uint256 childTokenId
    ) external;
}
