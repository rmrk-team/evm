# RMRKEquippablePreMint

*RMRK team*

> RMRKEquippablePreMint

Implementation of RMRK equippable module with pre-minting.



## Methods

### RMRK_INTERFACE

```solidity
function RMRK_INTERFACE() external pure returns (bytes4 rmrkInterface)
```

Interface identifier of the @rmrk-team/evm-contracts package




#### Returns

| Name | Type | Description |
|---|---|---|
| rmrkInterface | bytes4 | Interface identifier for implementations of the @rmrk-team/evm-contracts package |

### VERSION

```solidity
function VERSION() external pure returns (string version)
```

Version of the @rmrk-team/evm-contracts package




#### Returns

| Name | Type | Description |
|---|---|---|
| version | string | Version identifier for implementations of the @rmrk-team/evm-contracts package |

### acceptAsset

```solidity
function acceptAsset(uint256 tokenId, uint256 index, uint64 assetId) external nonpayable
```

Accepts a asset at from the pending array of given token.

*Migrates the asset from the token&#39;s pending asset array to the token&#39;s active asset array.Active assets cannot be removed by anyone, but can be replaced by a new asset.Requirements:  - The caller must own the token or be approved to manage the token&#39;s assets  - `tokenId` must exist.  - `index` must be in range of the length of the pending asset array.Emits an {AssetAccepted} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to accept the pending asset |
| index | uint256 | Index of the asset in the pending array to accept |
| assetId | uint64 | ID of the asset that is being accepted |

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

### addAssetEntry

```solidity
function addAssetEntry(string metadataURI) external nonpayable returns (uint256 assetId)
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
| assetId | uint256 | ID of the newly added asset |

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

### addEquippableAssetEntry

```solidity
function addEquippableAssetEntry(uint64 equippableGroupId, address catalogAddress, string metadataURI, uint64[] partIds) external nonpayable returns (uint256 assetId)
```

Used to add an equippable asset entry.

*The ID of the asset is automatically assigned to be the next available asset ID.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| equippableGroupId | uint64 | ID of the equippable group |
| catalogAddress | address | Address of the `Catalog` smart contract this asset belongs to |
| metadataURI | string | Metadata URI of the asset |
| partIds | uint64[] | An array of IDs of fixed and slot parts to be included in the asset |

#### Returns

| Name | Type | Description |
|---|---|---|
| assetId | uint256 | The ID of the newly added asset |

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

Used to grant approvals for specific tokens to a specified address.

*This can only be called by the owner of the token or by an account that has been granted permission to  manage all of the owner&#39;s assets.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | Address of the account to receive the approval to the specified token |
| tokenId | uint256 | ID of the token for which we are granting the permission |

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256 balance)
```

Used to retrieve the number of tokens in `owner`&#39;s account.



#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | Address of the account being checked |

#### Returns

| Name | Type | Description |
|---|---|---|
| balance | uint256 | The balance of the given account |

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
function burn(uint256 tokenId, uint256 maxChildrenBurns) external nonpayable returns (uint256 burnedChildren)
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
| burnedChildren | uint256 | Number of recursively burned children |

### canTokenBeEquippedWithAssetIntoSlot

```solidity
function canTokenBeEquippedWithAssetIntoSlot(address parent, uint256 tokenId, uint64 assetId, uint64 slotId) external view returns (bool canBeEquipped)
```

Used to verify whether a token can be equipped into a given parent&#39;s slot.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parent | address | Address of the parent token&#39;s smart contract |
| tokenId | uint256 | ID of the token we want to equip |
| assetId | uint64 | ID of the asset associated with the token we want to equip |
| slotId | uint64 | ID of the slot that we want to equip the token into |

#### Returns

| Name | Type | Description |
|---|---|---|
| canBeEquipped | bool | A boolean indicating whether the token with the given asset can be equipped into the desired slot |

### childOf

