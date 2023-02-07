# RMRKNestableMultiAsset

*RMRK team*

> RMRKNestableMultiAsset

Smart contract of the joined RMRK Nestable and Multi asset module.



## Methods

### VERSION

```solidity
function VERSION() external view returns (string)
```

Version of the @rmrk-team/evm-contracts package




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### acceptAsset

```solidity
function acceptAsset(uint256 tokenId, uint256 index, uint64 assetId) external nonpayable
```

Accepts an asset at from the pending array of given token.

*Migrates the asset from the token&#39;s pending asset array to the token&#39;s active asset array.Active assets cannot be removed by anyone, but can be replaced by a new asset.Requirements:  - The caller must own the token or be approved to manage the token&#39;s assets  - `tokenId` must exist.  - `index` must be in range of the length of the pending asset array.Emits an {AssetAccepted} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to accept the pending asset |
| index | uint256 | Index of the asset in the pending array to accept |
| assetId | uint64 | ID of the asset expected to be in the index |

### acceptChild

```solidity
function acceptChild(uint256 parentId, uint256 childIndex, address childAddress, uint256 childId) external nonpayable
```

Used to accept a pending child token for a given parent token.

*This moves the child token from parent token&#39;s pending child tokens array into the active child tokens  array.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token for which the child token is being accepted |
| childIndex | uint256 | Index of a child tokem in the given parent&#39;s pending children array |
| childAddress | address | Address of the collection smart contract of the child token expected to be located at the  specified index of the given parent token&#39;s pending children array |
| childId | uint256 | ID of the child token expected to be located at the specified index of the given parent token&#39;s  pending children array |

### addChild

```solidity
function addChild(uint256 parentId, uint256 childId, bytes data) external nonpayable
```

Used to add a child token to a given parent token.

*This adds the child token into the given parent token&#39;s pending child tokens array.Requirements:  - `directOwnerOf` on the child contract must resolve to the called contract.  - the pending array of the parent contract must not be full.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token to receive the new child token |
| childId | uint256 | ID of the new proposed child token |
| data | bytes | Additional data with no specified format |

### approve

```solidity
function approve(address to, uint256 tokenId) external nonpayable
```

Used to grant a one-time approval to manage one&#39;s token.

*Gives permission to `to` to transfer `tokenId` token to another account.The approval is cleared when the token is transferred.Only a single account can be approved at a time, so approving the zero address clears previous approvals.Requirements: - The caller must own the token or be an approved operator. - `tokenId` must exist.Emits an {Approval} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | Address receiving the approval |
| tokenId | uint256 | ID of the token for which the approval is being granted |

### approveForAssets

```solidity
function approveForAssets(address to, uint256 tokenId) external nonpayable
```

Used to grant permission to the user to manage token&#39;s assets.

