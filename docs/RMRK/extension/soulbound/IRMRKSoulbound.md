# Solidity API

## IRMRKSoulbound

Interface smart contract of the RMRK soulbound module.

### isSoulbound

```solidity
function isSoulbound(uint256 tokenId) external view returns (bool)
```

Used to check whether the given token is soulbound or not.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token being checked |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | Boolean value indicating whether the given token is soulbound |

