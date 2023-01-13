# Solidity API

## RMRKCatalogImpl

Implementation of RMRK catalog.

_Contract for storing 'catalog' elements of NFTs to be accessed by instances of RMRKAsset implementing contracts.
 This default implementation includes an OwnableLock dependency, which allows the deployer to freeze the state of the
 catalog contract._

### constructor

```solidity
constructor(string metadataURI, string type_) public
```

Used to initialize the smart contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| metadataURI | string | Base metadata URI of the contract |
| type_ | string | The type of the catalog |

### addPart

```solidity
function addPart(struct IRMRKCatalog.IntakeStruct intakeStruct) public virtual
```

Used to add a single `Part` to storage.

_The full `IntakeStruct` looks like this:
 [
         partID,
     [
         itemType,
         z,
         [
              permittedCollectionAddress0,
              permittedCollectionAddress1,
              permittedCollectionAddress2
          ],
          metadataURI
      ]
  ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| intakeStruct | struct IRMRKCatalog.IntakeStruct | `IntakeStruct` struct consisting of `partId` and a nested `Part` struct |

### addPartList

```solidity
function addPartList(struct IRMRKCatalog.IntakeStruct[] intakeStructs) public virtual
```

Used to add multiple `Part`s to storage.

_The full `IntakeStruct` looks like this:
 [
         partID,
     [
         itemType,
         z,
         [
              permittedCollectionAddress0,
              permittedCollectionAddress1,
              permittedCollectionAddress2
          ],
          metadataURI
      ]
  ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| intakeStructs | struct IRMRKCatalog.IntakeStruct[] |  |

### addEquippableAddresses

```solidity
function addEquippableAddresses(uint64 partId, address[] equippableAddresses) public virtual
```

Used to add multiple `equippableAddresses` to a single catalog entry.

_Can only be called on `Part`s of `Slot` type._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the `Part` that we are adding the equippable addresses to |
| equippableAddresses | address[] | An array of addresses that can be equipped into the `Part` associated with the `partId` |

### setEquippableAddresses

```solidity
function setEquippableAddresses(uint64 partId, address[] equippableAddresses) public virtual
```

Function used to set the new list of `equippableAddresses`.

_Overwrites existing `equippableAddresses`.
Can only be called on `Part`s of `Slot` type._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the `Part`s that we are overwiting the `equippableAddresses` for |
| equippableAddresses | address[] | A full array of addresses that can be equipped into this `Part` |

### setEquippableToAll

```solidity
function setEquippableToAll(uint64 partId) public virtual
```

Sets the isEquippableToAll flag to true, meaning that any collection may be equipped into the `Part` with
 this `partId`.

_Can only be called on `Part`s of `Slot` type._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the `Part` that we are setting as equippable by any address |

### resetEquippableAddresses

```solidity
function resetEquippableAddresses(uint64 partId) public virtual
```

Used to remove all of the `equippableAddresses` for a `Part` associated with the `partId`.

_Can only be called on `Part`s of `Slot` type._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| partId | uint64 | ID of the part that we are clearing the `equippableAddresses` from |

