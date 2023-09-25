# ERC1155Holder









## Methods

### balanceOfERC1155

```solidity
function balanceOfERC1155(address erc1155Contract, uint256 tokenHolderId, uint256 tokenHeldId) external view returns (uint256)
```

Used to retrieve the given token&#39;s specific ERC-1155 balance



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc1155Contract | address | The address of the ERC-1155 smart contract |
| tokenHolderId | uint256 | The ID of the token being checked for ERC-1155 balance |
| tokenHeldId | uint256 | The ID of the held token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The amount of the specified ERC-1155 tokens owned by a given token |

### onERC1155Received

```solidity
function onERC1155Received(address, address, uint256, uint256, bytes) external pure returns (bytes4)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | address | undefined |
| _2 | uint256 | undefined |
| _3 | uint256 | undefined |
| _4 | bytes | undefined |

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

### transferERC1155ToToken

```solidity
function transferERC1155ToToken(address erc1155Contract, uint256 tokenHolderId, uint256 tokenToTransferId, uint256 amount, bytes data) external nonpayable
```

Transfer ERC-1155 tokens to a specific token.

*The ERC-1155 smart contract must have approval for this contract to transfer the ERC-1155 tokens.The balance MUST be transferred from the `msg.sender`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| erc1155Contract | address | The address of the ERC-1155 smart contract |
| tokenHolderId | uint256 | The ID of the token to transfer ERC-1155 tokens to |
| tokenToTransferId | uint256 | The ID of the held token being received |
| amount | uint256 | The number of ERC-1155 tokens to transfer |
| data | bytes | Additional data with no specified format, to allow for custom logic |

### transferHeldERC1155FromToken

```solidity
function transferHeldERC1155FromToken(address erc1155Contract, uint256 tokenHolderId, uint256 tokenToTransferId, address to, uint256 amount, bytes data) external nonpayable
```

Transfer ERC-1155 tokens from a specific token.

*The balance MUST be transferred from this smart contract.Implementers should validate that the `msg.sender` is either the token owner or approved to manage it before calling this.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| erc1155Contract | address | The address of the ERC-1155 smart contract |
| tokenHolderId | uint256 | The ID of the token to transfer the ERC-1155 tokens from |
| tokenToTransferId | uint256 | The ID of the held token being sent |
| to | address | undefined |
| amount | uint256 | The number of ERC-1155 tokens to transfer |
| data | bytes | Additional data with no specified format, to allow for custom logic |



## Events

### ReceivedERC1155

```solidity
event ReceivedERC1155(address indexed erc1155Contract, uint256 indexed tokenHolderId, uint256 tokenTransferredId, address indexed from, uint256 amount)
```

Used to notify listeners that the token received ERC-1155 tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc1155Contract `indexed` | address | The address of the ERC-1155 smart contract |
| tokenHolderId `indexed` | uint256 | The ID of the token receiving the ERC-1155 tokens |
| tokenTransferredId  | uint256 | The ID of the received token |
| from `indexed` | address | The address of the account from which the tokens are being transferred |
| amount  | uint256 | The number of ERC-1155 tokens received |

### TransferredERC1155

```solidity
event TransferredERC1155(address indexed erc1155Contract, uint256 indexed tokenHolderId, uint256 tokenTransferredId, address indexed to, uint256 amount)
```

Used to notify the listeners that the ERC-1155 tokens have been transferred.



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc1155Contract `indexed` | address | The address of the ERC-1155 smart contract |
| tokenHolderId `indexed` | uint256 | The ID of the token from which the ERC-1155 tokens have been transferred |
| tokenTransferredId  | uint256 | The ID of the transferred token |
| to `indexed` | address | The address receiving the ERC-1155 tokens |
| amount  | uint256 | The number of ERC-1155 tokens transferred |



## Errors

### InvalidAddress

```solidity
error InvalidAddress()
```






### InvalidValue

```solidity
error InvalidValue()
```







