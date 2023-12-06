// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IERC7409 is IERC165 {
    /**
     * @notice Used to notify listeners that the token with the specified ID has been emoted to or that the reaction has been revoked.
     * @dev The event MUST only be emitted if the state of the emote is changed.
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
        string emoji,
        bool on
    );

    /**
     * @notice Used to get the number of emotes for a specific emoji on a token.
     * @param collection Address of the collection containing the token being checked for emoji count
     * @param tokenId ID of the token to check for emoji count
     * @param emoji Unicode identifier of the emoji
     * @return Number of emotes with the emoji on the token
     */
    function emoteCountOf(
        address collection,
        uint256 tokenId,
        string memory emoji
    ) external view returns (uint256);

    /**
     * @notice Used to get the number of emotes for a specific emoji on a set of tokens.
     * @param collections An array of addresses of the collections containing the tokens being checked for emoji count
     * @param tokenIds An array of IDs of the tokens to check for emoji count
     * @param emojis An array of unicode identifiers of the emojis
     * @return An array of numbers of emotes with the emoji on the tokens
     */
    function bulkEmoteCountOf(
        address[] memory collections,
        uint256[] memory tokenIds,
        string[] memory emojis
    ) external view returns (uint256[] memory);

    /**
     * @notice Used to get the information on whether the specified address has used a specific emoji on a specific
     *  token.
     * @param emoter Address of the account we are checking for a reaction to a token
     * @param collection Address of the collection smart contract containing the token being checked for emoji reaction
     * @param tokenId ID of the token being checked for emoji reaction
     * @param emoji The ASCII emoji code being checked for reaction
     * @return A boolean value indicating whether the `emoter` has used the `emoji` on the token (`true`) or not
     *  (`false`)
     */
    function hasEmoterUsedEmote(
        address emoter,
        address collection,
        uint256 tokenId,
        string memory emoji
    ) external view returns (bool);

    /**
     * @notice Used to get the information on whether the specified addresses have used specific emojis on specific
     *  tokens.
     * @param emoters An array of addresses of the accounts we are checking for reactions to tokens
     * @param collections An array of addresses of the collection smart contracts containing the tokens being checked
     *  for emoji reactions
     * @param tokenIds An array of IDs of the tokens being checked for emoji reactions
     * @param emojis An array of the ASCII emoji codes being checked for reactions
     * @return An array of boolean values indicating whether the `emoter`s has used the `emoji`s on the tokens (`true`)
     *  or not (`false`)
     */
    function haveEmotersUsedEmotes(
        address[] memory emoters,
        address[] memory collections,
        uint256[] memory tokenIds,
        string[] memory emojis
    ) external view returns (bool[] memory);

    /**
     * @notice Used to get the message to be signed by the `emoter` in order for the reaction to be submitted by someone
     *  else.
     * @param collection The address of the collection smart contract containing the token being emoted at
     * @param tokenId ID of the token being emoted
     * @param emoji Unicode identifier of the emoji
     * @param state Boolean value signifying whether to emote (`true`) or undo (`false`) emote
     * @param deadline UNIX timestamp of the deadline for the signature to be submitted
     * @return The message to be signed by the `emoter` in order for the reaction to be submitted by someone else
     */
    function prepareMessageToPresignEmote(
        address collection,
        uint256 tokenId,
        string memory emoji,
        bool state,
        uint256 deadline
    ) external view returns (bytes32);

    /**
     * @notice Used to get multiple messages to be signed by the `emoter` in order for the reaction to be submitted by someone
     *  else.
     * @param collections An array of addresses of the collection smart contracts containing the tokens being emoted at
     * @param tokenIds An array of IDs of the tokens being emoted
     * @param emojis An array of unicode identifiers of the emojis
     * @param states An array of boolean values signifying whether to emote (`true`) or undo (`false`) emote
     * @param deadlines An array of UNIX timestamps of the deadlines for the signatures to be submitted
     * @return The array of messages to be signed by the `emoter` in order for the reaction to be submitted by someone else
     */
    function bulkPrepareMessagesToPresignEmote(
        address[] memory collections,
        uint256[] memory tokenIds,
        string[] memory emojis,
        bool[] memory states,
        uint256[] memory deadlines
    ) external view returns (bytes32[] memory);

    /**
     * @notice Used to emote or undo an emote on a token.
     * @dev Does nothing if attempting to set a pre-existent state.
     * @dev MUST emit the `Emoted` event is the state of the emote is changed.
     * @param collection Address of the collection containing the token being emoted at
     * @param tokenId ID of the token being emoted
     * @param emoji Unicode identifier of the emoji
     * @param state Boolean value signifying whether to emote (`true`) or undo (`false`) emote
     */
    function emote(
        address collection,
        uint256 tokenId,
        string memory emoji,
        bool state
    ) external;

    /**
     * @notice Used to emote or undo an emote on multiple tokens.
     * @dev Does nothing if attempting to set a pre-existent state.
     * @dev MUST emit the `Emoted` event is the state of the emote is changed.
     * @dev MUST revert if the lengths of the `collections`, `tokenIds`, `emojis` and `states` arrays are not equal.
     * @param collections An array of addresses of the collections containing the tokens being emoted at
     * @param tokenIds An array of IDs of the tokens being emoted
     * @param emojis An array of unicode identifiers of the emojis
     * @param states An array of boolean values signifying whether to emote (`true`) or undo (`false`) emote
     */
    function bulkEmote(
        address[] memory collections,
        uint256[] memory tokenIds,
        string[] memory emojis,
        bool[] memory states
    ) external;

    /**
     * @notice Used to emote or undo an emote on someone else's behalf.
     * @dev Does nothing if attempting to set a pre-existent state.
     * @dev MUST emit the `Emoted` event is the state of the emote is changed.
     * @dev MUST revert if the lengths of the `collections`, `tokenIds`, `emojis` and `states` arrays are not equal.
     * @dev MUST revert if the `deadline` has passed.
     * @dev MUST revert if the recovered address is the zero address.
     * @param emoter The address that presigned the emote
     * @param collection The address of the collection smart contract containing the token being emoted at
     * @param tokenId IDs of the token being emoted
     * @param emoji Unicode identifier of the emoji
     * @param state Boolean value signifying whether to emote (`true`) or undo (`false`) emote
     * @param deadline UNIX timestamp of the deadline for the signature to be submitted
     * @param v `v` value of an ECDSA signature of the message obtained via `prepareMessageToPresignEmote`
     * @param r `r` value of an ECDSA signature of the message obtained via `prepareMessageToPresignEmote`
     * @param s `s` value of an ECDSA signature of the message obtained via `prepareMessageToPresignEmote`
     */
    function presignedEmote(
        address emoter,
        address collection,
        uint256 tokenId,
        string memory emoji,
        bool state,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @notice Used to bulk emote or undo an emote on someone else's behalf.
     * @dev Does nothing if attempting to set a pre-existent state.
     * @dev MUST emit the `Emoted` event is the state of the emote is changed.
     * @dev MUST revert if the lengths of the `collections`, `tokenIds`, `emojis` and `states` arrays are not equal.
     * @dev MUST revert if the `deadline` has passed.
     * @dev MUST revert if the recovered address is the zero address.
     * @param emoters An array of addresses of the accounts that presigned the emotes
     * @param collections An array of addresses of the collections containing the tokens being emoted at
     * @param tokenIds An array of IDs of the tokens being emoted
     * @param emojis An array of unicode identifiers of the emojis
     * @param states An array of boolean values signifying whether to emote (`true`) or undo (`false`) emote
     * @param deadlines UNIX timestamp of the deadline for the signature to be submitted
     * @param v An array of `v` values of an ECDSA signatures of the messages obtained via `prepareMessageToPresignEmote`
     * @param r An array of `r` values of an ECDSA signatures of the messages obtained via `prepareMessageToPresignEmote`
     * @param s An array of `s` values of an ECDSA signatures of the messages obtained via `prepareMessageToPresignEmote`
     */
    function bulkPresignedEmote(
        address[] memory emoters,
        address[] memory collections,
        uint256[] memory tokenIds,
        string[] memory emojis,
        bool[] memory states,
        uint256[] memory deadlines,
        uint8[] memory v,
        bytes32[] memory r,
        bytes32[] memory s
    ) external;
}
