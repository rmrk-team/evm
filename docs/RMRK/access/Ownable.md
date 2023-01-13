# Solidity API

## Ownable

A minimal ownable smart contractf or owner and contributors.

_This smart contract is based on "openzeppelin's access/Ownable.sol"._

### OwnershipTransferred

```solidity
event OwnershipTransferred(address previousOwner, address newOwner)
```

Used to anounce the transfer of ownership.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| previousOwner | address | Address of the account that transferred their ownership role |
| newOwner | address | Address of the account receiving the ownership role |

### ContributorUpdate

```solidity
event ContributorUpdate(address contributor, bool isContributor)
```

Event that signifies that an address was granted contributor role or that the permission has been
 revoked.

_This can only be triggered by a current owner, so there is no need to include that information in the event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| contributor | address | Address of the account that had contributor role status updated |
| isContributor | bool | A boolean value signifying whether the role has been granted (`true`) or revoked (`false`) |

### onlyOwnerOrContributor

```solidity
modifier onlyOwnerOrContributor()
```

_Reverts if called by any account other than the owner or an approved contributor._

### onlyOwner

```solidity
modifier onlyOwner()
```

_Reverts if called by any account other than the owner._

### constructor

```solidity
constructor() public
```

_Initializes the contract by setting the deployer as the initial owner._

### owner

```solidity
function owner() public view virtual returns (address)
```

Returns the address of the current owner.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Address of the current owner |

### renounceOwnership

```solidity
function renounceOwnership() public virtual
```

Leaves the contract without owner. Functions using the `onlyOwner` modifier will be disabled.

_Can only be called by the current owner.
Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is
 only available to the owner._

### transferOwnership

```solidity
function transferOwnership(address newOwner) public virtual
```

Transfers ownership of the contract to a new owner.

_Can only be called by the current owner._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newOwner | address | Address of the new owner's account |

### _transferOwnership

```solidity
function _transferOwnership(address newOwner) internal virtual
```

Transfers ownership of the contract to a new owner.

_Internal function without access restriction._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newOwner | address | Address of the new owner's account |

### manageContributor

```solidity
function manageContributor(address contributor, bool grantRole) external
```

Adds or removes a contributor to the smart contract.

_Can only be called by the owner._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| contributor | address | Address of the contributor's account |
| grantRole | bool | A boolean value signifying whether the contributor role is being granted (`true`) or revoked  (`false`) |

### isContributor

```solidity
function isContributor(address contributor) public view returns (bool)
```

Used to check if the address is one of the contributors.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| contributor | address | Address of the contributor whose status we are checking |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | Boolean value indicating whether the address is a contributor or not |

