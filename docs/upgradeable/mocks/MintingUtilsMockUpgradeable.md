# MintingUtilsMockUpgradeable









## Methods

### __MintingUtilsMockUpgradeable_init

```solidity
function __MintingUtilsMockUpgradeable_init(uint256 maxSupply_, uint256 pricePerMint_) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| maxSupply_ | uint256 | undefined |
| pricePerMint_ | uint256 | undefined |

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

### maxSupply

```solidity
function maxSupply() external view returns (uint256)
```

Used to retrieve the maximum supply of the collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The maximum supply of tokens in the collection |

### mockMint

```solidity
function mockMint(uint256 total) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| total | uint256 | undefined |

### owner

```solidity
function owner() external view returns (address)
```

Returns the address of the current owner.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the current owner |

### pricePerMint

```solidity
function pricePerMint() external view returns (uint256)
```

Used to retrieve the price per mint.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The price per mint of a single token expressed in the lowest denomination of a native currency |

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


### setupTestSaleIsOpen

```solidity
function setupTestSaleIsOpen() external nonpayable
```






### testSaleIsOpen

```solidity
function testSaleIsOpen() external view returns (bool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

Used to retrieve the total supply of the tokens in a collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The number of tokens in a collection |

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

### withdrawRaised

```solidity
function withdrawRaised(address to, uint256 amount) external nonpayable
```

Used to withdraw the minting proceedings to a specified address.

*This function can only be called by the owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | Address to receive the given amount of minting proceedings |
| amount | uint256 | The amount to withdraw |



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

### RMRKMintOverMax

```solidity
error RMRKMintOverMax()
```

Attempting to mint a number of tokens that would cause the total supply to be greater than maximum supply




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





