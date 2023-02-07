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
}
