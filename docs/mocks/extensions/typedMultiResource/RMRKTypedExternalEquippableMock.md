# RMRKTypedExternalEquippableMock









## Methods

### acceptResource

```solidity
function acceptResource(uint256 tokenId, uint256 index, uint64 resourceId) external nonpayable
```

Used to accept a pending resource of a given token.

*Accepting is done using the index of a pending resource. The array of pending resources is modified every  time one is accepted and the last pending resource is moved into its place.Can only be called by the owner of the token or a user that has been approved to manage the tokens&#39;s  resources.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which we are accepting the resource |
| index | uint256 | Index of the resource to accept in token&#39;s pending arry |
| resourceId | uint64 | undefined |

### addResourceEntry

```solidity
function addResourceEntry(uint64 id, uint64 equippableGroupId, address baseAddress, string metadataURI, uint64[] fixedPartIds, uint64[] slotPartIds) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint64 | undefined |
| equippableGroupId | uint64 | undefined |
| baseAddress | address | undefined |
| metadataURI | string | undefined |
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
function addTypedResourceEntry(uint64 id, uint64 equippableGroupId, address baseAddress, string metadataURI, uint64[] fixedPartIds, uint64[] slotPartIds, string type_) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint64 | undefined |
| equippableGroupId | uint64 | undefined |
| baseAddress | address | undefined |
| metadataURI | string | undefined |
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

*Resources metadata is stored by reference mapping `_resource[resourceId]`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to query |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | uint64[] Array of active resource IDs |

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

### getEquipment

```solidity
function getEquipment(uint256 tokenId, address targetBaseAddress, uint64 slotPartId) external view returns (struct IRMRKEquippable.Equipment)
```

Used to get the Equipment object equipped into the specified slot of the desired token.

*The `Equipment` struct consists of the following data:  [      resourceId,      childResourceId,      childId,      childEquippableAddress  ]*

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
function getExtendedResource(uint256 tokenId, uint64 resourceId) external view returns (string metadataURI, uint64 equippableGroupId, address baseAddress, uint64[] fixedPartIds, uint64[] slotPartIds)
```

Used to get the extended resource struct of the resource associated with given `resourceId`.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| resourceId | uint64 | ID of the resource of which we are retrieving |

#### Returns

| Name | Type | Description |
|---|---|---|
| metadataURI | string | undefined |
| equippableGroupId | uint64 | undefined |
| baseAddress | address | undefined |
| fixedPartIds | uint64[] | undefined |
| slotPartIds | uint64[] | undefined |

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

*Pending resources metadata is stored by reference mapping _pendingResource[resourceId]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | the token ID to query |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | uint64[] pending resource IDs |

### getResourceMetadata

```solidity
function getResourceMetadata(uint256 tokenId, uint64 resourceId) external view returns (string)
```

Used to fetch the resource metadata of the specified token&#39;s for given resource.

*Resources are stored by reference mapping `_resources[resourceId]`.Can be overriden to implement enumerate, fallback or other custom logic.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to query |
| resourceId | uint64 | Resource Id, must be in the pending or active resources array |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string Metadata of the resource |

### getResourceOverwrites

```solidity
function getResourceOverwrites(uint256 tokenId, uint64 newResourceId) external view returns (uint64)
```

Used to retrieve the resource ID that will be replaced (if any) if a given resourceID is accepted from  the pending resources array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to query |
| newResourceId | uint64 | ID of the pending resource which will be accepted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64 | uint64 ID of the resource which will be replaced |

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

### isApprovedForAllForResources

```solidity
function isApprovedForAllForResources(address owner, address operator) external view returns (bool)
```

Used to check whether the address has been granted the operator role by a given address or not.

*See {setApprovalForAllForResources}.*

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

*This is used to prevent from unnesting a child that is equipped.*

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

### rejectAllResources

```solidity
function rejectAllResources(uint256 tokenId, uint256 maxRejections) external nonpayable
```

Used to reject all pending resources of a given token.

