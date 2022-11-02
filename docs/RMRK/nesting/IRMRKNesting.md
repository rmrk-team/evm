# IRMRKNesting









## Methods

### acceptChild

```solidity
function acceptChild(uint256 parentTokenId, uint256 index) external nonpayable
```



*Function called to accept a pending child. Migrates the child at `index` on `parentTokenId` to the accepted children array. Requirements: - `parentTokenId` must exist*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentTokenId | uint256 | undefined |
| index | uint256 | undefined |

### addChild

```solidity
function addChild(uint256 parentTokenId, uint256 childTokenId) external nonpayable
```



*Function to be called into by other instances of RMRK nesting contracts to update the `child` struct of the parent. Requirements: - `ownerOf` on the child contract must resolve to the called contract. - the pending array of the parent contract must not be full.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentTokenId | uint256 | undefined |
| childTokenId | uint256 | undefined |

### burn

```solidity
function burn(uint256 tokenId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

### burnChild

```solidity
function burnChild(uint256 tokenId, uint256 childIndex) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| childIndex | uint256 | undefined |

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



*Returns array of child objects existing for `parentTokenId`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentTokenId | uint256 | undefined |

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



*Returns array of pending child objects existing for `parentTokenId`.*

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
function rejectAllChildren(uint256 parentTokenId) external nonpayable
```



*Function called to reject all pending children. Removes the children from the pending array mapping. The children&#39;s ownership structures are not updated. Requirements: - `parentTokenId` must exist*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentTokenId | uint256 | undefined |

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
function unnestChild(uint256 tokenId, uint256 index, address to, bool isPending) external nonpayable
```



*Function called to unnest a child from `tokenId`&#39;s child array. The owner of the token is set to `to`, or is not updated in the event `to` is the zero address Requirements: - `tokenId` must exist*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| index | uint256 | undefined |
| to | address | undefined |
| isPending | bool | undefined |



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
event ChildAccepted(uint256 indexed tokenId, address indexed childAddress, uint256 indexed childId, uint256 childIndex)
```



*emitted when a child NFT accepts a token from its pending array, migrating it to the active array.*

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



*emitted when a child NFT is added to a token&#39;s pending array*

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



*emitted when a token unnests a child from itself, transferring ownership to the root owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| childAddress `indexed` | address | undefined |
| childId `indexed` | uint256 | undefined |
| childIndex  | uint256 | undefined |
| fromPending  | bool | undefined |



