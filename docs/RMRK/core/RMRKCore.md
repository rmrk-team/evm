# Solidity API

## RMRKCore

Smart contract of the RMRK core module.

_This is currently just a passthrough contract which allows for granular editing of base-level ERC721 functions._

### VERSION

```solidity
string VERSION
```

Version of the @rmrk-team/evm-contracts package

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

### name

```solidity
function name() public view virtual returns (string)
```

Used to retrieve the collection name.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | string Name of the collection |

### symbol

```solidity
function symbol() public view virtual returns (string)
```

Used to retrieve the collection symbol.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | string Symbol of the collection |

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual
```

Hook that is called before any token transfer. This includes minting and burning.

_Calling conditions:

 - When `from` and `to` are both non-zero, ``from``'s `tokenId` will be transferred to `to`.
 - When `from` is zero, `tokenId` will be minted to `to`.
 - When `to` is zero, ``from``'s `tokenId` will be burned.
 - `from` and `to` are never zero at the same time.

 To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | Address from which the token is being transferred |
| to | address | Address to which the token is being transferred |
| tokenId | uint256 | ID of the token being transferred |

### _afterTokenTransfer

```solidity
function _afterTokenTransfer(address from, address to, uint256 tokenId) internal virtual
```

Hook that is called after any transfer of tokens. This includes minting and burning.

_Calling conditions:

 - When `from` and `to` are both non-zero.
 - `from` and `to` are never zero at the same time.

 To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | Address from which the token has been transferred |
| to | address | Address to which the token has been transferred |
| tokenId | uint256 | ID of the token that has been transferred |

