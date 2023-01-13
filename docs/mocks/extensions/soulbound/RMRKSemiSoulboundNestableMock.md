# Solidity API

## RMRKSemiSoulboundNestableMock

### soulboundExempt

```solidity
mapping(uint256 => bool) soulboundExempt
```

### constructor

```solidity
constructor(string name, string symbol) public
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual
```

### isSoulbound

```solidity
function isSoulbound(uint256 tokenId) public view returns (bool)
```

Used to check whether the given token is soulbound or not.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token being checked |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | Boolean value indicating whether the given token is soulbound |

### setSoulboundExempt

```solidity
function setSoulboundExempt(uint256 tokenId) public
```