*This differs from transfer approvals, as approvals are not cleared when the approved party accepts or  rejects an asset, or sets asset priorities. This approval is cleared on token transfer.Only a single account can be approved at a time, so approving the `0x0` address clears previous approvals.Requirements:  - The caller must own the token or be an approved operator.  - `tokenId` must exist.Emits an {ApprovalForAssets} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | Address of the account to grant the approval to |
| tokenId | uint256 | ID of the token for which the approval to manage the assets is granted |

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```

Used to retrieve the number of tokens in `owner`&#39;s account.



#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | Address of the account being checked |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The balance of the given account |

### burn

```solidity
function burn(uint256 tokenId) external nonpayable
```

Used to burn a given token.

*In case the token has any child tokens, the execution will be reverted.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to burn |

### burn

```solidity
function burn(uint256 tokenId, uint256 maxChildrenBurns) external nonpayable returns (uint256)
```

Used to burn a given token.

*When a token is burned, all of its child tokens are recursively burned as well.When specifying the maximum recursive burns, the execution will be reverted if there are more children to be  burned.Setting the `maxRecursiveBurn` value to 0 will only attempt to burn the specified token and revert if there  are any child tokens present.The approvals are cleared when the token is burned.Requirements:  - `tokenId` must exist.Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to burn |
| maxChildrenBurns | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Number of recursively burned children |

### childIsInActive

```solidity
function childIsInActive(address childAddress, uint256 childId) external view returns (bool)
```

Used to verify that the given child tokwn is included in an active array of a token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| childAddress | address | Address of the given token&#39;s collection smart contract |
| childId | uint256 | ID of the child token being checked |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | A boolean value signifying whether the given child token is included in an active child tokens array of a  token (`true`) or not (`false`) |

### childOf

```solidity
function childOf(uint256 parentId, uint256 index) external view returns (struct IRMRKNestable.Child)
```

Used to retrieve a specific active child token for a given parent token.

*Returns a single Child struct locating at `index` of parent token&#39;s active child tokens array.The Child struct consists of the following values:  [      tokenId,      contractAddress  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token for which the child is being retrieved |
| index | uint256 | Index of the child token in the parent token&#39;s active child tokens array |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNestable.Child | A Child struct containing data about the specified child |

### childrenOf

```solidity
function childrenOf(uint256 parentId) external view returns (struct IRMRKNestable.Child[])
```

Used to retrieve the active child tokens of a given parent token.

*Returns array of Child structs existing for parent token.The Child struct consists of the following values:  [      tokenId,      contractAddress  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token for which to retrieve the active child tokens |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNestable.Child[] | An array of Child structs containing the parent token&#39;s active child tokens |

### directOwnerOf

```solidity
function directOwnerOf(uint256 tokenId) external view returns (address, uint256, bool)
```

Used to retrieve the immediate owner of the given token.

*If the immediate owner is another token, the address returned, should be the one of the parent token&#39;s  collection smart contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which the RMRK owner is being retrieved |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the given token&#39;s owner |
| _1 | uint256 | The ID of the parent token. Should be `0` if the owner is an externally owned account |
| _2 | bool | The boolean value signifying whether the owner is an NFT or not |

### getActiveAssetPriorities

```solidity
function getActiveAssetPriorities(uint256 tokenId) external view returns (uint16[])
```

Used to retrieve the priorities of the active resoources of a given token.

*Asset priorities are a non-sequential array of uint16 values with an array size equal to active asset  priorites.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to retrieve the priorities of the active assets |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint16[] | An array of priorities of the active assets of the given token |

### getActiveAssets

```solidity
function getActiveAssets(uint256 tokenId) external view returns (uint64[])
```

Used to retrieve IDs of the active assets of given token.

*Asset data is stored by reference, in order to access the data corresponding to the ID, call  `getAssetMetadata(tokenId, assetId)`.You can safely get 10k*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to retrieve the IDs of the active assets |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | An array of active asset IDs of the given token |

### getApproved

```solidity
function getApproved(uint256 tokenId) external view returns (address)
```

Used to retrieve the account approved to manage given token.

*Requirements:  - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to check for approval |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the account approved to manage the token |

### getApprovedForAssets

```solidity
function getApprovedForAssets(uint256 tokenId) external view returns (address)
```

Used to retrieve the address of the account approved to manage assets of a given token.

*Requirements:  - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to retrieve the approved address |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the account that is approved to manage the specified token&#39;s assets |

### getAssetMetadata

```solidity
function getAssetMetadata(uint256 tokenId, uint64 assetId) external view returns (string)
```

Used to fetch the asset metadata of the specified token&#39;s active asset with the given index.

*Assets are stored by reference mapping `_assets[assetId]`.Can be overriden to implement enumerate, fallback or other custom logic.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token from which to retrieve the asset metadata |
| assetId | uint64 | Asset Id, must be in the active assets array |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | The metadata of the asset belonging to the specified index in the token&#39;s active assets  array |

### getAssetReplacements

```solidity
function getAssetReplacements(uint256 tokenId, uint64 newAssetId) external view returns (uint64)
```

Used to retrieve the asset that will be replaced if a given asset from the token&#39;s pending array  is accepted.

*Asset data is stored by reference, in order to access the data corresponding to the ID, call  `getAssetMetadata(tokenId, assetId)`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to check |
| newAssetId | uint64 | ID of the pending asset which will be accepted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64 | ID of the asset which will be replaced |

### getPendingAssets

```solidity
function getPendingAssets(uint256 tokenId) external view returns (uint64[])
```

Used to retrieve IDs of the pending assets of given token.

*Asset data is stored by reference, in order to access the data corresponding to the ID, call  `getAssetMetadata(tokenId, assetId)`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to retrieve the IDs of the pending assets |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | An array of pending asset IDs of the given token |

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool)
```

