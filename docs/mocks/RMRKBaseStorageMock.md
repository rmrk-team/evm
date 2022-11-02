# RMRKBaseStorageMock









## Methods

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
function addPart(IRMRKBaseStorage.IntakeStruct intakeStruct) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| intakeStruct | IRMRKBaseStorage.IntakeStruct | undefined |

### addPartList

```solidity
function addPartList(IRMRKBaseStorage.IntakeStruct[] intakeStructs) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| intakeStructs | IRMRKBaseStorage.IntakeStruct[] | undefined |

### checkIsEquippable

```solidity
function checkIsEquippable(uint64 partId, address targetAddress) external view returns (bool isEquippable)
```

Used to check whether the given address is allowed to equip the desired `Part`

*Returns true if a collection may equip resource with `partId`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | ID of the `Part` that we are checking |
| targetAddress | address | Address of the collection that we want to equip the `Part` in |

#### Returns

| Name | Type | Description |
|---|---|---|
| isEquippable | bool | Boolean value indicating whether the given `Part` can be equipped into the collection or not |

### checkIsEquippableToAll

```solidity
function checkIsEquippableToAll(uint64 partId) external view returns (bool)
```

Used to check whether the given `Part` is equippable by any address or not.

*Returns true if part is equippable to all.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | ID of the `Part` that we are checking |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool Status of equippable to all for the given `Part` |

### getMetadataURI

```solidity
function getMetadataURI() external view returns (string)
```

Used to retrieve the metadata URI of the associated collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string Metedata URI of the collection |

### getPart

```solidity
function getPart(uint64 partId) external view returns (struct IRMRKBaseStorage.Part)
```

Used to retrieve a single `Part`.



#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | The ID of the part to retriieve |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKBaseStorage.Part | struct `Part` associated with the specified `partId` |

### getParts

```solidity
function getParts(uint64[] partIds) external view returns (struct IRMRKBaseStorage.Part[])
```

Used to retrieve multiple `Part`s at the same time.



#### Parameters

| Name | Type | Description |
|---|---|---|
| partIds | uint64[] | Array of IDs of the `Part`s  to retrieve |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKBaseStorage.Part[] | struct An array of `Part`s associated with the specified `partIds` |

### getType

```solidity
function getType() external view returns (string)
```

Used to retrieve the `itemType` of the associated base.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string The value of the base&#39;s `itemType`, it can be either `None`, `Slot` or `Fixed` |

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



#### Parameters

| Name | Type | Description |
|---|---|---|
| partId `indexed` | uint64 | undefined |
| equippableAddresses  | address[] | undefined |

### AddedPart

```solidity
event AddedPart(uint64 indexed partId, enum IRMRKBaseStorage.ItemType indexed itemType, uint8 zIndex, address[] equippableAddresses, string metadataURI)
```

Event to announce addition of a new part.



#### Parameters

| Name | Type | Description |
|---|---|---|
| partId `indexed` | uint64 | undefined |
| itemType `indexed` | enum IRMRKBaseStorage.ItemType | undefined |
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



## Errors

### RMRKBadConfig

```solidity
error RMRKBadConfig()
```






### RMRKIdZeroForbidden

```solidity
error RMRKIdZeroForbidden()
```






### RMRKPartAlreadyExists

```solidity
error RMRKPartAlreadyExists()
```






### RMRKPartDoesNotExist

```solidity
error RMRKPartDoesNotExist()
```






### RMRKPartIsNotSlot

```solidity
error RMRKPartIsNotSlot()
```






### RMRKZeroLengthIdsPassed

```solidity
error RMRKZeroLengthIdsPassed()
```







