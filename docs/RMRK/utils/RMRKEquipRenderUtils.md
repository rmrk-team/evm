# Solidity API

## RMRKEquipRenderUtils

Smart contract of the RMRK Equip render utils module.

_Extra utility functions for composing RMRK extended assets._

### ExtendedActiveAsset

```solidity
struct ExtendedActiveAsset {
  uint64 id;
  uint64 equippableGroupId;
  uint16 priority;
  address catalogAddress;
  string metadata;
  uint64[] partIds;
}
```

### ExtendedPendingAsset

```solidity
struct ExtendedPendingAsset {
  uint64 id;
  uint64 equippableGroupId;
  uint128 acceptRejectIndex;
  uint64 replacesAssetWithId;
  address catalogAddress;
  string metadata;
  uint64[] partIds;
}
```

### EquippedSlotPart

```solidity
struct EquippedSlotPart {
  uint64 partId;
  uint64 childAssetId;
  uint8 z;
  address childAddress;
  uint256 childId;
  string childAssetMetadata;
  string partMetadata;
}
```

### FixedPart

```solidity
struct FixedPart {
  uint64 partId;
  uint8 z;
  string metadataURI;
}
```

### getExtendedActiveAssets

```solidity
function getExtendedActiveAssets(address target, uint256 tokenId) public view virtual returns (struct RMRKEquipRenderUtils.ExtendedActiveAsset[])
```

Used to get extended active assets of the given token.

_The full `ExtendedActiveAsset` looks like this:
 [
     ID,
     equippableGroupId,
     priority,
     catalogAddress,
     metadata,
     [
         fixedPartId0,
         fixedPartId1,
         fixedPartId2,
         slotPartId0,
         slotPartId1,
         slotPartId2
     ]
 ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the extended active assets for |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct RMRKEquipRenderUtils.ExtendedActiveAsset[] | sturct[] An array of ExtendedActiveAssets present on the given token |

### getExtendedPendingAssets

```solidity
function getExtendedPendingAssets(address target, uint256 tokenId) public view virtual returns (struct RMRKEquipRenderUtils.ExtendedPendingAsset[])
```

Used to get the extended pending assets of the given token.

_The full `ExtendedPendingAsset` looks like this:
 [
     ID,
     equippableGroupId,
     acceptRejectIndex,
     replacesAssetWithId,
     catalogAddress,
     metadata,
     [
         fixedPartId0,
         fixedPartId1,
         fixedPartId2,
         slotPartId0,
         slotPartId1,
         slotPartId2
     ]
 ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the extended pending assets for |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct RMRKEquipRenderUtils.ExtendedPendingAsset[] | sturct[] An array of ExtendedPendingAssets present on the given token |

### getEquipped

```solidity
function getEquipped(address target, uint64 tokenId, uint64 assetId) public view returns (uint64[] slotPartIds, struct IRMRKEquippable.Equipment[] childrenEquipped)
```

Used to retrieve the equipped parts of the given token.

_NOTE: Some of the equipped children might be empty.
The full `Equipment` struct looks like this:
 [
     assetId,
     childAssetId,
     childId,
     childEquippableAddress
 ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | Address of the smart contract of the given token |
| tokenId | uint64 | ID of the token to retrieve the equipped items in the asset for |
| assetId | uint64 | ID of the asset being queried for equipped parts |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| slotPartIds | uint64[] | An array of the IDs of the slot parts present in the given asset |
| childrenEquipped | struct IRMRKEquippable.Equipment[] | An array of `Equipment` structs containing info about the equipped children |

### composeEquippables

```solidity
function composeEquippables(address target, uint256 tokenId, uint64 assetId) public view returns (string metadataURI, uint64 equippableGroupId, address catalogAddress, struct RMRKEquipRenderUtils.FixedPart[] fixedParts, struct RMRKEquipRenderUtils.EquippedSlotPart[] slotParts)
```

Used to compose the given equippables.

_The full `FixedPart` struct looks like this:
 [
     partId,
     z,
     metadataURI
 ]
The full `EquippedSlotPart` struct looks like this:
 [
     partId,
     childAssetId,
     z,
     childAddress,
     childId,
     childAssetMetadata,
     partMetadata
 ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to compose the equipped items in the asset for |
| assetId | uint64 | ID of the asset being queried for equipped parts |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| metadataURI | string | Metadata URI of the asset |
| equippableGroupId | uint64 | Equippable group ID of the asset |
| catalogAddress | address | Address of the catalog to which the asset belongs to |
| fixedParts | struct RMRKEquipRenderUtils.FixedPart[] | An array of fixed parts respresented by the `FixedPart` structs present on the asset |
| slotParts | struct RMRKEquipRenderUtils.EquippedSlotPart[] | An array of slot parts represented by the `EquippedSlotPart` structs present on the asset |

### splitSlotAndFixedParts

```solidity
function splitSlotAndFixedParts(uint64[] allPartIds, address catalogAddress) public view returns (uint64[] slotPartIds, uint64[] fixedPartIds)
```

Used to split slot and fixed parts.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| allPartIds | uint64[] |  |
| catalogAddress | address | An address of the catalog to which the given `Part`s belong to |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| slotPartIds | uint64[] | An array of IDs of the `Slot` parts included in the `allPartIds` |
| fixedPartIds | uint64[] | An array of IDs of the `Fixed` parts included in the `allPartIds` |

