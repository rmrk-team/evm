# RMRKSoulboundEquippableMock









## Methods

### VERSION

```solidity
function VERSION() external view returns (string)
```

Version of the @rmrk-team/evm-contracts package




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### acceptChild

```solidity
function acceptChild(uint256 parentId, uint256 childIndex, address childAddress, uint256 childId) external nonpayable
```

@notice Used to accept a pending child token for a given parent token.

*This moves the child token from parent token&#39;s pending child tokens array into the active child tokens  array.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token for which the child token is being accepted |
| childIndex | uint256 | Index of a child tokem in the given parent&#39;s pending children array |
| childAddress | address | Address of the collection smart contract of the child token expected to be located at the  specified index of the given parent token&#39;s pending children array |
| childId | uint256 | ID of the child token expected to be located at the specified index of the given parent token&#39;s  pending children array |

### acceptResource

```solidity
function acceptResource(uint256 tokenId, uint256 index, uint64 resourceId) external nonpayable
```

Accepts a resource at from the pending array of given token.

*Migrates the resource from the token&#39;s pending resource array to the token&#39;s active resource array.Active resources cannot be removed by anyone, but can be replaced by a new resource.Requirements:  - The caller must own the token or be approved to manage the token&#39;s resources  - `tokenId` must exist.  - `index` must be in range of the length of the pending resource array.Emits an {ResourceAccepted} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to accept the pending resource |
| index | uint256 | Index of the resource in the pending array to accept |
| resourceId | uint64 | undefined |

### addChild

```solidity
function addChild(uint256 parentId, uint256 childId) external nonpayable
```

Used to add a child token to a given parent token.

*This adds the iichild token into the given parent token&#39;s pending child tokens array.Requirements:  - `ownerOf` on the child contract must resolve to the called contract.  - The pending array of the parent contract must not be full.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token to receive the new child token |
| childId | uint256 | ID of the new proposed child token |

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

### approve

```solidity
function approve(address to, uint256 tokenId) external nonpayable
```



*Gives permission to `to` to transfer `tokenId` token to another account. The approval is cleared when the token is transferred. Only a single account can be approved at a time, so approving the zero address clears previous approvals. Requirements: - The caller must own the token or be an approved operator. - `tokenId` must exist. Emits an {Approval} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |

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

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```



*Returns the number of tokens in ``owner``&#39;s account.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### burn

```solidity
function burn(uint256 tokenId) external nonpayable
```

Used to burn a given token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to burn |

### burn

```solidity
function burn(uint256 tokenId, uint256 maxChildrenBurns) external nonpayable returns (uint256)
```

Used to burn a token.

*When a token is burned, its children are recursively burned as well.The approvals are cleared when the token is burned.Requirements:  - `tokenId` must exist.Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to burn |
| maxChildrenBurns | uint256 | Maximum children to recursively burn |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 The number of recursive burns it took to burn all of the children |

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

### childIsInActive

```solidity
function childIsInActive(address childAddress, uint256 childId) external view returns (bool)
```

Used to verify that the given child tokwn is included in an active array of a token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| childAddress | address | Address of the given token&#39;s collection smart contract |
| childId | uint256 | ID of the child token being checked |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool A boolean value signifying whether the given child token is included in an active child tokens array  of a token (`true`) or not (`false`) |

### childOf

```solidity
function childOf(uint256 parentId, uint256 index) external view returns (struct IRMRKNesting.Child)
```

Used to retrieve a specific active child token for a given parent token.

*Returns a single Child struct locating at `index` of parent token&#39;s active child tokens array.The Child struct consists of the following values:  [      tokenId,      contractAddress  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token for which the child is being retrieved |
| index | uint256 | Index of the child token in the parent token&#39;s active child tokens array |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNesting.Child | struct A Child struct containing data about the specified child |

### childrenOf

```solidity
function childrenOf(uint256 parentId) external view returns (struct IRMRKNesting.Child[])
```

Used to retrieve the active child tokens of a given parent token.

*Returns array of Child structs existing for parent token.The Child struct consists of the following values:  [      tokenId,      contractAddress  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token for which to retrieve the active child tokens |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNesting.Child[] | struct[] An array of Child structs containing the parent token&#39;s active child tokens |

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

### getApproved

```solidity
function getApproved(uint256 tokenId) external view returns (address)
```



*Returns the account approved for `tokenId` token. Requirements: - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

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

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool)
```



*Returns if the `operator` is allowed to manage all of the assets of `owner`. See {setApprovalForAll}*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |
| operator | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

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

### isSoulbound

```solidity
function isSoulbound(uint256 tokenId) external view returns (bool)
```

