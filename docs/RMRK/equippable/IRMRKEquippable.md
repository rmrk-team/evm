# Solidity API

## IRMRKEquippable

Interface smart contract of the RMRK equippable module.

### Equipment

```solidity
struct Equipment {
  uint64 assetId;
  uint64 childAssetId;
  uint256 childId;
  address childEquippableAddress;
}
```

### IntakeEquip

```solidity
struct IntakeEquip {
  uint256 tokenId;
  uint256 childIndex;
  uint64 assetId;
  uint64 slotPartId;
  uint64 childAssetId;
}
```

### ChildAssetEquipped

```solidity
event ChildAssetEquipped(uint256 tokenId, uint64 assetId, uint64 slotPartId, uint256 childId, address childAddress, uint64 childAssetId)
```

Used to notify listeners that a child's asset has been equipped into one of its parent assets.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that had an asset equipped |
| assetId | uint64 | ID of the asset associated with the token we are equipping into |
| slotPartId | uint64 | ID of the slot we are using to equip |
| childId | uint256 | ID of the child token we are equipping into the slot |
| childAddress | address | Address of the child token's collection |
| childAssetId | uint64 | ID of the asset associated with the token we are equipping |

### ChildAssetUnequipped

```solidity
event ChildAssetUnequipped(uint256 tokenId, uint64 assetId, uint64 slotPartId, uint256 childId, address childAddress, uint64 childAssetId)
```

Used to notify listeners that a child's asset has been unequipped from one of its parent assets.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that had an asset unequipped |
| assetId | uint64 | ID of the asset associated with the token we are unequipping out of |
| slotPartId | uint64 | ID of the slot we are unequipping from |
| childId | uint256 | ID of the token being unequipped |
| childAddress | address | Address of the collection that a token that is being unequipped belongs to |
| childAssetId | uint64 | ID of the asset associated with the token we are unequipping |

### ValidParentEquippableGroupIdSet

```solidity
event ValidParentEquippableGroupIdSet(uint64 equippableGroupId, uint64 slotPartId, address parentAddress)
```

Used to notify listeners that the assets belonging to a `equippableGroupId` have been marked as
 equippable into a given slot and parent

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| equippableGroupId | uint64 | ID of the equippable group being marked as equippable into the slot associated with  `slotPartId` of the `parentAddress` collection |
| slotPartId | uint64 | ID of the slot part of the catalog into which the parts belonging to the equippable group  associated with `equippableGroupId` can be equipped |
| parentAddress | address | Address of the collection into which the parts belonging to `equippableGroupId` can be  equipped |

### equip

```solidity
function equip(struct IRMRKEquippable.IntakeEquip data) external
```

Used to equip a child into a token.

_The `IntakeEquip` stuct contains the following data:
 [
     tokenId,
     childIndex,
     assetId,
     slotPartId,
     childAssetId
 ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| data | struct IRMRKEquippable.IntakeEquip | An `IntakeEquip` struct specifying the equip data |

### unequip

```solidity
function unequip(uint256 tokenId, uint64 assetId, uint64 slotPartId) external
```

Used to unequip child from parent token.

_This can only be called by the owner of the token or by an account that has been granted permission to
 manage the given token by the current owner._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the parent from which the child is being unequipped |
| assetId | uint64 | ID of the parent's asset that contains the `Slot` into which the child is equipped |
| slotPartId | uint64 | ID of the `Slot` from which to unequip the child |

### isChildEquipped

```solidity
function isChildEquipped(uint256 tokenId, address childAddress, uint256 childId) external view returns (bool)
```

Used to check whether the token has a given child equipped.

_This is used to prevent from transferring a child that is equipped._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the parent token for which we are querying for |
| childAddress | address | Address of the child token's smart contract |
| childId | uint256 | ID of the child token |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool The boolean value indicating whether the child token is equipped into the given token or not |

### canTokenBeEquippedWithAssetIntoSlot

```solidity
function canTokenBeEquippedWithAssetIntoSlot(address parent, uint256 tokenId, uint64 assetId, uint64 slotId) external view returns (bool)
```

Used to verify whether a token can be equipped into a given parent's slot.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parent | address | Address of the parent token's smart contract |
| tokenId | uint256 | ID of the token we want to equip |
| assetId | uint64 | ID of the asset associated with the token we want to equip |
| slotId | uint64 | ID of the slot that we want to equip the token into |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool The boolean indicating whether the token with the given asset can be equipped into the desired  slot |

### getEquipment

```solidity
function getEquipment(uint256 tokenId, address targetCatalogAddress, uint64 slotPartId) external view returns (struct IRMRKEquippable.Equipment)
```

Used to get the Equipment object equipped into the specified slot of the desired token.

_The `Equipment` struct consists of the following data:
 [
     assetId,
     childAssetId,
     childId,
     childEquippableAddress
 ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which we are retrieving the equipped object |
| targetCatalogAddress | address | Address of the `Catalog` associated with the `Slot` part of the token |
| slotPartId | uint64 | ID of the `Slot` part that we are checking for equipped objects |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IRMRKEquippable.Equipment | struct The `Equipment` struct containing data about the equipped object |

### getAssetAndEquippableData

```solidity
function getAssetAndEquippableData(uint256 tokenId, uint64 assetId) external view returns (string metadataURI, uint64 equippableGroupId, address catalogAddress, uint64[] partIds)
```

Used to get the asset and equippable data associated with given `assetId`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which to retrieve the asset |
| assetId | uint64 | ID of the asset of which we are retrieving |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| metadataURI | string | The metadata URI of the asset |
| equippableGroupId | uint64 | ID of the equippable group this asset belongs to |
| catalogAddress | address | The address of the catalog the part belongs to |
| partIds | uint64[] | An array of IDs of parts included in the asset |

