# Solidity API

## RMRKReclaimableChild

Smart contract of the RMRK Reclaimable child module.

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

### reclaimChild

```solidity
function reclaimChild(uint256 tokenId, address childAddress, uint256 childId) public virtual
```

Used to reclaim an abandoned child token.

_Child token was abandoned by transferring it with `to` as the `0x0` address.
This function will set the child's owner to the `rootOwner` of the caller, allowing the `rootOwner`
 management permissions for the child.
Requirements:

 - `tokenId` must exist_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the last parent token of the child token being recovered |
| childAddress | address | Address of the child token's smart contract |
| childId | uint256 | ID of the child token being reclaimed |

### _reclaimChild

```solidity
function _reclaimChild(uint256 tokenId, address childAddress, uint256 childId) internal virtual
```

Used to reclaim an abandoned child token.

_Child token was abandoned by transferring it with `to` as the `0x0` address.
This function will set the child's owner to the `rootOwner` of the caller, allowing the `rootOwner`
 management permissions for the child.
Requirements:

 - `tokenId` must exist_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the last parent token of the child token being recovered |
| childAddress | address | Address of the child token's smart contract |
| childId | uint256 | ID of the child token being reclaimed |

### _beforeAddChild

```solidity
function _beforeAddChild(uint256 tokenId, address childAddress, uint256 childId, bytes data) internal virtual
```

A hook used to be called before adding a child token.

_we use this hook to keep track of children which are in pending, so they cannot be reclaimed from there._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token receiving the child token |
| childAddress | address | Address of the collection smart contract of the token expected to be at the given index |
| childId | uint256 | ID of the token expected to be located at the given index in its collection smart contract |
| data | bytes | Additional data of unspecified format to be passed along the transaction |

### _beforeAcceptChild

```solidity
function _beforeAcceptChild(uint256 parentId, uint256 childIndex, address childAddress, uint256 childId) internal virtual
```

A hook used to be called before accepting a child token.

_We use this hook to keep track of children which are in pending, so they cannot be reclaimed from there._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | ID of the parent token for which the child token is being accepted |
| childIndex | uint256 | Index of the pending child token in the pending children array of a given parent token |
| childAddress | address | Address of the collection smart contract of the pending child token expected to be at the given index |
| childId | uint256 | ID of the pending child token expected to be located at the given index |

### _beforeTransferChild

```solidity
function _beforeTransferChild(uint256 tokenId, uint256 childIndex, address childAddress, uint256 childId, bool isPending, bytes data) internal virtual
```

A hook used to be called before transferring a child token.

_The `Child` struct contains the following arguments:
 [
     ID of the child token,
     address of the child token's collection smart contract
 ]
we use this hook to keep track of children which are in pending, so they cannot be reclaimed from there._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token transferring the child token |
| childIndex | uint256 | Index of the token in the parent token's child tokens array |
| childAddress | address | Address of the collection smart contract of the child token expected to be at the given index |
| childId | uint256 | ID of the child token expected to be located at the given index |
| isPending | bool | A boolean value signifying whether the child token is located in the parent's active or pending  child token array |
| data | bytes | Additional data of unspecified format to be passed along the transaction |

