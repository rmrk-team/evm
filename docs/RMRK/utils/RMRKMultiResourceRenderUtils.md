# RMRKMultiResourceRenderUtils







*Extra utility functions for composing RMRK resources.*

## Methods

### getActiveResources

```solidity
function getActiveResources(address target, uint256 tokenId) external view returns (struct RMRKMultiResourceRenderUtils.ActiveResource[])
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | RMRKMultiResourceRenderUtils.ActiveResource[] | undefined |

### getPendingResources

```solidity
function getPendingResources(address target, uint256 tokenId) external view returns (struct RMRKMultiResourceRenderUtils.PendingResource[])
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | RMRKMultiResourceRenderUtils.PendingResource[] | undefined |

### getResourcesById

```solidity
function getResourcesById(address target, uint256 tokenId, uint64[] resourceIds) external view returns (string[])
```

Returns resource metadata strings for the given ids Requirements: - `resourceIds` must exist.



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| tokenId | uint256 | undefined |
| resourceIds | uint64[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string[] | undefined |

### getTopResourceMetaForToken

```solidity
function getTopResourceMetaForToken(address target, uint256 tokenId) external view returns (string)
```

Returns the resource metadata with the highest priority for the given token



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | undefined |
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |




## Errors

### RMRKTokenHasNoResources

```solidity
error RMRKTokenHasNoResources()
```

Attempting to determine the resource with the top priority on a token without resources





