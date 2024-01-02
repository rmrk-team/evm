# RMRKCatalogUtils

*RMRK team*

> RMRKCatalogUtils

Smart contract of the RMRK Catalog utils module.

*Extra utility functions for RMRK contracts.*

## Methods

### getCatalogData

```solidity
function getCatalogData(address catalog) external view returns (address owner, string type_, string metadataURI)
```

Used to get the catalog data of a specified catalog in a single call.

*The owner might be address 0 if the catalog does not implement the `Ownable` interface.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| catalog | address | Address of the catalog to get the data from |

#### Returns

| Name | Type | Description |
|---|---|---|
| owner | address | The address of the owner of the catalog |
| type_ | string | The type of the catalog |
| metadataURI | string | The metadata URI of the catalog |

### getCatalogDataAndExtendedParts

```solidity
function getCatalogDataAndExtendedParts(address catalog, uint64[] partIds) external view returns (address owner, string type_, string metadataURI, struct RMRKCatalogUtils.ExtendedPart[] parts)
```

Used to get the catalog data and the extended part data of many parts from the specified catalog in a single call.



#### Parameters

| Name | Type | Description |
|---|---|---|
| catalog | address | Address of the catalog to get the data from |
| partIds | uint64[] | Array of part IDs to get the data from |

#### Returns

| Name | Type | Description |
|---|---|---|
| owner | address | The address of the owner of the catalog |
| type_ | string | The type of the catalog |
| metadataURI | string | The metadata URI of the catalog |
| parts | RMRKCatalogUtils.ExtendedPart[] | Array of extended part data structs containing the part data |

### getExtendedParts

```solidity
function getExtendedParts(address catalog, uint64[] partIds) external view returns (struct RMRKCatalogUtils.ExtendedPart[] parts)
```

Used to get the extended part data of many parts from the specified catalog in a single call.



#### Parameters

| Name | Type | Description |
|---|---|---|
| catalog | address | Address of the catalog to get the data from |
| partIds | uint64[] | Array of part IDs to get the data from |

#### Returns

| Name | Type | Description |
|---|---|---|
| parts | RMRKCatalogUtils.ExtendedPart[] | Array of extended part data structs containing the part data |

### getOrphanedEquipmentFromChildAsset

```solidity
function getOrphanedEquipmentFromChildAsset(address parentAddress, uint256 parentId) external view returns (struct RMRKCatalogUtils.ExtendedEquipment[] equipments)
```

Used to get data about children equipped to a specified token, where the child asset has been replaced.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the collection smart contract of parent token |
| parentId | uint256 | ID of the parent token |

#### Returns

| Name | Type | Description |
|---|---|---|
| equipments | RMRKCatalogUtils.ExtendedEquipment[] | Array of extended equipment data structs containing the equipment data, including the slot part ID |

### getOrphanedEquipmentsFromParentAsset

```solidity
function getOrphanedEquipmentsFromParentAsset(address parentAddress, uint256 parentId, address catalogAddress, uint64[] slotPartIds) external view returns (struct RMRKCatalogUtils.ExtendedEquipment[] equipments)
```

Used to get data about children equipped to a specified token, where the parent asset has been replaced.



#### Parameters

| Name | Type | Description |
|---|---|---|
| parentAddress | address | Address of the collection smart contract of parent token |
| parentId | uint256 | ID of the parent token |
| catalogAddress | address | Address of the catalog the slot part Ids belong to |
| slotPartIds | uint64[] | Array of slot part IDs of the parent token&#39;s assets to search for orphan equipments |

#### Returns

| Name | Type | Description |
|---|---|---|
| equipments | RMRKCatalogUtils.ExtendedEquipment[] | Array of extended equipment data structs containing the equipment data, including the slot part ID |

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

### RMRKNotComposableAsset

```solidity
error RMRKNotComposableAsset()
```

Attempting to compose an asset wihtout having an associated Catalog





