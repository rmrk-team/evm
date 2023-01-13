# Solidity API

## RMRKNestableMock

### constructor

```solidity
constructor(string name_, string symbol_) public
```

### safeMint

```solidity
function safeMint(address to, uint256 tokenId) public
```

### safeMint

```solidity
function safeMint(address to, uint256 tokenId, bytes _data) public
```

### mint

```solidity
function mint(address to, uint256 tokenId) external
```

### nestMint

```solidity
function nestMint(address to, uint256 tokenId, uint256 destinationId) external
```

### transfer

```solidity
function transfer(address to, uint256 tokenId) public virtual
```

### nestTransfer

```solidity
function nestTransfer(address to, uint256 tokenId, uint256 destinationId) public virtual
```

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

### balancePerNftOf

```solidity
function balancePerNftOf(address owner, uint256 parentId) public view returns (uint256)
```

