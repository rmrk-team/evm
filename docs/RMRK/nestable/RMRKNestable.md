# Solidity API

## RMRKNestable

Smart contract of the RMRK Nestable module.

_This contract is hierarchy agnostic and can support an arbitrary number of nested levels up and down, as long as
 gas limits allow it._

### _activeChildren

```solidity
mapping(uint256 => struct IRMRKNestable.Child[]) _activeChildren
```

### _pendingChildren

```solidity
mapping(uint256 => struct IRMRKNestable.Child[]) _pendingChildren
```

### onlyApprovedOrOwner

```solidity
modifier onlyApprovedOrOwner(uint256 tokenId)
```

Used to verify that the caller is either the owner of the token or approved to manage it by its owner.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to check |

### onlyApprovedOrDirectOwner

```solidity
modifier onlyApprovedOrDirectOwner(uint256 tokenId)
```

Used to verify that the caller is approved to manage the given token or is its direct owner.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to check |

### constructor

```solidity
constructor(string name_, string symbol_) public
```

Initializes the contract by setting a `name` and a `symbol` to the token collection.

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

### balanceOf

```solidity
function balanceOf(address owner) public view virtual returns (uint256)
```

_Returns the number of tokens in ``owner``'s account._

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) public virtual
```

_Transfers `tokenId` token from `from` to `to`.

WARNING: Note that the caller is responsible to confirm that the recipient is capable of receiving ERC721
or else they may be permanently lost. Usage of {safeTransferFrom} prevents loss, though the caller must
understand this adds an external call which potentially creates a reentrancy vulnerability.

Requirements:

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `tokenId` token must be owned by `from`.
- If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.

Emits a {Transfer} event._

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) public virtual
```

_Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
are aware of the ERC721 protocol to prevent tokens from being forever locked.

Requirements:

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `tokenId` token must exist and be owned by `from`.
- If the caller is not `from`, it must have been allowed to move this token by either {approve} or {setApprovalForAll}.
- If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.

Emits a {Transfer} event._

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) public virtual
```

_Safely transfers `tokenId` token from `from` to `to`.

Requirements:

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `tokenId` token must exist and be owned by `from`.
- If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
- If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.

Emits a {Transfer} event._

### nestTransferFrom

```solidity
function nestTransferFrom(address from, address to, uint256 tokenId, uint256 destinationId, bytes data) public virtual
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

### _safeTransfer

```solidity
function _safeTransfer(address from, address to, uint256 tokenId, bytes data) internal virtual
```

Used to safely transfer the token form `from` to `to`.

_The function checks that contract recipients are aware of the ERC721 protocol to prevent tokens from being
 forever locked.
This internal function is equivalent to {safeTransferFrom}, and can be used to e.g. implement alternative
 mechanisms to perform token transfer, such as signature-based.
Requirements:

 - `from` cannot be the zero address.
 - `to` cannot be the zero address.
 - `tokenId` token must exist and be owned by `from`.
 - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
Emits a {Transfer} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | Address of the account currently owning the given token |
| to | address | Address to transfer the token to |
| tokenId | uint256 | ID of the token to transfer |
| data | bytes | Additional data with no specified format, sent in call to `to` |

### _transfer

```solidity
function _transfer(address from, address to, uint256 tokenId, bytes data) internal virtual
```

Used to transfer the token from `from` to `to`.

_As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
Requirements:

 - `to` cannot be the zero address.
 - `tokenId` token must be owned by `from`.
Emits a {Transfer} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | Address of the account currently owning the given token |
| to | address | Address to transfer the token to |
| tokenId | uint256 | ID of the token to transfer |
| data | bytes | Additional data with no specified format, sent in call to `to` |

### _nestTransfer

```solidity
function _nestTransfer(address from, address to, uint256 tokenId, uint256 destinationId, bytes data) internal virtual
```

Used to transfer a token into another token.

_Attempting to nest a token into `0x0` address will result in reverted transaction.
Attempting to nest a token into itself will result in reverted transaction._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | Address of the account currently owning the given token |
| to | address | Address of the receiving token's collection smart contract |
| tokenId | uint256 | ID of the token to transfer |
| destinationId | uint256 | ID of the token receiving the given token |
| data | bytes | Additional data with no specified format, sent in the addChild call |

### _safeMint

```solidity
function _safeMint(address to, uint256 tokenId, bytes data) internal virtual
```

Used to safely mint the token to the specified address while passing the additional data to contract
 recipients.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address to which to mint the token |
