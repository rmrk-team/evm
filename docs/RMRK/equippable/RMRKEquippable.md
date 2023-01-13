# Solidity API

## RMRKEquippable

Smart contract of the RMRK Equippable module.

### onlyApprovedForAssetsOrOwner

```solidity
modifier onlyApprovedForAssetsOrOwner(uint256 tokenId)
```

Used to ensure that the caller is either the owner of the given token or approved to manage the token's assets
 of the owner.

_If that is not the case, the execution of the function will be reverted._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that we are checking |

### constructor

```solidity
constructor(string name_, string symbol_) public
```

Initializes the contract by setting a `name` and a `symbol` of the token collection.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name_ | string | Name of the token collection |
| symbol_ | string | Symbol of the token collection |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

### acceptAsset

```solidity
function acceptAsset(uint256 tokenId, uint256 index, uint64 assetId) public virtual
```

Accepts a asset at from the pending array of given token.

_Migrates the asset from the token's pending asset array to the token's active asset array.
Active assets cannot be removed by anyone, but can be replaced by a new asset.
Requirements:

 - The caller must own the token or be approved to manage the token's assets
 - `tokenId` must exist.
 - `index` must be in range of the length of the pending asset array.
Emits an {AssetAccepted} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which to accept the pending asset |
| index | uint256 | Index of the asset in the pending array to accept |
| assetId | uint64 |  |

### rejectAsset

```solidity
function rejectAsset(uint256 tokenId, uint256 index, uint64 assetId) public virtual
```

Rejects a asset from the pending array of given token.

_Removes the asset from the token's pending asset array.
Requirements:

 - The caller must own the token or be approved to manage the token's assets
 - `tokenId` must exist.
 - `index` must be in range of the length of the pending asset array.
Emits a {AssetRejected} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that the asset is being rejected from |
| index | uint256 | Index of the asset in the pending array to be rejected |
| assetId | uint64 |  |

### rejectAllAssets

```solidity
function rejectAllAssets(uint256 tokenId, uint256 maxRejections) public virtual
```

Rejects all assets from the pending array of a given token.

_Effecitvely deletes the pending array.
Requirements:

 - The caller must own the token or be approved to manage the token's assets
 - `tokenId` must exist.
Emits a {AssetRejected} event with assetId = 0._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token of which to clear the pending array. |
| maxRejections | uint256 | Maximum number of expected assets to reject, used to prevent from rejecting assets which  arrive just before this operation. |

### setPriority

```solidity
function setPriority(uint256 tokenId, uint16[] priorities) public virtual
```

Sets a new priority array for a given token.

_The priority array is a non-sequential list of `uint16`s, where the lowest value is considered highest
 priority.
Value `0` of a priority is a special case equivalent to unitialized.
Requirements:

 - The caller must own the token or be approved to manage the token's assets
 - `tokenId` must exist.
 - The length of `priorities` must be equal the length of the active assets array.
Emits a {AssetPrioritySet} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to set the priorities for |
| priorities | uint16[] | An array of priority values |

### _addAssetEntry

```solidity
function _addAssetEntry(uint64 id, uint64 equippableGroupId, address catalogAddress, string metadataURI, uint64[] partIds) internal virtual
```

Used to add a asset entry.

_This internal function warrants custom access control to be implemented when used._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint64 | ID of the asset being added |
| equippableGroupId | uint64 | ID of the equippable group being marked as equippable into the slot associated with  `Parts` of the `Slot` type |
| catalogAddress | address | Address of the `Catalog` associated with the asset |
| metadataURI | string | The metadata URI of the asset |
| partIds | uint64[] | An array of IDs of fixed and slot parts to be included in the asset |

### approveForAssets

```solidity
function approveForAssets(address to, uint256 tokenId) public virtual
```

Used to grant approvals for specific tokens to a specified address.

_This can only be called by the owner of the token or by an account that has been granted permission to
 manage all of the owner's assets._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address of the account to receive the approval to the specified token |
| tokenId | uint256 | ID of the token for which we are granting the permission |

### getApprovedForAssets

```solidity
function getApprovedForAssets(uint256 tokenId) public view virtual returns (address)
```

Used to get the address of the user that is approved to manage the specified token from the current
 owner.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token we are checking |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address Address of the account that is approved to manage the token |

### _isApprovedForAssetsOrOwner

```solidity
function _isApprovedForAssetsOrOwner(address user, uint256 tokenId) internal view virtual returns (bool)
```

Internal function to check whether the queried user is either:
  1. The root owner of the token associated with `tokenId`.
  2. Is approved for all assets of the current owner via the `setApprovalForAllForAssets` function.
  3. Is granted approval for the specific tokenId for asset management via the `approveForAssets` function.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | Address of the user we are checking for permission |
| tokenId | uint256 | ID of the token to query for permission for a given `user` |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool A boolean value indicating whether the user is approved to manage the token or not |

### _approveForAssets

```solidity
function _approveForAssets(address to, uint256 tokenId) internal virtual
```

Internal function for granting approvals for a specific token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address of the account we are granting an approval to |
| tokenId | uint256 | ID of the token we are granting the approval for |

