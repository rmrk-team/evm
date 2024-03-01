# IRMRKCatalogExtended

*RMRK team*

> IRMRKCatalogExtended

An extended interface for Catalog for RMRK equippable module.



## Methods

### checkIsEquippable

```solidity
function checkIsEquippable(uint64 partId, address targetAddress) external view returns (bool isEquippable)
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
| isEquippable | bool | The status indicating whether the `targetAddress` can be equipped into `Part` with `partId` or not |

### checkIsEquippableToAll

```solidity
function checkIsEquippableToAll(uint64 partId) external view returns (bool isEquippableToAll)
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
| isEquippableToAll | bool | The status indicating whether the part with `partId` can be equipped by any address or not |

### getAllPartIds

```solidity
function getAllPartIds() external view returns (uint64[] partIds)
```

Used to get all the part IDs in the catalog.

*Can get at least 10k parts. Higher limits were not tested.It may fail if there are too many parts, in that case use either `getPaginatedPartIds` or `getTotalParts` and `getPartByIndex`.*


#### Returns

| Name | Type | Description |
|---|---|---|
| partIds | uint64[] | An array of all the part IDs in the catalog |

### getMetadataURI

```solidity
function getMetadataURI() external view returns (string)
```

Used to return the metadata URI of the associated Catalog.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | Catalog metadata URI |

### getPaginatedPartIds

```solidity
function getPaginatedPartIds(uint256 offset, uint256 limit) external view returns (uint64[] partIds)
```

Used to get all the part IDs in the catalog.



#### Parameters

| Name | Type | Description |
|---|---|---|
| offset | uint256 | The offset to start from |
| limit | uint256 | The maximum number of parts to return |

#### Returns

| Name | Type | Description |
|---|---|---|
| partIds | uint64[] | An array of all the part IDs in the catalog |

### getPart

```solidity
function getPart(uint64 partId) external view returns (struct IRMRKCatalog.Part part)
```

Used to retrieve a `Part` with id `partId`



#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | ID of the part that we are retrieving |

#### Returns

| Name | Type | Description |
|---|---|---|
| part | IRMRKCatalog.Part | The `Part` struct associated with given `partId` |

### getPartByIndex

```solidity
function getPartByIndex(uint256 index) external view returns (struct IRMRKCatalog.Part part)
```

Used to get a single `Part` by the index of its `partId`.



#### Parameters

| Name | Type | Description |
|---|---|---|
| index | uint256 | The index of the `partId`. |

#### Returns

| Name | Type | Description |
|---|---|---|
| part | IRMRKCatalog.Part | The `Part` struct associated with the `partId` at the given index |

### getParts

```solidity
function getParts(uint64[] partIds) external view returns (struct IRMRKCatalog.Part[] part)
```

Used to retrieve multiple parts at the same time.



#### Parameters

| Name | Type | Description |
|---|---|---|
| partIds | uint64[] | An array of part IDs that we want to retrieve |

#### Returns

| Name | Type | Description |
|---|---|---|
| part | IRMRKCatalog.Part[] | An array of `Part` structs associated with given `partIds` |

### getTotalParts

```solidity
function getTotalParts() external view returns (uint256 totalParts)
```

Used to get the total number of parts in the catalog.




#### Returns

| Name | Type | Description |
|---|---|---|
| totalParts | uint256 | The total number of parts in the catalog |

### getType

```solidity
function getType() external view returns (string)
```

Used to return the `itemType` of the associated Catalog




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | `itemType` of the associated Catalog |

### setMetadataURI

```solidity
function setMetadataURI(string newContractURI) external nonpayable
```

Used to set the metadata URI of the catalog.

*emits `ContractURIUpdated` event*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newContractURI | string | The new metadata URI |

### setType

```solidity
function setType(string newType) external nonpayable
```

Used to set the type of the catalog.

*emits `TypeUpdated` event*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newType | string | The new type of the catalog |

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

*It is emitted when new addresses are marked as equippable for `partId`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| partId `indexed` | uint64 | ID of the part that had new equippable addresses added |
| equippableAddresses  | address[] | An array of the new addresses that can equip this part |

### AddedPart

```solidity
event AddedPart(uint64 indexed partId, enum IRMRKCatalog.ItemType indexed itemType, uint8 zIndex, address[] equippableAddresses, string metadataURI)
```

Event to announce addition of a new part.

*It is emitted when a new part is added.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| partId `indexed` | uint64 | ID of the part that was added |
| itemType `indexed` | enum IRMRKCatalog.ItemType | Enum value specifying whether the part is `None`, `Slot` and `Fixed` |
| zIndex  | uint8 | An uint specifying the z value of the part. It is used to specify the depth which the part should  be rendered at |
| equippableAddresses  | address[] | An array of addresses that can equip this part |
| metadataURI  | string | The metadata URI of the part |

### ContractURIUpdated

```solidity
event ContractURIUpdated()
```

From ERC7572 (Draft) Emitted when the contract-level metadata is updated




### SetEquippableToAll

```solidity
event SetEquippableToAll(uint64 indexed partId)
```

Event to announce that a given part can be equipped by any address.

*It is emitted when a given part is marked as equippable by any.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| partId `indexed` | uint64 | ID of the part marked as equippable by any address |

### SetEquippables

```solidity
event SetEquippables(uint64 indexed partId, address[] equippableAddresses)
```

Event to announce the overriding of equippable addresses of the part.

*It is emitted when the existing list of addresses marked as equippable for `partId` is overwritten by a new one.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| partId `indexed` | uint64 | ID of the part whose list of equippable addresses was overwritten |
| equippableAddresses  | address[] | The new, full, list of addresses that can equip this part |

### TypeUpdated

```solidity
event TypeUpdated(string newType)
```

Emited when the type of the catalog is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| newType  | string | The new type of the catalog |



