# RMRKSoulboundAfterTransactionsUpgradeable

*RMRK team*

> RMRKSoulboundAfterTransactionsUpgradeable

Smart contract of the upgradeable RMRK Soulbound module where transfers are allowed for a limited a number of  transfers.



## Methods

### RMRK_INTERFACE

```solidity
function RMRK_INTERFACE() external view returns (bytes4)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes4 | undefined |

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

Gets the maximum number of transfers before a token becomes soulbound.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Maximum number of transfers before a token becomes soulbound |

### getTransfersPerToken

```solidity
function getTransfersPerToken(uint256 tokenId) external view returns (uint256)
```

Gets the current number of transfer the specified token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Number of the token&#39;s transfers to date |

### isTransferable

```solidity
function isTransferable(uint256 tokenId, address, address) external view returns (bool)
```

Used to check whether the given token is transferable or not.

*If this function returns `false`, the transfer of the token MUST revert execution.If the tokenId does not exist, this method MUST revert execution, unless the token is being checked for  minting.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token being checked |
| _1 | address | undefined |
| _2 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | Boolean value indicating whether the given token is transferable |

### name

```solidity
function name() external view returns (string)
```

Used to retrieve the collection name.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | Name of the collection |

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
| _0 | string | Symbol of the collection |



## Events

### Initialized

```solidity
event Initialized(uint8 version)
```



*Triggered when the contract has been initialized or reinitialized.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### Soulbound

```solidity
event Soulbound(uint256 indexed tokenId)
```

Emitted when a token becomes soulbound.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token |



