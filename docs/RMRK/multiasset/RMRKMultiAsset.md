# Solidity API

## RMRKMultiAsset

Smart contract of the RMRK Multi asset module.

### onlyApprovedOrOwner

```solidity
modifier onlyApprovedOrOwner(uint256 tokenId)
```

Used to verify that the caller is the owner of the given token or approved by its owner to manage it.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token being checked |

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

Initializes the contract by setting a name and a symbol to the token collection.

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

### balanceOf

```solidity
function balanceOf(address owner) public view virtual returns (uint256)
```

_Returns the number of tokens in ``owner``'s account._

### ownerOf

```solidity
function ownerOf(uint256 tokenId) public view virtual returns (address)
```

_Returns the owner of the `tokenId` token.

Requirements:

- `tokenId` must exist._

### approve

```solidity
function approve(address to, uint256 tokenId) public virtual
```

_Gives permission to `to` to transfer `tokenId` token to another account.
The approval is cleared when the token is transferred.

Only a single account can be approved at a time, so approving the zero address clears previous approvals.

Requirements:

- The caller must own the token or be an approved operator.
- `tokenId` must exist.

Emits an {Approval} event._

### getApproved

```solidity
function getApproved(uint256 tokenId) public view virtual returns (address)
```

_Returns the account approved for `tokenId` token.

Requirements:

- `tokenId` must exist._

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) public virtual
```

_Approve or remove `operator` as an operator for the caller.
Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.

Requirements:

- The `operator` cannot be the caller.

Emits an {ApprovalForAll} event._

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) public view virtual returns (bool)
```

_Returns if the `operator` is allowed to manage all of the assets of `owner`.

See {setApprovalForAll}_

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) public virtual
```

_Transfers `tokenId` token from `from` to `to`.

WARNING: Note that the caller is responsible to confirm that the recipient is capable of receiving ERC721
or else they may be permanently lost. Usage of {safeTransferFrom} prevents loss, though the caller must
understand this adds an external call which potentially creates a reentrancy vulnerability.

Requirements:

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `tokenId` token must be owned by `from`.
- If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.

Emits a {Transfer} event._

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) public virtual
```

_Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
are aware of the ERC721 protocol to prevent tokens from being forever locked.

Requirements:

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `tokenId` token must exist and be owned by `from`.
- If the caller is not `from`, it must have been allowed to move this token by either {approve} or {setApprovalForAll}.
- If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.

Emits a {Transfer} event._

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) public virtual
```

_Safely transfers `tokenId` token from `from` to `to`.

Requirements:

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `tokenId` token must exist and be owned by `from`.
- If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
- If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.

Emits a {Transfer} event._

### _safeTransfer

```solidity
function _safeTransfer(address from, address to, uint256 tokenId, bytes data) internal virtual
```

Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients are aware
 of the ERC721 protocol to prevent tokens from being forever locked.

_`data` is additional data, it has no specified format and it is sent in call to `to`.
This internal function is equivalent to {safeTransferFrom}, and can be used to e.g. implement alternative
 mechanisms to perform token transfer, such as signature-based.
Requirements:

 - `from` cannot be the zero address.
 - `to` cannot be the zero address.
 - `tokenId` token must exist and be owned by `from`.
 - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon
  a safe transfer.
Emits a {Transfer} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | Address from which to send the token from |
| to | address | Address to which to send the token to |
| tokenId | uint256 | ID of the token to be sent |
| data | bytes | Additional data to send with the tokens |

### _exists

```solidity
function _exists(uint256 tokenId) internal view virtual returns (bool)
```

Used to check whether the given token exists.

_Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
Tokens start existing when they are minted (`_mint`) and stop existing when they are burned (`_burn`)._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token being checked |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool The boolean value signifying whether the token exists |

### _isApprovedOrOwner

```solidity
function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool)
```

Used to check whether the given account is allowed to manage the given token.

_Requirements:

 - `tokenId` must exist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| spender | address | Address that is being checked for approval |
| tokenId | uint256 | ID of the token being checked |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool The boolean value indicating whether the `spender` is approved to manage the given token |

### _safeMint

```solidity
function _safeMint(address to, uint256 tokenId, bytes data) internal virtual
```

Used to safely mint the token to the specified address while passing the additional data to contract
 recipients.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address to which to mint the token. |
| tokenId | uint256 | ID of the token to mint |
| data | bytes | Additional data to send with the tokens |

### _mint

```solidity
function _mint(address to, uint256 tokenId) internal virtual
```

Used to mint a specified token to a given address.

_WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible.
Requirements:

 - `tokenId` must not exist.
 - `to` cannot be the zero address.
Emits a {Transfer} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address to mint the token to |
| tokenId | uint256 | ID of the token to mint |

### _burn

```solidity
function _burn(uint256 tokenId) internal virtual
```

Used to destroy the specified token.

_The approval is cleared when the token is burned.
Requirements:

 - `tokenId` must exist.
Emits a {Transfer} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to burn |

### _transfer

```solidity
function _transfer(address from, address to, uint256 tokenId) internal virtual
```

Used to transfer the specified token from one user to another.

_As opposed to {transferFrom}, this imposes no restrictions on `msg.sender`.
Requirements:

 - `to` cannot be the zero address.
 - `tokenId` token must be owned by `from`.
Emits a {Transfer} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | Address from which to transfer the token |
| to | address | Address to which to transfer the token |
| tokenId | uint256 | ID of the token to transfer |

### _approve

```solidity
function _approve(address to, uint256 tokenId) internal virtual
```

Used to grant an approval to an address to manage the given token.

_Emits an {Approval} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address receiveing the approval |
| tokenId | uint256 | ID of the token that the approval is being granted for |

### _setApprovalForAll

```solidity
function _setApprovalForAll(address owner, address operator, bool approved) internal virtual
```

Used to manage an approval to an address to manage all of the tokens of the user.

_If the user attempts to grant the approval to themselves, the execution is reverted.
Emits an {ApprovalForAll} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | Address of the account for which the approval is being granted |
| operator | address | Address receiving approval to manage all of the tokens of the `owner` |
| approved | bool | Boolean value signifying whether |

### _requireMinted

```solidity
function _requireMinted(uint256 tokenId) internal view virtual
```

Used to verify thet the token has been minted.

_The token is considered minted if its owner is not the `0x0` address.
This function doesn't output any feedback about the token existing, but it reverts if the token doesn't
 exist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token being checked |

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

