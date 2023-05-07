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

        if (directOwner == parentAddress && ownerId == parentId) {
            return true;
        }

        return false;
    }

    /**
     * @notice Used to validate whether the specified child token is owned by a given parent token.
     * @param parentAddress Address of the parent token's collection smart contract
     * @param childAddresses An array of the child token's collection smart contract addresses
     * @param parentId ID of the parent token
     * @param childIds An array of child token IDs to verify
     * @return A boolean value indicating whether all of the child tokens are owned by the parent token or not
     * @return An array of smart contract addresses of the tokens that are not owned by the parent token
     * @return An array of token IDs of child tokens that are not owned by the parent token
     */
    function validateChildrenOf(
        address parentAddress,
        address[] memory childAddresses,
        uint256 parentId,
        uint256[] memory childIds
    ) public view returns (bool, address[] memory, uint256[] memory) {
        if (childAddresses.length != childIds.length) {
            revert RMRKMismachedArrayLength();
        }

        address directOwner;
        uint256 ownerId;
        uint256 numberOfInvalidChildTokens;
        address[] memory tmpInvalidChildAddresses = new address[](
            childAddresses.length
        );
        uint256[] memory tmpInvalidChildIds = new uint256[](
            childAddresses.length
        );
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

            if (directOwner != parentAddress || ownerId != parentId) {
                tmpInvalidChildAddresses[
                    numberOfInvalidChildTokens
                ] = childAddresses[i];
                tmpInvalidChildIds[numberOfInvalidChildTokens] = childIds[i];
                numberOfInvalidChildTokens++;
                isValid = false;
            }

            delete directOwner;
            delete ownerId;

            unchecked {
                ++i;
            }
        }

        address[] memory invalidChildAddresses = new address[](
            numberOfInvalidChildTokens
        );
        uint256[] memory invalidChildIds = new uint256[](
            numberOfInvalidChildTokens
        );

        for (uint256 i; i < numberOfInvalidChildTokens; ) {
            invalidChildAddresses[i] = tmpInvalidChildAddresses[i];
            invalidChildIds[i] = tmpInvalidChildIds[i];

            unchecked {
                ++i;
            }
        }

        return (isValid, invalidChildAddresses, invalidChildIds);
    }
}
