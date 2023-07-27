# IEmotableRepository









## Methods

### bulkEmote

```solidity
function bulkEmote(address[] collections, uint256[] tokenIds, string[] emojis, bool[] states) external nonpayable
```

Used to emote or undo an emote on multiple tokens.

*Does nothing if attempting to set a pre-existent state.MUST emit the `Emoted` event is the state of the emote is changed.MUST revert if the lengths of the `collections`, `tokenIds`, `emojis` and `states` arrays are not equal.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| collections | address[] | An array of addresses of the collections containing the tokens being emoted at |
| tokenIds | uint256[] | An array of IDs of the tokens being emoted |
| emojis | string[] | An array of unicode identifiers of the emojis |
| states | bool[] | An array of boolean values signifying whether to emote (`true`) or undo (`false`) emote |

### bulkEmoteCountOf

```solidity
function bulkEmoteCountOf(address[] collections, uint256[] tokenIds, string[] emojis) external view returns (uint256[])
```

Used to get the number of emotes for a specific emoji on a set of tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collections | address[] | An array of addresses of the collections containing the tokens being checked for emoji count |
| tokenIds | uint256[] | An array of IDs of the tokens to check for emoji count |
| emojis | string[] | An array of unicode identifiers of the emojis |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256[] | An array of numbers of emotes with the emoji on the tokens |

### bulkPrepareMessagesToPresignEmote

```solidity
function bulkPrepareMessagesToPresignEmote(address[] collections, uint256[] tokenIds, string[] emojis, bool[] states, uint256[] deadlines) external view returns (bytes32[])
```

Used to get multiple messages to be signed by the `emoter` in order for the reaction to be submitted by someone  else.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collections | address[] | An array of addresses of the collection smart contracts containing the tokens being emoted at |
| tokenIds | uint256[] | An array of IDs of the tokens being emoted |
| emojis | string[] | An array of unicode identifiers of the emojis |
| states | bool[] | An array of boolean values signifying whether to emote (`true`) or undo (`false`) emote |
| deadlines | uint256[] | An array of UNIX timestamps of the deadlines for the signatures to be submitted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32[] | The array of messages to be signed by the `emoter` in order for the reaction to be submitted by someone else |

### bulkPresignedEmote

```solidity
function bulkPresignedEmote(address[] emoters, address[] collections, uint256[] tokenIds, string[] emojis, bool[] states, uint256[] deadlines, uint8[] v, bytes32[] r, bytes32[] s) external nonpayable
```

Used to bulk emote or undo an emote on someone else&#39;s behalf.

*Does nothing if attempting to set a pre-existent state.MUST emit the `Emoted` event is the state of the emote is changed.MUST revert if the lengths of the `collections`, `tokenIds`, `emojis` and `states` arrays are not equal.MUST revert if the `deadline` has passed.MUST revert if the recovered address is the zero address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| emoters | address[] | An array of addresses of the accounts that presigned the emotes |
| collections | address[] | An array of addresses of the collections containing the tokens being emoted at |
| tokenIds | uint256[] | An array of IDs of the tokens being emoted |
| emojis | string[] | An array of unicode identifiers of the emojis |
| states | bool[] | An array of boolean values signifying whether to emote (`true`) or undo (`false`) emote |
| deadlines | uint256[] | UNIX timestamp of the deadline for the signature to be submitted |
| v | uint8[] | An array of `v` values of an ECDSA signatures of the messages obtained via `prepareMessageToPresignEmote` |
| r | bytes32[] | An array of `r` values of an ECDSA signatures of the messages obtained via `prepareMessageToPresignEmote` |
| s | bytes32[] | An array of `s` values of an ECDSA signatures of the messages obtained via `prepareMessageToPresignEmote` |

### emote

```solidity
function emote(address collection, uint256 tokenId, string emoji, bool state) external nonpayable
```

Used to emote or undo an emote on a token.

*Does nothing if attempting to set a pre-existent state.MUST emit the `Emoted` event is the state of the emote is changed.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | Address of the collection containing the token being emoted at |
| tokenId | uint256 | ID of the token being emoted |
| emoji | string | Unicode identifier of the emoji |
| state | bool | Boolean value signifying whether to emote (`true`) or undo (`false`) emote |

### emoteCountOf

```solidity
function emoteCountOf(address collection, uint256 tokenId, string emoji) external view returns (uint256)
```

