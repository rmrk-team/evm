# Solidity API

## RMRKSoulbound

Smart contract of the RMRK Soulbound module.

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual
```

Hook that is called before any token transfer. This includes minting and burning.

_This is a hook ensuring that all transfers of tokens are reverted if the token is soulbound.
The only exception of transfers being allowed is when the tokens are minted or when they are being burned._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | Address from which the token is originating (current owner of the token) |
| to | address | Address to which the token would be sent |
| tokenId | uint256 | ID of the token that would be transferred |

### isSoulbound

```solidity
function isSoulbound(uint256 tokenId) public view virtual returns (bool)
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

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

