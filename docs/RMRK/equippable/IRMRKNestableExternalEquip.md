# Solidity API

## IRMRKNestableExternalEquip

Interface smart contract of the RMRK nestable with external equippable module.

### EquippableAddressSet

```solidity
event EquippableAddressSet(address old, address new_)
```

used to notify the listeners that the address of the `Equippable` associated smart contract has been set.

_When the address is set fot the first time, the `old` value should equal `0x0` address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| old | address | Address of the previous `Equippable` smart contract |
| new_ | address | Address of the new `Equippable` smart contract |

### getEquippableAddress

```solidity
function getEquippableAddress() external view returns (address)
```

Used to retrieve the `Equippable` smart contract's address.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address Address of the `Equippable` smart contract |

### isApprovedOrOwner

```solidity
function isApprovedOrOwner(address spender, uint256 tokenId) external view returns (bool)
```

Used to verify that the specified address is either the owner of the given token or approved to manage
 it.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| spender | address | Address of the account we are checking for ownership or approval |
| tokenId | uint256 | ID of the token that we are checking |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool A boolean value indicating whether the specified address is the owner of the given token or approved  to manage it |