Used to get the number of emotes for a specific emoji on a token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | Address of the collection containing the token being checked for emoji count |
| tokenId | uint256 | ID of the token to check for emoji count |
| emoji | string | Unicode identifier of the emoji |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Number of emotes with the emoji on the token |

### hasEmoterUsedEmote

```solidity
function hasEmoterUsedEmote(address emoter, address collection, uint256 tokenId, string emoji) external view returns (bool)
```

Used to get the information on whether the specified address has used a specific emoji on a specific  token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| emoter | address | Address of the account we are checking for a reaction to a token |
| collection | address | Address of the collection smart contract containing the token being checked for emoji reaction |
| tokenId | uint256 | ID of the token being checked for emoji reaction |
| emoji | string | The ASCII emoji code being checked for reaction |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | A boolean value indicating whether the `emoter` has used the `emoji` on the token (`true`) or not  (`false`) |

### haveEmotersUsedEmotes

```solidity
function haveEmotersUsedEmotes(address[] emoters, address[] collections, uint256[] tokenIds, string[] emojis) external view returns (bool[])
```

Used to get the information on whether the specified addresses have used specific emojis on specific  tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| emoters | address[] | An array of addresses of the accounts we are checking for reactions to tokens |
| collections | address[] | An array of addresses of the collection smart contracts containing the tokens being checked  for emoji reactions |
| tokenIds | uint256[] | An array of IDs of the tokens being checked for emoji reactions |
| emojis | string[] | An array of the ASCII emoji codes being checked for reactions |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool[] | An array of boolean values indicating whether the `emoter`s has used the `emoji`s on the tokens (`true`)  or not (`false`) |

### prepareMessageToPresignEmote

```solidity
function prepareMessageToPresignEmote(address collection, uint256 tokenId, string emoji, bool state, uint256 deadline) external view returns (bytes32)
```

Used to get the message to be signed by the `emoter` in order for the reaction to be submitted by someone  else.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | The address of the collection smart contract containing the token being emoted at |
| tokenId | uint256 | ID of the token being emoted |
| emoji | string | Unicode identifier of the emoji |
| state | bool | Boolean value signifying whether to emote (`true`) or undo (`false`) emote |
| deadline | uint256 | UNIX timestamp of the deadline for the signature to be submitted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | The message to be signed by the `emoter` in order for the reaction to be submitted by someone else |

### presignedEmote

```solidity
function presignedEmote(address emoter, address collection, uint256 tokenId, string emoji, bool state, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external nonpayable
```

Used to emote or undo an emote on someone else&#39;s behalf.

*Does nothing if attempting to set a pre-existent state.MUST emit the `Emoted` event is the state of the emote is changed.MUST revert if the lengths of the `collections`, `tokenIds`, `emojis` and `states` arrays are not equal.MUST revert if the `deadline` has passed.MUST revert if the recovered address is the zero address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| emoter | address | The address that presigned the emote |
| collection | address | The address of the collection smart contract containing the token being emoted at |
| tokenId | uint256 | IDs of the token being emoted |
| emoji | string | Unicode identifier of the emoji |
| state | bool | Boolean value signifying whether to emote (`true`) or undo (`false`) emote |
| deadline | uint256 | UNIX timestamp of the deadline for the signature to be submitted |
| v | uint8 | `v` value of an ECDSA signature of the message obtained via `prepareMessageToPresignEmote` |
| r | bytes32 | `r` value of an ECDSA signature of the message obtained via `prepareMessageToPresignEmote` |
| s | bytes32 | `s` value of an ECDSA signature of the message obtained via `prepareMessageToPresignEmote` |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section] to learn more about how these ids are created. This function call must use less than 30 000 gas.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |



## Events

### Emoted

```solidity
event Emoted(address indexed emoter, address indexed collection, uint256 indexed tokenId, string emoji, bool on)
```

Used to notify listeners that the token with the specified ID has been emoted to or that the reaction has been revoked.

*The event MUST only be emitted if the state of the emote is changed.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| emoter `indexed` | address | Address of the account that emoted or revoked the reaction to the token |
| collection `indexed` | address | Address of the collection smart contract containing the token being emoted to or having the reaction revoked |
| tokenId `indexed` | uint256 | ID of the token |
| emoji  | string | Unicode identifier of the emoji |
| on  | bool | Boolean value signifying whether the token was emoted to (`true`) or if the reaction has been revoked (`false`) |



