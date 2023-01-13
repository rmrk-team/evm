# Solidity API

## IRMRKReclaimableChild

Interface smart contract of the RMRK Reclaimable child module.

### reclaimChild

```solidity
function reclaimChild(uint256 tokenId, address childAddress, uint256 childId) external
```

Used to reclaim an abandoned child token.

_Child token was abandoned by transferring it with `to` as the `0x0` address.
This function will set the child's owner to the `rootOwner` of the caller, allowing the `rootOwner`
 management permissions for the child.
Requirements:

 - `tokenId` must exist_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the last parent token of the child token being recovered |
| childAddress | address | Address of the child token's smart contract |
| childId | uint256 | ID of the child token being reclaimed |