```solidity
function childOf(uint256 parentId, uint256 index) external view returns (struct IERC7401.Child child)
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
| child | IERC7401.Child | A Child struct containing data about the specified child |

### childrenOf

```solidity
function childrenOf(uint256 parentId) external view returns (struct IERC7401.Child[] children)
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
| children | IERC7401.Child[] | An array of Child structs containing the parent token&#39;s active child tokens |

### contractURI

```solidity
function contractURI() external view returns (string contractURI_)
```

Used to retrieve the metadata URI of the collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| contractURI_ | string | string The metadata URI of the collection |

### directOwnerOf

```solidity
function directOwnerOf(uint256 tokenId) external view returns (address owner_, uint256 parentId, bool isNFT)
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
| owner_ | address | Address of the given token&#39;s owner |
| parentId | uint256 | The ID of the parent token. Should be `0` if the owner is an externally owned account |
| isNFT | bool | The boolean value signifying whether the owner is an NFT or not |

### equip

```solidity
function equip(IERC6220.IntakeEquip data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| data | IERC6220.IntakeEquip | undefined |

### getActiveAssetPriorities

```solidity
function getActiveAssetPriorities(uint256 tokenId) external view returns (uint64[] priorities)
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
| priorities | uint64[] | An array of priorities of the active assets of the given token |

### getActiveAssets

```solidity
function getActiveAssets(uint256 tokenId) external view returns (uint64[] assetIds)
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
| assetIds | uint64[] | An array of active asset IDs of the given token |

### getApproved

```solidity
function getApproved(uint256 tokenId) external view returns (address approved)
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
| approved | address | Address of the account approved to manage the token |

### getApprovedForAssets

```solidity
function getApprovedForAssets(uint256 tokenId) external view returns (address approved)
```

Used to get the address of the user that is approved to manage the specified token from the current  owner.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token we are checking |

#### Returns

| Name | Type | Description |
|---|---|---|
| approved | address | Address of the account that is approved to manage the token |

### getAssetAndEquippableData

```solidity
function getAssetAndEquippableData(uint256 tokenId, uint64 assetId) external view returns (string metadataURI, uint64 equippableGroupId, address catalogAddress, uint64[] partIds)
```

Used to get the asset and equippable data associated with given `assetId`.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to retrieve the asset |
| assetId | uint64 | ID of the asset of which we are retrieving |

#### Returns

| Name | Type | Description |
|---|---|---|
| metadataURI | string | The metadata URI of the asset |
| equippableGroupId | uint64 | ID of the equippable group this asset belongs to |
| catalogAddress | address | The address of the catalog the part belongs to |
| partIds | uint64[] | An array of IDs of parts included in the asset |

### getAssetMetadata

```solidity
function getAssetMetadata(uint256 tokenId, uint64 assetId) external view returns (string metadata)
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
| metadata | string | The metadata of the asset belonging to the specified index in the token&#39;s active assets  array |

### getAssetReplacements

```solidity
function getAssetReplacements(uint256 tokenId, uint64 newAssetId) external view returns (uint64 replacedAssetId)
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
| replacedAssetId | uint64 | ID of the asset which will be replaced |

### getEquipment

```solidity
function getEquipment(uint256 tokenId, address targetCatalogAddress, uint64 slotPartId) external view returns (struct IERC6220.Equipment equipment)
```

Used to get the Equipment object equipped into the specified slot of the desired token.

*The `Equipment` struct consists of the following data:  [      assetId,      childAssetId,      childId,      childEquippableAddress  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which we are retrieving the equipped object |
| targetCatalogAddress | address | Address of the `Catalog` associated with the `Slot` part of the token |
| slotPartId | uint64 | ID of the `Slot` part that we are checking for equipped objects |

#### Returns

| Name | Type | Description |
|---|---|---|
| equipment | IERC6220.Equipment | The `Equipment` struct containing data about the equipped object |

### getPendingAssets

```solidity
function getPendingAssets(uint256 tokenId) external view returns (uint64[] assetIds)
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
| assetIds | uint64[] | An array of pending asset IDs of the given token |

### getRoyaltyPercentage

```solidity
function getRoyaltyPercentage() external view returns (uint256 royaltyPercentageBps)
```

Used to retrieve the specified royalty percentage.




#### Returns

| Name | Type | Description |
|---|---|---|
| royaltyPercentageBps | uint256 | The royalty percentage expressed in the basis points |

### getRoyaltyRecipient

```solidity
function getRoyaltyRecipient() external view returns (address recipient)
```

Used to retrieve the recipient of royalties.




#### Returns

| Name | Type | Description |
|---|---|---|
| recipient | address | Address of the recipient of royalties |

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool isApproved)
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
| isApproved | bool | A boolean value signifying whether the *operator* is allowed to manage the tokens of the *owner* (`true`)  or not (`false`) |

