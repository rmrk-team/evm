// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IERC6454
 * @author RMRK team
 * @notice An interface for Non-Fungible Tokens extension allowing for tokens to be non-transferable.
 */
interface IERC6454 is IERC165 {
    /**
     * @notice Used to check whether the given token is non-transferable or not.
     * @dev If this function returns `true`, the transfer of the token MUST revert execution
     * @dev If the tokenId does not exist, this method MUST revert execution
     * @param tokenId ID of the token being checked
     * @return Boolean value indicating whether the given token is non-transferable
     */
    function isNonTransferable(uint256 tokenId) external view returns (bool);
}
