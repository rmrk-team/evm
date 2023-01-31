# RMRKSoulboundAfterTransactions

*RMRK team*

> RMRKSoulbound variant where transfers are allowed for a limited a number of transfers

Smart contract of the RMRK Soulbound after a number of transactions module.



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

### getMaxNumberOfTransfers

```solidity
function getMaxNumberOfTransfers() external view returns (uint256)
```

Gets the max number of transfers before a token becomes soulbound




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Max number of transfer   s before a token becomes soulbound |

### getTransfersPerToken

```solidity
function getTransfersPerToken(uint256 tokenId) external view returns (uint256)
```

Gets the current number of transfer for a specific token



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Number of transfers for the token |

### isSoulbound

```solidity
function isSoulbound(uint256 tokenId) external view returns (bool)
```

Used to check whether the given token is soulbound or not.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token being checked |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | Boolean value indicating whether the given token is soulbound |

### name

```solidity
function name() external view returns (string)
```

Used to retrieve the collection name.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string Name of the collection |

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




