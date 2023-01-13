# Solidity API

## IRMRKMultiAsset

Interface smart contract of the RMRK multi asset module.

### AssetSet

```solidity
event AssetSet(uint64 assetId)
```

Used to notify listeners that an asset object is initialized at `assetId`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assetId | uint64 | ID of the asset that was initialized |

### AssetAddedToToken

```solidity
event AssetAddedToToken(uint256 tokenId, uint64 assetId, uint64 replacesId)
```

Used to notify listeners that an asset object at `assetId` is added to token's pending asset
 array.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that received a new pending asset |
| assetId | uint64 | ID of the asset that has been added to the token's pending assets array |
| replacesId | uint64 | ID of the asset that would be replaced |

### AssetAccepted

```solidity
event AssetAccepted(uint256 tokenId, uint64 assetId, uint64 replacesId)
```

Used to notify listeners that an asset object at `assetId` is accepted by the token and migrated
 from token's pending assets array to active assets array of the token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that had a new asset accepted |
| assetId | uint64 | ID of the asset that was accepted |
| replacesId | uint64 | ID of the asset that was replaced |

### AssetRejected

```solidity
event AssetRejected(uint256 tokenId, uint64 assetId)
```

Used to notify listeners that an asset object at `assetId` is rejected from token and is dropped
 from the pending assets array of the token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that had an asset rejected |
| assetId | uint64 | ID of the asset that was rejected |

### AssetPrioritySet

```solidity
event AssetPrioritySet(uint256 tokenId)
```

Used to notify listeners that token's prioritiy array is reordered.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that had the asset priority array updated |

### ApprovalForAssets

```solidity
event ApprovalForAssets(address owner, address approved, uint256 tokenId)
```

Used to notify listeners that owner has granted an approval to the user to manage the assets of a
 given token.

_Approvals must be cleared on transfer_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | Address of the account that has granted the approval for all token's assets |
| approved | address | Address of the account that has been granted approval to manage the token's assets |
| tokenId | uint256 | ID of the token on which the approval was granted |

### ApprovalForAllForAssets

```solidity
event ApprovalForAllForAssets(address owner, address operator, bool approved)
```

Used to notify listeners that owner has granted approval to the user to manage assets of all of their
 tokens.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | Address of the account that has granted the approval for all assets on all of their tokens |
| operator | address | Address of the account that has been granted the approval to manage the token's assets on all of  the tokens |
| approved | bool | Boolean value signifying whether the permission has been granted (`true`) or revoked (`false`) |

### acceptAsset

```solidity
function acceptAsset(uint256 tokenId, uint256 index, uint64 assetId) external
```

Accepts an asset at from the pending array of given token.

_Migrates the asset from the token's pending asset array to the token's active asset array.
Active assets cannot be removed by anyone, but can be replaced by a new asset.
Requirements:

 - The caller must own the token or be approved to manage the token's assets
 - `tokenId` must exist.
 - `index` must be in range of the length of the pending asset array.
Emits an {AssetAccepted} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which to accept the pending asset |
| index | uint256 | Index of the asset in the pending array to accept |
| assetId | uint64 | ID of the asset expected to be in the index |

### rejectAsset

```solidity
function rejectAsset(uint256 tokenId, uint256 index, uint64 assetId) external
```

Rejects an asset from the pending array of given token.

_Removes the asset from the token's pending asset array.
Requirements:

 - The caller must own the token or be approved to manage the token's assets
 - `tokenId` must exist.
 - `index` must be in range of the length of the pending asset array.
Emits a {AssetRejected} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that the asset is being rejected from |
| index | uint256 | Index of the asset in the pending array to be rejected |
| assetId | uint64 | ID of the asset expected to be in the index |

### rejectAllAssets

```solidity
function rejectAllAssets(uint256 tokenId, uint256 maxRejections) external
```

Rejects all assets from the pending array of a given token.

_Effecitvely deletes the pending array.
Requirements:

 - The caller must own the token or be approved to manage the token's assets
 - `tokenId` must exist.
Emits a {AssetRejected} event with assetId = 0._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token of which to clear the pending array. |
| maxRejections | uint256 | Maximum number of expected assets to reject, used to prevent from rejecting assets which  arrive just before this operation. |

### setPriority

```solidity
function setPriority(uint256 tokenId, uint16[] priorities) external
```

Sets a new priority array for a given token.

_The priority array is a non-sequential list of `uint16`s, where the lowest value is considered highest
 priority.
Value `0` of a priority is a special case equivalent to unitialized.
Requirements:

 - The caller must own the token or be approved to manage the token's assets
 - `tokenId` must exist.
 - The length of `priorities` must be equal the length of the active assets array.
Emits a {AssetPrioritySet} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to set the priorities for |
| priorities | uint16[] | An array of priorities of active assets. The succesion of items in the priorities array  matches that of the succesion of items in the active array |

### getActiveAssets

```solidity
function getActiveAssets(uint256 tokenId) external view returns (uint64[])
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
function getPendingAssets(uint256 tokenId) external view returns (uint64[])
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
function getActiveAssetPriorities(uint256 tokenId) external view returns (uint16[])
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
function getAssetReplacements(uint256 tokenId, uint64 newAssetId) external view returns (uint64)
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

### getAssetMetadata

```solidity
function getAssetMetadata(uint256 tokenId, uint64 assetId) external view returns (string)
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

### approveForAssets

```solidity
function approveForAssets(address to, uint256 tokenId) external
```

Used to grant permission to the user to manage token's assets.

_This differs from transfer approvals, as approvals are not cleared when the approved party accepts or
 rejects an asset, or sets asset priorities. This approval is cleared on token transfer.
Only a single account can be approved at a time, so approving the `0x0` address clears previous approvals.
Requirements:

 - The caller must own the token or be an approved operator.
 - `tokenId` must exist.
Emits an {ApprovalForAssets} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address of the account to grant the approval to |
| tokenId | uint256 | ID of the token for which the approval to manage the assets is granted |

### getApprovedForAssets

```solidity
function getApprovedForAssets(uint256 tokenId) external view returns (address)
```

Used to retrieve the address of the account approved to manage assets of a given token.

_Requirements:

 - `tokenId` must exist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which to retrieve the approved address |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address Address of the account that is approved to manage the specified token's assets |

### setApprovalForAllForAssets

```solidity
function setApprovalForAllForAssets(address operator, bool approved) external
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

### isApprovedForAllForAssets

```solidity
function isApprovedForAllForAssets(address owner, address operator) external view returns (bool)
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

