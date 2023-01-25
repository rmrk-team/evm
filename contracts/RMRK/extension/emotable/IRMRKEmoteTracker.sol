// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IRMRKEmoteTracker
 * @author RMRK team
 * @notice Interface smart contract of the RMRK emote tracker module.
 */
interface IRMRKEmoteTracker is IERC165 {
    /**
     * @notice Used to notify listeners that the token with the specified ID has been emoted to or that the reaction has been revoked.
     * @dev The event is only emitted if the state of the emote is changed.
     * @param emoter Address of the account that emoted or revoked the reaction to the token
     * @param collection Address of the collection smart contract containing the token being emoted to or having the reaction revoked
     * @param tokenId ID of the token
     * @param emoji Unicode identifier of the emoji
     * @param on Boolean value signifying whether the token was emoted to (`true`) or if the reaction has been revoked (`false`)
     */
    event Emoted(
        address indexed emoter,
        address indexed collection,
        uint256 indexed tokenId,
        bytes4 emoji,
        bool on
    );

    /**
     * @notice Used to get the number of emotes for a specific emoji on a token.
     * @param collection Address of the collection containing the token being checked for emoji count
     * @param tokenId ID of the token to check for emoji count
     * @param emoji Unicode identifier of the emoji
     * @return Number of emotes with the emoji on the token
     */
    function getEmoteCount(
        address collection,
        uint256 tokenId,
        bytes4 emoji
    ) external view returns (uint256);

    /**
     * @notice Used to emote or undo an emote on a token.
     * @dev Does nothing if attempting to set a pre-existent state
     * @param collection Address of the collection containing the token being checked for emoji count
     * @param tokenId ID of the token being emoted
     * @param emoji Unicode identifier of the emoji
     * @param state Boolean value signifying whether to emote (`true`) or undo (`false`) emote
     */
    function emote(
        address collection,
        uint256 tokenId,
        bytes4 emoji,
        bool state
    ) external;
}
