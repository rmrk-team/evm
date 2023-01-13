# Solidity API

## IRMRKNestable

Interface smart contract of the RMRK nestable module.

### DirectOwner

```solidity
struct DirectOwner {
  uint256 tokenId;
  address ownerAddress;
  bool isNft;
}
```

### NestTransfer

```solidity
event NestTransfer(address from, address to, uint256 fromTokenId, uint256 toTokenId, uint256 tokenId)
```

Used to notify listeners that the token is being transferred.

_Emitted when `tokenId` token is transferred from `from` to `to`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | Address of the previous immediate owner, which is a smart contract if the token was nested. |
| to | address | Address of the new immediate owner, which is a smart contract if the token is being nested. |
| fromTokenId | uint256 | ID of the previous parent token. If the token was not nested before, the value should be `0` |
| toTokenId | uint256 | ID of the new parent token. If the token is not being nested, the value should be `0` |
| tokenId | uint256 | ID of the token being transferred |

### ChildProposed

```solidity
event ChildProposed(uint256 tokenId, uint256 childIndex, address childAddress, uint256 childId)
```

Used to notify listeners that a new token has been added to a given token's pending children array.

_Emitted when a child NFT is added to a token's pending array._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that received a new pending child token |
| childIndex | uint256 | Index of the proposed child token in the parent token's pending children array |
| childAddress | address | Address of the proposed child token's collection smart contract |
| childId | uint256 | ID of the child token in the child token's collection smart contract |

### ChildAccepted

```solidity
event ChildAccepted(uint256 tokenId, uint256 childIndex, address childAddress, uint256 childId)
```

Used to notify listeners that a new child token was accepted by the parent token.

_Emitted when a parent token accepts a token from its pending array, migrating it to the active array._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that accepted a new child token |
| childIndex | uint256 | Index of the newly accepted child token in the parent token's active children array |
| childAddress | address | Address of the child token's collection smart contract |
| childId | uint256 | ID of the child token in the child token's collection smart contract |

### AllChildrenRejected

```solidity
event AllChildrenRejected(uint256 tokenId)
```

Used to notify listeners that all pending child tokens of a given token have been rejected.

_Emitted when a token removes all a child tokens from its pending array._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that rejected all of the pending children |

### ChildTransferred

```solidity
event ChildTransferred(uint256 tokenId, uint256 childIndex, address childAddress, uint256 childId, bool fromPending)
```

Used to notify listeners a child token has been transferred from parent token.

_Emitted when a token transfers a child from itself, transferring ownership to the root owner._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that transferred a child token |
| childIndex | uint256 | Index of a child in the array from which it is being transferred |
| childAddress | address | Address of the child token's collection smart contract |
| childId | uint256 | ID of the child token in the child token's collection smart contract |
| fromPending | bool | A boolean value signifying whether the token was in the pending child tokens array (`true`) or  in the active child tokens array (`false`) |

### Child

