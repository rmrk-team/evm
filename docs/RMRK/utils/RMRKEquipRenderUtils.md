# RMRKEquipRenderUtils

*RMRK team*

> RMRKEquipRenderUtils

Smart contract of the RMRK Equip render utils module.

*Extra utility functions for composing RMRK extended resources.*

## Methods

### composeEquippables

```solidity
function composeEquippables(address target, uint256 tokenId, uint64 resourceId) external view returns (string metadataURI, uint64 equippableGroupId, address baseAddress, struct IRMRKEquippable.FixedPart[] fixedParts, struct RMRKEquipRenderUtils.EquippedSlotPart[] slotParts)
```

Used to compose the given equippables.

*The full `FixedPart` struct looks like this:  [      partId,      z,      metadataURI  ]The full `EquippedSlotPart` struct looks like this:  [      partId,      childResourceId,      z,      childAddress,      childId,      childResourceMetadata,      partMetadata  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to compose the equipped items in the resource for |
| resourceId | uint64 | ID of the resource being queried for equipped parts |

#### Returns

| Name | Type | Description |
|---|---|---|
| metadataURI | string | Metadata URI of the resource |
| equippableGroupId | uint64 | Equippable group ID of the resource |
| baseAddress | address | Address of the base to which the resource belongs to |
| fixedParts | IRMRKEquippable.FixedPart[] | An array of fixed parts respresented by the `FixedPart` structs present on the resource |
| slotParts | RMRKEquipRenderUtils.EquippedSlotPart[] | An array of slot parts represented by the `EquippedSlotPart` structs present on the resource |

### getEquipped

```solidity
function getEquipped(address target, uint64 tokenId, uint64 resourceId) external view returns (uint64[] slotParts, struct IRMRKEquippable.Equipment[] childrenEquipped)
```

Used to retrieve the equipped parts of the given token.

*NOTE: Some of the equipped children might be empty.The full `Equipment` struct looks like this:  [      resourceId,      childResourceId,      childId,      childEquippableAddress  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint64 | ID of the token to retrieve the equipped items in the resource for |
| resourceId | uint64 | ID of the resource being queried for equipped parts |

#### Returns

| Name | Type | Description |
|---|---|---|
| slotParts | uint64[] | An array of the IDs of the slot parts present in the given resource |
| childrenEquipped | IRMRKEquippable.Equipment[] | An array of `Equipment` structs containing info about the equipped children |

### getExtendedActiveResources

```solidity
function getExtendedActiveResources(address target, uint256 tokenId) external view returns (struct RMRKEquipRenderUtils.ExtendedActiveResource[])
```

Used to get extended active resources of the given token.

*The full `ExtendedActiveResource` looks like this:  [      ID,      equippableGroupId,      priority,      baseAddress,      metadata,      [          fixedPartId0,          fixedPartId1,          fixedPartId2      ],      [          slotPartId0,          slotPartId1,          slotPartId2      ]  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the extended active resources for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | RMRKEquipRenderUtils.ExtendedActiveResource[] | sturct[] An array of ExtendedActiveResources present on the given token |

### getExtendedPendingResources

```solidity
function getExtendedPendingResources(address target, uint256 tokenId) external view returns (struct RMRKEquipRenderUtils.ExtendedPendingResource[])
```

Used to get the extended pending resources of the given token.

*The full `ExtendedPendingResource` looks like this:  [      ID,      equippableGroupId,      acceptRejectIndex,      overwritesResourceWithId,      baseAddress,      metadata,      [          fixedPartId0,          fixedPartId1,          fixedPartId2      ],      [          slotPartId0,          slotPartId1,          slotPartId2      ]  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the extended pending resources for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | RMRKEquipRenderUtils.ExtendedPendingResource[] | sturct[] An array of ExtendedPendingResources present on the given token |




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





