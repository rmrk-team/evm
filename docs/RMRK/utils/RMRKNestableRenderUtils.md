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





#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | undefined |
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| directOwner | address | undefined |
| ownerId | uint256 | undefined |
| isNFT | bool | undefined |
| inParentsActiveChildren | bool | undefined |
| inParentsPendingChildren | bool | undefined |

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

### isTokenRejectedOrAbandoned

```solidity
function isTokenRejectedOrAbandoned(address collection, uint256 tokenId) external view returns (bool isRejectedOrAbandoned)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | undefined |
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| isRejectedOrAbandoned | bool | undefined |

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