### isApprovedForAllForAssets

```solidity
function isApprovedForAllForAssets(address owner, address operator) external view returns (bool isApproved)
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
| isApproved | bool | A boolean value indicating whether the account we are checking has been granted the operator role |

### isChildEquipped

```solidity
function isChildEquipped(uint256 tokenId, address childAddress, uint256 childId) external view returns (bool isEquipped)
```

Used to check whether the token has a given child equipped.

*This is used to prevent from transferring a child that is equipped.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the parent token for which we are querying for |
| childAddress | address | Address of the child token&#39;s smart contract |
| childId | uint256 | ID of the child token |

#### Returns

| Name | Type | Description |
|---|---|---|
| isEquipped | bool | A boolean value indicating whether the child token is equipped into the given token or not |

### isContributor

```solidity
function isContributor(address contributor) external view returns (bool isContributor_)
```

Used to check if the address is one of the contributors.



#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor | address | Address of the contributor whose status we are checking |

#### Returns

| Name | Type | Description |
|---|---|---|
| isContributor_ | bool | Boolean value indicating whether the address is a contributor or not |

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
function maxSupply() external view returns (uint256 maxSupply_)
```

Used to retrieve the maximum supply of the collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| maxSupply_ | uint256 | The maximum supply of tokens in the collection |

### mint

```solidity
function mint(address to, uint256 numToMint, string tokenURI) external nonpayable returns (uint256 firstTokenId)
```

Used to mint the desired number of tokens to the specified address.

*The `data` value of the `_safeMint` method is set to an empty value.Can only be called while the open sale is open.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | Address to which to mint the token |
| numToMint | uint256 | Number of tokens to mint |
| tokenURI | string | URI assigned to all the minted tokens |

#### Returns

| Name | Type | Description |
|---|---|---|
| firstTokenId | uint256 | The ID of the first token to be minted in the current minting cycle |

### name

```solidity
function name() external view returns (string name_)
```

Used to retrieve the collection name.




#### Returns

| Name | Type | Description |
|---|---|---|
| name_ | string | Name of the collection |

### nestMint

```solidity
function nestMint(address to, uint256 numToMint, uint256 destinationId, string tokenURI) external nonpayable returns (uint256 firstTokenId)
```

Used to mint a desired number of child tokens to a given parent token.

*The `data` value of the `_safeMint` method is set to an empty value.Can only be called while the open sale is open.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | Address of the collection smart contract of the token into which to mint the child token |
| numToMint | uint256 | Number of tokens to mint |
| destinationId | uint256 | ID of the token into which to mint the new child token |
| tokenURI | string | URI assigned to all the minted tokens |

#### Returns

| Name | Type | Description |
|---|---|---|
| firstTokenId | uint256 | The ID of the first token to be minted in the current minting cycle |

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

### owner

```solidity
function owner() external view returns (address owner_)
```

Returns the address of the current owner.




#### Returns

| Name | Type | Description |
|---|---|---|
| owner_ | address | Address of the current owner |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address owner_)
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
| owner_ | address | The *root* owner of the token |

### pendingChildOf

