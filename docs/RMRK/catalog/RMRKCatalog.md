# RMRKCatalog

*RMRK team*

> RMRKCatalog

Catalog contract for RMRK equippable module.



## Methods

### checkIsEquippable

```solidity
function checkIsEquippable(uint64 partId, address targetAddress) external view returns (bool)
```

Used to check whether the given address is allowed to equip the desired `Part`.

*Returns true if a collection may equip asset with `partId`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | The ID of the part that we are checking |
| targetAddress | address | The address that we are checking for whether the part can be equipped into it or not |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | The status indicating whether the `targetAddress` can be equipped into `Part` with `partId` or not |

### checkIsEquippableToAll

```solidity
function checkIsEquippableToAll(uint64 partId) external view returns (bool)
```

Used to check if the part is equippable by all addresses.

*Returns true if part is equippable to all.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | ID of the part that we are checking |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | The status indicating whether the part with `partId` can be equipped by any address or not |

### getMetadataURI

```solidity
function getMetadataURI() external view returns (string)
```

Used to return the metadata URI of the associated Catalog.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | Catalog metadata URI |

### getPart

```solidity
function getPart(uint64 partId) external view returns (struct IRMRKCatalog.Part)
```

Used to retrieve a `Part` with id `partId`



#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | ID of the part that we are retrieving |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKCatalog.Part | The `Part` struct associated with given `partId` |

### getParts

```solidity
function getParts(uint64[] partIds) external view returns (struct IRMRKCatalog.Part[])
```

Used to retrieve multiple parts at the same time.



#### Parameters

| Name | Type | Description |
|---|---|---|
| partIds | uint64[] | An array of part IDs that we want to retrieve |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKCatalog.Part[] | An array of `Part` structs associated with given `partIds` |

### getType

```solidity
function getType() external view returns (string)
```

Used to return the `itemType` of the associated Catalog




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | `itemType` of the associated Catalog |

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



## Events

### AddedEquippables

```solidity
event AddedEquippables(uint64 indexed partId, address[] equippableAddresses)
```

Event to announce new equippables to the part.



#### Parameters

| Name | Type | Description |
|---|---|---|
| partId `indexed` | uint64 | undefined |
| equippableAddresses  | address[] | undefined |

### AddedPart

```solidity
event AddedPart(uint64 indexed partId, enum IRMRKCatalog.ItemType indexed itemType, uint8 zIndex, address[] equippableAddresses, string metadataURI)
```

Event to announce addition of a new part.



#### Parameters

| Name | Type | Description |
|---|---|---|
| partId `indexed` | uint64 | undefined |
| itemType `indexed` | enum IRMRKCatalog.ItemType | undefined |
| zIndex  | uint8 | undefined |
| equippableAddresses  | address[] | undefined |
| metadataURI  | string | undefined |

### SetEquippableToAll

```solidity
event SetEquippableToAll(uint64 indexed partId)
```

Event to announce that a given part can be equipped by any address.



#### Parameters

| Name | Type | Description |
|---|---|---|
| partId `indexed` | uint64 | undefined |

### SetEquippables

```solidity
event SetEquippables(uint64 indexed partId, address[] equippableAddresses)
```

Event to announce the overriding of equippable addresses of the part.



#### Parameters

| Name | Type | Description |
|---|---|---|
| partId `indexed` | uint64 | undefined |
| equippableAddresses  | address[] | undefined |



