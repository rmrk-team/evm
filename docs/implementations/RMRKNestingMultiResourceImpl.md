# RMRKNestingMultiResourceImpl









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

Accepts a resource from the pending array of given token.

*Migrates the resource from the token&#39;s pending resource array to the token&#39;s active resource array.Active resources cannot be removed by anyone, but can be replaced by a new resource.Requirements:  - The caller must own the token or be approved to manage the token&#39;s resources  - `tokenId` must exist.  - `index` must be in range of the length of the pending resource array.Emits an {ResourceAccepted} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to accept the pending resource |
| index | uint256 | Index of the resource in the pending array to accept |
| resourceId | uint64 | ID of the resource expected to be located at the specified index |

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

### addContributor

```solidity
function addContributor(address contributor) external nonpayable
```

Adds a contributor to the smart contract.

*Can only be called by the owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor | address | Address of the contributor&#39;s account |

### addResourceEntry

```solidity
function addResourceEntry(string metadataURI) external nonpayable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| metadataURI | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

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

### collectionMetadata

```solidity
function collectionMetadata() external view returns (string)
```

Used to retrieve the metadata of the collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string The metadata URI of the collection |

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

### getLock

```solidity
function getLock() external view returns (bool)
```

Used to retrieve the status of a lockable smart contract.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool A boolean value signifying whether the smart contract has been locked |

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

### getRoyaltyPercentage

```solidity
function getRoyaltyPercentage() external view returns (uint256)
```

Used to retrieve the specified royalty percentage.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 The royalty percentage expressed in the basis points |

### getRoyaltyRecipient

```solidity
function getRoyaltyRecipient() external view returns (address)
```

Used to retrieve the recipient of royalties.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address Address of the recipient of royalties |

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

### maxSupply

```solidity
function maxSupply() external view returns (uint256)
```

Used to retrieve the maximum supply of the collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 The maximum supply of tokens in the collection |

### mint

```solidity
function mint(address to, uint256 numToMint) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| numToMint | uint256 | undefined |

### mintNesting

```solidity
function mintNesting(address to, uint256 numToMint, uint256 destinationId) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| numToMint | uint256 | undefined |
| destinationId | uint256 | undefined |

### name

```solidity
function name() external view returns (string)
```

Used to retrieve the collection name.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string Name of the collection |

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

### owner

```solidity
function owner() external view returns (address)
```

Returns the address of the current owner.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

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

### pricePerMint

```solidity
function pricePerMint() external view returns (uint256)
```

Used to retrieve the price per mint.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 The price per mint of a single token expressed in the lowest denomination of a native currency |

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

*Effecitvely deletes the pending array.Requirements:  - The caller must own the token or be approved to manage the token&#39;s resources  - `tokenId` must exist.  - If there are more resouces than `maxRejections`, the execution will be revertedEmits a {ResourceRejected} event with resourceId = 0.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token of which to clear the pending array |
| maxRejections | uint256 | The maximum amount of resources to reject |

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
| resourceId | uint64 | ID of the resource expected to be located at the specified index |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```

Leaves the contract without owner. Functions using the `onlyOwner` modifier will be disabled.

*Can only be called by the current owner.Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is  only available to the owner.*


### revokeContributor

```solidity
function revokeContributor(address contributor) external nonpayable
```

Removes a contributor from the smart contract.

*Can only be called by the owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor | address | Address of the contributor&#39;s account |

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

### royaltyInfo

```solidity
function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount)
```

Used to retrieve the information about who shall receive royalties of a sale of the specified token and  how much they will be.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which the royalty info is being retrieved |
| salePrice | uint256 | Price of the token sale |

#### Returns

| Name | Type | Description |
|---|---|---|
| receiver | address | The beneficiary receiving royalties of the sale |
| royaltyAmount | uint256 | The value of the royalties recieved by the `receiver` from the sale |

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

### setLock

```solidity
function setLock() external nonpayable
```

Locks the operation.

*Once locked, functions using `notLocked` modifier cannot be executed.*


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
| priorities | uint16[] | An array of priorities of active resources. The succesion of items in the priorities array  matches that of the succesion of items in the active array |

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
function tokenURI(uint256) external view returns (string)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### totalResources

```solidity
function totalResources() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

Used to retrieve the total supply of the tokens in a collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 The number of tokens in a collection |

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

### updateRoyaltyRecipient

```solidity
function updateRoyaltyRecipient(address newRoyaltyRecipient) external nonpayable
```

Used to update recipient of royalties.

*Custom access control has to be implemented to ensure that only the intended actors can update the  beneficiary.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newRoyaltyRecipient | address | Address of the new recipient of royalties |

### withdrawRaised

```solidity
function withdrawRaised(address to, uint256 amount) external nonpayable
```

Used to withdraw the minting proceedings to a specified address.

*This function can only be called by the owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | Address to receive the given amount of minting proceedings |
| amount | uint256 | The amount to withdraw |



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

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

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

### RMRKMintOverMax

```solidity
error RMRKMintOverMax()
```

Attempting to mint a number of tokens that would cause the total supply to be greater than maximum supply




### RMRKMintToNonRMRKImplementer

```solidity
error RMRKMintToNonRMRKImplementer()
```

Attempting to mint a nested token to a smart contract that doesn&#39;t support nesting




### RMRKMintUnderpriced

```solidity
error RMRKMintUnderpriced()
```






### RMRKMintZero

```solidity
error RMRKMintZero()
```






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





