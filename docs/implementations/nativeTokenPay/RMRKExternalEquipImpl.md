# RMRKExternalEquipImpl

*RMRK team*

> RMRKExternalEquipImpl

Implementation of RMRK external equip module.



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
| index | uint256 | Index of the asset to accept in token&#39;s pending array |
| assetId | uint64 | ID of the asset expected to be located at the specified index |

### addAssetEntry

```solidity
function addAssetEntry(string metadataURI) external nonpayable returns (uint256)
```

Used to add a asset entry.

*The ID of the asset is automatically assigned to be the next available asset ID.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| metadataURI | string | Metadata URI of the asset |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | ID of the newly added asset |

### addAssetToToken

```solidity
function addAssetToToken(uint256 tokenId, uint64 assetId, uint64 replacesAssetWithId) external nonpayable
```

Used to add an asset to a token.

*If the given asset is already added to the token, the execution will be reverted.If the asset ID is invalid, the execution will be reverted.If the token already has the maximum amount of pending assets (128), the execution will be  reverted.If the asset is being added by the current root owner of the token, the asset will be automatically  accepted.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to add the asset to |
| assetId | uint64 | ID of the asset to add to the token |
| replacesAssetWithId | uint64 | ID of the asset to replace from the token&#39;s list of active assets |

### addEquippableAssetEntry

```solidity
function addEquippableAssetEntry(uint64 equippableGroupId, address catalogAddress, string metadataURI, uint64[] partIds) external nonpayable returns (uint256)
```

Used to add an equippable asset entry.

*The ID of the asset is automatically assigned to be the next available asset ID.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| equippableGroupId | uint64 | ID of the equippable group |
| catalogAddress | address | Address of the `Catalog` smart contract this asset belongs to |
| metadataURI | string | Metadata URI of the asset |
| partIds | uint64[] | An array of IDs of fixed and slot parts to be included in the asset |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The total number of assets after this asset has been added |

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
| _0 | bool | A boolean indicating whether the token with the given asset can be equipped into the desired slot |

### equip

