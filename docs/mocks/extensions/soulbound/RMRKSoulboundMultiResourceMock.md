# RMRKSoulboundMultiResourceMock









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

### acceptResource

```solidity
function acceptResource(uint256 tokenId, uint256 index) external nonpayable
```

Used to accept a resource from the pending array of a given token.

*When the resource is accepted, the last resource in the pending array is moved to its place.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which the resource is being accepted |
| index | uint256 | Index of the resource in the given token&#39;s penoding resources array to accept |

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

Used to grant an approval to an address to manage resources of a given token.

*If the current owner of the token attempts to grant the approval to self, the execution will be reverted.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | Address of the account to grant the approval to |
| tokenId | uint256 | ID of the token for which the approval is being given |

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





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

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

Used to retrieve the address approved to manage the given token&#39;s resources.

*If the specified token isn&#39;t minted, the execution will be reverted.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which the approved address is being retrieved |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address Address of the account approved to manage the resources of a given token |

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

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```



*Returns the owner of the `tokenId` token. Requirements: - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### rejectAllResources

```solidity
function rejectAllResources(uint256 tokenId) external nonpayable
```

Used to reject all resources from the pending array of a given token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which the pending resources array is being cleared |

### rejectResource

```solidity
function rejectResource(uint256 tokenId, uint256 index) external nonpayable
```

Used to reject a resource from the pending array of a given token.

*When the resource is rejected, the last resource in the pending array is moved to its place.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which the resource is being rejected |
| index | uint256 | Index of the resource in the given token&#39;s pending resources array to reject |

### safeMint

```solidity
function safeMint(address to, uint256 tokenId, bytes data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |
| data | bytes | undefined |

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

Used to set the priorities of resources in the given token&#39;s active resources array.

*If the array of priorities in not the same length as the active resources array, the execution will be  reverted.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which the prioritied are being set |
| priorities | uint16[] | Array of priorities to apply to the token&#39;s resources |

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



## Events

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




### RMRKCannotTransferSoulbound

```solidity
error RMRKCannotTransferSoulbound()
```

Attempting to transfer a soulbound (non-transferrable) token




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




### RMRKResourceAlreadyExists

```solidity
error RMRKResourceAlreadyExists()
```

Attempting to add a resource using an ID that has already been used





