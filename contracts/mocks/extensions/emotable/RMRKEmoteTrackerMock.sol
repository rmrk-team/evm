// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/extension/emotable/RMRKEmoteTracker.sol";

contract RMRKEmoteTrackerMock is RMRKEmoteTracker {
    function emote(
        address collection,
        uint256 tokenId,
        bytes4 emoji,
        bool on
    ) public {
        _emote(collection, tokenId, emoji, on);
    }

    function bulkEmote(
        address[] memory collections,
        uint256[] memory tokenIds,
        bytes4[] memory emojis,
        bool[] memory states
    ) public {
        _bulkEmote(collections, tokenIds, emojis, states);
    }

    function presignedEmote(
        address emoter,
        address collection,
        uint256 tokenId,
        bytes4 emoji,
        bool on,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        _presignedEmote(
            emoter,
            collection,
            tokenId,
            emoji,
            on,
            deadline,
            v,
            r,
            s
        );
    }

    function bulkPresignedEmote(
        address[] memory emoters,
        address[] memory collections,
        uint256[] memory tokenIds,
        bytes4[] memory emojis,
        bool[] memory states,
        uint256[] memory deadlines,
        uint8[] memory v,
        bytes32[] memory r,
        bytes32[] memory s
    ) public {
        _bulkPresignedEmote(
            emoters,
            collections,
            tokenIds,
            emojis,
            states,
            deadlines,
            v,
            r,
            s
        );
    }
}
