# RMRKBulkWriterPerCollection

*RMRK team*

> RMRKBulkWriterPerCollection

Smart contract of the RMRK Bulk Writer per collection module.

*Extra utility functions for RMRK contracts.*

## Methods

### bulkEquip

```solidity
function bulkEquip(RMRKBulkWriterPerCollection.IntakeUnequip[] unequips, IRMRKEquippable.IntakeEquip[] equips) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| unequips | RMRKBulkWriterPerCollection.IntakeUnequip[] | undefined |
| equips | IRMRKEquippable.IntakeEquip[] | undefined |

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
function replaceEquip(IRMRKEquippable.IntakeEquip data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| data | IRMRKEquippable.IntakeEquip | undefined |




