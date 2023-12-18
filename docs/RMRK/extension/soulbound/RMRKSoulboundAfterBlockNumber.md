# RMRKSoulboundAfterBlockNumber

*RMRK team*

> RMRKSoulboundAfterBlockNumber

Smart contract of the RMRK Soulbound module where transfers are only allowed until a certain block number.



## Methods

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
function isTransferable(uint256, address, address) external view returns (bool isTransferable_)
```

Used to check whether the given token is transferable or not.

*If this function returns `false`, the transfer of the token MUST revert execution.If the tokenId does not exist, this method MUST revert execution, unless the token is being checked for  minting.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |
| _1 | address | undefined |
| _2 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| isTransferable_ | bool | Boolean value indicating whether the given token is transferable |

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