Used to check if the given address is allowed to manage the tokens of the specified address.



#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | Address of the owner of the tokens |
| operator | address | Address being checked for approval |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | A boolean value signifying whether the *operator* is allowed to manage the tokens of the *owner* (`true`)  or not (`false`) |

### isApprovedForAllForAssets

```solidity
function isApprovedForAllForAssets(address owner, address operator) external view returns (bool)
```

Used to check whether the address has been granted the operator role by a given address or not.

*See {setApprovalForAllForAssets}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | Address of the account that we are checking for whether it has granted the operator role |
| operator | address | Address of the account that we are checking whether it has the operator role or not |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | A boolean value indicating wehter the account we are checking has been granted the operator role |

### name

```solidity
function name() external view returns (string)
```

Used to retrieve the collection name.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | Name of the collection |

### nestTransferFrom

```solidity
function nestTransferFrom(address from, address to, uint256 tokenId, uint256 destinationId, bytes data) external nonpayable
```

Used to transfer the token into another token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | Address of the direct owner of the token to be transferred |
| to | address | Address of the receiving token&#39;s collection smart contract |
| tokenId | uint256 | ID of the token being transferred |
| destinationId | uint256 | ID of the token to receive the token being transferred |
| data | bytes | Additional data with no specified format, sent in the addChild call |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```

Used to retrieve the *root* owner of a given token.

*The *root* owner of the token is an externally owned account (EOA). If the given token is child of another  NFT, this will return an EOA address. Otherwise, if the token is owned by an EOA, this EOA wil be returned.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which the *root* owner has been retrieved |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The *root* owner of the token |

### pendingChildOf

```solidity
function pendingChildOf(uint256 parentId, uint256 index) external view returns (struct IRMRKNestable.Child)
```

Used to retrieve a specific pending child token from a given parent token.

*Returns a single Child struct locating at `index` of parent token&#39;s active child tokens array.The Child struct consists of the following values:  [      tokenId,      contractAddress  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token for which the pending child token is being retrieved |
| index | uint256 | Index of the child token in the parent token&#39;s pending child tokens array |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNestable.Child | A Child struct containting data about the specified child |

### pendingChildrenOf

```solidity
function pendingChildrenOf(uint256 parentId) external view returns (struct IRMRKNestable.Child[])
```

Used to retrieve the pending child tokens of a given parent token.

*Returns array of pending Child structs existing for given parent.The Child struct consists of the following values:  [      tokenId,      contractAddress  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentId | uint256 | ID of the parent token for which to retrieve the pending child tokens |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKNestable.Child[] | An array of Child structs containing the parent token&#39;s pending child tokens |

### rejectAllAssets

```solidity
function rejectAllAssets(uint256 tokenId, uint256 maxRejections) external nonpayable
```

Rejects all assets from the pending array of a given token.

*Effecitvely deletes the pending array.Requirements:  - The caller must own the token or be approved to manage the token&#39;s assets  - `tokenId` must exist.Emits a {AssetRejected} event with assetId = 0.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token of which to clear the pending array. |
| maxRejections | uint256 | Maximum number of expected assets to reject, used to prevent from rejecting assets which  arrive just before this operation. |

### rejectAllChildren

```solidity
function rejectAllChildren(uint256 tokenId, uint256 maxRejections) external nonpayable
```

Used to reject all pending children of a given parent token.

*Removes the children from the pending array mapping.This does not update the ownership storage data on children. If necessary, ownership can be reclaimed by the  rootOwner of the previous parent.Requirements: Requirements: - `parentId` must exist*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| maxRejections | uint256 | Maximum number of expected children to reject, used to prevent from rejecting children which  arrive just before this operation. |

### rejectAsset

```solidity
function rejectAsset(uint256 tokenId, uint256 index, uint64 assetId) external nonpayable
```

Rejects an asset from the pending array of given token.

*Removes the asset from the token&#39;s pending asset array.Requirements:  - The caller must own the token or be approved to manage the token&#39;s assets  - `tokenId` must exist.  - `index` must be in range of the length of the pending asset array.Emits a {AssetRejected} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token that the asset is being rejected from |
| index | uint256 | Index of the asset in the pending array to be rejected |
| assetId | uint64 | ID of the asset expected to be in the index |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external nonpayable
```