Used to verify if the token is soulbound.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token we are verifying |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool Boolean verifying whether the token is soulbound |

### mint

```solidity
function mint(address to, uint256 tokenId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |

### name

```solidity
function name() external view returns (string)
```

Used to retrieve the collection name.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string Name of the collection |

### nestMint

```solidity
function nestMint(address to, uint256 tokenId, uint256 destinationId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |
| destinationId | uint256 | undefined |

### nestTransfer

```solidity
function nestTransfer(address to, uint256 tokenId, uint256 destinationId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |
| destinationId | uint256 | undefined |

### nestTransferFrom

```solidity
function nestTransferFrom(address from, address to, uint256 tokenId, uint256 destinationId) external nonpayable
```

Used to transfer the token into another token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | Address of the collection smart contract of the token to be transferred |
| to | address | Address of the receiving token&#39;s collection smart contract |
| tokenId | uint256 | ID of the token being transferred |
| destinationId | uint256 | ID of the token to receive the token being transferred |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```

Used to retrieve the root owner of the given token.

*Root owner is always the externally owned account.If the given token is owned by another token, it will recursively query the parent tokens until reaching the  root owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which the root owner is being retrieved |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address Address of the root owner of the given token |

### pendingChildOf

```solidity
function pendingChildOf(uint256 parentId, uint256 index) external view returns (struct IRMRKNesting.Child)
```

Used to retrieve a specific pending child token from a given parent token.

*Returns a single Child struct locating at `index` of parent token&#39;s active child tokens array.The Child struct consists of the following values:  [      tokenId,      contractAddress  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token for which the pending child token is being retrieved |
| index | uint256 | Index of the child token in the parent token&#39;s pending child tokens array |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNesting.Child | struct A Child struct containting data about the specified child |

### pendingChildrenOf

```solidity
function pendingChildrenOf(uint256 parentId) external view returns (struct IRMRKNesting.Child[])
```

Used to retrieve the pending child tokens of a given parent token.

*Returns array of pending Child structs existing for given parent.The Child struct consists of the following values:  [      tokenId,      contractAddress  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token for which to retrieve the pending child tokens |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNesting.Child[] | struct[] An array of Child structs containing the parent token&#39;s pending child tokens |

### rejectAllChildren

```solidity
function rejectAllChildren(uint256 tokenId) external nonpayable
```

Used to reject all pending children of a given parent token.

*Removes the children from the pending array mapping.This does not update the ownership storage data on children. If necessary, ownership can be reclaimed by the  rootOwner of the previous parent.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the parent token for which to reject all of the pending tokens |

### rejectAllResources

```solidity
function rejectAllResources(uint256 tokenId, uint256 maxRejections) external nonpayable
```

Rejects all resources from the pending array of a given token.

*Effecitvely deletes the pending array.Requirements:  - The caller must own the token or be approved to manage the token&#39;s resources  - `tokenId` must exist.Emits a {ResourceRejected} event with resourceId = 0.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token of which to clear the pending array |
| maxRejections | uint256 | undefined |

### rejectResource

```solidity
function rejectResource(uint256 tokenId, uint256 index, uint64 resourceId) external nonpayable
```

Rejects a resource from the pending array of given token.

*Removes the resource from the token&#39;s pending resource array.Requirements:  - The caller must own the token or be approved to manage the token&#39;s resources  - `tokenId` must exist.  - `index` must be in range of the length of the pending resource array.Emits a {ResourceRejected} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token that the resource is being rejected from |
| index | uint256 | Index of the resource in the pending array to be rejected |
| resourceId | uint64 | undefined |

### replaceEquipment

```solidity
function replaceEquipment(IRMRKEquippable.IntakeEquip data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| data | IRMRKEquippable.IntakeEquip | undefined |

### rmrkOwnerOf

```solidity
function rmrkOwnerOf(uint256 tokenId) external view returns (address, uint256, bool)
```

Used to retrieve the immediate owner of the given token.

*In the event the NFT is owned by an externally owned account, `tokenId` will be `0` and `isNft` will be  `false`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which the immediate owner is being retrieved |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address Address of the immediate owner. If the token is owned by an externally owned account, its address  will be returned. If the token is owned by another token, the parent token&#39;s collection smart contract address  is returned |
| _1 | uint256 | uint256 Token ID of the immediate owner. If the immediate owner is an externally owned account, the value  should be `0` |
| _2 | bool | bool A boolean value signifying whether the immediate owner is a token (`true`) or not (`false`) |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients are aware of the ERC721 protocol to prevent tokens from being forever locked. Requirements: - `from` cannot be the zero address. - `to` cannot be the zero address. - `tokenId` token must exist and be owned by `from`. - If the caller is not `from`, it must be have been allowed to move this token by either {approve} or {setApprovalForAll}. - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer. Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external nonpayable
```



*Safely transfers `tokenId` token from `from` to `to`. Requirements: - `from` cannot be the zero address. - `to` cannot be the zero address. - `tokenId` token must exist and be owned by `from`. - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}. - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer. Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |
| data | bytes | undefined |

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) external nonpayable
```



*Approve or remove `operator` as an operator for the caller. Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller. Requirements: - The `operator` cannot be the caller. Emits an {ApprovalForAll} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined |
| approved | bool | undefined |

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

### setPriority

```solidity
function setPriority(uint256 tokenId, uint16[] priorities) external nonpayable
```

Sets a new priority array for a given token.

*The priority array is a non-sequential list of `uint16`s, where the lowest value is considered highest  priority.Value `0` of a priority is a special case equivalent to unitialized.Requirements:  - The caller must own the token or be approved to manage the token&#39;s resources  - `tokenId` must exist.  - The length of `priorities` must be equal the length of the active resources array.Emits a {ResourcePrioritySet} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to set the priorities for |
| priorities | uint16[] | An array of priority values |

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

### symbol

```solidity
function symbol() external view returns (string)
```

Used to retrieve the collection symbol.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string Symbol of the collection |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```

