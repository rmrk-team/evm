# RMRKMultiAssetLazyMintErc20Soulbound

*RMRK team*

> RMRKMultiAssetLazyMintErc20Soulbound

Implementation of non-transferable RMRK multi-asset module with ERC20-powered lazy minting.



## Methods

### RMRK_INTERFACE

```solidity
function RMRK_INTERFACE() external view returns (bytes4)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes4 | undefined |

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

### addAssetEntry

```solidity
function addAssetEntry(string metadataURI) external nonpayable returns (uint256)
```

Used to add a asset entry.

*The ID of the asset is automatically assigned to be the next available asset ID.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| metadataURI | string | Metadata URI of the asset |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | ID of the newly added asset |

### addAssetToToken

```solidity
function addAssetToToken(uint256 tokenId, uint64 assetId, uint64 replacesAssetWithId) external nonpayable
```

Used to add an asset to a token.

*If the given asset is already added to the token, the execution will be reverted.If the asset ID is invalid, the execution will be reverted.If the token already has the maximum amount of pending assets (128), the execution will be  reverted.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to add the asset to |
| assetId | uint64 | ID of the asset to add to the token |
| replacesAssetWithId | uint64 | ID of the asset to replace from the token&#39;s list of active assets |

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

Used to retrieve the number of tokens in ``owner``&#39;s account.



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

Used to destroy the specified token.

*The approval is cleared when the token is burned.Requirements:  - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to burn |

### contractURI

```solidity
function contractURI() external view returns (string)
```

Used to retrieve the metadata of the collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string The metadata URI of the collection |

### erc20TokenAddress

```solidity
function erc20TokenAddress() external view returns (address)
```

Used to retrieve the address of the ERC20 token this smart contract supports.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the ERC20 token&#39;s smart contract |

### getActiveAssetPriorities

```solidity
function getActiveAssetPriorities(uint256 tokenId) external view returns (uint64[])
```

Used to retrieve the priorities of the active resoources of a given token.

*Asset priorities are a non-sequential array of uint64 values with an array size equal to active asset  priorites.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to retrieve the priorities of the active assets |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64[] | An array of priorities of the active assets of the given token |

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

### getRoyaltyPercentage

```solidity
function getRoyaltyPercentage() external view returns (uint256)
```

Used to retrieve the specified royalty percentage.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The royalty percentage expressed in the basis points |

### getRoyaltyRecipient

```solidity
function getRoyaltyRecipient() external view returns (address)
```

Used to retrieve the recipient of royalties.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the recipient of royalties |

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

### isContributor

```solidity
function isContributor(address contributor) external view returns (bool)
```

Used to check if the address is one of the contributors.



#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor | address | Address of the contributor whose status we are checking |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | Boolean value indicating whether the address is a contributor or not |

### isTransferable

```solidity
function isTransferable(uint256, address from, address to) external view returns (bool)
```

Used to check whether the given token is transferable or not.

*If this function returns `false`, the transfer of the token MUST revert execution.If the tokenId does not exist, this method MUST revert execution, unless the token is being checked for  minting.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |
| from | address | Address from which the token is being transferred |
| to | address | Address to which the token is being transferred |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | Boolean value indicating whether the given token is transferable |

### manageContributor

```solidity
function manageContributor(address contributor, bool grantRole) external nonpayable
```

Adds or removes a contributor to the smart contract.

*Can only be called by the owner.Emits ***ContributorUpdate*** event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor | address | Address of the contributor&#39;s account |
| grantRole | bool | A boolean value signifying whether the contributor role is being granted (`true`) or revoked  (`false`) |

### maxSupply

```solidity
function maxSupply() external view returns (uint256)
```

Used to retrieve the maximum supply of the collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The maximum supply of tokens in the collection |

### mint

```solidity
function mint(address to, uint256 numToMint) external payable returns (uint256)
```

Used to mint the desired number of tokens to the specified address.

*The `data` value of the `_safeMint` method is set to an empty value.Can only be called while the open sale is open.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | Address to which to mint the token |
| numToMint | uint256 | Number of tokens to mint |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The ID of the first token to be minted in the current minting cycle |

### name

```solidity
function name() external view returns (string)
```

Used to retrieve the collection name.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | Name of the collection |

### owner

```solidity
function owner() external view returns (address)
```

Returns the address of the current owner.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the current owner |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```

Used to retrieve the owner of the given token.

*Requirements:  - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to retrieve the token for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the account owning the token |

### pricePerMint

```solidity
function pricePerMint() external view returns (uint256)
```

Used to retrieve the price per mint.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The price per mint of a single token expressed in the lowest denomination of a native currency |

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

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```

Leaves the contract without owner. Functions using the `onlyOwner` modifier will be disabled.

*Can only be called by the current owner.Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is  only available to the owner.*


### royaltyInfo

```solidity
function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount)
```

Used to retrieve the information about who shall receive royalties of a sale of the specified token and  how much they will be.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which the royalty info is being retrieved |
| salePrice | uint256 | Price of the token sale |

#### Returns

| Name | Type | Description |
|---|---|---|
| receiver | address | The beneficiary receiving royalties of the sale |
| royaltyAmount | uint256 | The value of the royalties recieved by the `receiver` from the sale |

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
function setPriority(uint256 tokenId, uint64[] priorities) external nonpayable
```

Sets a new priority array for a given token.