| tokenId | uint256 | ID of the token to mint |
| data | bytes | Additional data to send with the tokens |

### _mint

```solidity
function _mint(address to, uint256 tokenId, bytes data) internal virtual
```

Used to mint a specified token to a given address.

_WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible.
Requirements:

 - `tokenId` must not exist.
 - `to` cannot be the zero address.
Emits a {Transfer} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address to mint the token to |
| tokenId | uint256 | ID of the token to mint |
| data | bytes | Additional data with no specified format, sent in call to `to` |

### _nestMint

```solidity
function _nestMint(address to, uint256 tokenId, uint256 destinationId, bytes data) internal virtual
```

Used to mint a child token to a given parent token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address of the collection smart contract of the token into which to mint the child token |
| tokenId | uint256 | ID of the token to mint |
| destinationId | uint256 | ID of the token into which to mint the new child token |
| data | bytes | Additional data with no specified format, sent in the addChild call |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) public view virtual returns (address)
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
| [0] | address |  |

### directOwnerOf

```solidity
function directOwnerOf(uint256 tokenId) public view virtual returns (address, uint256, bool)
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
function burn(uint256 tokenId) public virtual
```

Used to burn a given token.

_In case the token has any child tokens, the execution will be reverted._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to burn |

### burn

```solidity
function burn(uint256 tokenId, uint256 maxChildrenBurns) public virtual returns (uint256)
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
| maxChildrenBurns | uint256 |  |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 Number of recursively burned children |

### _burn

```solidity
function _burn(uint256 tokenId, uint256 maxChildrenBurns) internal virtual returns (uint256)
```

Used to burn a token.

_When a token is burned, its children are recursively burned as well.
The approvals are cleared when the token is burned.
Requirements:

 - `tokenId` must exist.
Emits a {Transfer} event.
Emits a {NestTransfer} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to burn |
| maxChildrenBurns | uint256 | Maximum children to recursively burn |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The number of recursive burns it took to burn all of the children |

### approve

```solidity
function approve(address to, uint256 tokenId) public virtual
```

_Gives permission to `to` to transfer `tokenId` token to another account.
The approval is cleared when the token is transferred.

Only a single account can be approved at a time, so approving the zero address clears previous approvals.

Requirements:

- The caller must own the token or be an approved operator.
- `tokenId` must exist.

Emits an {Approval} event._

### getApproved

```solidity
function getApproved(uint256 tokenId) public view virtual returns (address)
```

_Returns the account approved for `tokenId` token.

Requirements:

- `tokenId` must exist._

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) public virtual
```

_Approve or remove `operator` as an operator for the caller.
Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.

Requirements:

- The `operator` cannot be the caller.

Emits an {ApprovalForAll} event._

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) public view virtual returns (bool)
```

_Returns if the `operator` is allowed to manage all of the assets of `owner`.

See {setApprovalForAll}_

### _approve

```solidity
function _approve(address to, uint256 tokenId) internal virtual
```

Used to grant an approval to manage a given token.

_Emits an {Approval} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address to which the approval is being granted |
| tokenId | uint256 | ID of the token for which the approval is being granted |

### _updateOwnerAndClearApprovals

```solidity
function _updateOwnerAndClearApprovals(uint256 tokenId, uint256 destinationId, address to, bool isNft) internal
```

Used to update the owner of the token and clear the approvals associated with the previous owner.

_The `destinationId` should equal `0` if the new owner is an externally owned account._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token being updated |
| destinationId | uint256 | ID of the token to receive the given token |
| to | address | Address of account to receive the token |
| isNft | bool | A boolean value signifying whether the new owner is a token (`true`) or externally owned account  (`false`) |

### _cleanApprovals

```solidity
function _cleanApprovals(uint256 tokenId) internal virtual
```

Used to remove approvals for the current owner of the given token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to clear the approvals for |

### _isApprovedOrOwner

```solidity
function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool)
```

Used to check whether the given account is allowed to manage the given token.

_Requirements:

 - `tokenId` must exist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| spender | address | Address that is being checked for approval |
| tokenId | uint256 | ID of the token being checked |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool The boolean value indicating whether the `spender` is approved to manage the given token |

### _isApprovedOrDirectOwner

```solidity
function _isApprovedOrDirectOwner(address spender, uint256 tokenId) internal view virtual returns (bool)
```

Used to check whether the account is approved to manage the token or its direct owner.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| spender | address | Address that is being checked for approval or direct ownership |
| tokenId | uint256 | ID of the token being checked |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool The boolean value indicating whether the `spender` is approved to manage the given token or its  direct owner |

### _requireMinted

```solidity
function _requireMinted(uint256 tokenId) internal view virtual
```

Used to enforce that the given token has been minted.

_Reverts if the `tokenId` has not been minted yet.
The validation checks whether the owner of a given token is a `0x0` address and considers it not minted if
 it is. This means that both tokens that haven't been minted yet as well as the ones that have already been
 burned will cause the transaction to be reverted._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to check |

### _exists

```solidity
function _exists(uint256 tokenId) internal view virtual returns (bool)
```

Used to check whether the given token exists.

_Tokens start existing when they are minted (`_mint`) and stop existing when they are burned (`_burn`)._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token being checked |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool The boolean value signifying whether the token exists |

### addChild

```solidity
function addChild(uint256 parentId, uint256 childId, bytes data) public virtual
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
function acceptChild(uint256 parentId, uint256 childIndex, address childAddress, uint256 childId) public virtual
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

