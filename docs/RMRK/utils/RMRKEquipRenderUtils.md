# RMRKEquipRenderUtils

*RMRK team*

> RMRKEquipRenderUtils

Smart contract of the RMRK Equip render utils module.

*Extra utility functions for composing RMRK extended assets.*

## Methods

### checkExpectedParent

```solidity
function checkExpectedParent(address childAddress, uint256 childId, address expectedParent, uint256 expectedParentId) external view
```

Check if the child is owned by the expected parent.

*Reverts if child token is not owned by an NFT.Reverts if child token is not owned by the expected parent.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| childAddress | address | Address of the child contract |
| childId | uint256 | ID of the child token |
| expectedParent | address | Address of the expected parent contract |
| expectedParentId | uint256 | ID of the expected parent token |

### composeEquippables

```solidity
function composeEquippables(address target, uint256 tokenId, uint64 assetId) external view returns (string metadataURI, uint64 equippableGroupId, address catalogAddress, struct RMRKEquipRenderUtils.FixedPart[] fixedParts, struct RMRKEquipRenderUtils.EquippedSlotPart[] slotParts)
```

Used to compose the given equippables.

*The full `FixedPart` struct looks like this:  [      partId,      z,      metadataURI  ]The full `EquippedSlotPart` struct looks like this:  [      partId,      childAssetId,      z,      childAddress,      childId,      childAssetMetadata,      partMetadata  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to compose the equipped items in the asset for |
| assetId | uint64 | ID of the asset being queried for equipped parts |

#### Returns

| Name | Type | Description |
|---|---|---|
| metadataURI | string | Metadata URI of the asset |
| equippableGroupId | uint64 | Equippable group ID of the asset |
| catalogAddress | address | Address of the catalog to which the asset belongs to |
| fixedParts | RMRKEquipRenderUtils.FixedPart[] | An array of fixed parts respresented by the `FixedPart` structs present on the asset |
| slotParts | RMRKEquipRenderUtils.EquippedSlotPart[] | An array of slot parts represented by the `EquippedSlotPart` structs present on the asset |

### equippedChildrenOf

```solidity
function equippedChildrenOf(address parentAddress, uint256 parentId, uint64 parentAssetId) external view returns (struct IERC6220.Equipment[] equippedChildren)
```

Used to get information about the current children equipped into a specific parent and asset.

*The full `IERC6220.Equipment` struct looks like this:  [       assetId       childAssetId       childId       childEquippableAddress  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the parent token&#39;s smart contract |
| parentId | uint256 | ID of the parent token |
| parentAssetId | uint64 | ID of the target parent asset to use to equip the child |

#### Returns

| Name | Type | Description |
|---|---|---|
| equippedChildren | IERC6220.Equipment[] | An array of `IERC6220.Equipment` structs containing the info  about the equipped children |

### getAllEquippableSlotsFromParent

```solidity
function getAllEquippableSlotsFromParent(address targetChild, uint256 childId, bool onlyEquipped) external view returns (uint256 childIndex, struct RMRKEquipRenderUtils.EquippableData[] equippableData)
```

Used to get the child&#39;s assets and slot parts pairs, identifying parts the said assets can be equipped  into, for all of parent&#39;s assets.

*Reverts if child token is not owned by an NFT.The full `EquippableData` struct looks like this:  [      slotPartId,      childAssetId,      parentAssetId,      priority,      parentCatalogAddress,      isEquipped,      partMetadata  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| targetChild | address | Address of the smart contract of the given token |
| childId | uint256 | ID of the child token whose assets will be matched against parent&#39;s slot parts |
| onlyEquipped | bool | Boolean value signifying whether to only return the assets that are currently equipped (`true`) or to include the non-equipped ones as well (`false`) |

#### Returns

| Name | Type | Description |
|---|---|---|
| childIndex | uint256 | Index of the child in the parent&#39;s list of active children |
| equippableData | RMRKEquipRenderUtils.EquippableData[] | An array of `EquippableData` structs containing info about the equippable child assets and their corresponding slot parts |

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

### getChildIndex

```solidity
function getChildIndex(address parentAddress, uint256 parentId, address childAddress, uint256 childId) external view returns (uint256)
```

Used to retrieve the given child&#39;s index in its parent&#39;s child tokens array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the parent token&#39;s collection smart contract |
| parentId | uint256 | ID of the parent token |
| childAddress | address | Address of the child token&#39;s colection smart contract |
| childId | uint256 | ID of the child token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The index of the child token in the parent token&#39;s child tokens array |

### getChildrenWithTopMetadata

```solidity
function getChildrenWithTopMetadata(address parentAddress, uint256 parentId) external view returns (struct RMRKEquipRenderUtils.ChildWithTopAssetMetadata[])
```



*The full `ChildWithTopAssetMetadata` struct looks like this:  [      contractAddress,      tokenId,      metadata  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the collection smart contract of the parent token |
| parentId | uint256 | ID of the parent token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | RMRKEquipRenderUtils.ChildWithTopAssetMetadata[] | An array of `ChildWithTopAssetMetadata` structs representing the children with their top asset metadata |

### getEquippableSlotsFromParent

```solidity
function getEquippableSlotsFromParent(address targetChild, uint256 childId, uint64 parentAssetId) external view returns (uint256 childIndex, struct RMRKEquipRenderUtils.EquippableData[] equippableData)
```

Used to get the child&#39;s assets and slot parts pairs, identifying parts the said assets can be equipped  into, for a specific parent asset.

*Reverts if child token is not owned by an NFT.The full `EquippableData` struct looks like this:  [      slotPartId,      childAssetId,      parentAssetId,      priority,      parentCatalogAddress,      isEquipped,      partMetadata,      childAssetMetadata,      parentAssetMetadata  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| targetChild | address | Address of the smart contract of the given token |
| childId | uint256 | ID of the child token whose assets will be matched against parent&#39;s slot parts |
| parentAssetId | uint64 | ID of the target parent asset to use to equip the child |

#### Returns

| Name | Type | Description |
|---|---|---|
| childIndex | uint256 | Index of the child in the parent&#39;s list of active children |
| equippableData | RMRKEquipRenderUtils.EquippableData[] | An array of `EquippableData` structs containing info about the equippable child assets and  their corresponding slot parts |

### getEquippableSlotsFromParentForPendingChild

```solidity
function getEquippableSlotsFromParentForPendingChild(address targetChild, uint256 childId, uint64 parentAssetId) external view returns (uint256 childIndex, struct RMRKEquipRenderUtils.EquippableData[] equippableData)
```

Used to get the child&#39;s assets and slot parts pairs, identifying parts the said assets can be equipped  into, for a specific parent asset while the child is in pending array.

*Reverts if child token is not owned by an NFT.The full `EquippableData` struct looks like this:  [      slotPartId,      childAssetId,      parentAssetId,      priority,      parentCatalogAddress,      isEquipped,      partMetadata,      childAssetMetadata,      parentAssetMetadata  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| targetChild | address | Address of the smart contract of the given token |
| childId | uint256 | ID of the child token whose assets will be matched against parent&#39;s slot parts |
| parentAssetId | uint64 | ID of the target parent asset to use to equip the child |

#### Returns

| Name | Type | Description |
|---|---|---|
| childIndex | uint256 | Index of the child in the parent&#39;s list of pending children |
| equippableData | RMRKEquipRenderUtils.EquippableData[] | An array of `EquippableData` structs containing info about the equippable child assets and  their corresponding slot parts |

### getEquipped

```solidity
function getEquipped(address target, uint64 tokenId, uint64 assetId) external view returns (uint64[] slotPartIds, struct IERC6220.Equipment[] childrenEquipped, string[] childrenAssetMetadata)
```

Used to retrieve the equipped parts of the given token.

*NOTE: Some of the equipped children might be empty.The full `Equipment` struct looks like this:  [      assetId,      childAssetId,      childId,      childEquippableAddress  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint64 | ID of the token to retrieve the equipped items in the asset for |
| assetId | uint64 | ID of the asset being queried for equipped parts |

#### Returns

| Name | Type | Description |
|---|---|---|
| slotPartIds | uint64[] | An array of the IDs of the slot parts present in the given asset |
| childrenEquipped | IERC6220.Equipment[] | An array of `Equipment` structs containing info about the equipped children |
| childrenAssetMetadata | string[] | An array of strings corresponding to asset metadata of the equipped children |

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

### getExtendedEquippableActiveAssets

```solidity
function getExtendedEquippableActiveAssets(address target, uint256 tokenId) external view returns (struct RMRKEquipRenderUtils.ExtendedEquippableActiveAsset[])
```

Used to get extended active assets of the given token.

*The full `ExtendedEquippableActiveAsset` looks like this:  [      ID,      equippableGroupId,      priority,      catalogAddress,      metadata,      [          fixedPartId0,          fixedPartId1,          fixedPartId2,          slotPartId0,          slotPartId1,          slotPartId2      ]  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the extended active assets for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | RMRKEquipRenderUtils.ExtendedEquippableActiveAsset[] | An array of ExtendedEquippableActiveAssets present on the given token |

### getExtendedNft

```solidity
function getExtendedNft(uint256 tokenId, address targetCollection) external view returns (struct RMRKRenderUtils.ExtendedNft data)
```

Used to get extended information about a specified token.

*The full `ExtendedNft` struct looks like this:  [      tokenMetadataUri,      directOwner,      rootOwner,      activeAssetCount,      pendingAssetCount      priorities,      maxSupply,      totalSupply,      issuer,      name,      symbol,      activeChildrenNumber,      isSoulbound,      hasMultiAssetInterface,      hasNestingInterface,      hasEquippableInterface  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to retireve the `ExtendedNft` struct |
| targetCollection | address | Address of the collection to which the specified token belongs to |

#### Returns

| Name | Type | Description |
|---|---|---|
| data | RMRKRenderUtils.ExtendedNft | The `ExtendedNft` struct containing the specified token&#39;s data |

### getExtendedPendingAssets

```solidity
function getExtendedPendingAssets(address target, uint256 tokenId) external view returns (struct RMRKEquipRenderUtils.ExtendedPendingAsset[])
```

Used to get the extended pending assets of the given token.

*The full `ExtendedPendingAsset` looks like this:  [      ID,      equippableGroupId,      acceptRejectIndex,      replacesAssetWithId,      catalogAddress,      metadata,      [          fixedPartId0,          fixedPartId1,          fixedPartId2,          slotPartId0,          slotPartId1,          slotPartId2      ]  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenId | uint256 | ID of the token to retrieve the extended pending assets for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | RMRKEquipRenderUtils.ExtendedPendingAsset[] | An array of ExtendedPendingAssets present on the given token |

### getPaginatedMintedIds

```solidity
function getPaginatedMintedIds(address target, uint256 pageStart, uint256 pageSize) external view returns (uint256[] page)
```

Used to get a list of existing token IDs in the range between `pageStart` and `pageSize`.

*It is not optimized to avoid checking IDs out of max supply nor total supply, since this is not meant to be  used during transaction execution; it is only meant to be used as a getter.The resulting array might be smaller than the given `pageSize` since no-existent IDs are not included.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the collection smart contract of the given token |
| pageStart | uint256 | The first ID to check |
| pageSize | uint256 | The number of IDs to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| page | uint256[] | An array of IDs of the existing tokens |

### getParent

```solidity
function getParent(address childAddress, uint256 childId) external view returns (address parentAddress, uint256 parentId)
```

Used to retrieve the contract address and ID of the parent token of the specified child token.

*Reverts if child token is not owned by an NFT.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| childAddress | address | Address of the child token&#39;s collection smart contract |
| childId | uint256 | ID of the child token |

#### Returns

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the parent token&#39;s collection smart contract |
| parentId | uint256 | ID of the parent token |

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

### getPendingChildIndex

```solidity
function getPendingChildIndex(address parentAddress, uint256 parentId, address childAddress, uint256 childId) external view returns (uint256)
```

Used to retrieve the given child&#39;s index in its parent&#39;s pending child tokens array.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the parent token&#39;s collection smart contract |
| parentId | uint256 | ID of the parent token |
| childAddress | address | Address of the child token&#39;s colection smart contract |
| childId | uint256 | ID of the child token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The index of the child token in the parent token&#39;s pending child tokens array |

### getSlotPartsAndCatalog

```solidity
function getSlotPartsAndCatalog(address tokenAddress, uint256 tokenId, uint64 assetId) external view returns (uint64[] parentSlotPartIds, address catalogAddress)
```

Used to retrieve the parent address and its slot part IDs for a given target child, and the catalog of the parent asset.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | Address of the collection smart contract of parent token |
| tokenId | uint256 | ID of the parent token |
| assetId | uint64 | ID of the parent asset from which to get the slot parts |

#### Returns

| Name | Type | Description |
|---|---|---|
| parentSlotPartIds | uint64[] | Array of slot part IDs of the parent token&#39;s asset |
| catalogAddress | address | Address of the catalog the parent asset belongs to |

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

### getTopAssetAndEquippableDataForToken

```solidity
function getTopAssetAndEquippableDataForToken(address target, uint256 tokenId) external view returns (struct RMRKEquipRenderUtils.ExtendedEquippableActiveAsset topAsset)
```

Used to retrieve the equippable data of the specified token&#39;s asset with the highest priority.



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the collection smart contract of the specified token |
| tokenId | uint256 | ID of the token for which to retrieve the equippable data of the asset with the highest priority |

#### Returns

| Name | Type | Description |
|---|---|---|
| topAsset | RMRKEquipRenderUtils.ExtendedEquippableActiveAsset | `ExtendedEquippableActiveAsset` struct with the equippable data containing the asset with the  highest priority |

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

### getTopAssetMetadataForTokens

```solidity
function getTopAssetMetadataForTokens(address target, uint256[] tokenIds) external view returns (string[] metadata)
```

Used to retrieve the metadata URI of the specified token&#39;s asset with the highest priority for each of the given tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| tokenIds | uint256[] | IDs of the tokens for which to retrieve the metadata URI |

#### Returns

| Name | Type | Description |
|---|---|---|
| metadata | string[] | An array of strings with the top asset metadata for each the given tokens, in the same order of input |

### isAssetEquipped

```solidity
function isAssetEquipped(address parentAddress, uint256 parentId, address parentAssetCatalog, address childAddress, uint256 childId, uint64 childAssetId, uint64 slotPartId) external view returns (bool isEquipped)
```

Used to verify whether a given child asset is equipped into a given parent slot.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the collection smart contract of the parent token |
| parentId | uint256 | ID of the parent token |
| parentAssetCatalog | address | Address of the catalog the parent asset belongs to |
| childAddress | address | Address of the collection smart contract of the child token |
| childId | uint256 | ID of the child token |
| childAssetId | uint64 | ID of the child asset |
| slotPartId | uint64 | ID of the slot part |

#### Returns

| Name | Type | Description |
|---|---|---|
| isEquipped | bool | Boolean value signifying whether the child asset is equipped into the parent slot or not |

### splitSlotAndFixedParts

```solidity
function splitSlotAndFixedParts(uint64[] allPartIds, address catalogAddress) external view returns (uint64[] slotPartIds, uint64[] fixedPartIds)
```

Used to split slot and fixed parts.



#### Parameters

| Name | Type | Description |
|---|---|---|
| allPartIds | uint64[] | [] An array of `Part` IDs containing both, `Slot` and `Fixed` parts |
| catalogAddress | address | An address of the catalog to which the given `Part`s belong to |

#### Returns

| Name | Type | Description |
|---|---|---|
| slotPartIds | uint64[] | An array of IDs of the `Slot` parts included in the `allPartIds` |
| fixedPartIds | uint64[] | An array of IDs of the `Fixed` parts included in the `allPartIds` |




## Errors

### RMRKChildNotFoundInParent

```solidity
error RMRKChildNotFoundInParent()
```

Attempting to find the index of a child token on a parent which does not own it.




### RMRKNotComposableAsset

```solidity
error RMRKNotComposableAsset()
```

Attempting to compose an asset wihtout having an associated Catalog




### RMRKParentIsNotNFT

```solidity
error RMRKParentIsNotNFT()
```

Attempting an operation requiring the token being nested, while it is not




### RMRKTokenHasNoAssets

```solidity
error RMRKTokenHasNoAssets()
```

Attempting to determine the asset with the top priority on a token without assets




### RMRKUnexpectedParent

```solidity
error RMRKUnexpectedParent()
```

Attempting an operation expecting a parent to the token which is not the actual one





