# Solidity API

## OwnableLock

A minimal ownable lock smart contract.

### notLocked

```solidity
modifier notLocked()
```

Reverts if the lock flag is set to true.

### setLock

```solidity
function setLock() public virtual
```

Locks the operation.

_Once locked, functions using `notLocked` modifier cannot be executed._

### getLock

```solidity
function getLock() public view returns (bool)
```

Used to retrieve the status of a lockable smart contract.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool A boolean value signifying whether the smart contract has been locked |

