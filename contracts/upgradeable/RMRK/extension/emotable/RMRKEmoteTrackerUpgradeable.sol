// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./IRMRKEmoteTrackerUpgradeable.sol";

/**
 * @title RMRKEmotable
 * @author RMRK team
 * @notice Smart contract of the RMRK Emotable module.
 */
abstract contract RMRKEmoteTrackerUpgradeable is IRMRKEmoteTrackerUpgradeable {
    // Used to avoid double emoting and control undoing
    // emoter address => collection => tokenId => emoji => state (1 for emoted, 0 for not)
    mapping(address => mapping(address => mapping(uint256 => mapping(bytes4 => uint256))))
        private _emotesUsedByEmoter; // Cheaper than using a bool
    // collection => tokenId => emoji => count
    mapping(address => mapping(uint256 => mapping(bytes4 => uint256)))
        private _emotesPerToken;

    /**
     * @inheritdoc IRMRKEmoteTrackerUpgradeable
     */
    function emoteCountOf(
        address collection,
        uint256 tokenId,
        bytes4 emoji
    ) public view returns (uint256) {
        return _emotesPerToken[collection][tokenId][emoji];
    }

    /**
     * @inheritdoc IRMRKEmoteTrackerUpgradeable
     */
    function hasEmoterUsedEmote(
        address emoter,
        address collection,
        uint256 tokenId,
        bytes4 emoji
    ) public view returns (bool) {
        return _emotesUsedByEmoter[emoter][collection][tokenId][emoji] == 1;
    }

    /**
     * @notice Used to emote or undo an emote on a token.
     * @dev Emits ***Emoted*** event.
     * @param collection Address of the collection containing the token being emoted
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
        bool currentVal = _emotesUsedByEmoter[msg.sender][collection][tokenId][
            emoji
        ] == 1;
        if (currentVal != state) {
            _beforeEmote(collection, tokenId, emoji, state);
            if (state) {
                _emotesPerToken[collection][tokenId][emoji] += 1;
            } else {
                _emotesPerToken[collection][tokenId][emoji] -= 1;
            }
            _emotesUsedByEmoter[msg.sender][collection][tokenId][emoji] = state
                ? 1
                : 0;
            emit Emoted(msg.sender, collection, tokenId, emoji, state);
            _afterEmote(collection, tokenId, emoji, state);
        }
    }

    /**
     * @notice Hook that is called before emote is added or removed.
     * @param collection Address of the collection containing the token being emoted
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
     * @notice Hook that is called after emote is added or removed.
     * @param collection Address of the collection smart contract containing the token being emoted
     * @param tokenId ID of the token being emoted
     * @param emoji Unicode identifier of the emoji
     * @param state Boolean value signifying whether to emote (`true`) or undo (`false`) emote
     */
    function _afterEmote(
        address collection,
        uint256 tokenId,
        bytes4 emoji,
        bool state
    ) internal virtual {}

    /**
     * @inheritdoc IERC165Upgradeable
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == type(IRMRKEmoteTrackerUpgradeable).interfaceId ||
            interfaceId == type(IERC165Upgradeable).interfaceId;
    }

    uint256[50] private __gap;
}
