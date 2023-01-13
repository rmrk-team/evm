# Solidity API

## IRMRKExternalEquip

Interface smart contract of the RMRK external equippable module.

### NestableAddressSet

```solidity
event NestableAddressSet(address old, address new_)
```

Used to notify listeners of a new `Nestable` associated  smart contract address being set.

_When initially setting the `Nestable` smart contract address, the `old` value should equal `0x0` address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| old | address | Previous `Nestable` smart contract address |
| new_ | address | New `Nestable` smart contract address |

### getNestableAddress

```solidity
function getNestableAddress() external view returns (address)
```

Returns the Equippable contract's corresponding nestable address.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address Address of the Nestable module of the external equip composite |

