# RMRKSoulbound

*RMRK team*

> RMRKSoulbound

Smart contract of the RMRK Soulbound module.



## Methods

### isTransferable

```solidity
function isTransferable(uint256, address from, address to) external view returns (bool)
```

Used to check whether the given token is transferable or not.

*If this function returns `false`, the transfer of the token MUST revert execution.If the tokenId does not exist, this method MUST revert execution, unless the token is being checked for  minting.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |
| from | address | Address from which the token is being transferred |
| to | address | Address to which the token is being transferred |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | Boolean value indicating whether the given token is transferable |

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