Used to safely transfer a given token token from `from` to `to`.

*Requirements:  - `from` cannot be the zero address.  - `to` cannot be the zero address.  - `tokenId` token must exist and be owned by `from`.  - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.  - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | Address to transfer the tokens from |
| to | address | Address to transfer the tokens to |
| tokenId | uint256 | ID of the token to transfer |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external nonpayable
```

Used to safely transfer a given token token from `from` to `to`.

*Requirements:  - `from` cannot be the zero address.  - `to` cannot be the zero address.  - `tokenId` token must exist and be owned by `from`.  - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.  - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | Address to transfer the tokens from |
| to | address | Address to transfer the tokens to |
| tokenId | uint256 | ID of the token to transfer |
| data | bytes | Additional data without a specified format to be sent along with the token transaction |

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) external nonpayable
```

Used to approve or remove `operator` as an operator for the caller.

*Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.Requirements: - The `operator` cannot be the caller.Emits an {ApprovalForAll} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | Address of the operator being managed |
| approved | bool | A boolean value signifying whether the approval is being granted (`true`) or (`revoked`) |

### setApprovalForAllForAssets

```solidity
function setApprovalForAllForAssets(address operator, bool approved) external nonpayable
```

Used to add or remove an operator of assets for the caller.

*Operators can call {acceptAsset}, {rejectAsset}, {rejectAllAssets} or {setPriority} for any token  owned by the caller.Requirements:  - The `operator` cannot be the caller.Emits an {ApprovalForAllForAssets} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | Address of the account to which the operator role is granted or revoked from |
| approved | bool | The boolean value indicating whether the operator role is being granted (`true`) or revoked  (`false`) |

### setPriority

```solidity
function setPriority(uint256 tokenId, uint16[] priorities) external nonpayable
```

Sets a new priority array for a given token.

*The priority array is a non-sequential list of `uint16`s, where the lowest value is considered highest  priority.Value `0` of a priority is a special case equivalent to unitialized.Requirements:  - The caller must own the token or be approved to manage the token&#39;s assets  - `tokenId` must exist.  - The length of `priorities` must be equal the length of the active assets array.Emits a {AssetPrioritySet} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to set the priorities for |
| priorities | uint16[] | An array of priorities of active assets. The succesion of items in the priorities array  matches that of the succesion of items in the active array |

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

### symbol

```solidity
function symbol() external view returns (string)
```

Used to retrieve the collection symbol.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | Symbol of the collection |

### transferChild

```solidity
function transferChild(uint256 tokenId, address to, uint256 destinationId, uint256 childIndex, address childAddress, uint256 childId, bool isPending, bytes data) external nonpayable
```

Used to transfer a child token from a given parent token.

