# IRMRKNestableExternalEquipUpgradeable

*RMRK team*

> IRMRKNestableExternalEquipUpgradeable

Interface smart contract of the RMRK nestable with external equippable module.



## Methods

### getEquippableAddress

```solidity
function getEquippableAddress() external view returns (address)
```

Used to retrieve the `Equippable` smart contract&#39;s address.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the `Equippable` smart contract |

### isApprovedOrOwner

```solidity
function isApprovedOrOwner(address spender, uint256 tokenId) external view returns (bool)
```

Used to verify that the specified address is either the owner of the given token or approved to manage  it.



#### Parameters

| Name | Type | Description |
|---|---|---|
| spender | address | Address of the account we are checking for ownership or approval |
| tokenId | uint256 | ID of the token that we are checking |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | A boolean value indicating whether the specified address is the owner of the given token or approved to  manage it |

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



## Events

### EquippableAddressSet

```solidity
event EquippableAddressSet(address old, address new_)
```

used to notify the listeners that the address of the `Equippable` associated smart contract has been set.

*When the address is set fot the first time, the `old` value should equal `0x0` address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| old  | address | Address of the previous `Equippable` smart contract |
| new_  | address | Address of the new `Equippable` smart contract |



