# RMRKCoreUpgradeable

*RMRK team*

> RMRKCoreUpgradeable

Upgradeable smart contract of the RMRK core module.

*This is currently just a passthrough contract which allows for granular editing of base-level ERC721 functions.*

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
| _0 | string | Version identifier of the smart contract |

### initialize

```solidity
function initialize(string name_, string symbol_) external nonpayable
```

Used to initialize the smart contract.



#### Parameters

| Name | Type | Description |
|---|---|---|
| name_ | string | Name of the token collection |
| symbol_ | string | Symbol of the token collection |

### name

```solidity
function name() external view returns (string)
```

Used to retrieve the collection name.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | Name of the collection |

### symbol

```solidity
function symbol() external view returns (string)
```

Used to retrieve the collection symbol.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | Symbol of the collection |




## Errors

### RMRKAlreadyInitialized

```solidity
error RMRKAlreadyInitialized()
```

Attempting to call an initialize of an already initalized contract