*When rejecting all resources, the pending array is indiscriminately cleared.Can only be called by the owner of the token or a user that has been approved to manage the tokens&#39;s  resources.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which we are clearing the pending array |
| maxRejections | uint256 | undefined |

### rejectResource

```solidity
function rejectResource(uint256 tokenId, uint256 index, uint64 resourceId) external nonpayable
```

Used to reject a pending resource of a given token.

*Rejecting is done using the index of a pending resource. The array of pending resources is modified every  time one is rejected and the last pending resource is moved into its place.Can only be called by the owner of the token or a user that has been approved to manage the tokens&#39;s  resources.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which we are rejecting the resource |
| index | uint256 | Index of the resource to reject in token&#39;s pending array |
| resourceId | uint64 | undefined |

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

Used to add or remove an operator of resources for the caller.

*Operators can call {acceptResource}, {rejectResource}, {rejectAllResources} or {setPriority} for any token  owned by the caller.Requirements:  - The `operator` cannot be the caller.Emits an {ApprovalForAllForResources} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | Address of the account to which the operator role is granted or revoked from |
| approved | bool | The boolean value indicating whether the operator role is being granted (`true`) or revoked  (`false`) |

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
event ChildResourceEquipped(uint256 indexed tokenId, uint64 indexed resourceId, uint64 indexed slotPartId, uint256 childId, address childAddress, uint64 childResourceId)
```

Used to notify listeners that a child&#39;s resource has been equipped into one of its parent resources.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| resourceId `indexed` | uint64 | undefined |
| slotPartId `indexed` | uint64 | undefined |
| childId  | uint256 | undefined |
| childAddress  | address | undefined |
| childResourceId  | uint64 | undefined |

### ChildResourceUnequipped

```solidity
event ChildResourceUnequipped(uint256 indexed tokenId, uint64 indexed resourceId, uint64 indexed slotPartId, uint256 childId, address childAddress, uint64 childResourceId)
```

Used to notify listeners that a child&#39;s resource has been unequipped from one of its parent resources.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| resourceId `indexed` | uint64 | undefined |
| slotPartId `indexed` | uint64 | undefined |
| childId  | uint256 | undefined |
| childAddress  | address | undefined |
| childResourceId  | uint64 | undefined |

### NestingAddressSet

```solidity
event NestingAddressSet(address old, address new_)
```

Used to notify listeners of a new `Nesting` associated  smart contract address being set.



#### Parameters

| Name | Type | Description |
|---|---|---|
| old  | address | undefined |
| new_  | address | undefined |

### ResourceAccepted

```solidity
event ResourceAccepted(uint256 indexed tokenId, uint64 indexed resourceId, uint64 indexed overwritesId)
```

Used to notify listeners that a resource object at `resourceId` is accepted by the token and migrated  from token&#39;s pending resources array to active resources array of the token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| resourceId `indexed` | uint64 | undefined |
| overwritesId `indexed` | uint64 | undefined |

### ResourceAddedToToken

```solidity
event ResourceAddedToToken(uint256 indexed tokenId, uint64 indexed resourceId, uint64 indexed overwritesId)
```

Used to notify listeners that a resource object at `resourceId` is added to token&#39;s pending resource  array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| resourceId `indexed` | uint64 | undefined |
| overwritesId `indexed` | uint64 | undefined |

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

Used to notify listeners that the resources belonging to a `equippableGroupId` have been marked as  equippable into a given slot and parent



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




### RMRKTokenDoesNotHaveResource

```solidity
error RMRKTokenDoesNotHaveResource()
```

Attempting to compose a NFT of a token without active resources




### RMRKUnexpectedNumberOfResources

```solidity
error RMRKUnexpectedNumberOfResources()
```

Attempting to reject all resources but more resources than expected are pending




### RMRKUnexpectedResourceId

```solidity
error RMRKUnexpectedResourceId()
```

Attempting to accept or reject a resource which does not match the one at the specified index




### RentrantCall

```solidity
error RentrantCall()
```







