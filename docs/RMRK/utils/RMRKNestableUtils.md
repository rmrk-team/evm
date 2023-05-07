# RMRKNestableUtils

*RMRK team*

> RMRKNestableUtils

Smart contract of the RMRK Nestable  utils module.



## Methods

### validateChildOf

```solidity
function validateChildOf(address parentAddress, address childAddress, uint256 parentId, uint256 childId) external view returns (bool)
```

Used to validate whether the specified child token is owned by a given parent token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the parent token&#39;s collection smart contract |
| childAddress | address | Address of the child token&#39;s colection smart contract |
| parentId | uint256 | ID of the parent token |
| childId | uint256 | ID of the child token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | A boolean value indicating whether the child token is owned by the parent token or not |

### validateChildrenOf

```solidity
function validateChildrenOf(address parentAddress, address[] childAddresses, uint256 parentId, uint256[] childIds) external view returns (bool, address[], uint256[])
```

Used to validate whether the specified child token is owned by a given parent token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the parent token&#39;s collection smart contract |
| childAddresses | address[] | An array of the child token&#39;s colection smart contract addresses |
| parentId | uint256 | ID of the parent token |
| childIds | uint256[] | An array of child token IDs to verify |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | A boolean value indicating whether all of the child tokens are owned by the parent token or not |
| _1 | address[] | An array of token IDs of child tokens that are not owned by the parent token |
| _2 | uint256[] | undefined |




## Errors

### RMRKMismachedArrayLength

```solidity
error RMRKMismachedArrayLength()
```

Attempting to pass complementary arrays of different lengths





