# RMRKExternalEquip

*RMRK team*

> RMRKExternalEquip

Smart contract of the RMRK External Equippable module.

*This smart contract is expected to be paired with an instance of `RMRKNestableExternalEquip`.*

## Methods

### acceptAsset

```solidity
function acceptAsset(uint256 tokenId, uint256 index, uint64 assetId) external nonpayable
```

Used to accept a pending asset of a given token.

*Accepting is done using the index of a pending asset. The array of pending assets is modified every  time one is accepted and the last pending asset is moved into its place.Can only be called by the owner of the token or a user that has been approved to manage the tokens&#39;s  assets.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which we are accepting the asset |
| index | uint256 | Index of the asset to accept in token&#39;s pending arry |
| assetId | uint64 | undefined |

### approveForAssets

```solidity
function approveForAssets(address to, uint256 tokenId) external nonpayable
```

Used to grant approvals for specific tokens to a specified address.

*This can only be called by the owner of the token or by an account that has been granted permission to  manage all of the owner&#39;s assets.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | Address of the account to receive the approval to the specified token |
| tokenId | uint256 | ID of the token for which we are granting the permission |

### canTokenBeEquippedWithAssetIntoSlot

```solidity
function canTokenBeEquippedWithAssetIntoSlot(address parent, uint256 tokenId, uint64 assetId, uint64 slotId) external view returns (bool)
```

Used to verify whether a token can be equipped into a given parent&#39;s slot.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parent | address | Address of the parent token&#39;s smart contract |
| tokenId | uint256 | ID of the token we want to equip |
| assetId | uint64 | ID of the asset associated with the token we want to equip |
| slotId | uint64 | ID of the slot that we want to equip the token into |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool The boolean indicating whether the token with the given asset can be equipped into the desired  slot |

### equip

