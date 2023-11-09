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
| supportsNesting | bool | Boolean value signifying whether the collection supports Nestable interface (ERC7401) |
| supportsEquippable | bool | Boolean value signifying whether the collection supports Equippable interface (ERC6220) |
| supportsSoulbound | bool | Boolean value signifying whether the collection supports Soulbound interface (ERC6454) |
| supportsRoyalties | bool | Boolean value signifying whether the collection supports Royaltiesy interface (ERC2981) |

### getPaginatedMintedIds

```solidity
function getPaginatedMintedIds(address targetEquippable, uint256 pageStart, uint256 pageSize) external view returns (uint256[] page)
```

Used to get a list of existing token IDs in the range between `pageStart` and `pageSize`.

*It is not optimized to avoid checking IDs out of max supply nor total supply, since this is not meant to be  used during transaction execution; it is only meant to be used as a getter.The resulting array might be smaller than the given `pageSize` since no-existent IDs are not included.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| targetEquippable | address | Address of the collection smart contract of the given token |
| pageStart | uint256 | The first ID to check |
| pageSize | uint256 | The number of IDs to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| page | uint256[] | An array of IDs of the existing tokens |

### refreshCollectionTokensMetadata

```solidity
function refreshCollectionTokensMetadata(address collectionAddress) external nonpayable
```

Triggers an event to refresh the collection metadata.

*It will do nothing if the given collection address is not a contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| collectionAddress | address | Address of the collection to refresh the metadata from |

### refreshTokenMetadata

```solidity
function refreshTokenMetadata(address collectionAddress, uint256 tokenId) external nonpayable
```

Triggers an event to refresh the token metadata.

*It will do nothing if the given collection address is not a contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| collectionAddress | address | Address of the collection to refresh the metadata from |
| tokenId | uint256 | ID of the token to refresh the metadata from |



## Events

### CollectionTokensMetadataRefreshTriggered

```solidity
event CollectionTokensMetadataRefreshTriggered(address indexed collection)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| collection `indexed` | address | undefined |

### TokenMetadataRefreshTriggered

```solidity
event TokenMetadataRefreshTriggered(address indexed collection, uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| collection `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |



