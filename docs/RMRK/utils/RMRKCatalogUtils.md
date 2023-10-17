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




