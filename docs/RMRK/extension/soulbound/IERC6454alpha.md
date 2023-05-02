# IERC6454alpha

*RMRK team*

> IERC6454alpha

A minimal extension to identify the transferability of Non-Fungible Tokens.



## Methods

### isTransferable

```solidity
function isTransferable(uint256 tokenId, address from, address to) external view returns (bool)
```

Used to check whether the given token is transferable or not based on source and destination address.

*If this function returns `false`, the transfer of the token MUST revert executionIf the tokenId does not exist, this method MUST revert execution*

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

### isTransferable

```solidity
function isTransferable(uint256 tokenId) external view returns (bool)
```

Used to check whether the given token is transferable or not.

*If this function returns `false`, the transfer of the token MUST revert executionIf the tokenId does not exist, this method MUST revert execution*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token being checked |

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




