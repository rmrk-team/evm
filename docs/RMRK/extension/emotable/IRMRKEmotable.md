# Solidity API

## IRMRKEmotable

Interface smart contract of the RMRK emotable module.

### getEmoteCount

```solidity
function getEmoteCount(uint256 tokenId, bytes4 emoji) external view returns (uint256)
```

Used to get the number of emotes for a specific emoji on a token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to check for emoji count |
| emoji | bytes4 | Unicode identifier of the emoji |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Number of emotes with the emoji on the token |

### emote

```solidity
function emote(uint256 tokenId, bytes4 emoji, bool state) external
```

Used to emote or undo an emote on a token.

_Does nothing if attempting to set a pre-existent state_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token being emoted |
| emoji | bytes4 | Unicode identifier of the emoji |
| state | bool | Boolean value signifying whether to emote (`true`) or undo (`false`) emote |