```solidity
function pendingChildOf(uint256 parentId, uint256 index) external view returns (struct IERC7401.Child child)
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
| child | IERC7401.Child | A Child struct containting data about the specified child |

### pendingChildrenOf

```solidity
function pendingChildrenOf(uint256 parentId) external view returns (struct IERC7401.Child[] children)
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
| children | IERC7401.Child[] | An array of Child structs containing the parent token&#39;s pending child tokens |

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

Rejects a asset from the pending array of given token.

*Removes the asset from the token&#39;s pending asset array.Requirements:  - The caller must own the token or be approved to manage the token&#39;s assets  - `tokenId` must exist.  - `index` must be in range of the length of the pending asset array.Emits a {AssetRejected} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token that the asset is being rejected from |
| index | uint256 | Index of the asset in the pending array to be rejected |
| assetId | uint64 | ID of the asset that is being rejected |

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
| priorities | uint64[] | An array of priority values |

### setValidParentForEquippableGroup

```solidity
function setValidParentForEquippableGroup(uint64 equippableGroupId, address parentAddress, uint64 partId) external nonpayable
```

Used to declare that the assets belonging to a given `equippableGroupId` are equippable into the `Slot`  associated with the `partId` of the collection at the specified `parentAddress`



#### Parameters

| Name | Type | Description |
|---|---|---|
| equippableGroupId | uint64 | ID of the equippable group |
| parentAddress | address | Address of the parent into which the equippable group can be equipped into |
| partId | uint64 | ID of the `Slot` that the items belonging to the equippable group can be equipped into |

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
function symbol() external view returns (string symbol_)
```

Used to retrieve the collection symbol.




#### Returns

| Name | Type | Description |
|---|---|---|
| symbol_ | string | Symbol of the collection |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string tokenURI_)
```

Used to retrieve the metadata URI of a token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token to retrieve the metadata URI for |

#### Returns

| Name | Type | Description |
|---|---|---|
| tokenURI_ | string | Metadata URI of the specified token |

### totalAssets

```solidity
function totalAssets() external view returns (uint256 totalAssets_)
```

Used to retrieve the total number of assets.




#### Returns

| Name | Type | Description |
|---|---|---|
| totalAssets_ | uint256 | The total number of assets |

### totalSupply

```solidity
function totalSupply() external view returns (uint256 totalSupply_)
```

Used to retrieve the total supply of the tokens in a collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| totalSupply_ | uint256 | The number of tokens in a collection |

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

### unequip

```solidity
function unequip(uint256 tokenId, uint64 assetId, uint64 slotPartId) external nonpayable
```

Used to unequip child from parent token.

*This can only be called by the owner of the token or by an account that has been granted permission to  manage the given token by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the parent from which the child is being unequipped |
| assetId | uint64 | ID of the parent&#39;s asset that contains the `Slot` into which the child is equipped |
| slotPartId | uint64 | ID of the `Slot` from which to unequip the child |

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

### ChildAssetEquipped

```solidity
event ChildAssetEquipped(uint256 indexed tokenId, uint64 indexed assetId, uint64 indexed slotPartId, uint256 childId, address childAddress, uint64 childAssetId)
```

Used to notify listeners that a child&#39;s asset has been equipped into one of its parent assets.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that had an asset equipped |
| assetId `indexed` | uint64 | ID of the asset associated with the token we are equipping into |
| slotPartId `indexed` | uint64 | ID of the slot we are using to equip |
| childId  | uint256 | ID of the child token we are equipping into the slot |
| childAddress  | address | Address of the child token&#39;s collection |
| childAssetId  | uint64 | ID of the asset associated with the token we are equipping |

### ChildAssetUnequipped

```solidity
event ChildAssetUnequipped(uint256 indexed tokenId, uint64 indexed assetId, uint64 indexed slotPartId, uint256 childId, address childAddress, uint64 childAssetId)
```

