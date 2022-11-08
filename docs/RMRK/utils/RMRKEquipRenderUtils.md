# RMRKEquipRenderUtils







*Extra utility functions for composing RMRK extended resources.*

## Methods

### composeEquippables

```solidity
function composeEquippables(address target, uint256 tokenId, uint64 resourceId) external view returns (struct IRMRKEquippable.ExtendedResource resource, struct IRMRKEquippable.FixedPart[] fixedParts, struct RMRKEquipRenderUtils.EquippedSlotPart[] slotParts)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| tokenId | uint256 | undefined |
| resourceId | uint64 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| resource | IRMRKEquippable.ExtendedResource | undefined |
| fixedParts | IRMRKEquippable.FixedPart[] | undefined |
| slotParts | RMRKEquipRenderUtils.EquippedSlotPart[] | undefined |

### getEquipped

```solidity
function getEquipped(address target, uint64 tokenId, uint64 resourceId) external view returns (uint64[] slotParts, struct IRMRKEquippable.Equipment[] childrenEquipped)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| tokenId | uint64 | undefined |
| resourceId | uint64 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| slotParts | uint64[] | undefined |
| childrenEquipped | IRMRKEquippable.Equipment[] | undefined |

### getExtendedActiveResources

```solidity
function getExtendedActiveResources(address target, uint256 tokenId) external view returns (struct RMRKEquipRenderUtils.ExtendedActiveResource[])
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | RMRKEquipRenderUtils.ExtendedActiveResource[] | undefined |

### getExtendedPendingResources

```solidity
function getExtendedPendingResources(address target, uint256 tokenId) external view returns (struct RMRKEquipRenderUtils.ExtendedPendingResource[])
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | RMRKEquipRenderUtils.ExtendedPendingResource[] | undefined |




## Errors

### RMRKNotComposableResource

```solidity
error RMRKNotComposableResource()
```

Attempting to compose a resource wihtout having an associated Base




### RMRKTokenHasNoResources

```solidity
error RMRKTokenHasNoResources()
```

Attempting to determine the resource with the top priority on a token without resources





