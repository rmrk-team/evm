# ERC721Holder









## Methods

### balanceOfERC721

```solidity
function balanceOfERC721(address erc721Contract, uint256 tokenHolderId, uint256 tokenHeldId) external view returns (uint256)
```

Used to retrieve the given token&#39;s specific ERC-721 balance



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc721Contract | address | The address of the ERC-721 smart contract |
| tokenHolderId | uint256 | The ID of the token being checked for ERC-721 balance |
| tokenHeldId | uint256 | The ID of the held token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### onERC721Received

```solidity
function onERC721Received(address, address, uint256, bytes) external pure returns (bytes4)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | address | undefined |
| _2 | uint256 | undefined |
| _3 | bytes | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes4 | undefined |

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

### transferERC721ToToken

```solidity
function transferERC721ToToken(address erc721Contract, uint256 tokenHolderId, uint256 tokenToTransferId, bytes data) external nonpayable
```

Transfer ERC-721 tokens to a specific token.

*The ERC-721 smart contract must have approval for this contract to transfer the ERC-721 tokens.The balance MUST be transferred from the `msg.sender`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| erc721Contract | address | The address of the ERC-721 smart contract |
| tokenHolderId | uint256 | The ID of the token to transfer ERC-721 tokens to |
| tokenToTransferId | uint256 | The ID of the held token being received |
| data | bytes | Additional data with no specified format, to allow for custom logic |

### transferHeldERC721FromToken

```solidity
function transferHeldERC721FromToken(address erc721Contract, uint256 tokenHolderId, uint256 tokenToTransferId, address to, bytes data) external nonpayable
```

Transfer ERC-721 tokens from a specific token.

*The balance MUST be transferred from this smart contract.Implementers should validate that the `msg.sender` is either the token owner or approved to manage it before calling this.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| erc721Contract | address | The address of the ERC-721 smart contract |
| tokenHolderId | uint256 | The ID of the token to transfer the ERC-721 tokens from |
| tokenToTransferId | uint256 | The ID of the held token being sent |
| to | address | undefined |
| data | bytes | Additional data with no specified format, to allow for custom logic |



## Events

### ReceivedERC721

```solidity
event ReceivedERC721(address indexed erc721Contract, uint256 indexed tokenHolderId, uint256 tokenTransferredId, address indexed from)
```

Used to notify listeners that the token received ERC-721 tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc721Contract `indexed` | address | The address of the ERC-721 smart contract |
| tokenHolderId `indexed` | uint256 | The ID of the token receiving the ERC-721 tokens |
| tokenTransferredId  | uint256 | The ID of the received token |
| from `indexed` | address | The address of the account from which the tokens are being transferred |

### TransferredERC721

```solidity
event TransferredERC721(address indexed erc721Contract, uint256 indexed tokenHolderId, uint256 tokenTransferredId, address indexed to)
```

Used to notify the listeners that the ERC-721 tokens have been transferred.



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc721Contract `indexed` | address | The address of the ERC-721 smart contract |
| tokenHolderId `indexed` | uint256 | The ID of the token from which the ERC-721 tokens have been transferred |
| tokenTransferredId  | uint256 | The ID of the transferred token |
| to `indexed` | address | The address receiving the ERC-721 tokens |



## Errors

### InvalidAddress

```solidity
error InvalidAddress()
```







