# RMRKTokenURIUpgradeable

*RMRK team*

> RMRKTokenURIUpgradeable

Implementation of upgradeable token URI with option to be enumerable.



## Methods

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```

Used to retrieve the metadata URI of a token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to retrieve the metadata URI for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | Metadata URI of the specified token |



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



