# IRMRKEmotable

*RMRK team*

> IRMRKEmotable

Interface smart contract of the RMRK emotable module.



## Methods

### emote

```solidity
function emote(uint256 tokenId, bytes4 emoji, bool state) external nonpayable
```

Used to emote or undo an emote on a token.

*Does nothing if attempting to set a pre-existent state*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token being emoted |
| emoji | bytes4 | Unicode identifier of the emoji |
| state | bool | Boolean value signifying whether to emote (`true`) or undo (`false`) emote |

### getEmoteCount

```solidity
function getEmoteCount(uint256 tokenId, bytes4 emoji) external view returns (uint256)
```

Used to get the number of emotes for a specific emoji on a token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to check for emoji count |
| emoji | bytes4 | Unicode identifier of the emoji |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Number of emotes with the emoji on the token |

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
event Emoted(address indexed emoter, uint256 indexed tokenId, bytes4 emoji, bool on)
```

Used to notify listeners that the token with the specified ID has been emoted to or that the reaction has been revoked.

*The event is only emitted if the state of the emote is changed.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| emoter `indexed` | address | Address of the account that emoted or revoked the reaction to the token |
| tokenId `indexed` | uint256 | ID of the token |
| emoji  | bytes4 | Unicode identifier of the emoji |
| on  | bool | Boolean value signifying whether the token was emoted to (`true`) or if the reaction has been revoked (`false`) |