```solidity
function equip(IERC6220.IntakeEquip data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| data | IERC6220.IntakeEquip | undefined |

### getActiveAssetPriorities

```solidity
function getActiveAssetPriorities(uint256 tokenId) external view returns (uint64[])
```

Used to retrieve the priorities of the active resoources of a given token.

*Asset priorities are a non-sequential array of uint64 values with an array size equal to active asset  priorites.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to retrieve the priorities of the active assets |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | An array of priorities of the active assets of the given token |

### getActiveAssets

```solidity
function getActiveAssets(uint256 tokenId) external view returns (uint64[])
```

Used to retrieve IDs of the active assets of given token.

*Asset data is stored by reference, in order to access the data corresponding to the ID, call  `getAssetMetadata(tokenId, assetId)`.You can safely get 10k*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to retrieve the IDs of the active assets |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | An array of active asset IDs of the given token |

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
| _0 | address | Address of the account that is approved to manage the token |

### getAssetAndEquippableData

```solidity
function getAssetAndEquippableData(uint256 tokenId, uint64 assetId) external view returns (string, uint64, address, uint64[])
```

Used to get the asset and equippable data associated with given `assetId`.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to retrieve the asset |
| assetId | uint64 | ID of the asset of which we are retrieving |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | The metadata URI of the asset |
| _1 | uint64 | ID of the equippable group this asset belongs to |
| _2 | address | The address of the catalog the part belongs to |
| _3 | uint64[] | An array of IDs of parts included in the asset |

### getAssetMetadata

```solidity
function getAssetMetadata(uint256 tokenId, uint64 assetId) external view returns (string)
```

Used to fetch the asset metadata of the specified token&#39;s active asset with the given index.

*Assets are stored by reference mapping `_assets[assetId]`.Can be overriden to implement enumerate, fallback or other custom logic.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token from which to retrieve the asset metadata |
| assetId | uint64 | Asset Id, must be in the active assets array |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | The metadata of the asset belonging to the specified index in the token&#39;s active assets  array |

### getAssetReplacements

```solidity
function getAssetReplacements(uint256 tokenId, uint64 newAssetId) external view returns (uint64)
```

Used to retrieve the asset that will be replaced if a given asset from the token&#39;s pending array  is accepted.

*Asset data is stored by reference, in order to access the data corresponding to the ID, call  `getAssetMetadata(tokenId, assetId)`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to check |
| newAssetId | uint64 | ID of the pending asset which will be accepted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64 | ID of the asset which will be replaced |

### getEquipment

```solidity
function getEquipment(uint256 tokenId, address targetCatalogAddress, uint64 slotPartId) external view returns (struct IERC6220.Equipment)
```

Used to get the Equipment object equipped into the specified slot of the desired token.

*The `Equipment` struct consists of the following data:  [      assetId,      childAssetId,      childId,      childEquippableAddress  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which we are retrieving the equipped object |
| targetCatalogAddress | address | Address of the `Catalog` associated with the `Slot` part of the token |
| slotPartId | uint64 | ID of the `Slot` part that we are checking for equipped objects |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IERC6220.Equipment | The `Equipment` struct containing data about the equipped object |

### getLock

```solidity
function getLock() external view returns (bool)
```

Used to retrieve the status of a lockable smart contract.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | A boolean value signifying whether the smart contract has been locked |

### getNestableAddress

```solidity
function getNestableAddress() external view returns (address)
```

Returns the Equippable contract&#39;s corresponding nestable address.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the Nestable module of the external equip composite |

### getPendingAssets

```solidity
function getPendingAssets(uint256 tokenId) external view returns (uint64[])
```

Used to retrieve IDs of the pending assets of given token.

*Asset data is stored by reference, in order to access the data corresponding to the ID, call  `getAssetMetadata(tokenId, assetId)`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to retrieve the IDs of the pending assets |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | An array of pending asset IDs of the given token |

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
| _0 | bool | A boolean value indicating wehter the account we are checking has been granted the operator role |

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

### isContributor

```solidity
function isContributor(address contributor) external view returns (bool)
```

Used to check if the address is one of the contributors.



#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor | address | Address of the contributor whose status we are checking |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | Boolean value indicating whether the address is a contributor or not |

### manageContributor

```solidity
function manageContributor(address contributor, bool grantRole) external nonpayable
```

Adds or removes a contributor to the smart contract.

*Can only be called by the owner.Emits ***ContributorUpdate*** event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor | address | Address of the contributor&#39;s account |
| grantRole | bool | A boolean value signifying whether the contributor role is being granted (`true`) or revoked  (`false`) |

### owner

```solidity
function owner() external view returns (address)
```

Returns the address of the current owner.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the current owner |

### rejectAllAssets

```solidity
function rejectAllAssets(uint256 tokenId, uint256 maxRejections) external nonpayable
```

Used to reject all pending assets of a given token.

*When rejecting all assets, the pending array is indiscriminately cleared.Can only be called by the owner of the token or a user that has been approved to manage the tokens&#39;s  assets.If the number of pending assets is greater than the value of `maxRejections`, the exectuion will be  reverted.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which we are clearing the pending array. |
| maxRejections | uint256 | Maximum number of expected assets to reject, used to prevent from rejecting assets which  arrive just before this operation. |

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
| assetId | uint64 | ID of the asset expected to be located at the specified index |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```

Leaves the contract without owner. Functions using the `onlyOwner` modifier will be disabled.

*Can only be called by the current owner.Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is  only available to the owner.*


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

### setLock

```solidity
function setLock() external nonpayable
```

Locks the operation.

*Once locked, functions using `notLocked` modifier cannot be executed.*


### setNestableAddress

```solidity
function setNestableAddress(address nestableAddress) external nonpayable
```

Used to set the address of the `Nestable` smart contract.



#### Parameters

| Name | Type | Description |
|---|---|---|
| nestableAddress | address | Address of the `Nestable` smart contract |

### setPriority

```solidity
function setPriority(uint256 tokenId, uint64[] priorities) external nonpayable
```

Used to set priorities of active assets of a token.

*Priorities define which asset we would rather have shown when displaying the token.The pending assets array length has to match the number of active assets, otherwise setting priorities  will be reverted.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token we are managing the priorities of |
| priorities | uint64[] | An array of priorities of active assets. The succesion of items in the priorities array  matches that of the succesion of items in the active array |

### setValidParentForEquippableGroup

```solidity
function setValidParentForEquippableGroup(uint64 equippableGroupId, address parentAddress, uint64 partId) external nonpayable
```

Used to declare that the assets belonging to a given `equippableGroupId` are equippable into the `Slot`  associated with the `partId` of the collection at the specified `parentAddress`



#### Parameters