### _cleanApprovals

```solidity
function _cleanApprovals(uint256 tokenId) internal virtual
```

Used to clear the approvals on a given token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token we are clearing the approvals of |

### _transferChild

```solidity
function _transferChild(uint256 tokenId, address to, uint256 destinationId, uint256 childIndex, address childAddress, uint256 childId, bool isPending, bytes data) internal virtual
```

Used to transfer a child token from a given parent token.

_When transferring a child token, the owner of the token is set to `to`, or is not updated in the event of
 `to` being the `0x0` address.
Requirements:

 - `tokenId` must exist.
Emits {ChildTransferred} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the parent token from which the child token is being transferred |
| to | address | Address to which to transfer the token to |
| destinationId | uint256 | ID of the token to receive this child token (MUST be 0 if the destination is not a token) |
| childIndex | uint256 | Index of a token we are transferring, in the array it belongs to (can be either active array or  pending array) |
| childAddress | address | Address of the child token's collection smart contract. |
| childId | uint256 | ID of the child token in its own collection smart contract. |
| isPending | bool | A boolean value indicating whether the child token being transferred is in the pending array of  the parent token (`true`) or in the active array (`false`) |
| data | bytes | Additional data with no specified format, sent in call to `_to` |

### equip

```solidity
function equip(struct IRMRKEquippable.IntakeEquip data) public virtual
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

### _equip

```solidity
function _equip(struct IRMRKEquippable.IntakeEquip data) internal virtual
```

Private function used to equip a child into a token.

_If the `Slot` already has an item equipped, the execution will be reverted.
If the child can't be used in the given `Slot`, the execution will be reverted.
If the catalog doesn't allow this equip to happen, the execution will be reverted.
The `IntakeEquip` stuct contains the following data:
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
function unequip(uint256 tokenId, uint64 assetId, uint64 slotPartId) public virtual
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

### _unequip

```solidity
function _unequip(uint256 tokenId, uint64 assetId, uint64 slotPartId) internal virtual
```

Private function used to unequip child from parent token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the parent from which the child is being unequipped |
| assetId | uint64 | ID of the parent's asset that contains the `Slot` into which the child is equipped |
| slotPartId | uint64 | ID of the `Slot` from which to unequip the child |

### isChildEquipped

```solidity
function isChildEquipped(uint256 tokenId, address childAddress, uint256 childId) public view virtual returns (bool)
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

### _setValidParentForEquippableGroup

```solidity
function _setValidParentForEquippableGroup(uint64 equippableGroupId, address parentAddress, uint64 slotPartId) internal virtual
```

Internal function used to declare that the assets belonging to a given `equippableGroupId` are
 equippable into the `Slot` associated with the `partId` of the collection at the specified `parentAddress`

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| equippableGroupId | uint64 | ID of the equippable group |
| parentAddress | address | Address of the parent into which the equippable group can be equipped into |
| slotPartId | uint64 | ID of the `Slot` that the items belonging to the equippable group can be equipped into |

### canTokenBeEquippedWithAssetIntoSlot

```solidity
function canTokenBeEquippedWithAssetIntoSlot(address parent, uint256 tokenId, uint64 assetId, uint64 slotId) public view virtual returns (bool)
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

### getAssetAndEquippableData

```solidity
function getAssetAndEquippableData(uint256 tokenId, uint64 assetId) public view virtual returns (string, uint64, address, uint64[])
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
| [0] | string |  |
| [1] | uint64 |  |
| [2] | address |  |
| [3] | uint64[] |  |

### getEquipment

```solidity
function getEquipment(uint256 tokenId, address targetCatalogAddress, uint64 slotPartId) public view virtual returns (struct IRMRKEquippable.Equipment)
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

### _beforeEquip

```solidity
function _beforeEquip(struct IRMRKEquippable.IntakeEquip data) internal virtual
```

A hook to be called before a equipping a asset to the token.

_The `IntakeEquip` struct consist of the following data:
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
| data | struct IRMRKEquippable.IntakeEquip | The `IntakeEquip` struct containing data of the asset that is being equipped |

### _afterEquip

```solidity
function _afterEquip(struct IRMRKEquippable.IntakeEquip data) internal virtual
```

A hook to be called after equipping a asset to the token.

_The `IntakeEquip` struct consist of the following data:
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
| data | struct IRMRKEquippable.IntakeEquip | The `IntakeEquip` struct containing data of the asset that was equipped |

### _beforeUnequip

```solidity
function _beforeUnequip(uint256 tokenId, uint64 assetId, uint64 slotPartId) internal virtual
```

A hook to be called before unequipping a asset from the token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token from which the asset is being unequipped |
| assetId | uint64 | ID of the asset being unequipped |
| slotPartId | uint64 | ID of the slot from which the asset is being unequipped |

### _afterUnequip

```solidity
function _afterUnequip(uint256 tokenId, uint64 assetId, uint64 slotPartId) internal virtual
```

A hook to be called after unequipping a asset from the token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token from which the asset was unequipped |
| assetId | uint64 | ID of the asset that was unequipped |
| slotPartId | uint64 | ID of the slot from which the asset was unequipped |

