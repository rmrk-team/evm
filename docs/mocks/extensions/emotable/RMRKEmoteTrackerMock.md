# RMRKEmoteTrackerMock









## Methods

### emote

```solidity
function emote(address collection, uint256 tokenId, bytes4 emoji, bool on) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | undefined |
| tokenId | uint256 | undefined |
| emoji | bytes4 | undefined |
| on | bool | undefined |

### emoteCountOf

```solidity
function emoteCountOf(address collection, uint256 tokenId, bytes4 emoji) external view returns (uint256)
```

Used to get the number of emotes for a specific emoji on a token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | Address of the collection containing the token being checked for emoji count |
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
event Emoted(address indexed emoter, address indexed collection, uint256 indexed tokenId, bytes4 emoji, bool on)
```

Used to notify listeners that the token with the specified ID has been emoted to or that the reaction has been revoked.

*The event is only emitted if the state of the emote is changed.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| emoter `indexed` | address | Address of the account that emoted or revoked the reaction to the token |
| collection `indexed` | address | Address of the collection smart contract containing the token being emoted to or having the reaction revoked |
| tokenId `indexed` | uint256 | ID of the token |
| emoji  | bytes4 | Unicode identifier of the emoji |
| on  | bool | Boolean value signifying whether the token was emoted to (`true`) or if the reaction has been revoked (`false`) |



