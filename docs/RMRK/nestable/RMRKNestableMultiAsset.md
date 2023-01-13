# Solidity API

## RMRKNestableMultiAsset

Smart contract of the joined RMRK Nestable and Multi asset module.

### onlyApprovedForAssetsOrOwner

```solidity
modifier onlyApprovedForAssetsOrOwner(uint256 tokenId)
```

Used to verify that the caller is either the owner of the given token or approved by its owner to manage
 the assets on the given token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token being checked |

### constructor

```solidity
constructor(string name_, string symbol_) public
```

Initializes the contract by setting a `name` and a `symbol` of the token collection.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name_ | string | Name of the token collection |
| symbol_ | string | Symbol of the token collection |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

### acceptAsset

```solidity
function acceptAsset(uint256 tokenId, uint256 index, uint64 assetId) public virtual
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
function rejectAsset(uint256 tokenId, uint256 index, uint64 assetId) public virtual
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
function rejectAllAssets(uint256 tokenId, uint256 maxRejections) public virtual
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
function setPriority(uint256 tokenId, uint16[] priorities) public virtual
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

### approveForAssets

```solidity
function approveForAssets(address to, uint256 tokenId) public virtual
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
function getApprovedForAssets(uint256 tokenId) public view virtual returns (address)
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

### _approveForAssets

```solidity
function _approveForAssets(address to, uint256 tokenId) internal virtual
```

Used to grant an approval to an address to manage assets of a given token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address of the account to grant the approval to |
| tokenId | uint256 | ID of the token for which the approval is being given |

### _cleanApprovals

```solidity
function _cleanApprovals(uint256 tokenId) internal virtual
```

Used to remove approvals to manage the assets for a given token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which to clear the approvals |

### _isApprovedForAssetsOrOwner

```solidity
function _isApprovedForAssetsOrOwner(address user, uint256 tokenId) internal view virtual returns (bool)
```

Internal function to check whether the queried user is either:
  1. The root owner of the token associated with `tokenId`.
  2. Is approved for all assets of the current owner via the `setApprovalForAllForAssets` function.
  3. Is granted approval for the specific tokenId for asset management via the `approveForAssets` function.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | Address of the user we are checking for permission |
| tokenId | uint256 | ID of the token to query for permission for a given `user` |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool A boolean value indicating whether the user is approved to manage the token or not |

