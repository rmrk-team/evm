# IRMRKEquipRenderUtils









## Methods

### composeEquippables

```solidity
function composeEquippables(address target, uint256 tokenId, uint64 resourceId) external view returns (struct IRMRKEquippable.ExtendedResource resource, struct IRMRKEquippable.FixedPart[] fixedParts, struct IRMRKEquippable.SlotPart[] slotParts)
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
| slotParts | IRMRKEquippable.SlotPart[] | undefined |

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

### getExtendedResourceByIndex

```solidity
function getExtendedResourceByIndex(address target, uint256 tokenId, uint256 index) external view returns (struct IRMRKEquippable.ExtendedResource)
```

Returns `ExtendedResource` object associated with `resourceId` Requirements: - `resourceId` must exist.



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| tokenId | uint256 | undefined |
| index | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKEquippable.ExtendedResource | undefined |

### getExtendedResourcesById

```solidity
function getExtendedResourcesById(address target, uint64[] resourceIds) external view returns (struct IRMRKEquippable.ExtendedResource[])
```

Returns `ExtendedResource` objects for the given ids Requirements: - `resourceIds` must exist.



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| resourceIds | uint64[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKEquippable.ExtendedResource[] | undefined |

### getPendingExtendedResourceByIndex

```solidity
function getPendingExtendedResourceByIndex(address target, uint256 tokenId, uint256 index) external view returns (struct IRMRKEquippable.ExtendedResource)
```

Returns `ExtendedResource` object at `index` of active resource array on `tokenId` Requirements: - `tokenId` must exist. - `index` must be inside the range of active resource array



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| tokenId | uint256 | undefined |
| index | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKEquippable.ExtendedResource | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section] to learn more about how these ids are created. This function call must use less than 30 000 gas.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |




