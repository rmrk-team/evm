# RMRKMultiAssetRenderUtils

*RMRK team*

> RMRKMultiAssetRenderUtils





## Methods

### getAssetIdWithTopPriority

```solidity
function getAssetIdWithTopPriority(address target, uint256 tokenId) external view returns (uint64, uint16)
```

Used to retrieve the ID of the specified token&#39;s asset with the highest priority.



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token for which to retrieve the ID of the asset with the highest priority |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64 | The ID of the asset with the highest priority |
| _1 | uint16 | The priority value of the asset with the highest priority |

### getAssetsById

```solidity
function getAssetsById(address target, uint256 tokenId, uint64[] assetIds) external view returns (string[])
```

Used to retrieve the metadata URI of specified assets in the specified token.

*Requirements:  - `assetIds` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the specified assets for |
| assetIds | uint64[] | [] An array of asset IDs for which to retrieve the metadata URIs |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string[] | string[] An array of metadata URIs belonging to specified assets |

### getExtendedActiveAssets

```solidity
function getExtendedActiveAssets(address target, uint256 tokenId) external view returns (struct RMRKMultiAssetRenderUtils.ExtendedActiveAsset[])
```

Used to get the active assets of the given token.

*The full `ExtendedActiveAsset` looks like this:  [      id,      priority,      metadata  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the active assets for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | RMRKMultiAssetRenderUtils.ExtendedActiveAsset[] | struct[] An array of ActiveAssets present on the given token |

### getPendingAssets

```solidity
function getPendingAssets(address target, uint256 tokenId) external view returns (struct RMRKMultiAssetRenderUtils.PendingAsset[])
```

Used to get the pending assets of the given token.

*The full `PendingAsset` looks like this:  [      id,      acceptRejectIndex,      replacesAssetWithId,      metadata  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the pending assets for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | RMRKMultiAssetRenderUtils.PendingAsset[] | struct[] An array of PendingAssets present on the given token |

### getTopAssetMetaForToken

```solidity
function getTopAssetMetaForToken(address target, uint256 tokenId) external view returns (string)
```

Used to retrieve the metadata URI of the specified token&#39;s asset with the highest priority.



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token for which to retrieve the metadata URI of the asset with the highest priority |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string The metadata URI of the asset with the highest priority |




## Errors

### RMRKTokenHasNoAssets

```solidity
error RMRKTokenHasNoAssets()
```

Attempting to determine the asset with the top priority on a token without assets





