# EmotableRepository









## Methods

### DOMAIN_SEPARATOR

```solidity
function DOMAIN_SEPARATOR() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### bulkEmote

```solidity
function bulkEmote(address[] collections, uint256[] tokenIds, string[] emojis, bool[] states) external nonpayable
```

inheritdoc IEmotableRepository



#### Parameters

| Name | Type | Description |
|---|---|---|
| collections | address[] | undefined |
| tokenIds | uint256[] | undefined |
| emojis | string[] | undefined |
| states | bool[] | undefined |

### bulkEmoteCountOf

```solidity
function bulkEmoteCountOf(address[] collections, uint256[] tokenIds, string[] emojis) external view returns (uint256[])
```

inheritdoc IEmotableRepository



#### Parameters

| Name | Type | Description |
|---|---|---|
| collections | address[] | undefined |
| tokenIds | uint256[] | undefined |
| emojis | string[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256[] | undefined |

### bulkPrepareMessagesToPresignEmote

```solidity
function bulkPrepareMessagesToPresignEmote(address[] collections, uint256[] tokenIds, string[] emojis, bool[] states, uint256[] deadlines) external view returns (bytes32[])
```

inheritdoc IEmotableRepository



#### Parameters

| Name | Type | Description |
|---|---|---|
| collections | address[] | undefined |
| tokenIds | uint256[] | undefined |
| emojis | string[] | undefined |
| states | bool[] | undefined |
| deadlines | uint256[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32[] | undefined |

### bulkPresignedEmote

```solidity
function bulkPresignedEmote(address[] emoters, address[] collections, uint256[] tokenIds, string[] emojis, bool[] states, uint256[] deadlines, uint8[] v, bytes32[] r, bytes32[] s) external nonpayable
```

inheritdoc IEmotableRepository



#### Parameters

| Name | Type | Description |
|---|---|---|
| emoters | address[] | undefined |
| collections | address[] | undefined |
| tokenIds | uint256[] | undefined |
| emojis | string[] | undefined |
| states | bool[] | undefined |
| deadlines | uint256[] | undefined |
| v | uint8[] | undefined |
| r | bytes32[] | undefined |
| s | bytes32[] | undefined |

### emote

```solidity
function emote(address collection, uint256 tokenId, string emoji, bool state) external nonpayable
```

inheritdoc IEmotableRepository



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | undefined |
| tokenId | uint256 | undefined |
| emoji | string | undefined |
| state | bool | undefined |

### emoteCountOf

```solidity
function emoteCountOf(address collection, uint256 tokenId, string emoji) external view returns (uint256)
```

inheritdoc IEmotableRepository



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | undefined |
| tokenId | uint256 | undefined |
| emoji | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### hasEmoterUsedEmote

```solidity
function hasEmoterUsedEmote(address emoter, address collection, uint256 tokenId, string emoji) external view returns (bool)
```

inheritdoc IEmotableRepository



#### Parameters

| Name | Type | Description |
|---|---|---|
| emoter | address | undefined |
| collection | address | undefined |
| tokenId | uint256 | undefined |
| emoji | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### haveEmotersUsedEmotes

```solidity
function haveEmotersUsedEmotes(address[] emoters, address[] collections, uint256[] tokenIds, string[] emojis) external view returns (bool[])
```

inheritdoc IEmotableRepository



#### Parameters

| Name | Type | Description |
|---|---|---|
| emoters | address[] | undefined |
| collections | address[] | undefined |
| tokenIds | uint256[] | undefined |
| emojis | string[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool[] | undefined |

### prepareMessageToPresignEmote

```solidity
function prepareMessageToPresignEmote(address collection, uint256 tokenId, string emoji, bool state, uint256 deadline) external view returns (bytes32)
```

inheritdoc IEmotableRepository



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | undefined |
| tokenId | uint256 | undefined |
| emoji | string | undefined |
| state | bool | undefined |
| deadline | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### presignedEmote

```solidity
function presignedEmote(address emoter, address collection, uint256 tokenId, string emoji, bool state, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external nonpayable
```

inheritdoc IEmotableRepository



#### Parameters

| Name | Type | Description |
|---|---|---|
| emoter | address | undefined |
| collection | address | undefined |
| tokenId | uint256 | undefined |
| emoji | string | undefined |
| state | bool | undefined |
| deadline | uint256 | undefined |
| v | uint8 | undefined |
| r | bytes32 | undefined |
| s | bytes32 | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

inheritdoc IERC165



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



## Errors

### BulkParametersOfUnequalLength

```solidity
error BulkParametersOfUnequalLength()
```






### ExpiredPresignedEmote

```solidity
error ExpiredPresignedEmote()
```






### InvalidSignature

```solidity
error InvalidSignature()
```







