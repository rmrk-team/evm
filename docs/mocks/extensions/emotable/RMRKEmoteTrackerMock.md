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

### getEmoteCount

```solidity
function getEmoteCount(address collection, uint256 tokenId, bytes4 emoji) external view returns (uint256)
```

Used to get the number of emotes for a specific emoji on a token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | Address of the collection with the token to check for emoji count |
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





#### Parameters

| Name | Type | Description |
|---|---|---|
| emoter `indexed` | address | undefined |
| collection `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |
| emoji  | bytes4 | undefined |
| on  | bool | undefined |



