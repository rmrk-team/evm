// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./IERC6381.sol";

error BulkParametersOfUnequalLength();
error ExpiredPresignedEmote();
error InvalidSignature();

/**
 * @title RMRKEmotable
 * @author RMRK team
 * @notice Smart contract of the RMRK Emotable module.
 */
abstract contract RMRKEmoteTracker is IERC6381 {
    bytes32 public immutable DOMAIN_SEPARATOR =
        keccak256(
            abi.encode(
                "ERC-6381: Public Non-Fungible Token Emote Repository",
                "1",
                block.chainid,
                address(this)
            )
        );

    // Used to avoid double emoting and control undoing
    // emoter address => collection => tokenId => emoji => state (1 for emoted, 0 for not)
    mapping(address => mapping(address => mapping(uint256 => mapping(bytes4 => uint256))))
        private _emotesUsedByEmoter; // Cheaper than using a bool
    // collection => tokenId => emoji => count
    mapping(address => mapping(uint256 => mapping(bytes4 => uint256)))
        private _emotesPerToken;

    /**
     * @inheritdoc IERC6381
     */
    function emoteCountOf(
        address collection,
        uint256 tokenId,
        bytes4 emoji
    ) public view returns (uint256) {
        return _emotesPerToken[collection][tokenId][emoji];
    }

    /**
     * @inheritdoc IERC6381
     */
    function bulkEmoteCountOf(
        address[] memory collections,
        uint256[] memory tokenIds,
        bytes4[] memory emojis
    ) public view returns (uint256[] memory) {
        if (
            collections.length != tokenIds.length ||
            collections.length != emojis.length
        ) {
            revert BulkParametersOfUnequalLength();
        }

        uint256[] memory counts = new uint256[](collections.length);
        for (uint256 i; i < collections.length; ) {
            counts[i] = _emotesPerToken[collections[i]][tokenIds[i]][emojis[i]];
            unchecked {
                ++i;
            }
        }
        return counts;
    }

    /**
     * @inheritdoc IERC6381
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
     * @inheritdoc IERC6381
     */
    function haveEmotersUsedEmotes(
        address[] memory emoters,
        address[] memory collections,
        uint256[] memory tokenIds,
        bytes4[] memory emojis
    ) public view returns (bool[] memory) {
        if (
            emoters.length != collections.length ||
            emoters.length != tokenIds.length ||
            emoters.length != emojis.length
        ) {
            revert BulkParametersOfUnequalLength();
        }

        bool[] memory states = new bool[](collections.length);
        for (uint256 i; i < collections.length; ) {
            states[i] =
                _emotesUsedByEmoter[emoters[i]][collections[i]][tokenIds[i]][
                    emojis[i]
                ] ==
                1;
            unchecked {
                ++i;
            }
        }
        return states;
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
     * @notice Used to emote or undo an emote on multiple tokens.
     * @dev Does nothing if attempting to set a pre-existent state.
     * @dev MUST emit the `Emoted` event is the state of the emote is changed.
     * @dev MUST revert if the lengths of the `collections`, `tokenIds`, `emojis` and `states` arrays are not equal.
     * @param collections An array of addresses of the collections containing the tokens being emoted at
     * @param tokenIds An array of IDs of the tokens being emoted
     * @param emojis An array of unicode identifiers of the emojis
     * @param states An array of boolean values signifying whether to emote (`true`) or undo (`false`) emote
     */
    function _bulkEmote(
        address[] memory collections,
        uint256[] memory tokenIds,
        bytes4[] memory emojis,
        bool[] memory states
    ) internal virtual {
        if (
            collections.length != tokenIds.length ||
            collections.length != emojis.length ||
            collections.length != states.length
        ) {
            revert BulkParametersOfUnequalLength();
        }

        bool currentVal;
        for (uint256 i; i < collections.length; ) {
            currentVal =
                _emotesUsedByEmoter[msg.sender][collections[i]][tokenIds[i]][
                    emojis[i]
                ] ==
                1;
            if (currentVal != states[i]) {
                _beforeEmote(collections[i], tokenIds[i], emojis[i], states[i]);
                if (states[i]) {
                    _emotesPerToken[collections[i]][tokenIds[i]][
                        emojis[i]
                    ] += 1;
                } else {
                    _emotesPerToken[collections[i]][tokenIds[i]][
                        emojis[i]
                    ] -= 1;
                }
                _emotesUsedByEmoter[msg.sender][collections[i]][tokenIds[i]][
                    emojis[i]
                ] = states[i] ? 1 : 0;
                emit Emoted(
                    msg.sender,
                    collections[i],
                    tokenIds[i],
                    emojis[i],
                    states[i]
                );
                _afterEmote(collections[i], tokenIds[i], emojis[i], states[i]);
            }
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @inheritdoc IERC6381
     */
    function prepareMessageToPresignEmote(
        address collection,
        uint256 tokenId,
        bytes4 emoji,
        bool state,
        uint256 deadline
    ) public view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    DOMAIN_SEPARATOR,
                    collection,
                    tokenId,
                    emoji,
                    state,
                    deadline
                )
            );
    }

    /**
     * @inheritdoc IERC6381
     */
    function bulkPrepareMessagesToPresignEmote(
        address[] memory collections,
        uint256[] memory tokenIds,
        bytes4[] memory emojis,
        bool[] memory states,
        uint256[] memory deadlines
    ) public view returns (bytes32[] memory) {
        if (
            collections.length != tokenIds.length ||
            collections.length != emojis.length ||
            collections.length != states.length ||
            collections.length != deadlines.length
        ) {
            revert BulkParametersOfUnequalLength();
        }

        bytes32[] memory messages = new bytes32[](collections.length);
        for (uint256 i; i < collections.length; ) {
            messages[i] = keccak256(
                abi.encode(
                    DOMAIN_SEPARATOR,
                    collections[i],
                    tokenIds[i],
                    emojis[i],
                    states[i],
                    deadlines[i]
                )
            );
            unchecked {
                ++i;
            }
        }

        return messages;
    }

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
    function _presignedEmote(
        address emoter,
        address collection,
        uint256 tokenId,
        bytes4 emoji,
        bool state,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal virtual {
        if (block.timestamp > deadline) {
            revert ExpiredPresignedEmote();
        }
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(
                    abi.encode(
                        DOMAIN_SEPARATOR,
                        collection,
                        tokenId,
                        emoji,
                        state,
                        deadline
                    )
                )
            )
        );
        address signer = ecrecover(digest, v, r, s);
        if (signer != emoter) {
            revert InvalidSignature();
        }

        bool currentVal = _emotesUsedByEmoter[signer][collection][tokenId][
            emoji
        ] == 1;
        if (currentVal != state) {
            _beforeEmote(collection, tokenId, emoji, state);
            if (state) {
                _emotesPerToken[collection][tokenId][emoji] += 1;
            } else {
                _emotesPerToken[collection][tokenId][emoji] -= 1;
            }
            _emotesUsedByEmoter[signer][collection][tokenId][emoji] = state
                ? 1
                : 0;
            emit Emoted(signer, collection, tokenId, emoji, state);
            _afterEmote(collection, tokenId, emoji, state);
        }
    }

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
    function _bulkPresignedEmote(
        address[] memory emoters,
        address[] memory collections,
        uint256[] memory tokenIds,
        bytes4[] memory emojis,
        bool[] memory states,
        uint256[] memory deadlines,
        uint8[] memory v,
        bytes32[] memory r,
        bytes32[] memory s
    ) internal virtual {
        if (
            emoters.length != collections.length ||
            emoters.length != tokenIds.length ||
            emoters.length != emojis.length ||
            emoters.length != states.length ||
            emoters.length != deadlines.length ||
            emoters.length != v.length ||
            emoters.length != r.length ||
            emoters.length != s.length
        ) {
            revert BulkParametersOfUnequalLength();
        }

        bytes32 digest;
        address signer;
        bool currentVal;
        for (uint256 i; i < collections.length; ) {
            if (block.timestamp > deadlines[i]) {
                revert ExpiredPresignedEmote();
            }
            digest = keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    keccak256(
                        abi.encode(
                            DOMAIN_SEPARATOR,
                            collections[i],
                            tokenIds[i],
                            emojis[i],
                            states[i],
                            deadlines[i]
                        )
                    )
                )
            );
            signer = ecrecover(digest, v[i], r[i], s[i]);
            if (signer != emoters[i]) {
                revert InvalidSignature();
            }

            currentVal =
                _emotesUsedByEmoter[signer][collections[i]][tokenIds[i]][
                    emojis[i]
                ] ==
                1;
            if (currentVal != states[i]) {
                _beforeEmote(collections[i], tokenIds[i], emojis[i], states[i]);
                if (states[i]) {
                    _emotesPerToken[collections[i]][tokenIds[i]][
                        emojis[i]
                    ] += 1;
                } else {
                    _emotesPerToken[collections[i]][tokenIds[i]][
                        emojis[i]
                    ] -= 1;
                }
                _emotesUsedByEmoter[signer][collections[i]][tokenIds[i]][
                    emojis[i]
                ] = states[i] ? 1 : 0;
                emit Emoted(
                    signer,
                    collections[i],
                    tokenIds[i],
                    emojis[i],
                    states[i]
                );
                _afterEmote(collections[i], tokenIds[i], emojis[i], states[i]);
            }
            unchecked {
                ++i;
            }
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
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == type(IERC6381).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
