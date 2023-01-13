# Solidity API

## IRMRKCatalog

An interface Catalog for RMRK equippable module.

### AddedPart

```solidity
event AddedPart(uint64 partId, enum IRMRKCatalog.ItemType itemType, uint8 zIndex, address[] equippableAddresses, string metadataURI)
```

Event to announce addition of a new part.

_It is emitted when a new part is added._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the part that was added |
| itemType | enum IRMRKCatalog.ItemType | Enum value specifying whether the part is `None`, `Slot` and `Fixed` |
| zIndex | uint8 | An uint specifying the z value of the part. It is used to specify the depth which the part should  be rendered at |
| equippableAddresses | address[] | An array of addresses that can equip this part |
| metadataURI | string | The metadata URI of the part |

### AddedEquippables

```solidity
event AddedEquippables(uint64 partId, address[] equippableAddresses)
```

Event to announce new equippables to the part.

_It is emitted when new addresses are marked as equippable for `partId`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the part that had new equippable addresses added |
| equippableAddresses | address[] | An array of the new addresses that can equip this part |

### SetEquippables

```solidity
event SetEquippables(uint64 partId, address[] equippableAddresses)
```

Event to announce the overriding of equippable addresses of the part.

_It is emitted when the existing list of addresses marked as equippable for `partId` is overwritten by a new one._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the part whose list of equippable addresses was overwritten |
| equippableAddresses | address[] | The new, full, list of addresses that can equip this part |

### SetEquippableToAll

```solidity
event SetEquippableToAll(uint64 partId)
```

Event to announce that a given part can be equipped by any address.

_It is emitted when a given part is marked as equippable by any._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the part marked as equippable by any address |

### ItemType

```solidity
enum ItemType {
  None,
  Slot,
  Fixed
}
```

### Part

```solidity
struct Part {
  enum IRMRKCatalog.ItemType itemType;
  uint8 z;
  address[] equippable;
  string metadataURI;
}
```

### IntakeStruct

```solidity
struct IntakeStruct {
  uint64 partId;
  struct IRMRKCatalog.Part part;
}
```

### getMetadataURI

```solidity
function getMetadataURI() external view returns (string)
```

Used to return the metadata URI of the associated Catalog.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | string Case metadata URI |

### getType

```solidity
function getType() external view returns (string)
```

Used to return the `itemType` of the associated Catalog

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | string `itemType` of the associated Catalog |

### checkIsEquippable

```solidity
function checkIsEquippable(uint64 partId, address targetAddress) external view returns (bool)
```

Used to check whether the given address is allowed to equip the desired `Part`.

_Returns true if a collection may equip asset with `partId`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | The ID of the part that we are checking |
| targetAddress | address | The address that we are checking for whether the part can be equipped into it or not |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool The status indicating whether the `targetAddress` can be equipped into `Part` with `partId` or not |

### checkIsEquippableToAll

```solidity
function checkIsEquippableToAll(uint64 partId) external view returns (bool)
```

Used to check if the part is equippable by all addresses.

_Returns true if part is equippable to all._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the part that we are checking |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool The status indicating whether the part with `partId` can be equipped by any address or not |

### getPart

```solidity
function getPart(uint64 partId) external view returns (struct IRMRKCatalog.Part)
```

Used to retrieve a `Part` with id `partId`

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the part that we are retrieving |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IRMRKCatalog.Part | struct The `Part` struct associated with given `partId` |

### getParts

```solidity
function getParts(uint64[] partIds) external view returns (struct IRMRKCatalog.Part[])
```

Used to retrieve multiple parts at the same time.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partIds | uint64[] | An array of part IDs that we want to retrieve |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IRMRKCatalog.Part[] | struct An array of `Part` structs associated with given `partIds` |

