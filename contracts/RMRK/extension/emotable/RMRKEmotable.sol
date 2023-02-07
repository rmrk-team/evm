// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./IRMRKEmotable.sol";

/**
 * @title RMRKEmotable
 * @author RMRK team
 * @notice Smart contract of the RMRK Emotable module.
 */
abstract contract RMRKEmotable is IRMRKEmotable {
    // Used to avoid double emoting and control undoing
    mapping(address => mapping(uint256 => mapping(bytes4 => uint256)))
        private _emotesPerAddress; // Cheaper than using a bool
    mapping(uint256 => mapping(bytes4 => uint256)) private _emotesPerToken;

    /**
     * @inheritdoc IRMRKEmotable
     */
    function getEmoteCount(
        uint256 tokenId,
        bytes4 emoji
    ) public view returns (uint256) {
        return _emotesPerToken[tokenId][emoji];
    }

    /**
     * @notice Used to emote or undo an emote on a token.
     * @dev Emits ***Emoted*** event.
     * @param tokenId ID of the token being emoted
     * @param emoji Unicode identifier of the emoji
     * @param state Boolean value signifying whether to emote (`true`) or undo (`false`) emote
     */
    function _emote(
        uint256 tokenId,
        bytes4 emoji,
        bool state
    ) internal virtual {
        bool currentVal = _emotesPerAddress[msg.sender][tokenId][emoji] == 1;
        if (currentVal != state) {
            _beforeEmote(tokenId, emoji, state);
            if (state) {
                _emotesPerToken[tokenId][emoji] += 1;
            } else {
                _emotesPerToken[tokenId][emoji] -= 1;
            }
            _emotesPerAddress[msg.sender][tokenId][emoji] = state ? 1 : 0;
            emit Emoted(msg.sender, tokenId, emoji, state);
            _afterEmote(tokenId, emoji, state);
        }
    }

    /**
     * @notice Hook that is called before emote is added or removed.
     * @param tokenId ID of the token being emoted
     * @param emoji Unicode identifier of the emoji
     * @param state Boolean value signifying whether to emote (`true`) or undo (`false`) emote
     */
    function _beforeEmote(
        uint256 tokenId,
        bytes4 emoji,
        bool state
    ) internal virtual {}

    /**
     * @notice Hook that is called after emote is added or removed.
     * @param tokenId ID of the token being emoted
     * @param emoji Unicode identifier of the emoji
     * @param state Boolean value signifying whether to emote (`true`) or undo (`false`) emote
     */
    function _afterEmote(
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
        return interfaceId == type(IRMRKEmotable).interfaceId;
    }
}
