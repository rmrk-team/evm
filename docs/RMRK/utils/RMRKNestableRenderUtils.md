# RMRKNestableRenderUtils

*RMRK team*

> RMRKNestableRenderUtils

Smart contract of the RMRK Nestable render utils module.



## Methods

### checkExpectedParent

```solidity
function checkExpectedParent(address childAddress, uint256 childId, address expectedParent, uint256 expectedParentId) external view
```

Check if the child is owned by the expected parent.

*Reverts if child token is not owned by an NFT.Reverts if child token is not owned by the expected parent.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| childAddress | address | Address of the child contract |
| childId | uint256 | ID of the child token |
| expectedParent | address | Address of the expected parent contract |
| expectedParentId | uint256 | ID of the expected parent token |

### directOwnerOfWithParentsPerspective

```solidity
function directOwnerOfWithParentsPerspective(address collection, uint256 tokenId) external view returns (address directOwner, uint256 ownerId, bool isNFT, bool inParentsActiveChildren, bool inParentsPendingChildren)
```

Used to retrieve the immediate owner of the given token, and whether it is on the parent&#39;s active or pending children list.

*If the immediate owner is not an NFT, the function returns false for both `inParentsActiveChildren` and `inParentsPendingChildren`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | Address of the token&#39;s collection smart contract |
| tokenId | uint256 | ID of the token |

#### Returns

| Name | Type | Description |
|---|---|---|
| directOwner | address | Address of the given token&#39;s owner |
| ownerId | uint256 | The ID of the parent token. Should be `0` if the owner is an externally owned account |
| isNFT | bool | The boolean value signifying whether the owner is an NFT or not |
| inParentsActiveChildren | bool | A boolean value signifying whether the token is in the parent&#39;s active children list |
| inParentsPendingChildren | bool | A boolean value signifying whether the token is in the parent&#39;s pending children list |

### getChildIndex

```solidity
function getChildIndex(address parentAddress, uint256 parentId, address childAddress, uint256 childId) external view returns (uint256)
```

Used to retrieve the given child&#39;s index in its parent&#39;s child tokens array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the parent token&#39;s collection smart contract |
| parentId | uint256 | ID of the parent token |
| childAddress | address | Address of the child token&#39;s colection smart contract |
| childId | uint256 | ID of the child token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The index of the child token in the parent token&#39;s child tokens array |

### getParent

```solidity
function getParent(address childAddress, uint256 childId) external view returns (address parentAddress, uint256 parentId)
```

Used to retrieve the contract address and ID of the parent token of the specified child token.

*Reverts if child token is not owned by an NFT.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| childAddress | address | Address of the child token&#39;s collection smart contract |
| childId | uint256 | ID of the child token |

#### Returns

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the parent token&#39;s collection smart contract |
| parentId | uint256 | ID of the parent token |

### getPendingChildIndex

```solidity
function getPendingChildIndex(address parentAddress, uint256 parentId, address childAddress, uint256 childId) external view returns (uint256)
```

Used to retrieve the given child&#39;s index in its parent&#39;s pending child tokens array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the parent token&#39;s collection smart contract |
| parentId | uint256 | ID of the parent token |
| childAddress | address | Address of the child token&#39;s colection smart contract |
| childId | uint256 | ID of the child token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The index of the child token in the parent token&#39;s pending child tokens array |

### getTotalDescendants

```solidity
function getTotalDescendants(address collection, uint256 tokenId) external view returns (uint256 totalDescendants, bool hasMoreThanOneLevelOfNesting_)
```

Used to retrieve the total number of descendants of the given token and whether it has more than one level of nesting.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | Address of the token&#39;s collection smart contract |
| tokenId | uint256 | ID of the token |

#### Returns

| Name | Type | Description |
|---|---|---|
| totalDescendants | uint256 | The total number of descendants of the given token |
| hasMoreThanOneLevelOfNesting_ | bool | A boolean value indicating whether the given token has more than one level of nesting |

### hasMoreThanOneLevelOfNesting

```solidity
function hasMoreThanOneLevelOfNesting(address collection, uint256 tokenId) external view returns (bool)
```

Used to retrieve whether a token has more than one level of nesting.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | Address of the token&#39;s collection smart contract |
| tokenId | uint256 | ID of the token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | A boolean value indicating whether the given token has more than one level of nesting |

### isTokenRejectedOrAbandoned

```solidity
function isTokenRejectedOrAbandoned(address collection, uint256 tokenId) external view returns (bool isRejectedOrAbandoned)
```

Used to identify if the given token is rejected or abandoned. That is, it&#39;s parent is an NFT but this token is neither on the parent&#39;s active nor pending children list.

*Returns false if the immediate owner is not an NFT.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | Address of the token&#39;s collection smart contract |
| tokenId | uint256 | ID of the token |

#### Returns

| Name | Type | Description |
|---|---|---|
| isRejectedOrAbandoned | bool | Whether the token is rejected or abandoned |

### validateChildOf

```solidity
function validateChildOf(address parentAddress, address childAddress, uint256 parentId, uint256 childId) external view returns (bool)
```

Used to validate whether the specified child token is owned by a given parent token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the parent token&#39;s collection smart contract |
| childAddress | address | Address of the child token&#39;s collection smart contract |
| parentId | uint256 | ID of the parent token |
| childId | uint256 | ID of the child token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | A boolean value indicating whether the child token is owned by the parent token or not |

### validateChildrenOf

```solidity
function validateChildrenOf(address parentAddress, address[] childAddresses, uint256 parentId, uint256[] childIds) external view returns (bool, bool[])
```

Used to validate whether the specified child token is owned by a given parent token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the parent token&#39;s collection smart contract |
| childAddresses | address[] | An array of the child token&#39;s collection smart contract addresses |
| parentId | uint256 | ID of the parent token |
| childIds | uint256[] | An array of child token IDs to verify |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | A boolean value indicating whether all of the child tokens are owned by the parent token or not |
| _1 | bool[] | An array of boolean values indicating whether each of the child tokens are owned by the parent token or  not |




## Errors

### RMRKChildNotFoundInParent

```solidity
error RMRKChildNotFoundInParent()
```

Attempting to find the index of a child token on a parent which does not own it.




### RMRKMismachedArrayLength

```solidity
error RMRKMismachedArrayLength()
```

Attempting to pass complementary arrays of different lengths




### RMRKParentIsNotNFT

```solidity
error RMRKParentIsNotNFT()
```

Attempting an operation requiring the token being nested, while it is not




### RMRKUnexpectedParent

```solidity
error RMRKUnexpectedParent()
```

Attempting an operation expecting a parent to the token which is not the actual one





