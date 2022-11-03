# RMRKMultiResourceRenderUtils







*Extra utility functions for composing RMRK resources.*

## Methods

### getPendingResourceByIndex

```solidity
function getPendingResourceByIndex(address target, uint256 tokenId, uint256 index) external view returns (string)
```

Returns resource meta at `index` of pending resource array on `tokenId` Requirements: - `tokenId` must exist. - `index` must be inside the range of pending resource array



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| tokenId | uint256 | undefined |
| index | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### getResourceByIndex

```solidity
function getResourceByIndex(address target, uint256 tokenId, uint256 index) external view returns (string)
```

Returns resource meta at `index` of active resource array on `tokenId` Requirements: - `tokenId` must exist. - `index` must be inside the range of active resource array



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| tokenId | uint256 | undefined |
| index | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### getResourcesById

```solidity
function getResourcesById(address target, uint64[] resourceIds) external view returns (string[])
```

Returns resource meta strings for the given ids Requirements: - `resourceIds` must exist.



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| resourceIds | uint64[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string[] | undefined |

### getTopResourceMetaForToken

```solidity
function getTopResourceMetaForToken(address target, uint256 tokenId) external view returns (string)
```

Returns the resource meta with the highest priority for the given token



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

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




## Errors

### RMRKTokenHasNoResources

```solidity
error RMRKTokenHasNoResources()
```

Attempting to determine the resource with the top priority on a token without resources





