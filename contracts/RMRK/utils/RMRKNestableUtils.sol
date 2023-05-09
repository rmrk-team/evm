// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../nestable/IERC6059.sol";
import "../library/RMRKErrors.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "hardhat/console.sol";

/**
 * @title RMRKNestableUtils
 * @author RMRK team
 * @notice Smart contract of the RMRK Nestable  utils module.
 */
contract RMRKNestableUtils {
    /**
     * @notice Used to validate whether the specified child token is owned by a given parent token.
     * @param parentAddress Address of the parent token's collection smart contract
     * @param childAddress Address of the child token's collection smart contract
     * @param parentId ID of the parent token
     * @param childId ID of the child token
     * @return A boolean value indicating whether the child token is owned by the parent token or not
     */
    function validateChildOf(
        address parentAddress,
        address childAddress,
        uint256 parentId,
        uint256 childId
    ) public view returns (bool) {
        if (
            !IERC165(childAddress).supportsInterface(type(IERC6059).interfaceId)
        ) {
            return false;
        }

        (address directOwner, uint256 ownerId, ) = IERC6059(childAddress)
            .directOwnerOf(childId);

        return (directOwner == parentAddress && ownerId == parentId);
    }

    /**
     * @notice Used to validate whether the specified child token is owned by a given parent token.
     * @param parentAddress Address of the parent token's collection smart contract
     * @param childAddresses An array of the child token's collection smart contract addresses
     * @param parentId ID of the parent token
     * @param childIds An array of child token IDs to verify
     * @return A boolean value indicating whether all of the child tokens are owned by the parent token or not
     * @return An array of boolean values indicating whether each of the child tokens are owned by the parent token or
     *  not
     */
    function validateChildrenOf(
        address parentAddress,
        address[] memory childAddresses,
        uint256 parentId,
        uint256[] memory childIds
    ) public view returns (bool, bool[] memory) {
        if (childAddresses.length != childIds.length) {
            revert RMRKMismachedArrayLength();
        }

        address directOwner;
        uint256 ownerId;
        bool[] memory validityOfChildren = new bool[](childAddresses.length);
        bool isValid = true;

        for (uint256 i; i < childAddresses.length; ) {
            if (
                IERC165(childAddresses[i]).supportsInterface(
                    type(IERC6059).interfaceId
                )
            ) {
                (directOwner, ownerId, ) = IERC6059(childAddresses[i])
                    .directOwnerOf(childIds[i]);
            }

            if (
                isValid && (directOwner != parentAddress || ownerId != parentId)
            ) {
                isValid = false;
            }

            validityOfChildren[i] =
                directOwner == parentAddress &&
                ownerId == parentId;

            delete directOwner;
            delete ownerId;

            unchecked {
                ++i;
            }
        }

        return (isValid, validityOfChildren);
    }
}
