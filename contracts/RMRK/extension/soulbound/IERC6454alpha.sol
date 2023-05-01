// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IERC6454alpha
 * @author RMRK team
 * @notice A minimal extension to identify the transferability of Non-Fungible Tokens.
 */
interface IERC6454alpha is IERC165 {
    /**
     * @notice Used to check whether the given token is transferable or not.
     * @dev If this function returns `false`, the transfer of the token MUST revert execution
     * @dev If the tokenId does not exist, this method MUST revert execution
     * @param tokenId ID of the token being checked
     * @return Boolean value indicating whether the given token is transferable
     */
    function isTransferable(uint256 tokenId) external view returns (bool);

    /**
     * @notice Used to check whether the given token is transferable or not based on source and destination address.
     * @dev If this function returns `false`, the transfer of the token MUST revert execution
     * @dev If the tokenId does not exist, this method MUST revert execution
     * @param tokenId ID of the token being checked
     * @param from Address from which the token is being transferred
     * @param to Address to which the token is being transferred
     * @return Boolean value indicating whether the given token is transferable
     */
    function isTransferable(uint256 tokenId, address from, address to) external view returns (bool);

}