### _acceptChild

```solidity
function _acceptChild(uint256 parentId, uint256 childIndex, address childAddress, uint256 childId) internal virtual
```

Used to accept a pending child token for a given parent token.

_This moves the child token from parent token's pending child tokens array into the active child tokens
 array.
Requirements:

 - `tokenId` must exist
 - `index` must be in range of the pending children array_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | ID of the parent token for which the child token is being accepted |
| childIndex | uint256 | Index of a child tokem in the given parent's pending children array |
| childAddress | address | Address of the collection smart contract of the child token expected to be located at the  specified index of the given parent token's pending children array |
| childId | uint256 | ID of the child token expected to be located at the specified index of the given parent token's  pending children array |

### rejectAllChildren

```solidity
function rejectAllChildren(uint256 tokenId, uint256 maxRejections) public virtual
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
| tokenId | uint256 |  |
| maxRejections | uint256 | Maximum number of expected children to reject, used to prevent from  rejecting children which arrive just before this operation. |

### _rejectAllChildren

```solidity
function _rejectAllChildren(uint256 tokenId, uint256 maxRejections) internal virtual
```

Used to reject all pending children of a given parent token.

_Removes the children from the pending array mapping.
This does not update the ownership storage data on children. If necessary, ownership can be reclaimed by the
 rootOwner of the previous parent.
Requirements:

 - `tokenId` must exist_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the parent token for which to reject all of the pending tokens. |
| maxRejections | uint256 | Maximum number of expected children to reject, used to prevent from  rejecting children which arrive just before this operation. |

### transferChild

```solidity
function transferChild(uint256 tokenId, address to, uint256 destinationId, uint256 childIndex, address childAddress, uint256 childId, bool isPending, bytes data) public virtual
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

### childrenOf

