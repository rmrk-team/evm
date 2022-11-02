# RMRKSoulboundNestingMultiResourceMock









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
function acceptChild(uint256 tokenId, uint256 index) external nonpayable
```

Sends an instance of Child from the pending children array at index to children array for tokenId.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | tokenId of parent token to accept a child on |
| index | uint256 | index of child in _pendingChildren array to accept. |

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

### addChild

```solidity
function addChild(uint256 parentTokenId, uint256 childTokenId) external nonpayable
```



*Function designed to be used by other instances of RMRK-Core contracts to update children. param1 parentTokenId is the tokenId of the parent token on (this). param2 childTokenId is the tokenId of the child instance*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentTokenId | uint256 | undefined |
| childTokenId | uint256 | undefined |

### addResourceEntry

```solidity
function addResourceEntry(uint64 id, string metadataURI) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint64 | undefined |
| metadataURI | string | undefined |

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



*See {IERC721-approve}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |

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

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```



*See {IERC721-balanceOf}.*

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



*Destroys `tokenId`. The approval is cleared when the token is burned. Requirements: - `tokenId` must exist. Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

### burnChild

```solidity
function burnChild(uint256 tokenId, uint256 index) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| index | uint256 | undefined |

### childIsInActive

```solidity
function childIsInActive(address childAddress, uint256 childId) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| childAddress | address | undefined |
| childId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### childOf

```solidity
function childOf(uint256 parentTokenId, uint256 index) external view returns (struct IRMRKNesting.Child)
```



*Returns a single child object existing at `index` on `parentTokenId`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentTokenId | uint256 | undefined |
| index | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNesting.Child | undefined |

### childrenOf

```solidity
function childrenOf(uint256 parentTokenId) external view returns (struct IRMRKNesting.Child[])
```

Returns all confirmed children



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentTokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNesting.Child[] | undefined |

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

### getApproved

```solidity
function getApproved(uint256 tokenId) external view returns (address)
```



*See {IERC721-getApproved}.*

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

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool)
```



*See {IERC721-isApprovedForAll}.*

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

### isSoulbound

```solidity
function isSoulbound(uint256 tokenId) external view returns (bool)
```

