# Solidity API

## RMRKMultiAssetRenderUtils

### ActiveAsset

```solidity
struct ActiveAsset {
  uint64 id;
  uint16 priority;
  string metadata;
}
```

### PendingAsset

```solidity
struct PendingAsset {
  uint64 id;
  uint128 acceptRejectIndex;
  uint64 replacesAssetWithId;
  string metadata;
}
```

### getActiveAssets

```solidity
function getActiveAssets(address target, uint256 tokenId) public view virtual returns (struct RMRKMultiAssetRenderUtils.ActiveAsset[])
```

Used to get the active assets of the given token.

_The full `ActiveAsset` looks like this:
 [
     id,
     priority,
     metadata
 ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the active assets for |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct RMRKMultiAssetRenderUtils.ActiveAsset[] | struct[] An array of ActiveAssets present on the given token |

### getPendingAssets

```solidity
function getPendingAssets(address target, uint256 tokenId) public view virtual returns (struct RMRKMultiAssetRenderUtils.PendingAsset[])
```

Used to get the pending assets of the given token.

_The full `PendingAsset` looks like this:
 [
     id,
     acceptRejectIndex,
     replacesAssetWithId,
     metadata
 ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the pending assets for |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct RMRKMultiAssetRenderUtils.PendingAsset[] | struct[] An array of PendingAssets present on the given token |

### getAssetsById

```solidity
function getAssetsById(address target, uint256 tokenId, uint64[] assetIds) public view virtual returns (string[])
```

Used to retrieve the metadata URI of specified assets in the specified token.

_Requirements:

 - `assetIds` must exist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the specified assets for |
| assetIds | uint64[] |  |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string[] | string[] An array of metadata URIs belonging to specified assets |

### getTopAssetMetaForToken

```solidity
function getTopAssetMetaForToken(address target, uint256 tokenId) external view returns (string)
```

Used to retrieve the metadata URI of the specified token's asset with the highest priority.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token for which to retrieve the metadata URI of the asset with the highest priority |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | string The metadata URI of the asset with the highest priority |

