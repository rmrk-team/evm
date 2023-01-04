// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IRMRKEmotable
 * @author RMRK team
 * @notice Interface smart contract of the RMRK emotable module.
 */
interface IRMRKEmotable is IERC165 {
    /**
     * @notice Used to get the number of emotes for a specific emoji on a token.
     * @param tokenId ID of the token to check for emoji count
     * @param emoji Unicode identifier of the emoji
     * @return Number of emotes with the emoji on the token
     */
    function getEmoteCount(
        uint256 tokenId,
        bytes4 emoji
    ) external view returns (uint256);

    /**
     * @notice Used to emote or undo an emote on a token.
     * @param tokenId ID of the token being emoted
     * @param emoji Unicode identifier of the emoji
     * @param state whether to turn emote or undo. True for emote, false for undo
     */
    function emote(uint256 tokenId, bytes4 emoji, bool state) external;
}
