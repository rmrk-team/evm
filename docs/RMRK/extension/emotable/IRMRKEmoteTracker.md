# Solidity API

## IRMRKEmoteTracker

Interface smart contract of the RMRK emote tracker module.

### getEmoteCount

```solidity
function getEmoteCount(address collection, uint256 tokenId, bytes4 emoji) external view returns (uint256)
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

### emote

```solidity
function emote(address collection, uint256 tokenId, bytes4 emoji, bool state) external
```

Used to emote or undo an emote on a token.

_Does nothing if attempting to set a pre-existent state_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| collection | address | Address of the collection containing the token being checked for emoji count |
| tokenId | uint256 | ID of the token being emoted |
| emoji | bytes4 | Unicode identifier of the emoji |
| state | bool | Boolean value signifying whether to emote (`true`) or undo (`false`) emote |

