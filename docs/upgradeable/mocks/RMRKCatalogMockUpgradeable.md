# RMRKCatalogMockUpgradeable









## Methods

### __RMRKCatalogMockUpgradeable_init

```solidity
function __RMRKCatalogMockUpgradeable_init(string metadataURI, string type_) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| metadataURI | string | undefined |
| type_ | string | undefined |

### addEquippableAddresses

```solidity
function addEquippableAddresses(uint64 partId, address[] equippableAddresses) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | undefined |
| equippableAddresses | address[] | undefined |

### addPart

```solidity
function addPart(IRMRKCatalogUpgradeable.IntakeStruct intakeStruct) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| intakeStruct | IRMRKCatalogUpgradeable.IntakeStruct | undefined |

### addPartList

```solidity
function addPartList(IRMRKCatalogUpgradeable.IntakeStruct[] intakeStructs) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| intakeStructs | IRMRKCatalogUpgradeable.IntakeStruct[] | undefined |

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
function getPart(uint64 partId) external view returns (struct IRMRKCatalogUpgradeable.Part)
```

Used to retrieve a `Part` with id `partId`



#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | ID of the part that we are retrieving |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKCatalogUpgradeable.Part | The `Part` struct associated with given `partId` |

### getParts

```solidity
function getParts(uint64[] partIds) external view returns (struct IRMRKCatalogUpgradeable.Part[])
```

Used to retrieve multiple parts at the same time.



#### Parameters

| Name | Type | Description |
|---|---|---|
| partIds | uint64[] | An array of part IDs that we want to retrieve |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKCatalogUpgradeable.Part[] | An array of `Part` structs associated with given `partIds` |

### getType

```solidity
function getType() external view returns (string)
```

Used to return the `itemType` of the associated Catalog




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | `itemType` of the associated Catalog |

### resetEquippableAddresses

```solidity
function resetEquippableAddresses(uint64 partId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | undefined |

### setEquippableAddresses

```solidity
function setEquippableAddresses(uint64 partId, address[] equippableAddresses) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | undefined |
| equippableAddresses | address[] | undefined |

### setEquippableToAll

```solidity
function setEquippableToAll(uint64 partId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | undefined |

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
event AddedPart(uint64 indexed partId, enum IRMRKCatalogUpgradeable.ItemType indexed itemType, uint8 zIndex, address[] equippableAddresses, string metadataURI)
```

Event to announce addition of a new part.

*It is emitted when a new part is added.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| partId `indexed` | uint64 | ID of the part that was added |
| itemType `indexed` | enum IRMRKCatalogUpgradeable.ItemType | Enum value specifying whether the part is `None`, `Slot` and `Fixed` |
| zIndex  | uint8 | An uint specifying the z value of the part. It is used to specify the depth which the part should  be rendered at |
| equippableAddresses  | address[] | An array of addresses that can equip this part |
| metadataURI  | string | The metadata URI of the part |

### Initialized

```solidity
event Initialized(uint8 version)
```



*Triggered when the contract has been initialized or reinitialized.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

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



## Errors

### RMRKBadConfig

```solidity
error RMRKBadConfig()
```

Attempting to incorrectly configue a Catalog item




### RMRKIdZeroForbidden

```solidity
error RMRKIdZeroForbidden()
```

Attempting to use ID 0, which is not supported

*The ID 0 in RMRK suite is reserved for empty values. Guarding against its use ensures the expected operation*


### RMRKPartAlreadyExists

```solidity
error RMRKPartAlreadyExists()
```

Attempting to add a `Part` with an ID that is already used




### RMRKPartDoesNotExist

```solidity
error RMRKPartDoesNotExist()
```

Attempting to use a `Part` that doesn&#39;t exist




### RMRKPartIsNotSlot

```solidity
error RMRKPartIsNotSlot()
```

Attempting to use a `Part` that is `Fixed` when `Slot` kind of `Part` should be used




### RMRKZeroLengthIdsPassed

```solidity
error RMRKZeroLengthIdsPassed()
```

Attempting not to pass an empty array of equippable addresses when adding or setting the equippable addresses