*The priority array is a non-sequential list of `uint64`s, where the lowest value is considered highest  priority.Value `0` of a priority is a special case equivalent to unitialized.Requirements:  - The caller must own the token or be approved to manage the token&#39;s assets  - `tokenId` must exist.  - The length of `priorities` must be equal the length of the active assets array.Emits a {AssetPrioritySet} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to set the priorities for |
| priorities | uint64[] | An array of priorities of active assets. The succesion of items in the priorities array  matches that of the succesion of items in the active array |

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

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```

Used to retrieve the metadata URI of a token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to retrieve the metadata URI for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | Metadata URI of the specified token |

### totalAssets

```solidity
function totalAssets() external view returns (uint256)
```

Used to retrieve the total number of assets.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The total number of assets |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

Used to retrieve the total supply of the tokens in a collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The number of tokens in a collection |

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

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```

Transfers ownership of the contract to a new owner.

*Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | Address of the new owner&#39;s account |

### updateRoyaltyRecipient

```solidity
function updateRoyaltyRecipient(address newRoyaltyRecipient) external nonpayable
```

Used to update recipient of royalties.

*Custom access control has to be implemented to ensure that only the intended actors can update the  beneficiary.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newRoyaltyRecipient | address | Address of the new recipient of royalties |

### withdrawRaisedERC20

```solidity
function withdrawRaisedERC20(address erc20, address to, uint256 amount) external nonpayable
```

Used to withdraw the minting proceedings to a specified address.

*This function can only be called by the owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| erc20 | address | Address of the ERC20 token to withdraw |
| to | address | Address to receive the given amount of minting proceedings |
| amount | uint256 | The amount to withdraw |



## Events

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

### AssetAddedToTokens

```solidity
event AssetAddedToTokens(uint256[] tokenIds, uint64 indexed assetId, uint64 indexed replacesId)
```

Used to notify listeners that an asset object at `assetId` is added to token&#39;s pending asset  array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenIds  | uint256[] | An array of token IDs that received a new pending asset |
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

### ContributorUpdate

```solidity
event ContributorUpdate(address indexed contributor, bool isContributor)
```

Event that signifies that an address was granted contributor role or that the permission has been  revoked.

*This can only be triggered by a current owner, so there is no need to include that information in the event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor `indexed` | address | Address of the account that had contributor role status updated |
| isContributor  | bool | A boolean value signifying whether the role has been granted (`true`) or revoked (`false`) |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```

Used to anounce the transfer of ownership.



#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | Address of the account that transferred their ownership role |
| newOwner `indexed` | address | Address of the account receiving the ownership role |

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




### ERC721MintToTheZeroAddress

```solidity
error ERC721MintToTheZeroAddress()
```

Attempting to mint to 0x0 address




### ERC721NotApprovedOrOwner

```solidity
error ERC721NotApprovedOrOwner()
```

Attempting to manage a token without being its owner or approved by the owner




### ERC721TokenAlreadyMinted

```solidity
error ERC721TokenAlreadyMinted()
```

Attempting to mint an already minted token




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




### RMRKAssetAlreadyExists

```solidity
error RMRKAssetAlreadyExists()
```

Attempting to add an asset using an ID that has already been used




### RMRKBadPriorityListLength

```solidity
error RMRKBadPriorityListLength()
```

Attempting to set the priorities with an array of length that doesn&#39;t match the length of active assets array




### RMRKCannotTransferSoulbound

```solidity
error RMRKCannotTransferSoulbound()
```

Attempting to transfer a soulbound (non-transferrable) token




### RMRKIdZeroForbidden

```solidity
error RMRKIdZeroForbidden()
```

Attempting to use ID 0, which is not supported

*The ID 0 in RMRK suite is reserved for empty values. Guarding against its use ensures the expected operation*


### RMRKIndexOutOfRange

```solidity
error RMRKIndexOutOfRange()
```

Attempting to interact with an asset, using index greater than number of assets




### RMRKMaxPendingAssetsReached

```solidity
error RMRKMaxPendingAssetsReached()
```

Attempting to add a pending asset after the number of pending assets has reached the limit (default limit is  128)




### RMRKMintOverMax

```solidity
error RMRKMintOverMax()
```

Attempting to mint a number of tokens that would cause the total supply to be greater than maximum supply




### RMRKMintZero

```solidity
error RMRKMintZero()
```

Attempting to mint zero tokens




### RMRKNewContributorIsZeroAddress

```solidity
error RMRKNewContributorIsZeroAddress()
```

Attempting to assign a 0x0 address as a contributor




### RMRKNewOwnerIsZeroAddress

```solidity
error RMRKNewOwnerIsZeroAddress()
```

Attempting to transfer the ownership to the 0x0 address




### RMRKNoAssetMatchingId

```solidity
error RMRKNoAssetMatchingId()
```

Attempting to interact with an asset that can not be found




### RMRKNotApprovedForAssetsOrOwner

```solidity
error RMRKNotApprovedForAssetsOrOwner()
```

Attempting to manage an asset without owning it or having been granted permission by the owner to do so




### RMRKNotOwner

```solidity
error RMRKNotOwner()
```

Attempting to interact with a management function without being the smart contract&#39;s owner




### RMRKNotOwnerOrContributor

```solidity
error RMRKNotOwnerOrContributor()
```

Attempting to interact with a function without being the owner or contributor of the collection




### RMRKRoyaltiesTooHigh

```solidity
error RMRKRoyaltiesTooHigh()
```

Attempting to set the royalties to a value higher than 100% (10000 in basis points)




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




### RMRKUnexpectedNumberOfAssets

```solidity
error RMRKUnexpectedNumberOfAssets()
```

Attempting to reject all pending assets but more assets than expected are pending





