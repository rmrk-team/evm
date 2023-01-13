# Solidity API

## RMRKExternalEquip

Smart contract of the RMRK External Equippable module.

_This smart contract is expected to be paired with an instance of `RMRKNestableExternalEquip`._

### _onlyApprovedOrOwner

```solidity
function _onlyApprovedOrOwner(uint256 tokenId) internal view
```

Used to verify that the caller is either approved to manage the given token or its owner.

_If the caller is not the owner of the token or approved to manage it, the execution will be reverted._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that we are checking |

### onlyApprovedOrOwner

```solidity
modifier onlyApprovedOrOwner(uint256 tokenId)
```

Used to verify that the caller is either approved to manage the given token or its owner.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that we are checking |

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

### onlyApprovedForAssetsOrOwner

```solidity
modifier onlyApprovedForAssetsOrOwner(uint256 tokenId)
```

Used to verify that the caller is ether the owner of the token or approved to manage it.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token we are checking |

### constructor

```solidity
constructor(address nestableAddress) public
```

Used to initialize the smart contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| nestableAddress | address | Address of the Nestable module of external equip composite |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

### _setNestableAddress

```solidity
function _setNestableAddress(address nestableAddress) internal
```

Used to set the address of the `Nestable` smart contract

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| nestableAddress | address | Address of the `Nestable` smart contract |

### getNestableAddress

```solidity
function getNestableAddress() public view returns (address)
```

Returns the Equippable contract's corresponding nestable address.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address Address of the Nestable module of the external equip composite |

### acceptAsset

```solidity
function acceptAsset(uint256 tokenId, uint256 index, uint64 assetId) public virtual
```

Used to accept a pending asset of a given token.

_Accepting is done using the index of a pending asset. The array of pending assets is modified every
 time one is accepted and the last pending asset is moved into its place.
Can only be called by the owner of the token or a user that has been approved to manage the tokens's
 assets._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which we are accepting the asset |
| index | uint256 | Index of the asset to accept in token's pending array |
| assetId | uint64 | ID of the asset expected to be located at the specified index |

### rejectAsset

```solidity
function rejectAsset(uint256 tokenId, uint256 index, uint64 assetId) public virtual
```

Used to reject a pending asset of a given token.

_Rejecting is done using the index of a pending asset. The array of pending assets is modified every
 time one is rejected and the last pending asset is moved into its place.
Can only be called by the owner of the token or a user that has been approved to manage the tokens's
 assets._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which we are rejecting the asset |
| index | uint256 | Index of the asset to reject in token's pending array |
| assetId | uint64 | ID of the asset expected to be located at the specified index |

### rejectAllAssets

```solidity
function rejectAllAssets(uint256 tokenId, uint256 maxRejections) public virtual
```

Used to reject all pending assets of a given token.

_When rejecting all assets, the pending array is indiscriminately cleared.
Can only be called by the owner of the token or a user that has been approved to manage the tokens's
 assets.
If the number of pending assets is greater than the value of `maxRejections`, the exectuion will be
 reverted._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which we are clearing the pending array. |
| maxRejections | uint256 | Maximum number of expected assets to reject, used to prevent from  rejecting assets which arrive just before this operation. |

### setPriority

```solidity
function setPriority(uint256 tokenId, uint16[] priorities) public virtual
```

Used to set priorities of active assets of a token.

_Priorities define which asset we would rather have shown when displaying the token.
The pending assets array length has to match the number of active assets, otherwise setting priorities
 will be reverted._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token we are managing the priorities of |
| priorities | uint16[] | An array of priorities of active assets. The succesion of items in the priorities array  matches that of the succesion of items in the active array |

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
function isChildEquipped(uint256 tokenId, address childAddress, uint256 childId) public view returns (bool)
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
function _setValidParentForEquippableGroup(uint64 equippableGroupId, address parentAddress, uint64 slotPartId) internal
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
function canTokenBeEquippedWithAssetIntoSlot(address parent, uint256 tokenId, uint64 assetId, uint64 slotId) public view returns (bool)
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

### _addAssetEntry

```solidity
function _addAssetEntry(uint64 id, uint64 equippableGroupId, address catalogAddress, string metadataURI, uint64[] partIds) internal
```

Used to add a asset entry.

_This internal function warrants custom access control to be implemented when used._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint64 | ID to be assigned to asset |
| equippableGroupId | uint64 | ID of the equippable group this asset belongs to |
| catalogAddress | address | Address of the Catalog this asset should be associated with |
| metadataURI | string | Metadata URI of the asset |
| partIds | uint64[] | An array of IDs of fixed and slot parts to be included in the asset |

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
function getEquipment(uint256 tokenId, address targetCatalogAddress, uint64 slotPartId) public view returns (struct IRMRKEquippable.Equipment)
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

### _requireMinted

```solidity
function _requireMinted(uint256 tokenId) internal view virtual
```

Used to  verify that the given token has been minted.

_As this function utilizes the `_exists()` function, the token is marked as non-existent when it is owned by
 the `0x0` address.Reverts if the `tokenId` has not been minted yet.
If the token with the specified ID doesn't "exist", the execution of the function is reverted._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token we are checking |

### _exists

```solidity
function _exists(uint256 tokenId) internal view virtual returns (bool)
```

Used to validate that the given token exists.

_As the check validates that the owner is not the `0x0` address, the token is marked as non-existent if it
 hasn't been minted yet, or if has already been burned._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token we are checking |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool A boolean value specifying whether the token exists |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) internal view returns (address)
```

Used to retrieve the owner of the given token.

_This returns the root owner of the token. In case where the token is nested into a parent token, the owner
 is iteratively searched for, until non-smart contract owner is found._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token we are checking |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address Address of the root owner of the token |

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

