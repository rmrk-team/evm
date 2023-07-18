# RMRKCollectionUtils

*RMRK team*

> RMRKCollectionUtils

Smart contract of the RMRK Collection utils module.

*Extra utility functions for RMRK contracts.*

## Methods

### getCollectionData

```solidity
function getCollectionData(address collection) external view returns (struct RMRKCollectionUtils.CollectionData data)
```

Used to get the collection data of a specified collection.

*The full `CollectionData` struct looks like this:  [      totalSupply,      maxSupply,      royaltyPercentage,      royaltyRecipient,      owner,      symbol,      name,      collectionMetadata  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | Address of the collection to get the data from |

#### Returns

| Name | Type | Description |
|---|---|---|
| data | RMRKCollectionUtils.CollectionData | Collection data struct containing the collection data |

### getInterfaceSupport

```solidity
function getInterfaceSupport(address collection) external view returns (bool supports721, bool supportsMultiAsset, bool supportsNesting, bool supportsEquippable, bool supportsSoulbound, bool supportsRoyalties)
```

Used to get the interface support of a specified collection.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | Address of the collection to get the interface support from |

#### Returns

| Name | Type | Description |
|---|---|---|
| supports721 | bool | Boolean value signifying whether the collection supports ERC721 interface |
| supportsMultiAsset | bool | Boolean value signifying whether the collection supports MultiAsset interface (ERC5773) |
| supportsNesting | bool | Boolean value signifying whether the collection supports Nestable interface (ERC6059) |
| supportsEquippable | bool | Boolean value signifying whether the collection supports Equippable interface (ERC6220) |
| supportsSoulbound | bool | Boolean value signifying whether the collection supports Soulbound interface (ERC6454) |
| supportsRoyalties | bool | Boolean value signifying whether the collection supports Royaltiesy interface (ERC2981) |