*When transferring a child token, the owner of the token is set to `to`, or is not updated in the event of  `to` being the `0x0` address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the parent token from which the child token is being transferred |
| to | address | Address to which to transfer the token to |
| destinationId | uint256 | ID of the token to receive this child token (MUST be 0 if the destination is not a token) |
| childIndex | uint256 | Index of a token we are transferring, in the array it belongs to (can be either active array or  pending array) |
| childAddress | address | Address of the child token&#39;s collection smart contract. |
| childId | uint256 | ID of the child token in its own collection smart contract. |
| isPending | bool | A boolean value indicating whether the child token being transferred is in the pending array of  the parent token (`true`) or in the active array (`false`) |
| data | bytes | Additional data with no specified format, sent in call to `_to` |

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) external nonpayable
```

Transfers a given token from `from` to `to`.

*Requirements:  - `from` cannot be the zero address.  - `to` cannot be the zero address.  - `tokenId` token must be owned by `from`.  - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | Address from which to transfer the token from |
| to | address | Address to which to transfer the token to |
| tokenId | uint256 | ID of the token to transfer |



## Events

### AllChildrenRejected

```solidity
event AllChildrenRejected(uint256 indexed tokenId)
```

Used to notify listeners that all pending child tokens of a given token have been rejected.

*Emitted when a token removes all a child tokens from its pending array.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that rejected all of the pending children |

### Approval

```solidity
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
```



*Emitted when `owner` enables `approved` to manage the `tokenId` token.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| approved `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
```



*Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| operator `indexed` | address | undefined |
| approved  | bool | undefined |

### ApprovalForAllForAssets

```solidity
event ApprovalForAllForAssets(address indexed owner, address indexed operator, bool approved)
```

Used to notify listeners that owner has granted approval to the user to manage assets of all of their  tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | Address of the account that has granted the approval for all assets on all of their tokens |
| operator `indexed` | address | Address of the account that has been granted the approval to manage the token&#39;s assets on all of  the tokens |
| approved  | bool | Boolean value signifying whether the permission has been granted (`true`) or revoked (`false`) |

### ApprovalForAssets

```solidity
event ApprovalForAssets(address indexed owner, address indexed approved, uint256 indexed tokenId)
```

Used to notify listeners that owner has granted an approval to the user to manage the assets of a  given token.

*Approvals must be cleared on transfer*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | Address of the account that has granted the approval for all token&#39;s assets |
| approved `indexed` | address | Address of the account that has been granted approval to manage the token&#39;s assets |
| tokenId `indexed` | uint256 | ID of the token on which the approval was granted |

### AssetAccepted

```solidity
event AssetAccepted(uint256 indexed tokenId, uint64 indexed assetId, uint64 indexed replacesId)
```

Used to notify listeners that an asset object at `assetId` is accepted by the token and migrated  from token&#39;s pending assets array to active assets array of the token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that had a new asset accepted |
| assetId `indexed` | uint64 | ID of the asset that was accepted |
| replacesId `indexed` | uint64 | ID of the asset that was replaced |

### AssetAddedToToken

```solidity
event AssetAddedToToken(uint256 indexed tokenId, uint64 indexed assetId, uint64 indexed replacesId)
```

Used to notify listeners that an asset object at `assetId` is added to token&#39;s pending asset  array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that received a new pending asset |
| assetId `indexed` | uint64 | ID of the asset that has been added to the token&#39;s pending assets array |
| replacesId `indexed` | uint64 | ID of the asset that would be replaced |

### AssetPrioritySet

```solidity
event AssetPrioritySet(uint256 indexed tokenId)
```

Used to notify listeners that token&#39;s prioritiy array is reordered.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that had the asset priority array updated |

### AssetRejected

```solidity
event AssetRejected(uint256 indexed tokenId, uint64 indexed assetId)
```

Used to notify listeners that an asset object at `assetId` is rejected from token and is dropped  from the pending assets array of the token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that had an asset rejected |
| assetId `indexed` | uint64 | ID of the asset that was rejected |

### AssetSet

```solidity
event AssetSet(uint64 indexed assetId)
```

Used to notify listeners that an asset object is initialized at `assetId`.



#### Parameters

| Name | Type | Description |
|---|---|---|
| assetId `indexed` | uint64 | ID of the asset that was initialized |

### ChildAccepted

```solidity
event ChildAccepted(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId)
```

Used to notify listeners that a new child token was accepted by the parent token.

*Emitted when a parent token accepts a token from its pending array, migrating it to the active array.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that accepted a new child token |
| childIndex  | uint256 | Index of the newly accepted child token in the parent token&#39;s active children array |
| childAddress `indexed` | address | Address of the child token&#39;s collection smart contract |
| childId `indexed` | uint256 | ID of the child token in the child token&#39;s collection smart contract |

### ChildProposed

```solidity
event ChildProposed(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId)
```

Used to notify listeners that a new token has been added to a given token&#39;s pending children array.

*Emitted when a child NFT is added to a token&#39;s pending array.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that received a new pending child token |
| childIndex  | uint256 | Index of the proposed child token in the parent token&#39;s pending children array |
| childAddress `indexed` | address | Address of the proposed child token&#39;s collection smart contract |
| childId `indexed` | uint256 | ID of the child token in the child token&#39;s collection smart contract |

### ChildTransferred

```solidity
event ChildTransferred(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId, bool fromPending)
```

Used to notify listeners a child token has been transferred from parent token.

*Emitted when a token transfers a child from itself, transferring ownership to the root owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that transferred a child token |
| childIndex  | uint256 | Index of a child in the array from which it is being transferred |
| childAddress `indexed` | address | Address of the child token&#39;s collection smart contract |
| childId `indexed` | uint256 | ID of the child token in the child token&#39;s collection smart contract |
| fromPending  | bool | A boolean value signifying whether the token was in the pending child tokens array (`true`) or  in the active child tokens array (`false`) |

### NestTransfer

```solidity
event NestTransfer(address indexed from, address indexed to, uint256 fromTokenId, uint256 toTokenId, uint256 indexed tokenId)
```

Used to notify listeners that the token is being transferred.

*Emitted when `tokenId` token is transferred from `from` to `to`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | Address of the previous immediate owner, which is a smart contract if the token was nested. |
| to `indexed` | address | Address of the new immediate owner, which is a smart contract if the token is being nested. |
| fromTokenId  | uint256 | ID of the previous parent token. If the token was not nested before, the value should be `0` |
| toTokenId  | uint256 | ID of the new parent token. If the token is not being nested, the value should be `0` |
| tokenId `indexed` | uint256 | ID of the token being transferred |

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
```



