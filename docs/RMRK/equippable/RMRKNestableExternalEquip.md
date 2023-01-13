# Solidity API

## RMRKNestableExternalEquip

Smart contract of the RMRK Nestable External Equippable module.

_This is a RMRKNestable smart contract with external `Equippable` smart contract for space saving purposes. It is
 expected to be deployed along an instance of `RMRKExternalEquip`. To make use of the equippable module with this
 contract, the `_setEquippableAddress` function has to be exposed and used to set the corresponding equipment
 contract after deployment. Consider using `RMRKOwnableLock` to lock the equippable address after deployment._

### constructor

```solidity
constructor(string name_, string symbol_) public
```

Used to initialize the smart contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name_ | string | Name of the token collection |
| symbol_ | string | Symbol of the token collection |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

### _transferChild

```solidity
function _transferChild(uint256 tokenId, address to, uint256 destinationId, uint256 childIndex, address childAddress, uint256 childId, bool isPending, bytes data) internal virtual
```

Used to transfer a child token from a given parent token.

_When transferring a child token, the owner of the token is set to `to`, or is not updated in the event of
 `to` being the `0x0` address.
Requirements:

 - `tokenId` must exist.
Emits {ChildTransferred} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the parent token from which the child token is being transferred |
| to | address | Address to which to transfer the token to |
| destinationId | uint256 | ID of the token to receive this child token (MUST be 0 if the destination is not a token) |
| childIndex | uint256 | Index of a token we are transferring, in the array it belongs to (can be either active array or  pending array) |
| childAddress | address | Address of the child token's collection smart contract. |
| childId | uint256 | ID of the child token in its own collection smart contract. |
| isPending | bool | A boolean value indicating whether the child token being transferred is in the pending array of  the parent token (`true`) or in the active array (`false`) |
| data | bytes | Additional data with no specified format, sent in call to `_to` |

### _setEquippableAddress

```solidity
function _setEquippableAddress(address equippable) internal virtual
```

Used to set the address of the `Equippable` smart contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| equippable | address | Address of the `Equippable` smart contract |

### getEquippableAddress

```solidity
function getEquippableAddress() external view virtual returns (address)
```

Used to retrieve the `Equippable` smart contract's address.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address Address of the `Equippable` smart contract |

### isApprovedOrOwner

```solidity
function isApprovedOrOwner(address spender, uint256 tokenId) external view virtual returns (bool)
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

### _cleanApprovals

```solidity
function _cleanApprovals(uint256 tokenId) internal virtual
```

Used to remove approvals for the current owner of the given token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to clear the approvals for |

