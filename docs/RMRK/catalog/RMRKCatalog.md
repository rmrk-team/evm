# Solidity API

## RMRKCatalog

Catalog contract for RMRK equippable module.

### constructor

```solidity
constructor(string metadataURI, string type_) public
```

Used to initialize the Catalog.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| metadataURI | string | Base metadata URI of the Catalog |
| type_ | string | Type of Catalog |

### onlySlot

```solidity
modifier onlySlot(uint64 partId)
```

Used to limit execution of functions intended for the `Slot` parts to only execute when used with such
 parts.

_Reverts execution of a function if the part with associated `partId` is uninitailized or is `Fixed`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the part that we want the function to interact with |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

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

### _addPartList

```solidity
function _addPartList(struct IRMRKCatalog.IntakeStruct[] partIntake) internal
```

Internal helper function that adds `Part` entries to storage.

_Delegates to { _addPart } below._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partIntake | struct IRMRKCatalog.IntakeStruct[] | An array of `IntakeStruct` structs, consisting of `partId` and a nested `Part` struct |

### _addPart

```solidity
function _addPart(struct IRMRKCatalog.IntakeStruct partIntake) internal
```

Internal function that adds a single `Part` to storage.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partIntake | struct IRMRKCatalog.IntakeStruct | `IntakeStruct` struct consisting of `partId` and a nested `Part` struct |

### _addEquippableAddresses

```solidity
function _addEquippableAddresses(uint64 partId, address[] equippableAddresses) internal
```

Internal function used to add multiple `equippableAddresses` to a single catalog entry.

_Can only be called on `Part`s of `Slot` type._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the `Part` that we are adding the equippable addresses to |
| equippableAddresses | address[] | An array of addresses that can be equipped into the `Part` associated with the `partId` |

### _setEquippableAddresses

```solidity
function _setEquippableAddresses(uint64 partId, address[] equippableAddresses) internal
```

Internal function used to set the new list of `equippableAddresses`.

_Overwrites existing `equippableAddresses`.
Can only be called on `Part`s of `Slot` type._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the `Part`s that we are overwiting the `equippableAddresses` for |
| equippableAddresses | address[] | A full array of addresses that can be equipped into this `Part` |

### _resetEquippableAddresses

```solidity
function _resetEquippableAddresses(uint64 partId) internal
```

Internal function used to remove all of the `equippableAddresses` for a `Part` associated with the `partId`.

_Can only be called on `Part`s of `Slot` type._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the part that we are clearing the `equippableAddresses` from |

### _setEquippableToAll

```solidity
function _setEquippableToAll(uint64 partId) internal
```

Sets the isEquippableToAll flag to true, meaning that any collection may be equipped into the `Part` with this
 `partId`.

_Can only be called on `Part`s of `Slot` type._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the `Part` that we are setting as equippable by any address |

### checkIsEquippableToAll

```solidity
function checkIsEquippableToAll(uint64 partId) public view returns (bool)
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

### checkIsEquippable

```solidity
function checkIsEquippable(uint64 partId, address targetAddress) public view returns (bool)
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

### getPart

```solidity
function getPart(uint64 partId) public view returns (struct IRMRKCatalog.Part)
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
function getParts(uint64[] partIds) public view returns (struct IRMRKCatalog.Part[])
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