Used to notify listeners that a child&#39;s asset has been unequipped from one of its parent assets.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | ID of the token that had an asset unequipped |
| assetId `indexed` | uint64 | ID of the asset associated with the token we are unequipping out of |
| slotPartId `indexed` | uint64 | ID of the slot we are unequipping from |
| childId  | uint256 | ID of the token being unequipped |
| childAddress  | address | Address of the collection that a token that is being unequipped belongs to |
| childAssetId  | uint64 | ID of the asset associated with the token we are unequipping |

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
event ChildTransferred(uint256 indexed tokenId, uint256 childIndex, address indexed childAddress, uint256 indexed childId, bool fromPending, bool toZero)
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
| toZero  | bool | A boolean value signifying whether the token is being transferred to the `0x0` address (`true`) or  not (`false`) |

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

### ValidParentEquippableGroupIdSet

```solidity
event ValidParentEquippableGroupIdSet(uint64 indexed equippableGroupId, uint64 indexed slotPartId, address parentAddress)
```

Used to notify listeners that the assets belonging to a `equippableGroupId` have been marked as  equippable into a given slot and parent



#### Parameters

| Name | Type | Description |
|---|---|---|
| equippableGroupId `indexed` | uint64 | ID of the equippable group being marked as equippable into the slot associated with  `slotPartId` of the `parentAddress` collection |
| slotPartId `indexed` | uint64 | ID of the slot part of the catalog into which the parts belonging to the equippable group  associated with `equippableGroupId` can be equipped |
| parentAddress  | address | Address of the collection into which the parts belonging to `equippableGroupId` can be  equipped |



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




### IndexOutOfBounds

```solidity
error IndexOutOfBounds()
```






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




### RMRKCatalogRequiredForParts

```solidity
error RMRKCatalogRequiredForParts()
```

Attempting to add an asset entry with `Part`s, without setting the `Catalog` address




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




### RMRKEquippableEquipNotAllowedByCatalog

```solidity
error RMRKEquippableEquipNotAllowedByCatalog()
```

Attempting to equip a `Part` with a child not approved by the Catalog




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




### RMRKIsNotContract

```solidity
error RMRKIsNotContract()
```

Attempting to interact with an end-user account when the contract account is expected




### RMRKMaxPendingAssetsReached

```solidity
error RMRKMaxPendingAssetsReached()
```

Attempting to add a pending asset after the number of pending assets has reached the limit (default limit is  128)




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




### RMRKMustUnequipFirst

```solidity
error RMRKMustUnequipFirst()
```

Attempting to transfer a child before it is unequipped




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




### RMRKNotApprovedOrDirectOwner

```solidity
error RMRKNotApprovedOrDirectOwner()
```

Attempting to interact with a token without being its owner or having been granted permission by the  owner to do so

*When a token is nested, only the direct owner (NFT parent) can mange it. In that case, approved addresses are  not allowed to manage it, in order to ensure the expected behaviour*


### RMRKNotEquipped

```solidity
error RMRKNotEquipped()
```

Attempting to unequip an item that isn&#39;t equipped




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




### RMRKPendingChildIndexOutOfRange

```solidity
error RMRKPendingChildIndexOutOfRange()
```

Attempting to interact with a pending child using an index greater than the size of pending array




### RMRKRoyaltiesTooHigh

```solidity
error RMRKRoyaltiesTooHigh()
```

Attempting to set the royalties to a value higher than 100% (10000 in basis points)




### RMRKSlotAlreadyUsed

```solidity
error RMRKSlotAlreadyUsed()
```

Attempting to equip an item into a slot that already has an item equipped




### RMRKTargetAssetCannotReceiveSlot

```solidity
error RMRKTargetAssetCannotReceiveSlot()
```

Attempting to equip an item into a `Slot` that the target asset does not implement




### RMRKTokenCannotBeEquippedWithAssetIntoSlot

```solidity
error RMRKTokenCannotBeEquippedWithAssetIntoSlot()
```

Attempting to equip a child into a `Slot` and parent that the child&#39;s collection doesn&#39;t support




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




### RentrantCall

```solidity
error RentrantCall()
```







