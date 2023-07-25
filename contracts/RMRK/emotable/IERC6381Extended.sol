// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IERC6381Extended is IERC165 {
    event Emoted(
        address indexed emoter,
        address indexed collection,
        uint256 indexed tokenId,
        string emoji,
        bool on
    );

    function emoteCountOf(
        address collection,
        uint256 tokenId,
        string memory emoji
    ) external view returns (uint256);

    function bulkEmoteCountOf(
        address[] memory collections,
        uint256[] memory tokenIds,
        string[] memory emojis
    ) external view returns (uint256[] memory);

    function hasEmoterUsedEmote(
        address emoter,
        address collection,
        uint256 tokenId,
        string memory emoji
    ) external view returns (bool);

    function haveEmotersUsedEmotes(
        address[] memory emoters,
        address[] memory collections,
        uint256[] memory tokenIds,
        string[] memory emojis
    ) external view returns (bool[] memory);

    function prepareMessageToPresignEmote(
        address collection,
        uint256 tokenId,
        string memory emoji,
        bool state,
        uint256 deadline
    ) external view returns (bytes32);

    function bulkPrepareMessagesToPresignEmote(
        address[] memory collections,
        uint256[] memory tokenIds,
        string[] memory emojis,
        bool[] memory states,
        uint256[] memory deadlines
    ) external view returns (bytes32[] memory);

    function emote(
        address collection,
        uint256 tokenId,
        string memory emoji,
        bool state
    ) external;

    function bulkEmote(
        address[] memory collections,
        uint256[] memory tokenIds,
        string[] memory emojis,
        bool[] memory states
    ) external;

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
