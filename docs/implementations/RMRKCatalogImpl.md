# RMRKCatalogImpl

*RMRK team*

> RMRKCatalogImpl

Implementation of RMRK catalog.

*Contract for storing &#39;catalog&#39; elements of NFTs to be accessed by instances of RMRKAsset implementing contracts.  This default implementation includes an OwnableLock dependency, which allows the deployer to freeze the state of the  catalog contract.*

## Methods

### addEquippableAddresses

```solidity
function addEquippableAddresses(uint64 partId, address[] equippableAddresses) external nonpayable
```

Used to add multiple `equippableAddresses` to a single catalog entry.

*Can only be called on `Part`s of `Slot` type.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | ID of the `Part` that we are adding the equippable addresses to |
| equippableAddresses | address[] | An array of addresses that can be equipped into the `Part` associated with the `partId` |

### addPart

```solidity
function addPart(IRMRKCatalog.IntakeStruct intakeStruct) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| intakeStruct | IRMRKCatalog.IntakeStruct | undefined |

### addPartList

```solidity
function addPartList(IRMRKCatalog.IntakeStruct[] intakeStructs) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| intakeStructs | IRMRKCatalog.IntakeStruct[] | undefined |

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

### getLock

```solidity
function getLock() external view returns (bool)
```

Used to retrieve the status of a lockable smart contract.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | A boolean value signifying whether the smart contract has been locked |

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

### manageContributor

```solidity
function manageContributor(address contributor, bool grantRole) external nonpayable
```

Adds or removes a contributor to the smart contract.

*Can only be called by the owner.Emits ***ContributorUpdate*** event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor | address | Address of the contributor&#39;s account |
| grantRole | bool | A boolean value signifying whether the contributor role is being granted (`true`) or revoked  (`false`) |

### owner

```solidity
function owner() external view returns (address)
```

Returns the address of the current owner.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the current owner |

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

Used to remove all of the `equippableAddresses` for a `Part` associated with the `partId`.

*Can only be called on `Part`s of `Slot` type.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | ID of the part that we are clearing the `equippableAddresses` from |

### setEquippableAddresses

```solidity
function setEquippableAddresses(uint64 partId, address[] equippableAddresses) external nonpayable
```

Function used to set the new list of `equippableAddresses`.

*Overwrites existing `equippableAddresses`.Can only be called on `Part`s of `Slot` type.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | ID of the `Part`s that we are overwiting the `equippableAddresses` for |
| equippableAddresses | address[] | A full array of addresses that can be equipped into this `Part` |

### setEquippableToAll

```solidity
function setEquippableToAll(uint64 partId) external nonpayable
```

Sets the isEquippableToAll flag to true, meaning that any collection may be equipped into the `Part` with  this `partId`.

*Can only be called on `Part`s of `Slot` type.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| partId | uint64 | ID of the `Part` that we are setting as equippable by any address |

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

### ContributorUpdate

```solidity
event ContributorUpdate(address indexed contributor, bool isContributor)
```

Event that signifies that an address was granted contributor role or that the permission has been  revoked.

*This can only be triggered by a current owner, so there is no need to include that information in the event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor `indexed` | address | Address of the account that had contributor role status updated |
| isContributor  | bool | A boolean value signifying whether the role has been granted (`true`) or revoked (`false`) |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```

Used to anounce the transfer of ownership.



#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | Address of the account that transferred their ownership role |
| newOwner `indexed` | address | Address of the account receiving the ownership role |

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





