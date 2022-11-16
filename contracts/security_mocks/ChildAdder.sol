// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/nestable/IRMRKNestable.sol";

/**
 * @title ChildAdder
 * @author RMRK team
 * @notice Smart contract of the child adder module.
 * @dev This smart contract is used to easily add a desired amount of child tokens to a desired token.
 */
contract ChildAdder {
    /**
     * @notice Used to add a specified amount of child tokens with the same IO to a given token.
     * @param destContract The address of the smart contract of the token to which to add new child tokens
     * @param parentId ID of the token to which to add the child tokens
     * @param childId ID of the child tokens to be added
     * @param numChildren The number of child tokens to add
     */
    function addChild(
        address destContract,
        uint256 parentId,
        uint256 childId,
        uint256 numChildren
    ) external {
        for (uint256 i; i < numChildren; i++) {
            IRMRKNestable(destContract).addChild(parentId, childId);
        }
    }
}
