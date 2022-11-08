# RMRKSoulboundNestingMock









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

Sends an instance of Child from the pending children array at index to children array for tokenId.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | tokenId of parent token to accept a child on |
| childIndex | uint256 | index of child in _pendingChildren array to accept. |
| childAddress | address | address of the child expected to be in the index. |
| childId | uint256 | token Id of the child expected to be in the index |

### addChild

```solidity
function addChild(uint256 parentId, uint256 childId) external nonpayable
```



*Function designed to be used by other instances of RMRK-Core contracts to update children. param1 parentId is the tokenId of the parent token on (this). param2 childId is the tokenId of the child instance*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | undefined |
| childId | uint256 | undefined |

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

### balancePerNftOf

```solidity
function balancePerNftOf(address owner, uint256 parentId) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |
| parentId | uint256 | undefined |

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

### burn

```solidity
function burn(uint256 tokenId, uint256 maxChildrenBurns) external nonpayable returns (uint256)
```



*Destroys `tokenId`. The approval is cleared when the token is burned. Requirements: - `tokenId` must exist. Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| maxChildrenBurns | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

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
function childOf(uint256 parentId, uint256 index) external view returns (struct IRMRKNesting.Child)
```



*Returns a single child object existing at `index` on `parentId`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | undefined |
| index | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNesting.Child | undefined |

### childrenOf

```solidity
function childrenOf(uint256 parentId) external view returns (struct IRMRKNesting.Child[])
```

Returns all confirmed children



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNesting.Child[] | undefined |

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
function pendingChildOf(uint256 parentId, uint256 index) external view returns (struct IRMRKNesting.Child)
```



*Returns a single pending child object existing at `index` on `parentId`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | undefined |
| index | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNesting.Child | undefined |

### pendingChildrenOf

```solidity
function pendingChildrenOf(uint256 parentId) external view returns (struct IRMRKNesting.Child[])
```

Returns all pending children



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | undefined |

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
function unnestChild(uint256 tokenId, address to, uint256 childIndex, address childAddress, uint256 childId, bool isPending) external nonpayable
```

Function to unnest a child from the active token array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | is the tokenId of the parent token to unnest from. |
| to | address | is the address to transfer this |
| childIndex | uint256 | is the index of the child token ID. |
| childAddress | address | address of the child expected to be in the index. |
| childId | uint256 | token Id of the child expected to be in the index |
| isPending | bool | Boolean value indicating whether the token is in the pending array of the parent (`true`) or in  the active array (`false`) |



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

### ChildAccepted

```solidity
event ChildAccepted(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId)
```





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





#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| fromTokenId  | uint256 | undefined |
| toTokenId  | uint256 | undefined |
| tokenId `indexed` | uint256 | undefined |

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




### RMRKIdZeroForbidden

```solidity
error RMRKIdZeroForbidden()
```

Attempting to use ID 0, which is not supported

*The ID 0 in RMRK suite is reserved for empty values. Guarding against its use ensures the expected operation*


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




### RMRKNotApprovedOrDirectOwner

```solidity
error RMRKNotApprovedOrDirectOwner()
```

Attempting to interact with a token without being its owner or having been granted permission by the  owner to do so

*When a token is nested, only the direct owner (NFT parent) can mange it. In that case, approved addresses are  not allowed to manage it, in order to ensure the expected behaviour*


### RMRKPendingChildIndexOutOfRange

```solidity
error RMRKPendingChildIndexOutOfRange()
```

Attempting to interact with a pending child using an index greater than the size of pending array




### RMRKUnexpectedChildId

```solidity
error RMRKUnexpectedChildId()
```

Attempting to accept or unnest a child which does not match the one at the specified index





