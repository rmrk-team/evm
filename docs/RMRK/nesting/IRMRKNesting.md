# IRMRKNesting

*RMRK team*

> IRMRKNesting

Interface smart contract of the RMRK nesting module.



## Methods

### acceptChild

```solidity
function acceptChild(uint256 parentId, uint256 childIndex, address childAddress, uint256 childId) external nonpayable
```

Used to accept a pending child token for a given parent token.

*This moves the child token from parent token&#39;s pending child tokens array into the active child tokens  array.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token for which the child token is being accepted |
| childIndex | uint256 | Index of the child token to accept in the pending children array of a given token |
| childAddress | address | Address of the collection smart contract of the child token expected to be at the specified  index |
| childId | uint256 | ID of the child token expected to be located at the specified index |

### addChild

```solidity
function addChild(uint256 parentId, uint256 childId) external nonpayable
```

Used to add a child token to a given parent token.

*This adds the iichild token into the given parent token&#39;s pending child tokens array.Requirements:  - `ownerOf` on the child contract must resolve to the called contract.  - the pending array of the parent contract must not be full.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token to receive the new child token |
| childId | uint256 | ID of the new proposed child token |

### burn

```solidity
function burn(uint256 tokenId, uint256 maxRecursiveBurns) external nonpayable returns (uint256)
```

Used to burn a given token.

*When a token is burned, all of its child tokens are recursively burned as well.When specifying the maximum recursive burns, the execution will be reverted if there are more children to be  burned.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to burn |
| maxRecursiveBurns | uint256 | Maximum number of tokens to recursively burn |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 Number of recursively burned children |

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
function ownerOf(uint256 tokenId) external view returns (address owner)
```

Used to retrieve the *root* owner of a given token.

*The *root* owner of the token is an externally owned account. If the given token is child of another NFT,  this will return an EOA address. Otherwise, it will return the immediate owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which the *root* owner has been retrieved |

#### Returns

| Name | Type | Description |
|---|---|---|
| owner | address | The *root* owner of the token |

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
function rejectAllChildren(uint256 parentId) external nonpayable
```

Used to reject all pending children of a given parent token.

*Removes the children from the pending array mapping.The children&#39;s ownership structures are not updated.Requirements: Requirements: - `parentId` must exist*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token for which to reject all of the pending tokens |

### rmrkOwnerOf

```solidity
function rmrkOwnerOf(uint256 tokenId) external view returns (address, uint256, bool)
```

Used to retrieve the immediate owner of the given token.

*If the immediate owner is another token, the address returned, should be the one of the parent token&#39;s  collection smart contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which the RMRK owner is being retrieved |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address Address of the given token&#39;s owner |
| _1 | uint256 | uint256 The ID of the parent token. Should be `0` if the owner is an externally owned account |
| _2 | bool | bool The boolean value signifying whether the owner is an NFT or not |

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
function unnestChild(uint256 tokenId, address to, uint256 childIndex, address childAddress, uint256 childId, bool isPending) external nonpayable
```

Used to unnest a child token from a given parent token.

*When unnesting a child token, the owner of the token is set to `to`, or is not updated in the event of `to`  being the `0x0` address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token from which to unnest a child token |
| to | address | Address of the new owner of the child token being unnested |
| childIndex | uint256 | Index of the child token to unnest in the array it is located in |
| childAddress | address | Address of the collection smart contract of the child token expected to be at the specified  index |
| childId | uint256 | ID of the child token expected to be located at the specified index |
| isPending | bool | A boolean value signifying whether the child token is being unnested from the pending child  tokens array (`true`) or from the active child tokens array (`false`) |



## Events

### AllChildrenRejected

```solidity
event AllChildrenRejected(uint256 indexed tokenId)
```

Used to notify listeners that all pending child tokens of a given token have been rejected.

*Emitted when a token removes all a child tokens from its pending array.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that rejected all of the pending children |

### ChildAccepted

```solidity
event ChildAccepted(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId)
```

Used to notify listeners that a new child token was accepted by the parent token.

*Emitted when a parent token accepts a token from its pending array, migrating it to the active array.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that accepted a new child token |
| childIndex  | uint256 | Index of the newly accepted child token in the parent token&#39;s active children array |
| childAddress `indexed` | address | Address of the child token&#39;s collection smart contract |
| childId `indexed` | uint256 | ID of the child token in the child token&#39;s collection smart contract |

### ChildProposed

```solidity
event ChildProposed(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId)
```

Used to notify listeners that a new token has been added to a given token&#39;s pending children array.

*Emitted when a child NFT is added to a token&#39;s pending array.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that received a new pending child token |
| childIndex  | uint256 | Index of the proposed child token in the parent token&#39;s pending children array |
| childAddress `indexed` | address | Address of the proposed child token&#39;s collection smart contract |
| childId `indexed` | uint256 | ID of the child token in the child token&#39;s collection smart contract |

### ChildUnnested

```solidity
event ChildUnnested(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId, bool fromPending)
```

Used to notify listeners a child token has been unnested from parent token.

*Emitted when a token unnests a child from itself, transferring ownership to the root owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that unnested a child token |
| childIndex  | uint256 | Index of a child in the array from which it is being unnested |
| childAddress `indexed` | address | Address of the child token&#39;s collection smart contract |
| childId `indexed` | uint256 | ID of the child token in the child token&#39;s collection smart contract |
| fromPending  | bool | A boolean value signifying whether the token was in the pending child tokens array (`true`) or  not (`false`) |

### NestTransfer

```solidity
event NestTransfer(address indexed from, address indexed to, uint256 fromTokenId, uint256 toTokenId, uint256 indexed tokenId)
```

Used to notify listeners that the token is being transferred.

*Emitted when `tokenId` token is transferred from `from` to `to`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | Address of the previous immediate owner, which is a smart contract if the token was nested. |
| to `indexed` | address | Address of the new immediate owner, which is a smart contract if the token is being nested. |
| fromTokenId  | uint256 | ID of the previous parent token. If the token was not nested before, the value should be `0` |
| toTokenId  | uint256 | ID of the new parent token. If the token is not being nested, the value should be `0` |
| tokenId `indexed` | uint256 | ID of the token being transferred |



