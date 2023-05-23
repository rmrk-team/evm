# RMRKSoulboundPerTokenUpgradeable

*RMRK team*

> RMRKSoulboundPerTokenUpgradeable

Smart contract of the upgradeable RMRK Soulbound module where the transfers are permitted or prohibited on a per-token basis.



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

### isTransferable

```solidity
function isTransferable(uint256 tokenId, address from, address to) external view returns (bool)
```

Used to check whether the given token is transferable or not.

*If this function returns `false`, the transfer of the token MUST revert execution.If the tokenId does not exist, this method MUST revert execution, unless the token is being checked for  minting.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token being checked |
| from | address | Address from which the token is being transferred |
| to | address | Address to which the token is being transferred |

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
event Soulbound(uint256 indexed tokenId, bool state)
```

Emitted when a token&#39;s soulbound state changes.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token |
| state  | bool | A boolean value signifying whether the token became soulbound (`true`) or transferrable (`false`) |



