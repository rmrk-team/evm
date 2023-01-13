# Solidity API

## AbstractMultiAsset

Abstract Smart contract implementing most of the common logic for contracts implementing IRMRKMultiAsset

### _activeAssets

```solidity
mapping(uint256 => uint64[]) _activeAssets
```

Mapping of tokenId to an array of active assets

_Active recurses is unbounded, getting all would reach gas limit at around 30k items
so we leave this as internal in case a custom implementation needs to implement pagination_

### _pendingAssets

```solidity
mapping(uint256 => uint64[]) _pendingAssets
```

Mapping of tokenId to an array of pending assets

### _activeAssetPriorities

```solidity
mapping(uint256 => uint16[]) _activeAssetPriorities
```

Mapping of tokenId to an array of priorities for active assets

### getAssetMetadata

```solidity
function getAssetMetadata(uint256 tokenId, uint64 assetId) public view virtual returns (string)
```

Used to fetch the asset metadata of the specified token's active asset with the given index.

_Assets are stored by reference mapping `_assets[assetId]`.
Can be overriden to implement enumerate, fallback or other custom logic._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token from which to retrieve the asset metadata |
| assetId | uint64 | Asset Id, must be in the active assets array |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | string The metadata of the asset belonging to the specified index in the token's active assets  array |

### getActiveAssets

```solidity
function getActiveAssets(uint256 tokenId) public view virtual returns (uint64[])
```

Used to retrieve IDs of the active assets of given token.

_Asset data is stored by reference, in order to access the data corresponding to the ID, call
 `getAssetMetadata(tokenId, assetId)`.
You can safely get 10k_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to retrieve the IDs of the active assets |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint64[] | uint64[] An array of active asset IDs of the given token |

### getPendingAssets

```solidity
function getPendingAssets(uint256 tokenId) public view virtual returns (uint64[])
```

Used to retrieve IDs of the pending assets of given token.

_Asset data is stored by reference, in order to access the data corresponding to the ID, call
 `getAssetMetadata(tokenId, assetId)`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to retrieve the IDs of the pending assets |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint64[] | uint64[] An array of pending asset IDs of the given token |

### getActiveAssetPriorities

```solidity
function getActiveAssetPriorities(uint256 tokenId) public view virtual returns (uint16[])
```

Used to retrieve the priorities of the active resoources of a given token.

_Asset priorities are a non-sequential array of uint16 values with an array size equal to active asset
 priorites._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which to retrieve the priorities of the active assets |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint16[] | uint16[] An array of priorities of the active assets of the given token |

### getAssetReplacements

```solidity
function getAssetReplacements(uint256 tokenId, uint64 newAssetId) public view virtual returns (uint64)
```

Used to retrieve the asset that will be replaced if a given asset from the token's pending array
 is accepted.

_Asset data is stored by reference, in order to access the data corresponding to the ID, call
 `getAssetMetadata(tokenId, assetId)`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to check |
| newAssetId | uint64 | ID of the pending asset which will be accepted |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint64 | uint64 ID of the asset which will be replaced |

### isApprovedForAllForAssets

```solidity
function isApprovedForAllForAssets(address owner, address operator) public view virtual returns (bool)
```

Used to check whether the address has been granted the operator role by a given address or not.

_See {setApprovalForAllForAssets}._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | Address of the account that we are checking for whether it has granted the operator role |
| operator | address | Address of the account that we are checking whether it has the operator role or not |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool The boolean value indicating wehter the account we are checking has been granted the operator role |

### setApprovalForAllForAssets

```solidity
function setApprovalForAllForAssets(address operator, bool approved) public virtual
```

Used to add or remove an operator of assets for the caller.

_Operators can call {acceptAsset}, {rejectAsset}, {rejectAllAssets} or {setPriority} for any token
 owned by the caller.
Requirements:

 - The `operator` cannot be the caller.
Emits an {ApprovalForAllForAssets} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| operator | address | Address of the account to which the operator role is granted or revoked from |
| approved | bool | The boolean value indicating whether the operator role is being granted (`true`) or revoked  (`false`) |

### _acceptAsset

```solidity
function _acceptAsset(uint256 tokenId, uint256 index, uint64 assetId) internal virtual
```

Used to accept a pending asset.

_The call is reverted if there is no pending asset at a given index._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which to accept the pending asset |
| index | uint256 | Index of the asset in the pending array to accept |
| assetId | uint64 | ID of the asset to accept in token's pending array |

### _rejectAsset

```solidity
function _rejectAsset(uint256 tokenId, uint256 index, uint64 assetId) internal virtual
```

Used to reject the specified asset from the pending array.

_The call is reverted if there is no pending asset at a given index._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that the asset is being rejected from |
| index | uint256 | Index of the asset in the pending array to be rejected |
| assetId | uint64 | ID of the asset expected to be in the index |

### _rejectAllAssets

```solidity
function _rejectAllAssets(uint256 tokenId, uint256 maxRejections) internal virtual
```

Used to reject all of the pending assets for the given token.

_When rejecting all assets, the pending array is indiscriminately cleared.
If the number of pending assets is greater than the value of `maxRejections`, the exectuion will be
 reverted._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to reject all of the pending assets. |
