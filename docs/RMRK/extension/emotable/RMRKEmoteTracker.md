# Solidity API

## RMRKEmoteTracker

Smart contract of the RMRK Emotable module.

### Emoted

```solidity
event Emoted(address emoter, address collection, uint256 tokenId, bytes4 emoji, bool on)
```

### getEmoteCount

```solidity
function getEmoteCount(address collection, uint256 tokenId, bytes4 emoji) public view returns (uint256)
```

Used to get the number of emotes for a specific emoji on a token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| collection | address | Address of the collection containing the token being checked for emoji count |
| tokenId | uint256 | ID of the token to check for emoji count |
| emoji | bytes4 | Unicode identifier of the emoji |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Number of emotes with the emoji on the token |

### _emote

```solidity
function _emote(address collection, uint256 tokenId, bytes4 emoji, bool state) internal virtual
```

Used to emote or undo an emote on a token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| collection | address | Address of the collection containing the token being emoted |
| tokenId | uint256 | ID of the token being emoted |
| emoji | bytes4 | Unicode identifier of the emoji |
| state | bool | Boolean value signifying whether to emote (`true`) or undo (`false`) emote |

### _beforeEmote

```solidity
function _beforeEmote(address collection, uint256 tokenId, bytes4 emoji, bool state) internal virtual
```

Hook that is called before emote is added or removed.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| collection | address | Address of the collection containing the token being emoted |
| tokenId | uint256 | ID of the token being emoted |
| emoji | bytes4 | Unicode identifier of the emoji |
| state | bool | Boolean value signifying whether to emote (`true`) or undo (`false`) emote |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