| Name | Type | Description |
|---|---|---|
| equippableGroupId | uint64 | ID of the equippable group |
| parentAddress | address | Address of the parent into which the equippable group can be equipped into |
| partId | uint64 | ID of the `Slot` that the items belonging to the equippable group can be equipped into |

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

### totalAssets

```solidity
function totalAssets() external view returns (uint256)
```

Used to retrieve the total number of assets.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The total number of assets |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```

Transfers ownership of the contract to a new owner.

*Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | Address of the new owner&#39;s account |

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
| owner `indexed` | address | Address of the account that has granted the approval for all assets on all of their tokens |
| operator `indexed` | address | Address of the account that has been granted the approval to manage the token&#39;s assets on all of  the tokens |
| approved  | bool | Boolean value signifying whether the permission has been granted (`true`) or revoked (`false`) |

### ApprovalForAssets

```solidity
event ApprovalForAssets(address indexed owner, address indexed approved, uint256 indexed tokenId)
```

Used to notify listeners that owner has granted an approval to the user to manage the assets of a  given token.

*Approvals must be cleared on transfer*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | Address of the account that has granted the approval for all token&#39;s assets |
| approved `indexed` | address | Address of the account that has been granted approval to manage the token&#39;s assets |
| tokenId `indexed` | uint256 | ID of the token on which the approval was granted |

### AssetAccepted

```solidity
event AssetAccepted(uint256 indexed tokenId, uint64 indexed assetId, uint64 indexed replacesId)
```

Used to notify listeners that an asset object at `assetId` is accepted by the token and migrated  from token&#39;s pending assets array to active assets array of the token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that had a new asset accepted |
| assetId `indexed` | uint64 | ID of the asset that was accepted |
| replacesId `indexed` | uint64 | ID of the asset that was replaced |

### AssetAddedToTokens

```solidity
event AssetAddedToTokens(uint256[] tokenIds, uint64 indexed assetId, uint64 indexed replacesId)
```

Used to notify listeners that an asset object at `assetId` is added to token&#39;s pending asset  array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenIds  | uint256[] | An array of token IDs that received a new pending asset |
| assetId `indexed` | uint64 | ID of the asset that has been added to the token&#39;s pending assets array |
| replacesId `indexed` | uint64 | ID of the asset that would be replaced |

### AssetPrioritySet

```solidity
event AssetPrioritySet(uint256 indexed tokenId)
```

Used to notify listeners that token&#39;s prioritiy array is reordered.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that had the asset priority array updated |

### AssetRejected

```solidity
event AssetRejected(uint256 indexed tokenId, uint64 indexed assetId)
```

Used to notify listeners that an asset object at `assetId` is rejected from token and is dropped  from the pending assets array of the token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that had an asset rejected |
| assetId `indexed` | uint64 | ID of the asset that was rejected |

### AssetSet

```solidity
event AssetSet(uint64 indexed assetId)
```

Used to notify listeners that an asset object is initialized at `assetId`.



#### Parameters

| Name | Type | Description |
|---|---|---|
| assetId `indexed` | uint64 | ID of the asset that was initialized |

### ChildAssetEquipped

```solidity
event ChildAssetEquipped(uint256 indexed tokenId, uint64 indexed assetId, uint64 indexed slotPartId, uint256 childId, address childAddress, uint64 childAssetId)
```

Used to notify listeners that a child&#39;s asset has been equipped into one of its parent assets.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that had an asset equipped |
| assetId `indexed` | uint64 | ID of the asset associated with the token we are equipping into |
| slotPartId `indexed` | uint64 | ID of the slot we are using to equip |
| childId  | uint256 | ID of the child token we are equipping into the slot |
| childAddress  | address | Address of the child token&#39;s collection |
| childAssetId  | uint64 | ID of the asset associated with the token we are equipping |

### ChildAssetUnequipped

```solidity
event ChildAssetUnequipped(uint256 indexed tokenId, uint64 indexed assetId, uint64 indexed slotPartId, uint256 childId, address childAddress, uint64 childAssetId)
```

Used to notify listeners that a child&#39;s asset has been unequipped from one of its parent assets.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that had an asset unequipped |
| assetId `indexed` | uint64 | ID of the asset associated with the token we are unequipping out of |
| slotPartId `indexed` | uint64 | ID of the slot we are unequipping from |
| childId  | uint256 | ID of the token being unequipped |
| childAddress  | address | Address of the collection that a token that is being unequipped belongs to |
| childAssetId  | uint64 | ID of the asset associated with the token we are unequipping |

### ContributorUpdate

```solidity
event ContributorUpdate(address indexed contributor, bool isContributor)
```

Event that signifies that an address was granted contributor role or that the permission has been  revoked.

*This can only be triggered by a current owner, so there is no need to include that information in the event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor `indexed` | address | Address of the account that had contributor role status updated |
| isContributor  | bool | A boolean value signifying whether the role has been granted (`true`) or revoked (`false`) |

### NestableAddressSet

```solidity
event NestableAddressSet(address old, address new_)
```

Used to notify listeners of a new `Nestable` associated  smart contract address being set.

*When initially setting the `Nestable` smart contract address, the `old` value should equal `0x0` address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| old  | address | Previous `Nestable` smart contract address |
| new_  | address | New `Nestable` smart contract address |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```