```solidity
function equip(IRMRKEquippable.IntakeEquip data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| data | IRMRKEquippable.IntakeEquip | undefined |

### getActiveAssetPriorities

```solidity
function getActiveAssetPriorities(uint256 tokenId) external view returns (uint16[])
```

Used to retrieve active asset priorities of a given token.

*Asset priorities are a non-sequential array of uint16 values with an array size equal to active asset  priorites.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to query |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint16[] | uint16[] Array of active asset priorities |

### getActiveAssets

```solidity
function getActiveAssets(uint256 tokenId) external view returns (uint64[])
```

Used to retrieve the active asset IDs of a given token.

*Assets metadata is stored by reference mapping `_asset[assetId]`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to query |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | uint64[] Array of active asset IDs |

### getApprovedForAssets

```solidity
function getApprovedForAssets(uint256 tokenId) external view returns (address)
```

Used to get the address of the user that is approved to manage the specified token from the current  owner.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token we are checking |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address Address of the account that is approved to manage the token |

### getAssetMetadata

```solidity
function getAssetMetadata(uint256 tokenId, uint64 assetId) external view returns (string)
```

Used to fetch the asset metadata of the specified token&#39;s for given asset.

*Assets are stored by reference mapping `_assets[assetId]`.Can be overriden to implement enumerate, fallback or other custom logic.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to query |
| assetId | uint64 | Asset Id, must be in the pending or active assets array |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string Metadata of the asset |

### getAssetReplacements

```solidity
function getAssetReplacements(uint256 tokenId, uint64 newAssetId) external view returns (uint64)
```

Used to retrieve the asset ID that will be replaced (if any) if a given assetID is accepted from  the pending assets array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to query |
| newAssetId | uint64 | ID of the pending asset which will be accepted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64 | uint64 ID of the asset which will be replaced |

### getEquipment

```solidity
function getEquipment(uint256 tokenId, address targetBaseAddress, uint64 slotPartId) external view returns (struct IRMRKEquippable.Equipment)
```

Used to get the Equipment object equipped into the specified slot of the desired token.

*The `Equipment` struct consists of the following data:  [      assetId,      childAssetId,      childId,      childEquippableAddress  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which we are retrieving the equipped object |
| targetBaseAddress | address | Address of the `Base` associated with the `Slot` part of the token |
| slotPartId | uint64 | ID of the `Slot` part that we are checking for equipped objects |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKEquippable.Equipment | struct The `Equipment` struct containing data about the equipped object |

### getExtendedAsset

```solidity
function getExtendedAsset(uint256 tokenId, uint64 assetId) external view returns (string metadataURI, uint64 equippableGroupId, address baseAddress, uint64[] fixedPartIds, uint64[] slotPartIds)
```

Used to get the extended asset struct of the asset associated with given `assetId`.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| assetId | uint64 | ID of the asset of which we are retrieving |

#### Returns

| Name | Type | Description |
|---|---|---|
| metadataURI | string | undefined |
| equippableGroupId | uint64 | undefined |
| baseAddress | address | undefined |
| fixedPartIds | uint64[] | undefined |
| slotPartIds | uint64[] | undefined |

### getNestableAddress

```solidity
function getNestableAddress() external view returns (address)
```

Used to retrieve the address of the `Nestable` smart contract




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address Address of the `Nestable` smart contract |

### getPendingAssets

```solidity
function getPendingAssets(uint256 tokenId) external view returns (uint64[])
```

Returns pending asset IDs for a given token

*Pending assets metadata is stored by reference mapping _pendingAsset[assetId]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | the token ID to query |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | uint64[] pending asset IDs |

### isApprovedForAllForAssets

```solidity
function isApprovedForAllForAssets(address owner, address operator) external view returns (bool)
```

Used to check whether the address has been granted the operator role by a given address or not.

*See {setApprovalForAllForAssets}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | Address of the account that we are checking for whether it has granted the operator role |
| operator | address | Address of the account that we are checking whether it has the operator role or not |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool The boolean value indicating wehter the account we are checking has been granted the operator role |

### isChildEquipped

```solidity
function isChildEquipped(uint256 tokenId, address childAddress, uint256 childId) external view returns (bool)
```

Used to check whether the token has a given child equipped.

*This is used to prevent from transferring a child that is equipped.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the parent token for which we are querying for |
| childAddress | address | Address of the child token&#39;s smart contract |
| childId | uint256 | ID of the child token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool The boolean value indicating whether the child token is equipped into the given token or not |

### rejectAllAssets

```solidity
function rejectAllAssets(uint256 tokenId, uint256 maxRejections) external nonpayable
```

Used to reject all pending assets of a given token.

*When rejecting all assets, the pending array is indiscriminately cleared.Can only be called by the owner of the token or a user that has been approved to manage the tokens&#39;s  assets.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which we are clearing the pending array. |
| maxRejections | uint256 | Maximum number of expected assets to reject, used to prevent from  rejecting assets which arrive just before this operation. |

### rejectAsset

```solidity
function rejectAsset(uint256 tokenId, uint256 index, uint64 assetId) external nonpayable
```

Used to reject a pending asset of a given token.

*Rejecting is done using the index of a pending asset. The array of pending assets is modified every  time one is rejected and the last pending asset is moved into its place.Can only be called by the owner of the token or a user that has been approved to manage the tokens&#39;s  assets.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which we are rejecting the asset |
| index | uint256 | Index of the asset to reject in token&#39;s pending array |
| assetId | uint64 | undefined |

### setApprovalForAllForAssets

```solidity
function setApprovalForAllForAssets(address operator, bool approved) external nonpayable
```

Used to add or remove an operator of assets for the caller.

*Operators can call {acceptAsset}, {rejectAsset}, {rejectAllAssets} or {setPriority} for any token  owned by the caller.Requirements:  - The `operator` cannot be the caller.Emits an {ApprovalForAllForAssets} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | Address of the account to which the operator role is granted or revoked from |
| approved | bool | The boolean value indicating whether the operator role is being granted (`true`) or revoked  (`false`) |

### setPriority

```solidity
function setPriority(uint256 tokenId, uint16[] priorities) external nonpayable
```

Used to set priorities of active assets of a token.

*Priorities define which asset we would rather have shown when displaying the token.The pending assets array length has to match the number of active assets, otherwise setting priorities  will be reverted.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token we are managing the priorities of |
| priorities | uint16[] | An array of priorities of active assets. The succesion of items in the priorities array  matches that of the succesion of items in the active array |

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

### unequip

```solidity
function unequip(uint256 tokenId, uint64 assetId, uint64 slotPartId) external nonpayable
```

Used to unequip child from parent token.

*This can only be called by the owner of the token or by an account that has been granted permission to  manage the given token by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the parent from which the child is being unequipped |
| assetId | uint64 | ID of the parent&#39;s asset that contains the `Slot` into which the child is equipped |
| slotPartId | uint64 | ID of the `Slot` from which to unequip the child |



## Events

### ApprovalForAllForAssets

```solidity
event ApprovalForAllForAssets(address indexed owner, address indexed operator, bool approved)
```

Used to notify listeners that owner has granted approval to the user to manage assets of all of their  tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| operator `indexed` | address | undefined |
| approved  | bool | undefined |

### ApprovalForAssets

```solidity
event ApprovalForAssets(address indexed owner, address indexed approved, uint256 indexed tokenId)
```

Used to notify listeners that owner has granted an approval to the user to manage the assets of a  given token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| approved `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

### AssetAccepted

```solidity
event AssetAccepted(uint256 indexed tokenId, uint64 indexed assetId, uint64 indexed replacesId)
```

Used to notify listeners that a asset object at `assetId` is accepted by the token and migrated  from token&#39;s pending assets array to active assets array of the token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| assetId `indexed` | uint64 | undefined |
| replacesId `indexed` | uint64 | undefined |

### AssetAddedToToken

```solidity
event AssetAddedToToken(uint256 indexed tokenId, uint64 indexed assetId, uint64 indexed replacesId)
```

Used to notify listeners that a asset object at `assetId` is added to token&#39;s pending asset  array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| assetId `indexed` | uint64 | undefined |
| replacesId `indexed` | uint64 | undefined |

### AssetPrioritySet

```solidity
event AssetPrioritySet(uint256 indexed tokenId)
```

Used to notify listeners that token&#39;s prioritiy array is reordered.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |

### AssetRejected