Used to retrieve the metadata URI of a token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to retrieve the metadata URI for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string Metadata URI of the specified token |

### transfer

```solidity
function transfer(address to, uint256 tokenId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*Transfers `tokenId` token from `from` to `to`. WARNING: Usage of this method is discouraged, use {safeTransferFrom} whenever possible. Requirements: - `from` cannot be the zero address. - `to` cannot be the zero address. - `tokenId` token must be owned by `from`. - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}. Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

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

### unnestChild

```solidity
function unnestChild(uint256 tokenId, address to, uint256 childIndex, address childAddress, uint256 childId, bool isPending) external nonpayable
```

Function to unnest a child from the active token array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token from which to unnest a child token |
| to | address | Address of the new owner of the child token being unnested |
| childIndex | uint256 | Index of the child token to unnest in the array it is located in |
| childAddress | address | Address of the collection smart contract of the child token expected to be located at the  specified index of the given parent token&#39;s pending children array |
| childId | uint256 | ID of the child token expected to be located at the specified index of the given parent token&#39;s  pending children array |
| isPending | bool | A boolean value signifying whether the child token is being unnested from the pending child  tokens array (`true`) or from the active child tokens array (`false`) |



## Events

### AllChildrenRejected

```solidity
event AllChildrenRejected(uint256 indexed tokenId)
```

Used to notify listeners that all pending child tokens of a given token have been rejected.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |

### Approval

```solidity
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| approved `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| operator `indexed` | address | undefined |
| approved  | bool | undefined |

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

### ChildAccepted

```solidity
event ChildAccepted(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId)
```

Used to notify listeners that a new child token was accepted by the parent token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| childIndex  | uint256 | undefined |
| childAddress `indexed` | address | undefined |
| childId `indexed` | uint256 | undefined |

### ChildProposed

```solidity
event ChildProposed(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId)
```

Used to notify listeners that a new token has been added to a given token&#39;s pending children array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| childIndex  | uint256 | undefined |
| childAddress `indexed` | address | undefined |
| childId `indexed` | uint256 | undefined |

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

### ChildUnnested

```solidity
event ChildUnnested(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId, bool fromPending)
```

Used to notify listeners a child token has been unnested from parent token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| childIndex  | uint256 | undefined |
| childAddress `indexed` | address | undefined |
| childId `indexed` | uint256 | undefined |
| fromPending  | bool | undefined |

### NestTransfer

```solidity
event NestTransfer(address indexed from, address indexed to, uint256 fromTokenId, uint256 toTokenId, uint256 indexed tokenId)
```

Used to notify listeners that the token is being transferred.



#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| fromTokenId  | uint256 | undefined |
| toTokenId  | uint256 | undefined |
| tokenId `indexed` | uint256 | undefined |

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

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

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

### ERC721AddressZeroIsNotaValidOwner

```solidity
error ERC721AddressZeroIsNotaValidOwner()
```

Attempting to grant the token to 0x0 address




### ERC721ApprovalToCurrentOwner

```solidity
error ERC721ApprovalToCurrentOwner()
```

Attempting to grant approval to the current owner of the token




### ERC721ApproveCallerIsNotOwnerNorApprovedForAll

```solidity
error ERC721ApproveCallerIsNotOwnerNorApprovedForAll()
```

Attempting to grant approval when not being owner or approved for all should not be permitted




### ERC721ApproveToCaller

```solidity
error ERC721ApproveToCaller()
```

Attempting to grant approval to self




### ERC721InvalidTokenId

```solidity
error ERC721InvalidTokenId()
```

Attempting to use an invalid token ID




### ERC721MintToTheZeroAddress

```solidity
error ERC721MintToTheZeroAddress()
```

Attempting to mint to 0x0 address




### ERC721NotApprovedOrOwner

```solidity
error ERC721NotApprovedOrOwner()
```

Attempting to manage a token without being its owner or approved by the owner




### ERC721TokenAlreadyMinted

```solidity
error ERC721TokenAlreadyMinted()
```

Attempting to mint an already minted token




### ERC721TransferFromIncorrectOwner

```solidity
error ERC721TransferFromIncorrectOwner()
```

Attempting to transfer the token from an address that is not the owner




### ERC721TransferToNonReceiverImplementer

```solidity
error ERC721TransferToNonReceiverImplementer()
```

Attempting to safe transfer to an address that is unable to receive the token




### ERC721TransferToTheZeroAddress

```solidity
error ERC721TransferToTheZeroAddress()
```

Attempting to transfer the token to a 0x0 address




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




### RMRKCannotTransferSoulbound

```solidity
error RMRKCannotTransferSoulbound()
```

Attempting to transfer a soulbound (non-transferrable) token




### RMRKChildAlreadyExists

```solidity
error RMRKChildAlreadyExists()
```

Attempting to accept a child that has already been accepted




### RMRKChildIndexOutOfRange

```solidity
error RMRKChildIndexOutOfRange()
```

Attempting to interact with a child, using index that is higher than the number of children




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




### RMRKIsNotContract

```solidity
error RMRKIsNotContract()
```

Attempting to interact with an end-user account when the contract account is expected




### RMRKMaxPendingChildrenReached

```solidity
error RMRKMaxPendingChildrenReached()
```

Attempting to add a pending child after the number of pending children has reached the limit (default limit is 128)




### RMRKMaxPendingResourcesReached

```solidity
error RMRKMaxPendingResourcesReached()
```

Attempting to add a pending resource after the number of pending resources has reached the limit (default limit is  128)




### RMRKMaxRecursiveBurnsReached

```solidity
error RMRKMaxRecursiveBurnsReached(address childContract, uint256 childId)
```

Attempting to burn a total number of recursive children higher than maximum set



#### Parameters

| Name | Type | Description |
|---|---|---|
| childContract | address | Address of the collection smart contract in which the maximum number of recursive burns was reached |
| childId | uint256 | ID of the child token at which the maximum number of recursive burns was reached |

### RMRKMintToNonRMRKImplementer

```solidity
error RMRKMintToNonRMRKImplementer()
```

Attempting to mint a nested token to a smart contract that doesn&#39;t support nesting




### RMRKMustUnequipFirst

```solidity
error RMRKMustUnequipFirst()
```

Attempting to unnest a child before it is unequipped




### RMRKNestingTooDeep

```solidity
error RMRKNestingTooDeep()
```

Attempting to nest a child over the nesting limit (current limit is 100 levels of nesting)




### RMRKNestingTransferToDescendant

```solidity
error RMRKNestingTransferToDescendant()
```

Attempting to nest the token to own descendant, which would create a loop and leave the looped tokens in limbo




### RMRKNestingTransferToNonRMRKNestingImplementer

```solidity
error RMRKNestingTransferToNonRMRKNestingImplementer()
```

Attempting to nest the token to a smart contract that doesn&#39;t support nesting




### RMRKNestingTransferToSelf

```solidity
error RMRKNestingTransferToSelf()
```

Attempting to nest the token into itself




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




### RMRKNotApprovedOrDirectOwner

```solidity
error RMRKNotApprovedOrDirectOwner()
```

Attempting to interact with a token without being its owner or having been granted permission by the  owner to do so

*When a token is nested, only the direct owner (NFT parent) can mange it. In that case, approved addresses are  not allowed to manage it, in order to ensure the expected behaviour*


### RMRKNotEquipped

```solidity
error RMRKNotEquipped()
```

Attempting to unequip an item that isn&#39;t equipped




### RMRKPendingChildIndexOutOfRange

```solidity
error RMRKPendingChildIndexOutOfRange()
```

Attempting to interact with a pending child using an index greater than the size of pending array




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




### RMRKUnexpectedChildId

```solidity
error RMRKUnexpectedChildId()
```

Attempting to accept or unnest a child which does not match the one at the specified index




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