Used to verify that the token is soulbound.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token we are verifying |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool Boolean verifying whether the token is soulbound (`true`) or not (`false`) |

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
function nestMint(address to, uint256 tokenId, uint256 destId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |
| destId | uint256 | undefined |

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



*Function called when calling transferFrom with the target as another NFT via `tokenId` on `to`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |
| destinationId | uint256 | undefined |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```

Returns the root owner of the current RMRK NFT.

*In the event the NFT is owned by another NFT, it will recursively ask the parent.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### pendingChildOf

```solidity
function pendingChildOf(uint256 parentTokenId, uint256 index) external view returns (struct IRMRKNesting.Child)
```



*Returns a single pending child object existing at `index` on `parentTokenId`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentTokenId | uint256 | undefined |
| index | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNesting.Child | undefined |

### pendingChildrenOf

```solidity
function pendingChildrenOf(uint256 parentTokenId) external view returns (struct IRMRKNesting.Child[])
```

Returns all pending children



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentTokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNesting.Child[] | undefined |

### rejectAllChildren

```solidity
function rejectAllChildren(uint256 tokenId) external nonpayable
```

Deletes all pending children.

*This does not update the ownership storage data on children. If necessary, ownership can be reclaimed by the rootOwner of the previous parent (this).*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

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

### rmrkOwnerOf

```solidity
function rmrkOwnerOf(uint256 tokenId) external view returns (address, uint256, bool)
```

Returns the immediate provenance data of the current RMRK NFT.

*In the event the NFT is owned by a wallet, tokenId will be zero and isNft will be false. Otherwise, the returned data is the contract address and tokenID of the owner NFT, as well as its isNft flag.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | uint256 | undefined |
| _2 | bool | undefined |

### safeMint

```solidity
function safeMint(address to, uint256 tokenId, bytes _data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |
| _data | bytes | undefined |

### safeMint

```solidity
function safeMint(address to, uint256 tokenId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*See {IERC721-safeTransferFrom}.*

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



*See {IERC721-safeTransferFrom}.*

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



*See {IERC721-setApprovalForAll}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined |
| approved | bool | undefined |

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



*See {IERC721-transferFrom}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

### unnestChild

```solidity
function unnestChild(uint256 tokenId, uint256 index, address to, bool isPending) external nonpayable
```

Function to unnest a child from the active token array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | is the tokenId of the parent token to unnest from. |
| index | uint256 | is the index of the child token ID. |
| to | address | is the address to transfer this |
| isPending | bool | indicates if the child is pending (active otherwise). |



## Events

### AllChildrenRejected

```solidity
event AllChildrenRejected(uint256 indexed tokenId)
```





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
event ChildAccepted(uint256 indexed tokenId, address indexed childAddress, uint256 indexed childId, uint256 childIndex)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| childAddress `indexed` | address | undefined |
| childId `indexed` | uint256 | undefined |
| childIndex  | uint256 | undefined |

### ChildProposed

```solidity
event ChildProposed(uint256 indexed tokenId, address indexed childAddress, uint256 indexed childId, uint256 childIndex)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| childAddress `indexed` | address | undefined |
| childId `indexed` | uint256 | undefined |
| childIndex  | uint256 | undefined |

### ChildUnnested

```solidity
event ChildUnnested(uint256 indexed tokenId, address indexed childAddress, uint256 indexed childId, uint256 childIndex, bool fromPending)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| childAddress `indexed` | address | undefined |
| childId `indexed` | uint256 | undefined |
| childIndex  | uint256 | undefined |
| fromPending  | bool | undefined |

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



## Errors

### ERC721AddressZeroIsNotaValidOwner

```solidity
error ERC721AddressZeroIsNotaValidOwner()
```






### ERC721ApprovalToCurrentOwner

```solidity
error ERC721ApprovalToCurrentOwner()
```






### ERC721ApproveCallerIsNotOwnerNorApprovedForAll

```solidity
error ERC721ApproveCallerIsNotOwnerNorApprovedForAll()
```






### ERC721ApproveToCaller

```solidity
error ERC721ApproveToCaller()
```






### ERC721InvalidTokenId

```solidity
error ERC721InvalidTokenId()
```






### ERC721MintToTheZeroAddress

```solidity
error ERC721MintToTheZeroAddress()
```






### ERC721NotApprovedOrOwner

```solidity
error ERC721NotApprovedOrOwner()
```






### ERC721TokenAlreadyMinted

```solidity
error ERC721TokenAlreadyMinted()
```






### ERC721TransferFromIncorrectOwner

```solidity
error ERC721TransferFromIncorrectOwner()
```






### ERC721TransferToNonReceiverImplementer

```solidity
error ERC721TransferToNonReceiverImplementer()
```






### ERC721TransferToTheZeroAddress

```solidity
error ERC721TransferToTheZeroAddress()
```






### RMRKApprovalForResourcesToCurrentOwner

```solidity
error RMRKApprovalForResourcesToCurrentOwner()
```






### RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll

```solidity
error RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll()
```






### RMRKApproveForResourcesToCaller

```solidity
error RMRKApproveForResourcesToCaller()
```






### RMRKBadPriorityListLength

```solidity
error RMRKBadPriorityListLength()
```






### RMRKCannotTransferSoulbound

```solidity
error RMRKCannotTransferSoulbound()
```






### RMRKChildAlreadyExists

```solidity
error RMRKChildAlreadyExists()
```






### RMRKChildIndexOutOfRange

```solidity
error RMRKChildIndexOutOfRange()
```






### RMRKIdZeroForbidden

```solidity
error RMRKIdZeroForbidden()
```






### RMRKIndexOutOfRange

```solidity
error RMRKIndexOutOfRange()
```






### RMRKIsNotContract

```solidity
error RMRKIsNotContract()
```






### RMRKMaxPendingChildrenReached

```solidity
error RMRKMaxPendingChildrenReached()
```






### RMRKMaxPendingResourcesReached

```solidity
error RMRKMaxPendingResourcesReached()
```






### RMRKMintToNonRMRKImplementer

```solidity
error RMRKMintToNonRMRKImplementer()
```






### RMRKNestingTooDeep

```solidity
error RMRKNestingTooDeep()
```






### RMRKNestingTransferToDescendant

```solidity
error RMRKNestingTransferToDescendant()
```






### RMRKNestingTransferToNonRMRKNestingImplementer

```solidity
error RMRKNestingTransferToNonRMRKNestingImplementer()
```






### RMRKNestingTransferToSelf

```solidity
error RMRKNestingTransferToSelf()
```






### RMRKNoResourceMatchingId

```solidity
error RMRKNoResourceMatchingId()
```






### RMRKNotApprovedForResourcesOrOwner

```solidity
error RMRKNotApprovedForResourcesOrOwner()
```






### RMRKNotApprovedOrDirectOwner

```solidity
error RMRKNotApprovedOrDirectOwner()
```






### RMRKPendingChildIndexOutOfRange

```solidity
error RMRKPendingChildIndexOutOfRange()
```






### RMRKResourceAlreadyExists

```solidity
error RMRKResourceAlreadyExists()
```






### RMRKTokenIdZeroForbidden

```solidity
error RMRKTokenIdZeroForbidden()
```







