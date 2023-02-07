// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../nestable/IRMRKNestable.sol";

/**
 * @title RMRKNestableAutoIndex
 * @author RMRK team
 * @notice Interface smart contract of the RMRK Nestable AutoIndex module.
 */
interface IRMRKNestableAutoIndex is IRMRKNestable {
    /**
     * @notice Used to accept a pending child token for a given parent token.
     * @dev This moves the child token from parent token's pending child tokens array into the active child tokens
     *  array.
     * @param parentId ID of the parent token for which the child token is being accepted
     * @param childAddress Address of the collection smart contract of the child
     * @param childId ID of the child token
     */
    function acceptChild(
        uint256 parentId,
        address childAddress,
        uint256 childId
    ) external;

    /**
     * @notice Used to transfer a child token from a given parent token.
     * @dev When transferring a child token, the owner of the token is set to `to`, or is not updated in the event of `to`
     *  being the `0x0` address.
     * @param tokenId ID of the parent token from which the child token is being transferred
     * @param to Address to which to transfer the token to
     * @param destinationId ID of the token to receive this child token (MUST be 0 if the destination is not a token)
     * @param childAddress Address of the collection smart contract of the child
     * @param childId ID of the child token
     * @param isPending A boolean value indicating whether the child token being transferred is in the pending array of the
     *  parent token (`true`) or in the active array (`false`)
     * @param data Additional data with no specified format, sent in call to `_to`
     */
    function transferChild(
        uint256 tokenId,
        address to,
        uint256 destinationId,
        address childAddress,
        uint256 childId,
        bool isPending,
        bytes memory data
    ) external;
}
