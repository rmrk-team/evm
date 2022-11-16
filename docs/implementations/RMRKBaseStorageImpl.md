# RMRKBaseStorageImpl







*Contract for storing &#39;base&#39; elements of NFTs to be accessed by instances of RMRKAsset implementing contracts. This default implementation includes an OwnableLock dependency, which allows the deployer to freeze the state of the base contract. In addition, this implementation treats the base registry as an append-only ledger, so*

## Methods

### addContributor

```solidity
function addContributor(address contributor) external nonpayable
```

Adds a contributor to the smart contract.

*Can only be called by the owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor | address | Address of the contributor&#39;s account |

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
function checkIsEquippable(uint64 partId, address targetAddress) external view returns (bool)
```

Used to check whether the given address is allowed to equip the desired `Part`

*Returns true if a collection may equip asset with `partId`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | The ID of the part that we are checking |
| targetAddress | address | The address that we are checking for whether the part can be equipped into it or not |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool The status indicating whether the `targetAddress` can be equipped into `Part` with `partId` or not |

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
| _0 | bool | bool The status indicating whether the part with `partId` can be equipped by any address or not |

### getLock

```solidity
function getLock() external view returns (bool)
```

Used to retrieve the status of a lockable smart contract.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool A boolean value signifying whether the smart contract has been locked |

### getMetadataURI

```solidity
function getMetadataURI() external view returns (string)
```

Used to return the metadata URI of the associated base.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string Base metadata URI |

### getPart

```solidity
function getPart(uint64 partId) external view returns (struct IRMRKBaseStorage.Part)
```

Used to retrieve a `Part` with id `partId`



#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | ID of the part that we are retrieving |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKBaseStorage.Part | struct The `Part` struct associated with given `partId` |

### getParts

```solidity
function getParts(uint64[] partIds) external view returns (struct IRMRKBaseStorage.Part[])
```

Used to retrieve multiple parts at the same time.



#### Parameters

| Name | Type | Description |
|---|---|---|
| partIds | uint64[] | An array of part IDs that we want to retrieve |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IRMRKBaseStorage.Part[] | struct An array of `Part` structs associated with given `partIds` |

### getType

```solidity
function getType() external view returns (string)
```

Used to return the `itemType` of the associated base




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string `itemType` of the associated base |

### isContributor

```solidity
function isContributor(address contributor) external view returns (bool)
```

Used to check if the address is one of the contributors.



#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor | address | Address of the contributor whose status we are checking |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | Boolean value indicating whether the address is a contributor or not |

### owner

```solidity
function owner() external view returns (address)
```

Returns the address of the current owner.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```

Leaves the contract without owner. Functions using the `onlyOwner` modifier will be disabled.

*Can only be called by the current owner.Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is  only available to the owner.*


### resetEquippableAddresses

```solidity
function resetEquippableAddresses(uint64 partId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | undefined |

### revokeContributor

```solidity
function revokeContributor(address contributor) external nonpayable
```

Removes a contributor from the smart contract.

*Can only be called by the owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor | address | Address of the contributor&#39;s account |

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

### setLock

```solidity
function setLock() external nonpayable
```

Locks the operation.

*Once locked, functions using `notLocked` modifier cannot be executed.*


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

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```

Transfers ownership of the contract to a new owner.

*Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | Address of the new owner&#39;s account |



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

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

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

Attempting to incorrectly configue a Base item




### RMRKIdZeroForbidden

```solidity
error RMRKIdZeroForbidden()
```

Attempting to use ID 0, which is not supported

*The ID 0 in RMRK suite is reserved for empty values. Guarding against its use ensures the expected operation*


### RMRKLocked

```solidity
error RMRKLocked()
```

Attempting to interact with a contract that had its operation locked




### RMRKNewContributorIsZeroAddress

```solidity
error RMRKNewContributorIsZeroAddress()
```

Attempting to assign a 0x0 address as a contributor




### RMRKNewOwnerIsZeroAddress

```solidity
error RMRKNewOwnerIsZeroAddress()
```

Attempting to transfer the ownership to the 0x0 address




### RMRKNotOwner

```solidity
error RMRKNotOwner()
```

Attempting to interact with a management function without being the smart contract&#39;s owner




### RMRKNotOwnerOrContributor

```solidity
error RMRKNotOwnerOrContributor()
```

Attempting to interact with a function without being the owner or contributor of the collection




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





