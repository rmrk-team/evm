# RMRKERC20HolderMock

*RMRK team*

> RMRKERC20HolderMock

Smart contract of the RMRK ERC20 Holder module.



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

### balanceOfERC20

```solidity
function balanceOfERC20(address erc20Contract, uint256 tokenId) external view returns (uint256)
```

Look up the balance of ERC-20 tokens for a specific token and ERC-20 contract



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc20Contract | address | The ERC-20 contract |
| tokenId | uint256 | The token that owns the ERC-20 tokens |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The number of ERC-20 tokens owned by a token from an ERC-20 contract |

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

### transferERC20FromToken

```solidity
function transferERC20FromToken(address erc20Contract, uint256 tokenId, address to, uint256 value, bytes data) external nonpayable
```

Transfer ERC-20 tokens to address



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc20Contract | address | The ERC-20 contract |
| tokenId | uint256 | The token to transfer from |
| to | address | The address to send the ERC-20 tokens to |
| value | uint256 | The number of ERC-20 tokens to transfer |
| data | bytes | Additional data with no specified format, to allow for custom logic. |

### transferERC20ToToken

```solidity
function transferERC20ToToken(address erc20Contract, uint256 tokenId, uint256 value, bytes data) external nonpayable
```

Transfer ERC-20 tokens to a specific token

*The ERC-20 contract must have approved this contract to transfer the ERC-20 tokensThe balance MUST be transferred from the message sender*

#### Parameters

| Name | Type | Description |
|---|---|---|
| erc20Contract | address | The ERC-20 contract |
| tokenId | uint256 | The token to transfer to |
| value | uint256 | The number of ERC-20 tokens to transfer |
| data | bytes | Additional data with no specified format, to allow for custom logic. |

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

### ReceivedERC20

```solidity
event ReceivedERC20(address indexed erc20Contract, uint256 indexed toTokenId, address indexed from, uint256 value)
```

This emits when a token receives ERC-20 tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc20Contract `indexed` | address | The ERC-20 contract. |
| toTokenId `indexed` | uint256 | The token that receives the ERC-20 tokens. |
| from `indexed` | address | The prior owner of the token. |
| value  | uint256 | The number of ERC-20 tokens received. |

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

### TransferredERC20

```solidity
event TransferredERC20(address indexed erc20Contract, uint256 indexed fromTokenId, address indexed to, uint256 value)
```

This emits when a token transfers ERC-20 tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc20Contract `indexed` | address | The ERC-20 contract. |
| fromTokenId `indexed` | uint256 | The token that owned the ERC-20 tokens. |
| to `indexed` | address | The address that sends the ERC-20 tokens. |
| value  | uint256 | The number of ERC-20 tokens transferred. |



## Errors

### InsufficientBalance

```solidity
error InsufficientBalance()
```






### InvalidAddress

```solidity
error InvalidAddress()
```






### InvalidValue

```solidity
error InvalidValue()
```






### OnlyNFTOwnerCanTransferTokensFromIt

```solidity
error OnlyNFTOwnerCanTransferTokensFromIt()
```