| maxRejections | uint256 | Maximum number of expected assets to reject, used to prevent from  rejecting assets which arrive just before this operation. |

### _setPriority

```solidity
function _setPriority(uint256 tokenId, uint16[] priorities) internal virtual
```

Used to specify the priorities for a given token's active assets.

_If the length of the priorities array doesn't match the length of the active assets array, the execution
 will be reverted.
The position of the priority value in the array corresponds the position of the asset in the active
 assets array it will be applied to._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which the priorities are being set |
| priorities | uint16[] | Array of priorities for the assets |

### _addAssetEntry

```solidity
function _addAssetEntry(uint64 id, string metadataURI) internal virtual
```

Used to add an asset entry.

_If the specified ID is already used by another asset, the execution will be reverted.
This internal function warrants custom access control to be implemented when used._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint64 | ID of the asset to assign to the new asset |
| metadataURI | string | Metadata URI of the asset |

### _addAssetToToken

```solidity
function _addAssetToToken(uint256 tokenId, uint64 assetId, uint64 replacesAssetWithId) internal virtual
```

Used to add an asset to a token.

_If the given asset is already added to the token, the execution will be reverted.
If the asset ID is invalid, the execution will be reverted.
If the token already has the maximum amount of pending assets (128), the execution will be
 reverted._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to add the asset to |
| assetId | uint64 | ID of the asset to add to the token |
| replacesAssetWithId | uint64 | ID of the asset to replace from the token's list of active assets |

### _beforeAddAsset

```solidity
function _beforeAddAsset(uint64 id, string metadataURI) internal virtual
```

Hook that is called before an asset is added.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint64 | ID of the asset |
| metadataURI | string | Metadata URI of the asset |

### _afterAddAsset

```solidity
function _afterAddAsset(uint64 id, string metadataURI) internal virtual
```

Hook that is called after an asset is added.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint64 | ID of the asset |
| metadataURI | string | Metadata URI of the asset |

### _beforeAddAssetToToken

```solidity
function _beforeAddAssetToToken(uint256 tokenId, uint64 assetId, uint64 replacesAssetWithId) internal virtual
```

Hook that is called before adding an asset to a token's pending assets array.

_If the asset doesn't intend to replace another asset, the `replacesAssetWithId` value should be `0`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to which the asset is being added |
| assetId | uint64 | ID of the asset that is being added |
| replacesAssetWithId | uint64 | ID of the asset that this asset is attempting to replace |

### _afterAddAssetToToken

```solidity
function _afterAddAssetToToken(uint256 tokenId, uint64 assetId, uint64 replacesAssetWithId) internal virtual
```

Hook that is called after an asset has been added to a token's pending assets array.

_If the asset doesn't intend to replace another asset, the `replacesAssetWithId` value should be `0`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to which the asset is has been added |
| assetId | uint64 | ID of the asset that is has been added |
| replacesAssetWithId | uint64 | ID of the asset that this asset is attempting to replace |

### _beforeAcceptAsset

```solidity
function _beforeAcceptAsset(uint256 tokenId, uint256 index, uint256 assetId) internal virtual
```

Hook that is called before an asset is accepted to a token's active assets array.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which the asset is being accepted |
| index | uint256 | Index of the asset in the token's pending assets array |
| assetId | uint256 | ID of the asset expected to be located at the specified `index` |

### _afterAcceptAsset

```solidity
function _afterAcceptAsset(uint256 tokenId, uint256 index, uint256 assetId) internal virtual
```

Hook that is called after an asset is accepted to a token's active assets array.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which the asset has been accepted |
| index | uint256 | Index of the asset in the token's pending assets array |
| assetId | uint256 | ID of the asset expected to have been located at the specified `index` |

### _beforeRejectAsset

```solidity
function _beforeRejectAsset(uint256 tokenId, uint256 index, uint256 assetId) internal virtual
```

Hook that is called before rejecting an asset.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token from which the asset is being rejected |
| index | uint256 | Index of the asset in the token's pending assets array |
| assetId | uint256 | ID of the asset expected to be located at the specified `index` |

### _afterRejectAsset

```solidity
function _afterRejectAsset(uint256 tokenId, uint256 index, uint256 assetId) internal virtual
```

Hook that is called after rejecting an asset.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token from which the asset has been rejected |
| index | uint256 | Index of the asset in the token's pending assets array |
| assetId | uint256 | ID of the asset expected to have been located at the specified `index` |

### _beforeRejectAllAssets

```solidity
function _beforeRejectAllAssets(uint256 tokenId) internal virtual
```

Hook that is called before rejecting all assets of a token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token from which all of the assets are being rejected |

### _afterRejectAllAssets

```solidity
function _afterRejectAllAssets(uint256 tokenId) internal virtual
```

Hook that is called after rejecting all assets of a token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token from which all of the assets have been rejected |

### _beforeSetPriority

```solidity
function _beforeSetPriority(uint256 tokenId, uint16[] priorities) internal virtual
```

Hook that is called before the priorities for token's assets is set.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which the asset priorities are being set |
| priorities | uint16[] |  |

### _afterSetPriority

```solidity
function _afterSetPriority(uint256 tokenId, uint16[] priorities) internal virtual
```

Hook that is called after the priorities for token's assets is set.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which the asset priorities have been set |
| priorities | uint16[] |  |

