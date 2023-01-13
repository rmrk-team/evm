# Solidity API

## RMRKNestableAutoIndex

### constructor

```solidity
constructor(string name_, string symbol_) public
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

### _beforeAddChild

```solidity
function _beforeAddChild(uint256 tokenId, address childAddress, uint256 childId, bytes) internal virtual
```

### _beforeAcceptChild

```solidity
function _beforeAcceptChild(uint256 parentId, uint256 childIndex, address childAddress, uint256 childId) internal virtual
```

Hook that is called before a child is accepted to the active tokens array of a given token.

_The Child struct consists of the following values:
 [
     tokenId,
     contractAddress
 ]
To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | ID of the token that will accept a pending child token |
| childIndex | uint256 | Index of the child token to accept in the given parent token's pending children array |
| childAddress | address | Address of the collection smart contract of the child token expected to be located at the  specified index of the given parent token's pending children array |
| childId | uint256 | ID of the child token expected to be located at the specified index of the given parent token's  pending children array |

### _beforeTransferChild

```solidity
function _beforeTransferChild(uint256 tokenId, uint256 childIndex, address, uint256, bool isPending, bytes) internal virtual
```

### acceptChild

```solidity
function acceptChild(uint256 parentId, address childAddress, uint256 childId) public
```

Used to accept a pending child token for a given parent token.

_This moves the child token from parent token's pending child tokens array into the active child tokens
 array._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | ID of the parent token for which the child token is being accepted |
| childAddress | address | Address of the collection smart contract of the child |
| childId | uint256 | ID of the child token |

### _acceptChild

```solidity
function _acceptChild(uint256 parentId, address childAddress, uint256 childId) internal
```

### transferChild

```solidity
function transferChild(uint256 tokenId, address to, uint256 destinationId, address childAddress, uint256 childId, bool isPending, bytes data) public
```

Used to transfer a child token from a given parent token.

_When transferring a child token, the owner of the token is set to `to`, or is not updated in the event of `to`
 being the `0x0` address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the parent token from which the child token is being transferred |
| to | address | Address to which to transfer the token to |
| destinationId | uint256 | ID of the token to receive this child token (MUST be 0 if the destination is not a token) |
| childAddress | address | Address of the collection smart contract of the child |
| childId | uint256 | ID of the child token |
| isPending | bool | A boolean value indicating whether the child token being transferred is in the pending array of the  parent token (`true`) or in the active array (`false`) |
| data | bytes | Additional data with no specified format, sent in call to `_to` |

### _transferChild

```solidity
function _transferChild(uint256 tokenId, address to, uint256 destinationId, address childAddress, uint256 childId, bool isPending, bytes data) internal
```

### ownerOf

```solidity
function ownerOf(uint256 tokenId) public view virtual returns (address)
```

