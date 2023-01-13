# Solidity API

## RMRKMintingUtils

Smart contract of the RMRK minting utils module.

_This smart contract includes the top-level utilities for managing minting and implements OwnableLock by default.
Max supply-related and pricing variables are immutable after deployment._

### _totalSupply

```solidity
uint256 _totalSupply
```

### _maxSupply

```solidity
uint256 _maxSupply
```

### _pricePerMint

```solidity
uint256 _pricePerMint
```

### constructor

```solidity
constructor(uint256 maxSupply_, uint256 pricePerMint_) public
```

Initializes the smart contract with a given maximum supply and minting price.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| maxSupply_ | uint256 | The maximum supply of tokens to initialize the smart contract with |
| pricePerMint_ | uint256 | The minting price to initialize the smart contract with, expressed in the smallest  denomination of the native currency of the chain to which the smart contract is deployed to |

### saleIsOpen

```solidity
modifier saleIsOpen()
```

Used to verify that the sale of the given token is still available.

_If the maximum supply is reached, the execution will be reverted._

### setLock

```solidity
function setLock() public virtual
```

Locks the operation.

_Once locked, functions using `notLocked` modifier cannot be executed._

### totalSupply

```solidity
function totalSupply() public view returns (uint256)
```

Used to retrieve the total supply of the tokens in a collection.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The number of tokens in a collection |

### maxSupply

```solidity
function maxSupply() public view returns (uint256)
```

Used to retrieve the maximum supply of the collection.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The maximum supply of tokens in the collection |

### pricePerMint

```solidity
function pricePerMint() public view returns (uint256)
```

Used to retrieve the price per mint.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The price per mint of a single token expressed in the lowest denomination of a native currency |

### withdrawRaised

```solidity
function withdrawRaised(address to, uint256 amount) external
```

Used to withdraw the minting proceedings to a specified address.

_This function can only be called by the owner._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address to receive the given amount of minting proceedings |
| amount | uint256 | The amount to withdraw |

