# OwnableLockMockUpgradeable









## Methods

### __OwnableLockMockUpgradeable_init

```solidity
function __OwnableLockMockUpgradeable_init() external nonpayable
```






### getLock

```solidity
function getLock() external view returns (bool)
```

Used to retrieve the status of a lockable smart contract.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | A boolean value signifying whether the smart contract has been locked |

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


### setLock

```solidity
function setLock() external nonpayable
```

Locks the operation.

*Once locked, functions using `notLocked` modifier cannot be executed.Emits ***LockSet*** event.*


### testLock

```solidity
function testLock() external view returns (bool)
```






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

### Initialized

```solidity
event Initialized(uint8 version)
```



*Triggered when the contract has been initialized or reinitialized.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### LockSet

```solidity
event LockSet()
```

Emitted when the smart contract is locked.




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



## Errors

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





