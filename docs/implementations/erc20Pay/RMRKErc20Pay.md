# Solidity API

## RMRKNotEnoughAllowance

```solidity
error RMRKNotEnoughAllowance()
```

## RMRKErc20Pay

Smart contract of the RMRK Nestable module.

### constructor

```solidity
constructor(address erc20TokenAddress_) internal
```

Used to initialize the smart contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| erc20TokenAddress_ | address | Address of the ERC20 token supported by this smart contract |

### _chargeFromToken

```solidity
function _chargeFromToken(address from, address to, uint256 value) internal virtual
```

Used to charge an ERC20 token for a specified value.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | Address from which to transfer the tokens |
| to | address | Address to which to transfer the tokens |
| value | uint256 | The amount of tokens to transfer |

### erc20TokenAddress

```solidity
function erc20TokenAddress() public view virtual returns (address)
```

Used to retrieve the address of the ERC20 token this smart contract supports.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address Address of the ERC20 token's smart contract |

