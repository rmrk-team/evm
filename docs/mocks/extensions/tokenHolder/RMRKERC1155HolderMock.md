# RMRKERC1155HolderMock

*RMRK team*

> RMRKERC1155HolderMock

Smart contract of the RMRK ERC1155 Holder module.



## Methods

### approve

```solidity
function approve(address to, uint256 tokenId) external nonpayable
```



*See {IERC721-approve}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```



*See {IERC721-balanceOf}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

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

### getApproved

```solidity
function getApproved(uint256 tokenId) external view returns (address)
```



*See {IERC721-getApproved}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool)
```



*See {IERC721-isApprovedForAll}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |
| operator | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### mint

```solidity
function mint(address to, uint256 tokenId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |

### name

```solidity
function name() external view returns (string)
```



*See {IERC721Metadata-name}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

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

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```



*See {IERC721-ownerOf}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*See {IERC721-safeTransferFrom}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external nonpayable
```



*See {IERC721-safeTransferFrom}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |
| data | bytes | undefined |

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) external nonpayable
```



*See {IERC721-setApprovalForAll}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined |
| approved | bool | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### symbol

```solidity
function symbol() external view returns (string)
```



*See {IERC721Metadata-symbol}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```



*See {IERC721Metadata-tokenURI}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

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

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*See {IERC721-transferFrom}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

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

### Approval

```solidity
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
```



*Emitted when `owner` enables `approved` to manage the `tokenId` token.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| approved `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
```



*Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| operator `indexed` | address | undefined |
| approved  | bool | undefined |

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

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
```



*Emitted when `tokenId` token is transferred from `from` to `to`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

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

### InsufficientBalance

```solidity
error InsufficientBalance()
```






### InvalidAddressForERC1155

```solidity
error InvalidAddressForERC1155()
```






### InvalidValueForERC1155

```solidity
error InvalidValueForERC1155()
```






### OnlyNFTOwnerCanTransferTokensFromIt

```solidity
error OnlyNFTOwnerCanTransferTokensFromIt()
```







