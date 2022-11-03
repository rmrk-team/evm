// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IRMRKSoulbound
 * @author RMRK team
 * @notice Interface smart contract of the RMRK soulbound module.
 */
interface IRMRKSoulbound is IERC165 {
    /**
     * @notice Used to check whether the given token is soulbound or not.
     * @param tokenId ID of the token being checked
     * @return bool Boolean value indicating whether the given token is soulbound
     */
    function isSoulbound(uint256 tokenId) external view returns (bool);
}
