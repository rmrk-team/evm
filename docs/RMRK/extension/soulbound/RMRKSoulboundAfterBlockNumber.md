# RMRKSoulboundAfterBlockNumber

*RMRK team*

> RMRKSoulboundAfterBlockNumber

Smart contract of the RMRK Soulbound module where transfers are only allowed until a certain block number.



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

### getLastBlockToTransfer

```solidity
function getLastBlockToTransfer() external view returns (uint256)
```

Gets the last block number where transfers are allowed




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The block number after which tokens are soulbound |

### isTransferable

```solidity
function isTransferable(uint256 tokenId, address, address) external view returns (bool)
```

Used to check whether the given token is transferable or not based on source and destination address.

*If this function returns `false`, the transfer of the token MUST revert executionIf the tokenId does not exist, this method MUST revert execution*

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

### isTransferable

```solidity
function isTransferable(uint256) external view returns (bool)
```

Used to check whether the given token is transferable or not.

*If this function returns `false`, the transfer of the token MUST revert executionIf the tokenId does not exist, this method MUST revert execution*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

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




