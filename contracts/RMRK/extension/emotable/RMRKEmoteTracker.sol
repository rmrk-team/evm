// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./IRMRKEmoteTracker.sol";
import "hardhat/console.sol";

/**
 * @title RMRKEmotable
 * @author RMRK team
 * @notice Smart contract of the RMRK Emotable module.
 */
abstract contract RMRKEmoteTracker is IRMRKEmoteTracker {
    // Used to avoid double emoting and control undoing
    // emoter address => collection => tokenId => emoji => state (1 for emoted, 0 for not.)
    mapping(address => mapping(address => mapping(uint256 => mapping(bytes4 => uint256))))
        private _emotesPerAddress; // Cheaper than using a bool
    // collection => tokenId => emoji => count
    mapping(address => mapping(uint256 => mapping(bytes4 => uint256)))
        private _emotesPerToken;

    event Emoted(
        address indexed emoter,
        address indexed collection,
        uint256 indexed tokenId,
        bytes4 emoji,
        bool on
    );

    /**
     * @inheritdoc IRMRKEmoteTracker
     */
    function getEmoteCount(
        address collection,
        uint256 tokenId,
        bytes4 emoji
    ) public view returns (uint256) {
        return _emotesPerToken[collection][tokenId][emoji];
    }

    /**
     * @notice Used to emote or undo an emote on a token.
     * @param collection Address of the collection with the token being emoted
     * @param tokenId ID of the token being emoted
     * @param emoji Unicode identifier of the emoji
     * @param state Boolean value signifying whether to emote (`true`) or undo (`false`) emote
     */
    function _emote(
        address collection,
        uint256 tokenId,
        bytes4 emoji,
        bool state
    ) internal virtual {
        bool currentVal = _emotesPerAddress[msg.sender][collection][tokenId][
            emoji
        ] == 1;
        if (currentVal != state) {
            _beforeEmote(collection, tokenId, emoji, state);
            if (state) {
                _emotesPerToken[collection][tokenId][emoji] += 1;
            } else {
                _emotesPerToken[collection][tokenId][emoji] -= 1;
            }
            _emotesPerAddress[msg.sender][collection][tokenId][emoji] = state
                ? 1
                : 0;
            emit Emoted(msg.sender, collection, tokenId, emoji, state);
        }
    }

    /**
     * @notice Hook that is called before emote is added or removed.
     * @param collection Address of the collection with the token being emoted
     * @param tokenId ID of the token being emoted
     * @param emoji Unicode identifier of the emoji
     * @param state Boolean value signifying whether to emote (`true`) or undo (`false`) emote
     */
    function _beforeEmote(
        address collection,
        uint256 tokenId,
        bytes4 emoji,
        bool state
    ) internal virtual {}

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        console.logBytes4(type(IRMRKEmoteTracker).interfaceId);
        return
            interfaceId == type(IRMRKEmoteTracker).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