Used to anounce the transfer of ownership.



#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | Address of the account that transferred their ownership role |
| newOwner `indexed` | address | Address of the account receiving the ownership role |

### ValidParentEquippableGroupIdSet

```solidity
event ValidParentEquippableGroupIdSet(uint64 indexed equippableGroupId, uint64 indexed slotPartId, address parentAddress)
```

Used to notify listeners that the assets belonging to a `equippableGroupId` have been marked as  equippable into a given slot and parent



#### Parameters

| Name | Type | Description |
|---|---|---|
| equippableGroupId `indexed` | uint64 | ID of the equippable group being marked as equippable into the slot associated with  `slotPartId` of the `parentAddress` collection |
| slotPartId `indexed` | uint64 | ID of the slot part of the catalog into which the parts belonging to the equippable group  associated with `equippableGroupId` can be equipped |
| parentAddress  | address | Address of the collection into which the parts belonging to `equippableGroupId` can be  equipped |



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




### RMRKAssetAlreadyExists

```solidity
error RMRKAssetAlreadyExists()
```

Attempting to add an asset using an ID that has already been used




### RMRKBadPriorityListLength

```solidity
error RMRKBadPriorityListLength()
```

Attempting to set the priorities with an array of length that doesn&#39;t match the length of active assets array




### RMRKCatalogRequiredForParts

```solidity
error RMRKCatalogRequiredForParts()
```

Attempting to add an asset entry with `Part`s, without setting the `Catalog` address




### RMRKEquippableEquipNotAllowedByCatalog

```solidity
error RMRKEquippableEquipNotAllowedByCatalog()
```

Attempting to equip a `Part` with a child not approved by the Catalog




### RMRKIdZeroForbidden

```solidity
error RMRKIdZeroForbidden()
```

Attempting to use ID 0, which is not supported

*The ID 0 in RMRK suite is reserved for empty values. Guarding against its use ensures the expected operation*


### RMRKIndexOutOfRange

```solidity
error RMRKIndexOutOfRange()
```

Attempting to interact with an asset, using index greater than number of assets




### RMRKMaxPendingAssetsReached

```solidity
error RMRKMaxPendingAssetsReached()
```

Attempting to add a pending asset after the number of pending assets has reached the limit (default limit is  128)




### RMRKNewContributorIsZeroAddress

```solidity
error RMRKNewContributorIsZeroAddress()
```

Attempting to assign a 0x0 address as a contributor




### RMRKNewOwnerIsZeroAddress

```solidity
error RMRKNewOwnerIsZeroAddress()
```

Attempting to transfer the ownership to the 0x0 address




### RMRKNoAssetMatchingId

```solidity
error RMRKNoAssetMatchingId()
```

Attempting to interact with an asset that can not be found




### RMRKNotApprovedForAssetsOrOwner

```solidity
error RMRKNotApprovedForAssetsOrOwner()
```

Attempting to manage an asset without owning it or having been granted permission by the owner to do so




### RMRKNotEquipped

```solidity
error RMRKNotEquipped()
```

Attempting to unequip an item that isn&#39;t equipped




### RMRKNotOwner

```solidity
error RMRKNotOwner()
```

Attempting to interact with a management function without being the smart contract&#39;s owner




### RMRKNotOwnerOrContributor

```solidity
error RMRKNotOwnerOrContributor()
```

Attempting to interact with a function without being the owner or contributor of the collection




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

Attempting to accept or reject an asset which does not match the one at the specified index




### RMRKUnexpectedNumberOfAssets

```solidity
error RMRKUnexpectedNumberOfAssets()
```

Attempting to reject all pending assets but more assets than expected are pending




### RentrantCall

```solidity
error RentrantCall()
```