*Emitted when `tokenId` token is transferred from `from` to `to`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |



## Errors

### ERC721AddressZeroIsNotaValidOwner

```solidity
error ERC721AddressZeroIsNotaValidOwner()
```

Attempting to grant the token to 0x0 address




### ERC721ApprovalToCurrentOwner

```solidity
error ERC721ApprovalToCurrentOwner()
```

Attempting to grant approval to the current owner of the token




### ERC721ApproveCallerIsNotOwnerNorApprovedForAll

```solidity
error ERC721ApproveCallerIsNotOwnerNorApprovedForAll()
```

Attempting to grant approval when not being owner or approved for all should not be permitted




### ERC721ApproveToCaller

```solidity
error ERC721ApproveToCaller()
```

Attempting to grant approval to self




### ERC721InvalidTokenId

```solidity
error ERC721InvalidTokenId()
```

Attempting to use an invalid token ID




### ERC721NotApprovedOrOwner

```solidity
error ERC721NotApprovedOrOwner()
```

Attempting to manage a token without being its owner or approved by the owner




### ERC721TransferFromIncorrectOwner

```solidity
error ERC721TransferFromIncorrectOwner()
```

Attempting to transfer the token from an address that is not the owner




### ERC721TransferToNonReceiverImplementer

```solidity
error ERC721TransferToNonReceiverImplementer()
```

Attempting to safe transfer to an address that is unable to receive the token




### ERC721TransferToTheZeroAddress

```solidity
error ERC721TransferToTheZeroAddress()
```

Attempting to transfer the token to a 0x0 address




### RMRKApprovalForAssetsToCurrentOwner

```solidity
error RMRKApprovalForAssetsToCurrentOwner()
```

