# RMRKMultiAssetRenderUtils

*RMRK team*

> RMRKMultiAssetRenderUtils





## Methods

### getAssetIdWithTopPriority

```solidity
function getAssetIdWithTopPriority(address target, uint256 tokenId) external view returns (uint64, uint64)
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
| _1 | uint64 | The priority value of the asset with the highest priority |

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
| _0 | string[] | An array of metadata URIs belonging to specified assets |

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
| _0 | RMRKMultiAssetRenderUtils.ExtendedActiveAsset[] | An array of ActiveAssets present on the given token |

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
| _0 | RMRKMultiAssetRenderUtils.PendingAsset[] | An array of PendingAssets present on the given token |

### getTopAsset

```solidity
function getTopAsset(address target, uint256 tokenId) external view returns (uint64 topAssetId, uint64 topAssetPriority, string topAssetMetadata)
```

Used to retrieve ID, priority value and metadata URI of the asset with the highest priority that is  present on a specified token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Collection smart contract of the token for which to retireve the top asset |
| tokenId | uint256 | ID of the token for which to retrieve the top asset |

#### Returns

| Name | Type | Description |
|---|---|---|
| topAssetId | uint64 | ID of the asset with the highest priority |
| topAssetPriority | uint64 | Priotity value of the asset with the highest priority |
| topAssetMetadata | string | Metadata URI of the asset with the highest priority |

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
| _0 | string | The metadata URI of the asset with the highest priority |




## Errors

### RMRKTokenHasNoAssets

```solidity
error RMRKTokenHasNoAssets()
```

Attempting to determine the asset with the top priority on a token without assets