```solidity
struct Child {
  uint256 tokenId;
  address contractAddress;
}
```

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address owner)
```

Used to retrieve the *root* owner of a given token.

_The *root* owner of the token is an externally owned account (EOA). If the given token is child of another
 NFT, this will return an EOA address. Otherwise, if the token is owned by an EOA, this EOA wil be returned._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which the *root* owner has been retrieved |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | The *root* owner of the token |

### directOwnerOf

```solidity
function directOwnerOf(uint256 tokenId) external view returns (address, uint256, bool)
```

Used to retrieve the immediate owner of the given token.

_If the immediate owner is another token, the address returned, should be the one of the parent token's
 collection smart contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which the RMRK owner is being retrieved |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address Address of the given token's owner |
| [1] | uint256 | uint256 The ID of the parent token. Should be `0` if the owner is an externally owned account |
| [2] | bool | bool The boolean value signifying whether the owner is an NFT or not |

### burn

```solidity
function burn(uint256 tokenId, uint256 maxRecursiveBurns) external returns (uint256)
```

Used to burn a given token.

_When a token is burned, all of its child tokens are recursively burned as well.
When specifying the maximum recursive burns, the execution will be reverted if there are more children to be
 burned.
Setting the `maxRecursiveBurn` value to 0 will only attempt to burn the specified token and revert if there
 are any child tokens present.
The approvals are cleared when the token is burned.
Requirements:

 - `tokenId` must exist.
Emits a {Transfer} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to burn |
| maxRecursiveBurns | uint256 | Maximum number of tokens to recursively burn |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 Number of recursively burned children |

### addChild

```solidity
function addChild(uint256 parentId, uint256 childId, bytes data) external
```

Used to add a child token to a given parent token.

_This adds the child token into the given parent token's pending child tokens array.
Requirements:

 - `directOwnerOf` on the child contract must resolve to the called contract.
 - the pending array of the parent contract must not be full._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | ID of the parent token to receive the new child token |
| childId | uint256 | ID of the new proposed child token |
| data | bytes | Additional data with no specified format |

### acceptChild

```solidity
function acceptChild(uint256 parentId, uint256 childIndex, address childAddress, uint256 childId) external
```

Used to accept a pending child token for a given parent token.

_This moves the child token from parent token's pending child tokens array into the active child tokens
 array._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | ID of the parent token for which the child token is being accepted |
| childIndex | uint256 | Index of a child tokem in the given parent's pending children array |
| childAddress | address | Address of the collection smart contract of the child token expected to be located at the  specified index of the given parent token's pending children array |
| childId | uint256 | ID of the child token expected to be located at the specified index of the given parent token's  pending children array |

### rejectAllChildren

```solidity
function rejectAllChildren(uint256 parentId, uint256 maxRejections) external
```

Used to reject all pending children of a given parent token.

_Removes the children from the pending array mapping.
This does not update the ownership storage data on children. If necessary, ownership can be reclaimed by the
 rootOwner of the previous parent.
Requirements:

Requirements:

- `parentId` must exist_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | ID of the parent token for which to reject all of the pending tokens. |
| maxRejections | uint256 | Maximum number of expected children to reject, used to prevent from  rejecting children which arrive just before this operation. |

### transferChild

```solidity
function transferChild(uint256 tokenId, address to, uint256 destinationId, uint256 childIndex, address childAddress, uint256 childId, bool isPending, bytes data) external
```

Used to transfer a child token from a given parent token.

_When transferring a child token, the owner of the token is set to `to`, or is not updated in the event of
 `to` being the `0x0` address._

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

### childrenOf

```solidity
function childrenOf(uint256 parentId) external view returns (struct IRMRKNestable.Child[])
```

Used to retrieve the active child tokens of a given parent token.

_Returns array of Child structs existing for parent token.
The Child struct consists of the following values:
 [
     tokenId,
     contractAddress
 ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | ID of the parent token for which to retrieve the active child tokens |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IRMRKNestable.Child[] | struct[] An array of Child structs containing the parent token's active child tokens |

### pendingChildrenOf

```solidity
function pendingChildrenOf(uint256 parentId) external view returns (struct IRMRKNestable.Child[])
```

Used to retrieve the pending child tokens of a given parent token.

_Returns array of pending Child structs existing for given parent.
The Child struct consists of the following values:
 [
     tokenId,
     contractAddress
 ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | ID of the parent token for which to retrieve the pending child tokens |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IRMRKNestable.Child[] | struct[] An array of Child structs containing the parent token's pending child tokens |

### childOf

```solidity
function childOf(uint256 parentId, uint256 index) external view returns (struct IRMRKNestable.Child)
```

Used to retrieve a specific active child token for a given parent token.

_Returns a single Child struct locating at `index` of parent token's active child tokens array.
The Child struct consists of the following values:
 [
     tokenId,
     contractAddress
 ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | ID of the parent token for which the child is being retrieved |
| index | uint256 | Index of the child token in the parent token's active child tokens array |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IRMRKNestable.Child | struct A Child struct containing data about the specified child |

### pendingChildOf

```solidity
function pendingChildOf(uint256 parentId, uint256 index) external view returns (struct IRMRKNestable.Child)
```

Used to retrieve a specific pending child token from a given parent token.

_Returns a single Child struct locating at `index` of parent token's active child tokens array.
The Child struct consists of the following values:
 [
     tokenId,
     contractAddress
 ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | ID of the parent token for which the pending child token is being retrieved |
| index | uint256 | Index of the child token in the parent token's pending child tokens array |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IRMRKNestable.Child | struct A Child struct containting data about the specified child |

### nestTransferFrom

```solidity
function nestTransferFrom(address from, address to, uint256 tokenId, uint256 destinationId, bytes data) external
```

Used to transfer the token into another token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | Address of the direct owner of the token to be transferred |
| to | address | Address of the receiving token's collection smart contract |
| tokenId | uint256 | ID of the token being transferred |
| destinationId | uint256 | ID of the token to receive the token being transferred |
| data | bytes | Additional data with no specified format, sent in the addChild call |