```solidity
event AssetRejected(uint256 indexed tokenId, uint64 indexed assetId)
```

Used to notify listeners that a asset object at `assetId` is rejected from token and is dropped  from the pending assets array of the token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| assetId `indexed` | uint64 | undefined |

### AssetSet

```solidity
event AssetSet(uint64 indexed assetId)
```

Used to notify listeners that a asset object is initialized at `assetId`.



#### Parameters

| Name | Type | Description |
|---|---|---|
| assetId `indexed` | uint64 | undefined |

### ChildAssetEquipped

```solidity
event ChildAssetEquipped(uint256 indexed tokenId, uint64 indexed assetId, uint64 indexed slotPartId, uint256 childId, address childAddress, uint64 childAssetId)
```

Used to notify listeners that a child&#39;s asset has been equipped into one of its parent assets.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| assetId `indexed` | uint64 | undefined |
| slotPartId `indexed` | uint64 | undefined |
| childId  | uint256 | undefined |
| childAddress  | address | undefined |
| childAssetId  | uint64 | undefined |

### ChildAssetUnequipped

```solidity
event ChildAssetUnequipped(uint256 indexed tokenId, uint64 indexed assetId, uint64 indexed slotPartId, uint256 childId, address childAddress, uint64 childAssetId)
```

Used to notify listeners that a child&#39;s asset has been unequipped from one of its parent assets.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| assetId `indexed` | uint64 | undefined |
| slotPartId `indexed` | uint64 | undefined |
| childId  | uint256 | undefined |
| childAddress  | address | undefined |
| childAssetId  | uint64 | undefined |

### NestableAddressSet

```solidity
event NestableAddressSet(address old, address new_)
```

Used to notify listeners of a new `Nestable` associated  smart contract address being set.



#### Parameters

| Name | Type | Description |
|---|---|---|
| old  | address | undefined |
| new_  | address | undefined |

### ValidParentEquippableGroupIdSet

```solidity
event ValidParentEquippableGroupIdSet(uint64 indexed equippableGroupId, uint64 indexed slotPartId, address parentAddress)
```

Used to notify listeners that the assets belonging to a `equippableGroupId` have been marked as  equippable into a given slot and parent



#### Parameters

| Name | Type | Description |
|---|---|---|
| equippableGroupId `indexed` | uint64 | undefined |
| slotPartId `indexed` | uint64 | undefined |
| parentAddress  | address | undefined |



## Errors

### ERC721InvalidTokenId

```solidity
error ERC721InvalidTokenId()
```

Attempting to use an invalid token ID




### ERC721NotApprovedOrOwner

```solidity
error ERC721NotApprovedOrOwner()
```

Attempting to manage a token without being its owner or approved by the owner




### RMRKApprovalForAssetsToCurrentOwner

```solidity
error RMRKApprovalForAssetsToCurrentOwner()
```

Attempting to grant approval of assets to their current owner




### RMRKApproveForAssetsCallerIsNotOwnerNorApprovedForAll

```solidity
error RMRKApproveForAssetsCallerIsNotOwnerNorApprovedForAll()
```

Attempting to grant approval of assets without being the caller or approved for all




### RMRKBadPriorityListLength

```solidity
error RMRKBadPriorityListLength()
```

Attempting to set the priorities with an array of length that doesn&#39;t match the length of active assets array




### RMRKEquippableEquipNotAllowedByBase

```solidity
error RMRKEquippableEquipNotAllowedByBase()
```

Attempting to equip a `Part` with a child not approved by the base




### RMRKIndexOutOfRange

```solidity
error RMRKIndexOutOfRange()
```

Attempting to interact with a asset, using index greater than number of assets




### RMRKNotApprovedForAssetsOrOwner

```solidity
error RMRKNotApprovedForAssetsOrOwner()
```

Attempting to manage a asset without owning it or having been granted permission by the owner to do so




### RMRKNotEquipped

```solidity
error RMRKNotEquipped()
```

Attempting to unequip an item that isn&#39;t equipped




### RMRKSlotAlreadyUsed

```solidity
error RMRKSlotAlreadyUsed()
```

Attempting to equip an item into a slot that already has an item equipped




### RMRKTargetAssetCannotReceiveSlot

```solidity
error RMRKTargetAssetCannotReceiveSlot()
```

Attempting to equip an item into a `Slot` that the target asset does not implement




### RMRKTokenCannotBeEquippedWithAssetIntoSlot

```solidity
error RMRKTokenCannotBeEquippedWithAssetIntoSlot()
```

Attempting to equip a child into a `Slot` and parent that the child&#39;s collection doesn&#39;t support




### RMRKTokenDoesNotHaveAsset

```solidity
error RMRKTokenDoesNotHaveAsset()
```

Attempting to compose a NFT of a token without active assets




### RMRKUnexpectedAssetId

```solidity
error RMRKUnexpectedAssetId()
```

Attempting to accept or reject a asset which does not match the one at the specified index




### RMRKUnexpectedNumberOfAssets

```solidity
error RMRKUnexpectedNumberOfAssets()
```

Attempting to reject all pending assets but more assets than expected are pending




### RentrantCall

```solidity
error RentrantCall()
```







