# RMRKMultiResourceRenderUtils

*RMRK team*

> RMRKMultiResourceRenderUtils

Interface smart contract of the RMRK Multi resource render utils module.



## Methods

### getActiveResources

```solidity
function getActiveResources(address target, uint256 tokenId) external view returns (struct RMRKMultiResourceRenderUtils.ActiveResource[])
```

Used to get the active resources of the given token.

*The full `ActiveResource` looks like this:  [      id,      priority,      metadata  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the active resources for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | RMRKMultiResourceRenderUtils.ActiveResource[] | struct[] An array of ActiveResources present on the given token |

### getPendingResources

```solidity
function getPendingResources(address target, uint256 tokenId) external view returns (struct RMRKMultiResourceRenderUtils.PendingResource[])
```

Used to get the pending resources of the given token.

*The full `PendingResource` looks like this:  [      id,      acceptRejectIndex,      overwritesResourceWithId,      metadata  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the pending resources for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | RMRKMultiResourceRenderUtils.PendingResource[] | struct[] An array of PendingResources present on the given token |

### getResourcesById

```solidity
function getResourcesById(address target, uint256 tokenId, uint64[] resourceIds) external view returns (string[])
```

Used to retriece the metadata URI of specified resources in the specified token.

*Requirements:  - `resourceIds` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the specified resources for |
| resourceIds | uint64[] | [] An array of resource IDs for which to retrieve the metadata URIs |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string[] | string[] An array of metadata URIs belonging to specified resources |

### getTopResourceMetaForToken

```solidity
function getTopResourceMetaForToken(address target, uint256 tokenId) external view returns (string)
```

Used to retrieve the metadata URI of the specified token&#39;s resource with the highest priority.



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token for which to retrieve the metadata URI of the resource with the highest priority |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string The metadata URI of the resource with the highest priority |




## Errors

### RMRKTokenHasNoResources

```solidity
error RMRKTokenHasNoResources()
```

Attempting to determine the resource with the top priority on a token without resources