```solidity
function childrenOf(uint256 parentId) public view virtual returns (struct IRMRKNestable.Child[])
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
function pendingChildrenOf(uint256 parentId) public view virtual returns (struct IRMRKNestable.Child[])
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
function childOf(uint256 parentId, uint256 index) public view virtual returns (struct IRMRKNestable.Child)
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
function pendingChildOf(uint256 parentId, uint256 index) public view virtual returns (struct IRMRKNestable.Child)
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

### childIsInActive

```solidity
function childIsInActive(address childAddress, uint256 childId) public view virtual returns (bool)
```

Used to verify that the given child tokwn is included in an active array of a token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| childAddress | address | Address of the given token's collection smart contract |
| childId | uint256 | ID of the child token being checked |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool A boolean value signifying whether the given child token is included in an active child tokens array  of a token (`true`) or not (`false`) |

### _beforeNestedTokenTransfer

```solidity
function _beforeNestedTokenTransfer(address from, address to, uint256 fromTokenId, uint256 toTokenId, uint256 tokenId, bytes data) internal virtual
```

Hook that is called before nested token transfer.

_To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | Address from which the token is being transferred |
| to | address | Address to which the token is being transferred |
| fromTokenId | uint256 | ID of the token from which the given token is being transferred |
| toTokenId | uint256 | ID of the token to which the given token is being transferred |
| tokenId | uint256 | ID of the token being transferred |
| data | bytes | Additional data with no specified format, sent in the addChild call |

### _afterNestedTokenTransfer

```solidity
function _afterNestedTokenTransfer(address from, address to, uint256 fromTokenId, uint256 toTokenId, uint256 tokenId, bytes data) internal virtual
```

Hook that is called after nested token transfer.

_To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | Address from which the token was transferred |
| to | address | Address to which the token was transferred |
| fromTokenId | uint256 | ID of the token from which the given token was transferred |
| toTokenId | uint256 | ID of the token to which the given token was transferred |
| tokenId | uint256 | ID of the token that was transferred |
| data | bytes | Additional data with no specified format, sent in the addChild call |

### _beforeAddChild

```solidity
function _beforeAddChild(uint256 tokenId, address childAddress, uint256 childId, bytes data) internal virtual
```

Hook that is called before a child is added to the pending tokens array of a given token.

_The Child struct consists of the following values:
 [
     tokenId,
     contractAddress
 ]
To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that will receive a new pending child token |
| childAddress | address | Address of the collection smart contract of the child token expected to be located at the  specified index of the given parent token's pending children array |
| childId | uint256 | ID of the child token expected to be located at the specified index of the given parent token's  pending children array |
| data | bytes | Additional data with no specified format |

### _afterAddChild

```solidity
function _afterAddChild(uint256 tokenId, address childAddress, uint256 childId, bytes data) internal virtual
```

Hook that is called after a child is added to the pending tokens array of a given token.

_The Child struct consists of the following values:
 [
     tokenId,
     contractAddress
 ]
To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that has received a new pending child token |
| childAddress | address | Address of the collection smart contract of the child token expected to be located at the  specified index of the given parent token's pending children array |
| childId | uint256 | ID of the child token expected to be located at the specified index of the given parent token's  pending children array |
| data | bytes | Additional data with no specified format |

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

### _afterAcceptChild

```solidity
function _afterAcceptChild(uint256 parentId, uint256 childIndex, address childAddress, uint256 childId) internal virtual
```

Hook that is called after a child is accepted to the active tokens array of a given token.

_The Child struct consists of the following values:
 [
     tokenId,
     contractAddress
 ]
To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | ID of the token that has accepted a pending child token |
| childIndex | uint256 | Index of the child token that was accpeted in the given parent token's pending children array |
| childAddress | address | Address of the collection smart contract of the child token that was expected to be located  at the specified index of the given parent token's pending children array |
| childId | uint256 | ID of the child token that was expected to be located at the specified index of the given parent  token's pending children array |

### _beforeTransferChild

```solidity
function _beforeTransferChild(uint256 tokenId, uint256 childIndex, address childAddress, uint256 childId, bool isPending, bytes data) internal virtual
```

Hook that is called before a child is transferred from a given child token array of a given token.

_The Child struct consists of the following values:
 [
     tokenId,
     contractAddress
 ]
To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that will transfer a child token |
| childIndex | uint256 | Index of the child token that will be transferred from the given parent token's children array |
| childAddress | address | Address of the collection smart contract of the child token that is expected to be located  at the specified index of the given parent token's children array |
| childId | uint256 | ID of the child token that is expected to be located at the specified index of the given parent  token's children array |
| isPending | bool | A boolean value signifying whether the child token is being transferred from the pending child  tokens array (`true`) or from the active child tokens array (`false`) |
| data | bytes | Additional data with no specified format, sent in the addChild call |

### _afterTransferChild

```solidity
function _afterTransferChild(uint256 tokenId, uint256 childIndex, address childAddress, uint256 childId, bool isPending, bytes data) internal virtual
```

Hook that is called after a child is transferred from a given child token array of a given token.

_The Child struct consists of the following values:
 [
     tokenId,
     contractAddress
 ]
To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that has transferred a child token |
| childIndex | uint256 | Index of the child token that was transferred from the given parent token's children array |
| childAddress | address | Address of the collection smart contract of the child token that was expected to be located  at the specified index of the given parent token's children array |
| childId | uint256 | ID of the child token that was expected to be located at the specified index of the given parent  token's children array |
| isPending | bool | A boolean value signifying whether the child token was transferred from the pending child tokens  array (`true`) or from the active child tokens array (`false`) |
| data | bytes | Additional data with no specified format, sent in the addChild call |

### _beforeRejectAllChildren

```solidity
function _beforeRejectAllChildren(uint256 tokenId) internal virtual
```

Hook that is called before a pending child tokens array of a given token is cleared.

_To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that will reject all of the pending child tokens |

### _afterRejectAllChildren

```solidity
function _afterRejectAllChildren(uint256 tokenId) internal virtual
```

Hook that is called after a pending child tokens array of a given token is cleared.

_To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token that has rejected all of the pending child tokens |

