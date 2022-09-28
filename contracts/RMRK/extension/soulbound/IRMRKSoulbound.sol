// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRMRKSoulbound is IERC165 {
    /**
     * @notice Returns whether or not the token is soulbound
     */
    function isSoulbound(uint256 tokenId) external view returns (bool);
}
