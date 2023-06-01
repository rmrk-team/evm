# RMRKBulkWriterPerCollectionUpgradeable

*RMRK team*

> RMRKBulkWriterPerCollectionUpgradeable

Smart contract of the upgradeable RMRK Bulk Writer per collection module.

*Extra utility functions for RMRK contracts.*

## Methods

### bulkEquip

```solidity
function bulkEquip(uint256 tokenId, RMRKBulkWriterPerCollectionUpgradeable.IntakeUnequip[] unequips, IERC6220.IntakeEquip[] equips) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| unequips | RMRKBulkWriterPerCollectionUpgradeable.IntakeUnequip[] | undefined |
| equips | IERC6220.IntakeEquip[] | undefined |

### getCollection

```solidity
function getCollection() external view returns (address)
```

Returns the address of the collection that this contract is managing




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the collection that this contract is managing |

### replaceEquip

```solidity
function replaceEquip(IERC6220.IntakeEquip data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| data | IERC6220.IntakeEquip | undefined |



## Events

### Initialized

```solidity
event Initialized(uint8 version)
```



*Triggered when the contract has been initialized or reinitialized.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |



## Errors

### RMRKCanOnlyDoBulkOperationsOnOwnedTokens

```solidity
error RMRKCanOnlyDoBulkOperationsOnOwnedTokens()
```






### RMRKCanOnlyDoBulkOperationsWithOneTokenAtATime

```solidity
error RMRKCanOnlyDoBulkOperationsWithOneTokenAtATime()
```







