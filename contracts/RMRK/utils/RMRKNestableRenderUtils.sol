// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../nestable/IRMRKNestable.sol";
import "../library/RMRKErrors.sol";

/**
 * @title RMRKNestableRenderUtils
 * @author RMRK team
 * @notice Smart contract of the RMRK Nestable render utils module.
 */
contract RMRKNestableRenderUtils {
    function getChildIndex(
        address parentAddress,
        uint256 parentId,
        address childAddress,
        uint256 childId
    ) public view returns (uint256) {
        IRMRKNestable.Child[] memory children = IRMRKNestable(parentAddress)
            .childrenOf(parentId);
        (parentId);
        uint256 len = children.length;
        for (uint256 i; i < len; ) {
            if (
                children[i].tokenId == childId &&
                children[i].contractAddress == childAddress
            ) return i;
            unchecked {
                ++i;
            }
        }
        revert RMRKChildNotFoundInParent();
    }

    /**
     * @notice Check if the child is owned by the expected parent.
     * @dev Reverts if child token is not owned by an NFT.
     * @dev Reverts if child token is not owned by the expected parent.
     * @param childAddress Address of the child contract
     * @param childId ID of the child token
     * @param expectedParent Address of the expected parent contract
     * @param expectedParentId ID of the expected parent token
     */
    function checkExpectedParent(
        address childAddress,
        uint256 childId,
        address expectedParent,
        uint256 expectedParentId
    ) public view {
        address parentAddress;
        uint256 parentId;
        bool isNFT;
        (parentAddress, parentId, isNFT) = IRMRKNestable(childAddress)
            .directOwnerOf(childId);
        if (!isNFT) revert RMRKParentIsNotNFT();
        if (parentAddress != expectedParent || expectedParentId != parentId)
            revert RMRKUnexpectedParent();
    }
}
