# IRMRKExternalEquip

*RMRK team*

> IRMRKExternalEquip

Interface smart contract of the RMRK external equippable module.



## Methods

### acceptResource

```solidity
function acceptResource(uint256 tokenId, uint256 index) external nonpayable
```

Accepts a resource at from the pending array of given token.

*Migrates the resource from the token&#39;s pending resource array to the token&#39;s active resource array.Active resources cannot be removed by anyone, but can be replaced by a new resource.Requirements:  - The caller must own the token or be an approved operator.  - `tokenId` must exist.  - `index` must be in range of the length of the pending resource array.Emits an {ResourceAccepted} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to accept the pending resource |
| index | uint256 | Index of the resource in the pending array to accept |

### approveForResources

```solidity
function approveForResources(address to, uint256 tokenId) external nonpayable
```

Used to grant permission to the user to manage token&#39;s resources.

*This differs from transfer approvals, as approvals are not cleared when the approved party accepts or  rejects a resource, or sets resource priorities. This approval is cleared on token transfer.Only a single account can be approved at a time, so approving the `0x0` address clears previous approvals.Requirements:  - The caller must own the token or be an approved operator.  - `tokenId` must exist.Emits an {ApprovalForResources} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | Address of the account to grant the approval to |
| tokenId | uint256 | ID of the token for which the approval to manage the resources is granted |

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

### getActiveResourcePriorities

```solidity
function getActiveResourcePriorities(uint256 tokenId) external view returns (uint16[])
```

Used to retrieve the priorities of the active resoources of a given token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to retrieve the priorities of the active resources |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint16[] | uint16[] An array of priorities of the active resources of the given token |

### getActiveResources

```solidity
function getActiveResources(uint256 tokenId) external view returns (uint64[])
```

Used to retrieve IDs od the active resources of given token.

*Resource data is stored by reference, in order to access the data corresponding to the ID, call  `getResourceMeta(resourceId)`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to retrieve the IDs of the active resources |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | uint64[] An array of active resource IDs of the given token |

### getAllResources

```solidity
function getAllResources() external view returns (uint64[])
```

Returns the ids of all stored resources




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | undefined |

### getApprovedForResources

```solidity
function getApprovedForResources(uint256 tokenId) external view returns (address)
```

Used to retrieve the address of the account approved to manage resources of a given token.

*Requirements:  - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to retrieve the approved address |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address Address of the account that is approved to manage the specified token&#39;s resources |

### getBaseAddressOfResource

```solidity
function getBaseAddressOfResource(uint64 resourceId) external view returns (address)
```

Used to get the address of the resource&#39;s `Base`



#### Parameters

| Name | Type | Description |
|---|---|---|
| resourceId | uint64 | ID of the resource for which we are retrieving the address of the `Base` |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address Address of the `Base` smart contract of the resource |

### getEquipment

```solidity
function getEquipment(uint256 tokenId, address targetBaseAddress, uint64 slotPartId) external view returns (struct IRMRKEquippable.Equipment)
```

Used to get the Equipment object equipped into the specified slot of the desired token.



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



*Returns the Equippable contract&#39;s corresponding nesting address.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### getPendingResources

```solidity
function getPendingResources(uint256 tokenId) external view returns (uint64[])
```

Used to retrieve IDs od the active resources of given token.

*Resource data is stored by reference, in order to access the data corresponding to the ID, call  `getResourceMeta(resourceId)`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to retrieve the IDs of the pending resources |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | uint64[] An array of pending resource IDs of the given token |

### getResourceMeta

```solidity
function getResourceMeta(uint64 resourceId) external view returns (string)
```

Used to retrieve the metadata of the resource associated with `resourceId`.



#### Parameters

| Name | Type | Description |
|---|---|---|
| resourceId | uint64 | The ID of the resource for which we are trying to retrieve the resource metadata |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string The metadata of the resource with ID equal to `resourceId` |

### getResourceMetaForToken

```solidity
function getResourceMetaForToken(uint256 tokenId, uint64 resourceIndex) external view returns (string)
```

Used to fetch the resource data for the token&#39;s active resource using its index.

*Resources are stored by reference mapping `_resources[resourceId]`.Can be overriden to implement enumerate, fallback or other custom logic.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token from which to retrieve the resource data |
| resourceIndex | uint64 | Index of the resource in the active resources array for which to retrieve the metadata |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string The metadata of the resource belonging to the specified index in the token&#39;s active resources  array |

### getResourceOverwrites

```solidity
function getResourceOverwrites(uint256 tokenId, uint64 resourceId) external view returns (uint64)
```

Used to retrieve the resource that will be overriden if a given resource from the token&#39;s pending array  is accepted.

*Resource data is stored by reference, in order to access the data corresponding to the ID, call  `getResourceMeta(resourceId)`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to check |
| resourceId | uint64 | ID of the resource that would be accepted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64 | uint64 ID of the resource that would be overriden |

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
| _0 | bool | bool The boolean value indicating wehter the account we are checking has been granted the operator role  (`true`) or not (`false`) |

### isChildEquipped

```solidity
function isChildEquipped(uint256 tokenId, address childAddress, uint256 childTokenId) external view returns (bool)
```

Used to check whether the token has a given token equipped.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which we are querrying if it has another equipped |
| childAddress | address | Address of the child token&#39;s smart cotntract |
| childTokenId | uint256 | ID of the child token for which we are checking if it is equipped |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool The boolean value indicating whether the child toke is equipped into the given token or not |

### rejectAllResources

```solidity
function rejectAllResources(uint256 tokenId) external nonpayable
```

Rejects all resources from the pending array of a given token.

*Effecitvely deletes the pending array.Requirements:  - The caller must own the token or be an approved operator.  - `tokenId` must exist.Emits a {ResourceRejected} event with resourceId = 0.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token of which to clear the pending array |

### rejectResource

```solidity
function rejectResource(uint256 tokenId, uint256 index) external nonpayable
```

Rejects a resource from the pending array of given token.

*Removes the resource from the token&#39;s pending resource array.Requirements:  - The caller must own the token or be an approved operator.  - `tokenId` must exist.  - `index` must be in range of the length of the pending resource array.Emits a {ResourceRejected} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token that the resource is being rejected from |
| index | uint256 | Index of the resource in the pending array to be rejected  |

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
| approved | bool | The boolean value indicating wether the operator role is being granted (`true`) or revoked  (`false`) |

### setPriority

```solidity
function setPriority(uint256 tokenId, uint16[] priorities) external nonpayable
```

Sets a new priority array for a given token.

*The priority array is a non-sequential list of `uint16`s, where the lowest value is considered highest  priority.Value `0` of a priority is a special case equivalent to unitialized.Requirements:  - The caller must own the token or be an approved operator.  - `tokenId` must exist.  - The length of `priorities` must be equal the length of the active resources array.Emits a {ResourcePrioritySet} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to set the priorities for |
| priorities | uint16[] | An array of priority values |

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

*When initially setting the `Nesting` smart contract address, the `old` value should equal `0x0` address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| old  | address | Previous `Nesting` smart contract address |
| new_  | address | New `Nesting` smart contract address |

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



