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

### replaceEquip

```solidity
function replaceEquip(address collection, IERC6220.IntakeEquip data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | undefined |
| data | IERC6220.IntakeEquip | undefined |




## Errors

### RMRKCanOnlyDoBulkOperationsOnOwnedTokens

```solidity
error RMRKCanOnlyDoBulkOperationsOnOwnedTokens()
```






### RMRKCanOnlyDoBulkOperationsWithOneTokenAtATime

```solidity
error RMRKCanOnlyDoBulkOperationsWithOneTokenAtATime()
```







