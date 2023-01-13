# Solidity API

## IRMRKNestableAutoIndex

### acceptChild

```solidity
function acceptChild(uint256 parentId, address childAddress, uint256 childId) external
```

Used to accept a pending child token for a given parent token.

_This moves the child token from parent token's pending child tokens array into the active child tokens
 array._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | ID of the parent token for which the child token is being accepted |
| childAddress | address | Address of the collection smart contract of the child |
| childId | uint256 | ID of the child token |

### transferChild

```solidity
function transferChild(uint256 tokenId, address to, uint256 destinationId, address childAddress, uint256 childId, bool isPending, bytes data) external
```

Used to transfer a child token from a given parent token.

_When transferring a child token, the owner of the token is set to `to`, or is not updated in the event of `to`
 being the `0x0` address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the parent token from which the child token is being transferred |
| to | address | Address to which to transfer the token to |
| destinationId | uint256 | ID of the token to receive this child token (MUST be 0 if the destination is not a token) |
| childAddress | address | Address of the collection smart contract of the child |
| childId | uint256 | ID of the child token |
| isPending | bool | A boolean value indicating whether the child token being transferred is in the pending array of the  parent token (`true`) or in the active array (`false`) |
| data | bytes | Additional data with no specified format, sent in call to `_to` |

