# RMRKTypedExternalEquippableMock









## Methods

### acceptResource

```solidity
function acceptResource(uint256 tokenId, uint256 index) external nonpayable
```

Used to accept a resource from a tokens pending array.

*Once the resource is accepted from a pending array, the last resource from the pending array is moved to its  index. This ensures that there are no gaps in the pending array and is cheaper than shifting all of the members  of the array by updating all of their indices.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to which we are accepting a pending resource |
| index | uint256 | Index of the resource in the given token&#39;s pending array |

### addResourceEntry

```solidity
function addResourceEntry(IRMRKEquippable.ExtendedResource resource, uint64[] fixedPartIds, uint64[] slotPartIds) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| resource | IRMRKEquippable.ExtendedResource | undefined |
| fixedPartIds | uint64[] | undefined |
| slotPartIds | uint64[] | undefined |

### addResourceToToken

```solidity
function addResourceToToken(uint256 tokenId, uint64 resourceId, uint64 overwrites) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| resourceId | uint64 | undefined |
| overwrites | uint64 | undefined |

### addTypedResourceEntry

```solidity
function addTypedResourceEntry(IRMRKEquippable.ExtendedResource resource, uint64[] fixedPartIds, uint64[] slotPartIds, string type_) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| resource | IRMRKEquippable.ExtendedResource | undefined |
| fixedPartIds | uint64[] | undefined |
| slotPartIds | uint64[] | undefined |
| type_ | string | undefined |

### approveForResources

```solidity
function approveForResources(address to, uint256 tokenId) external nonpayable
```

Used to grant approvals for specific tokens to a specified address.

*This can only be called by the owner of the token or by an account that has been granted permission to  manage all of the owner&#39;s resources.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | Address of the account to receive the approval to the specified token |
| tokenId | uint256 | ID of the token for which we are granting the permission |

### canTokenBeEquippedWithResourceIntoSlot

```solidity
function canTokenBeEquippedWithResourceIntoSlot(address parent, uint256 tokenId, uint64 resourceId, uint64 slotId) external view returns (bool)
```

Used to verify whether a token can be equipped into a given parent&#39;s slot.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parent | address | Address of the parent token&#39;s smart contract |
| tokenId | uint256 | ID of the token we want to equip |
| resourceId | uint64 | ID of the resource associated with the token we want to equip |
| slotId | uint64 | ID of the slot that we want to equip the token into |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool The boolean indicating whether the token with the given resource can be equipped into the desired  slot |

### equip

```solidity
function equip(IRMRKEquippable.IntakeEquip data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| data | IRMRKEquippable.IntakeEquip | undefined |

### getActiveResourcePriorities

```solidity
function getActiveResourcePriorities(uint256 tokenId) external view returns (uint16[])
```

Used to retrieve active resource priorities of a given token.

*Resource priorities are a non-sequential array of uint16 values with an array size equal to active resource  priorites.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to query |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint16[] | uint16[] Array of active resource priorities |

### getActiveResources

```solidity
function getActiveResources(uint256 tokenId) external view returns (uint64[])
```

Used to retrieve the active resource IDs of a given token.

*Resources data is stored by reference mapping `_resource[resourceId]`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to query |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | uint64[] Array of active resource IDs |

### getAllResources

```solidity
function getAllResources() external view returns (uint64[])
```

Used to retrieve an array containing all of the resource IDs.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | uint64[] Array of all resource IDs. |

### getApprovedForResources

```solidity
function getApprovedForResources(uint256 tokenId) external view returns (address)
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

### getBaseAddressOfResource

```solidity
function getBaseAddressOfResource(uint64 resourceId) external view returns (address)
```

Used to get the address of resource&#39;s `Base`



#### Parameters

| Name | Type | Description |
|---|---|---|
| resourceId | uint64 | ID of the resource we are retrieving the `Base` address from |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address Address of the resource&#39;s `Base` |

### getEquipment

```solidity
function getEquipment(uint256 tokenId, address targetBaseAddress, uint64 slotPartId) external view returns (struct IRMRKEquippable.Equipment)
```

Used to get the Equipment object equipped into the specified slot of the desired token.

*The `Equipment` struct consists of the following data:  [      resourceId,      childResourceId,      childTokenId,      childEquippableAddress  ]*

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

### getExtendedResource

```solidity
function getExtendedResource(uint64 resourceId) external view returns (struct IRMRKEquippable.ExtendedResource)
```

Used to get the extended resource struct of the resource associated with given `resourceId`.

*The `ExtendedResource` struct contains the following data:  [      id,      equippableGroupId,      baseAddress,      metadataURI  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| resourceId | uint64 | ID of the resource of which we are retrieving the extended resource struct |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKEquippable.ExtendedResource | struct The `ExtendedResource` struct associated with the resource |

### getFixedPartIds

```solidity
function getFixedPartIds(uint64 resourceId) external view returns (uint64[])
```

Used to get IDs of the fixed parts present on a given resource.



#### Parameters

| Name | Type | Description |
|---|---|---|
| resourceId | uint64 | ID of the resource of which to get the active fiixed parts |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | uint64[] An array of active fixed parts present on resource |

### getNestingAddress

```solidity
function getNestingAddress() external view returns (address)
```

Used to retrieve the address of the `Nesting` smart contract




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address Address of the `Nesting` smart contract |

### getPendingResources

```solidity
function getPendingResources(uint256 tokenId) external view returns (uint64[])
```

Returns pending resource IDs for a given token

*Pending resources data is stored by reference mapping _pendingResource[resourceId]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | the token ID to query |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | uint64[] pending resource IDs |

### getResourceMeta

```solidity
function getResourceMeta(uint64 resourceId) external view returns (string)
```

Used to fetch the resource data of the specified resource.

*Resources are stored by reference mapping `_resources[resourceId]`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| resourceId | uint64 | ID of the resource to query |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string Metadata of the resource |

### getResourceMetaForToken

```solidity
function getResourceMetaForToken(uint256 tokenId, uint64 resourceIndex) external view returns (string)
```

Used to fetch the resource data of the specified token&#39;s active resource with the given index.

*Resources are stored by reference mapping `_resources[resourceId]`.Can be overriden to implement enumerate, fallback or other custom logic.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to query |
| resourceIndex | uint64 | Index of the resource to query in the token&#39;s active resources |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string Metadata of the resource |

### getResourceOverwrites

```solidity
function getResourceOverwrites(uint256 tokenId, uint64 resourceId) external view returns (uint64)
```

Used to retrieve the resource ID that will be replaced (if any) if a given resourceID is accepted from  the pending resources array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to query |
| resourceId | uint64 | ID of the pending resource which will be accepted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64 | uint64 ID of the resource which will be replacted |

### getResourceType

```solidity
function getResourceType(uint64 resourceId) external view returns (string)
```

Used to get the type of the resource.



#### Parameters

| Name | Type | Description |
|---|---|---|
| resourceId | uint64 | ID of the resource to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string The type of the resource |

### getSlotPartIds

```solidity
function getSlotPartIds(uint64 resourceId) external view returns (uint64[])
```

Used to retrieve the slot part IDs associated with a given resource.



#### Parameters

| Name | Type | Description |
|---|---|---|
| resourceId | uint64 | ID of the resource of which we are retrieving the array of slot part IDs |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | uint64[] An array of slot part IDs associated with the given resource |

### isApprovedForAllForResources

```solidity
function isApprovedForAllForResources(address owner, address operator) external view returns (bool)
```

Used to retrieve the permission of the `operator` to manage the resources on `owner`&#39;s tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | Address of the owner of the tokens |
| operator | address | Address of the user being checked for permission to manage `owner`&#39;s tokens&#39; resources |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool Boolean value indicating whether the `operator` is authorised to manage `owner`&#39;s tokens&#39; resources  (`true`) or not (`false`) |

### isChildEquipped

```solidity
function isChildEquipped(uint256 tokenId, address childAddress, uint256 childTokenId) external view returns (bool)
```

Used to check whether the given token has a child token equipped.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the parent token |
| childAddress | address | Address of the child token&#39;s collection |
| childTokenId | uint256 | ID of the child token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool Boolean value indicating whether the child is equipped into the given parent |

### rejectAllResources

```solidity
function rejectAllResources(uint256 tokenId) external nonpayable
```

Used to reject all of the resources from the pending array of a given token.

*This indiscriminately clears the pending array of the token.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token of which we are clearing the pending array |

### rejectResource

```solidity
function rejectResource(uint256 tokenId, uint256 index) external nonpayable
```

Used to reject a resource from the pending array of a given token.

*Once the resource has been rejected from the pending array, the resource in the last place of the pending  array takes its place. This ensures that there are no gaps in the pending array and is cheaper than shifting all  of the members of the array by updating all of their indices.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token we are rejecting the pending resource from |
| index | uint256 | Index of the resource in the pending array we are rejecting |

### replaceEquipment

```solidity
function replaceEquipment(IRMRKEquippable.IntakeEquip data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| data | IRMRKEquippable.IntakeEquip | undefined |

### setApprovalForAllForResources

```solidity
function setApprovalForAllForResources(address operator, bool approved) external nonpayable
```

Used to manage approval to manage own tokens&#39; resources.

*Passing the value of `true` for the `approved` argument grants the approval and `false` revokes it.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | Address of the user of which we are managing the approval |
| approved | bool | Boolean value indicating whether the approval is being granted (`true`) or revoked (`false`) |

### setNestingAddress

```solidity
function setNestingAddress(address nestingAddress) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| nestingAddress | address | undefined |

### setPriority

```solidity
function setPriority(uint256 tokenId, uint16[] priorities) external nonpayable
```

Used to set priorities of active resources of a token.

*Priorities define which resource we would rather have shown when displaying the token.The pending resources array length has to match the number of active resources, otherwise setting priorities  will be reverted.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token we are managing the priorities of |
| priorities | uint16[] | An array of priorities of active resources. The succesion of items in the priorities array  matches that of the succesion of items in the active array |

### setValidParentForEquippableGroup

```solidity
function setValidParentForEquippableGroup(uint64 equippableGroupId, address parentAddress, uint64 partId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| equippableGroupId | uint64 | undefined |
| parentAddress | address | undefined |
| partId | uint64 | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```





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
function unequip(uint256 tokenId, uint64 resourceId, uint64 slotPartId) external nonpayable
```

Used to unequip child from parent token.

*This can only be called by the owner of the token or by an account that has been granted permission to  manage the given token by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the parent from which the child is being unequipped |
| resourceId | uint64 | ID of the parent&#39;s resource that contains the `Slot` into which the child is equipped |
| slotPartId | uint64 | ID of the `Slot` from which to unequip the child |



## Events

### ApprovalForAllForResources

```solidity
event ApprovalForAllForResources(address indexed owner, address indexed operator, bool approved)
```

Used to notify listeners that owner has granted approval to the user to manage resources of all of their  tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| operator `indexed` | address | undefined |
| approved  | bool | undefined |

### ApprovalForResources

```solidity
event ApprovalForResources(address indexed owner, address indexed approved, uint256 indexed tokenId)
```

Used to notify listeners that owner has granted an approval to the user to manage the resources of a  given token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| approved `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

### ChildResourceEquipped

```solidity
event ChildResourceEquipped(uint256 indexed tokenId, uint64 indexed resourceId, uint64 indexed slotPartId, uint256 childTokenId, address childAddress, uint64 childResourceId)
```

Used to notify listeners that a child&#39;s resource has been equipped into one of its parent resources.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| resourceId `indexed` | uint64 | undefined |
| slotPartId `indexed` | uint64 | undefined |
| childTokenId  | uint256 | undefined |
| childAddress  | address | undefined |
| childResourceId  | uint64 | undefined |

### ChildResourceUnequipped

```solidity
event ChildResourceUnequipped(uint256 indexed tokenId, uint64 indexed resourceId, uint64 indexed slotPartId, uint256 childTokenId, address childAddress, uint64 childResourceId)
```

Used to notify listeners that a child&#39;s resource has been removed from one of its parent resources.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| resourceId `indexed` | uint64 | undefined |
| slotPartId `indexed` | uint64 | undefined |
| childTokenId  | uint256 | undefined |
| childAddress  | address | undefined |
| childResourceId  | uint64 | undefined |

### NestingAddressSet

```solidity
event NestingAddressSet(address old, address new_)
```

Used to notify listeners of a new `Nesting` smart contract address being set.



#### Parameters

| Name | Type | Description |
|---|---|---|
| old  | address | undefined |
| new_  | address | undefined |

### ResourceAccepted

```solidity
event ResourceAccepted(uint256 indexed tokenId, uint64 indexed resourceId)
```

Used to notify listeners that a resource object at `resourceId` is accepted by the token and migrated  from token&#39;s pending resources array to active resources array of the token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| resourceId `indexed` | uint64 | undefined |

### ResourceAddedToToken

```solidity
event ResourceAddedToToken(uint256 indexed tokenId, uint64 indexed resourceId)
```

Used to notify listeners that a resource object at `resourceId` is added to token&#39;s pending resource  array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| resourceId `indexed` | uint64 | undefined |

### ResourceOverwriteProposed

```solidity
event ResourceOverwriteProposed(uint256 indexed tokenId, uint64 indexed resourceId, uint64 indexed overwritesId)
```

Used to notify listeners that a resource object at `resourceId` is proposed to token, and that the  proposal will initiate an overwrite of the resource with a new one if accepted.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| resourceId `indexed` | uint64 | undefined |
| overwritesId `indexed` | uint64 | undefined |

### ResourceOverwritten

```solidity
event ResourceOverwritten(uint256 indexed tokenId, uint64 indexed oldResourceId, uint64 indexed newResourceId)
```

Used to notify listeners that a pending resource with an overwrite is accepted, overwriting a token&#39;s  resource.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| oldResourceId `indexed` | uint64 | undefined |
| newResourceId `indexed` | uint64 | undefined |

### ResourcePrioritySet

```solidity
event ResourcePrioritySet(uint256 indexed tokenId)
```

Used to notify listeners that token&#39;s prioritiy array is reordered.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |

### ResourceRejected

```solidity
event ResourceRejected(uint256 indexed tokenId, uint64 indexed resourceId)
```

Used to notify listeners that a resource object at `resourceId` is rejected from token and is dropped  from the pending resources array of the token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| resourceId `indexed` | uint64 | undefined |

### ResourceSet

```solidity
event ResourceSet(uint64 indexed resourceId)
```

Used to notify listeners that a resource object is initialized at `resourceId`.



#### Parameters

| Name | Type | Description |
|---|---|---|
| resourceId `indexed` | uint64 | undefined |

### ValidParentEquippableGroupIdSet

```solidity
event ValidParentEquippableGroupIdSet(uint64 indexed equippableGroupId, uint64 indexed slotPartId, address parentAddress)
```

Used to notify listeners that the resources belonging to a `equippableGroupId` have beem marked as  equippable into a given slot



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




### RMRKApprovalForResourcesToCurrentOwner

```solidity
error RMRKApprovalForResourcesToCurrentOwner()
```

Attempting to grant approval of resources to their current owner




### RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll

```solidity
error RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll()
```

Attempting to grant approval of resources without being the caller or approved for all




### RMRKBadPriorityListLength

```solidity
error RMRKBadPriorityListLength()
```

Attempting to set the priorities with an array of length that doesn&#39;t match the length of active resources array




### RMRKBaseRequiredForParts

```solidity
error RMRKBaseRequiredForParts()
```

Attempting to add a resource entry with `Part`s, without setting the `Base` address




### RMRKEquippableEquipNotAllowedByBase

```solidity
error RMRKEquippableEquipNotAllowedByBase()
```

Attempting to equip a `Part` with a child not approved by the base




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

Attempting to interact with a resource, using index greater than number of resources




### RMRKMaxPendingResourcesReached

```solidity
error RMRKMaxPendingResourcesReached()
```

Attempting to add a pending resource after the number of pending resources has reached the limit (default limit is  128)




### RMRKNoResourceMatchingId

```solidity
error RMRKNoResourceMatchingId()
```

Attempting to interact with a resource that can not be found




### RMRKNotApprovedForResourcesOrOwner

```solidity
error RMRKNotApprovedForResourcesOrOwner()
```

Attempting to manage a resource without owning it or having been granted permission by the owner to do so




### RMRKNotEquipped

```solidity
error RMRKNotEquipped()
```

Attempting to unequip an item that isn&#39;t equipped




### RMRKResourceAlreadyExists

```solidity
error RMRKResourceAlreadyExists()
```

Attempting to add a resource using an ID that has already been used




### RMRKSlotAlreadyUsed

```solidity
error RMRKSlotAlreadyUsed()
```

Attempting to equip an item into a slot that already has an item equipped




### RMRKTargetResourceCannotReceiveSlot

```solidity
error RMRKTargetResourceCannotReceiveSlot()
```

Attempting to equip an item into a `Slot` that the target resource does not implement




### RMRKTokenCannotBeEquippedWithResourceIntoSlot

```solidity
error RMRKTokenCannotBeEquippedWithResourceIntoSlot()
```

Attempting to equip a child into a `Slot` and parent that the child&#39;s collection doesn&#39;t support




### RentrantCall

```solidity
error RentrantCall()
```







