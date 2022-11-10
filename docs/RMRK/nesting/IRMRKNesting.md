# IRMRKNesting









## Methods

### acceptChild

```solidity
function acceptChild(uint256 parentId, address childAddress, uint256 childId) external nonpayable
```

Sends an instance of Child from the pending children array at index to children array for tokenId.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | tokenId of parent token to accept a child on |
| childAddress | address | address of the child contract |
| childId | uint256 | token Id of the child |

### addChild

```solidity
function addChild(uint256 parentId, uint256 childId) external nonpayable
```



*Function to be called into by other instances of RMRK nesting contracts to update the `child` struct of the parent. Requirements: - `ownerOf` on the child contract must resolve to the called contract. - the pending array of the parent contract must not be full.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | undefined |
| childId | uint256 | undefined |

### burn

```solidity
function burn(uint256 tokenId, uint256 maxRecursiveBurns) external nonpayable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| maxRecursiveBurns | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### childrenOf

```solidity
function childrenOf(uint256 parentId) external view returns (struct IRMRKNesting.Child[])
```



*Returns array of child objects existing for `parentId`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNesting.Child[] | undefined |

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
function ownerOf(uint256 tokenId) external view returns (address owner)
```



*Returns the &#39;root&#39; owner of an NFT. If this is a child of another NFT, this will return an EOA address. Otherwise, it will return the immediate owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

### pendingChildrenOf

```solidity
function pendingChildrenOf(uint256 parentId) external view returns (struct IRMRKNesting.Child[])
```



*Returns array of pending child objects existing for `parentId`.*

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
function rejectAllChildren(uint256 parentId) external nonpayable
```



*Function called to reject all pending children. Removes the children from the pending array mapping. The children&#39;s ownership structures are not updated. Requirements: - `parentId` must exist*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | undefined |

### rmrkOwnerOf

```solidity
function rmrkOwnerOf(uint256 tokenId) external view returns (address, uint256, bool)
```



*Returns the immediate owner of an NFT -- if the owner is another RMRK NFT, the uint256 will reflect*

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

### unnestChild

```solidity
function unnestChild(uint256 tokenId, address to, address childAddress, uint256 childId, bool isPending) external nonpayable
```

Function to unnest a child from the active token array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | is the tokenId of the parent token to unnest from. |
| to | address | is the address to transfer this |
| childAddress | address | address of the child expected to be in the index. |
| childId | uint256 | token Id of the child expected to be in the index |
| isPending | bool | Boolean value indicating whether the token is in the pending array of the parent (`true`) or in  the active array (`false`) |



## Events

### AllChildrenRejected

```solidity
event AllChildrenRejected(uint256 indexed tokenId)
```



*emitted when a token removes all a child tokens from its pending array.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |

### ChildAccepted

```solidity
event ChildAccepted(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId)
```



*emitted when a child NFT accepts a token from its pending array, migrating it to the active array.*

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



*emitted when a child NFT is added to a token&#39;s pending array*

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



*emitted when a token unnests a child from itself, transferring ownership to the root owner.*

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



*Emitted when `tokenId` token is transferred from `from` to `to`. from indicates the immediate owner, which is a contract if nested. If token was nested, `fromTokenId` indicates former parent id. If destination is an NFT, `toTokenId` indicates the new parent id.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| fromTokenId  | uint256 | undefined |
| toTokenId  | uint256 | undefined |
| tokenId `indexed` | uint256 | undefined |



