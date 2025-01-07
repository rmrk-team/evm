# RMRKBulkWriter

*RMRK team*

> RMRKBulkWriter

Smart contract of the RMRK Bulk Writer module.

*Extra utility functions for RMRK contracts.*

## Methods

### bulkEquip

```solidity
function bulkEquip(address collection, uint256 tokenId, RMRKBulkWriter.IntakeUnequip[] unequips, IERC6220.IntakeEquip[] equips) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | undefined |
| tokenId | uint256 | undefined |
| unequips | RMRKBulkWriter.IntakeUnequip[] | undefined |
| equips | IERC6220.IntakeEquip[] | undefined |

### bulkTransferAllChildren

```solidity
function bulkTransferAllChildren(address collection, uint256 tokenId, address to, uint256 destinationId) external nonpayable
```

Transfers all children from one token.

*If `destinationId` is 0, the destination can be an EoA or a contract implementing the IERC721Receiver interface.If `destinationId` is not 0, the destination must be a contract implementing the IERC7401 interface.This methods works with active children only.This contract must have approval to manage the NFT, only the current owner can call this method (not an approved operator).*

#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | Address of the collection that this contract is managing |
| tokenId | uint256 | ID of the token we are managing |
| to | address | Address of the destination token or contract |
| destinationId | uint256 | ID of the destination token |

### bulkTransferChildren

```solidity
function bulkTransferChildren(address collection, uint256 tokenId, uint256[] childrenIndexes, address to, uint256 destinationId) external nonpayable
```

Transfers multiple children from one token.

*If `destinationId` is 0, the destination can be an EoA or a contract implementing the IERC721Receiver interface.If `destinationId` is not 0, the destination must be a contract implementing the IERC7401 interface.`childrenIndexes` MUST be in ascending order, this method will transfer the children in reverse order to avoid index changes on children.This methods works with active children only.This contract must have approval to manage the NFT, only the current owner can call this method (not an approved operator).*

#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | Address of the collection that this contract is managing |
| tokenId | uint256 | ID of the token we are managing |
| childrenIndexes | uint256[] | An array of indexes of the children to transfer |
| to | address | Address of the destination token or contract |
| destinationId | uint256 | ID of the destination token |

### replaceEquip

```solidity
function replaceEquip(address collection, IERC6220.IntakeEquip data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | undefined |
| data | IERC6220.IntakeEquip | undefined |

### transferAndEquip

```solidity
function transferAndEquip(address collection, uint256 tokenId, address destinationCollection, uint256 destinationTokenId, RMRKBulkWriter.ParentData parentData, IERC6220.IntakeEquip equipData) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | undefined |
| tokenId | uint256 | undefined |
| destinationCollection | address | undefined |
| destinationTokenId | uint256 | undefined |
| parentData | RMRKBulkWriter.ParentData | undefined |
| equipData | IERC6220.IntakeEquip | undefined |




## Errors

### RMRKCanOnlyDoBulkOperationsOnOwnedTokens

```solidity
error RMRKCanOnlyDoBulkOperationsOnOwnedTokens()
```

Attempting to do a bulk operation on a token that is not owned by the caller




### RMRKCanOnlyDoBulkOperationsWithOneTokenAtATime

```solidity
error RMRKCanOnlyDoBulkOperationsWithOneTokenAtATime()
```

Attempting to do a bulk operation with multiple tokens at a time