Attempting to grant approval of assets to their current owner




### RMRKApproveForAssetsCallerIsNotOwnerNorApprovedForAll

```solidity
error RMRKApproveForAssetsCallerIsNotOwnerNorApprovedForAll()
```

Attempting to grant approval of assets without being the caller or approved for all




### RMRKBadPriorityListLength

```solidity
error RMRKBadPriorityListLength()
```

Attempting to set the priorities with an array of length that doesn&#39;t match the length of active assets array




### RMRKChildAlreadyExists

```solidity
error RMRKChildAlreadyExists()
```

Attempting to accept a child that has already been accepted




### RMRKChildIndexOutOfRange

```solidity
error RMRKChildIndexOutOfRange()
```

Attempting to interact with a child, using index that is higher than the number of children




### RMRKIndexOutOfRange

```solidity
error RMRKIndexOutOfRange()
```

Attempting to interact with an asset, using index greater than number of assets




### RMRKIsNotContract

```solidity
error RMRKIsNotContract()
```

Attempting to interact with an end-user account when the contract account is expected




### RMRKMaxPendingChildrenReached

```solidity
error RMRKMaxPendingChildrenReached()
```

Attempting to add a pending child after the number of pending children has reached the limit (default limit is 128)




### RMRKMaxRecursiveBurnsReached

```solidity
error RMRKMaxRecursiveBurnsReached(address childContract, uint256 childId)
```

Attempting to burn a total number of recursive children higher than maximum set



#### Parameters

| Name | Type | Description |
|---|---|---|
| childContract | address | Address of the collection smart contract in which the maximum number of recursive burns was reached |
| childId | uint256 | ID of the child token at which the maximum number of recursive burns was reached |

### RMRKNestableTooDeep

```solidity
error RMRKNestableTooDeep()
```

Attempting to nest a child over the nestable limit (current limit is 100 levels of nesting)




### RMRKNestableTransferToDescendant

```solidity
error RMRKNestableTransferToDescendant()
```

Attempting to nest the token to own descendant, which would create a loop and leave the looped tokens in limbo




### RMRKNestableTransferToNonRMRKNestableImplementer

```solidity
error RMRKNestableTransferToNonRMRKNestableImplementer()
```

Attempting to nest the token to a smart contract that doesn&#39;t support nesting




### RMRKNestableTransferToSelf

```solidity
error RMRKNestableTransferToSelf()
```

Attempting to nest the token into itself




### RMRKNotApprovedForAssetsOrOwner

```solidity
error RMRKNotApprovedForAssetsOrOwner()
```

Attempting to manage an asset without owning it or having been granted permission by the owner to do so




### RMRKNotApprovedOrDirectOwner

```solidity
error RMRKNotApprovedOrDirectOwner()
```

Attempting to interact with a token without being its owner or having been granted permission by the  owner to do so

*When a token is nested, only the direct owner (NFT parent) can mange it. In that case, approved addresses are  not allowed to manage it, in order to ensure the expected behaviour*


### RMRKPendingChildIndexOutOfRange

```solidity
error RMRKPendingChildIndexOutOfRange()
```

Attempting to interact with a pending child using an index greater than the size of pending array




### RMRKTokenDoesNotHaveAsset

```solidity
error RMRKTokenDoesNotHaveAsset()
```

Attempting to compose a NFT of a token without active assets




### RMRKUnexpectedAssetId

```solidity
error RMRKUnexpectedAssetId()
```

Attempting to accept or reject an asset which does not match the one at the specified index




### RMRKUnexpectedChildId

```solidity
error RMRKUnexpectedChildId()
```

Attempting to accept or transfer a child which does not match the one at the specified index




### RMRKUnexpectedNumberOfAssets

```solidity
error RMRKUnexpectedNumberOfAssets()
```

Attempting to reject all pending assets but more assets than expected are pending




### RMRKUnexpectedNumberOfChildren

```solidity
error RMRKUnexpectedNumberOfChildren()
```

Attempting to reject all pending children but children assets than expected are pending





