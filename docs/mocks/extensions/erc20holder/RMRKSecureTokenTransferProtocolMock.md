# RMRKSecureTokenTransferProtocolMock

*RMRK team*

> RMRKSecureTokenTransferProtocolMock

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

### balanceOfToken

```solidity
function balanceOfToken(address tokenContract, enum IRMRKSecureTokenTransferProtocol.TokenType tokenType, uint256 tokenId, uint256 heldTokenId) external view returns (uint256)
```

Used to retrieve the given token&#39;s balance of given token

*When retrieving the balance of an ERC-20 token, the `heldTokenId` parameter MUST be ignored.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenContract | address | The address of the held token&#39;s smart contract |
| tokenType | enum IRMRKSecureTokenTransferProtocol.TokenType | The type of the token being checked for balance |
| tokenId | uint256 | The ID of the token being checked for balance |
| heldTokenId | uint256 | The ID of the held token of which the balance is being retrieved |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The amount of the specified ERC-20 tokens owned by a given token |

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

### transferHeldTokenFromToken

```solidity
function transferHeldTokenFromToken(address tokenContract, enum IRMRKSecureTokenTransferProtocol.TokenType tokenType, uint256 tokenId, uint256 heldTokenId, uint256 amount, address to, bytes data) external nonpayable
```

Transfer held tokens from a specific token.

*The balance MUST be transferred from this smart contract.Implementers should validate that the `msg.sender` is either the token owner or approved to manage it before  calling this.If the token type is `ERC-20`, the `heldTokenId` MUST be ignored.IF the token type is `ERC-721`, the `amount` MUST be ignored.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenContract | address | The address of the held token&#39;s smart contract |
| tokenType | enum IRMRKSecureTokenTransferProtocol.TokenType | The type of the token being transferred |
| tokenId | uint256 | The ID of the token to transfer the held token from |
| heldTokenId | uint256 | The ID of the held token to transfer |
| amount | uint256 | The number of held tokens to transfer |
| to | address | The address to transfer the held tokens to |
| data | bytes | Additional data with no specified format, to allow for custom logic |

### transferHeldTokenToToken

```solidity
function transferHeldTokenToToken(address tokenContract, enum IRMRKSecureTokenTransferProtocol.TokenType tokenType, uint256 tokenId, uint256 heldTokenId, uint256 amount, bytes data) external nonpayable
```

Transfer tokens to a specific holder token.

*The token smart contract must have approval for this contract to transfer the tokens.The balance MUST be transferred from the `msg.sender`.If the token type is `ERC-20`, the `heldTokenId` MUST be ignored.If the token type is `ERC-721`, the `amount` MUST be ignored.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenContract | address | The address of the token smart contract |
| tokenType | enum IRMRKSecureTokenTransferProtocol.TokenType | The type of the token being transferred |
| tokenId | uint256 | The ID of the token to transfer the tokens to |
| heldTokenId | uint256 | The ID of the held token to transfer |
| amount | uint256 | The number of ERC-20 tokens to transfer |
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

### ReceivedToken

```solidity
event ReceivedToken(address indexed tokenContract, enum IRMRKSecureTokenTransferProtocol.TokenType tokenType, uint256 indexed toTokenId, uint256 heldTokenId, address indexed from, uint256 amount)
```

Used to notify listeners that the token received held tokens.

*If the token type is `ERC-20`, the `heldTokenId` MUST equal `0`If the token type is `ERC-721`, the `amount` MUST equal `1`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenContract `indexed` | address | The address of the held token&#39;s smart contract |
| tokenType  | enum IRMRKSecureTokenTransferProtocol.TokenType | The type of the held token being received |
| toTokenId `indexed` | uint256 | The ID of the token receiving the held tokens |
| heldTokenId  | uint256 | The ID of the held token being received |
| from `indexed` | address | The address of the account from which the tokens are being transferred |
| amount  | uint256 | The amount of held tokens received |

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

### TransferredToken

```solidity
event TransferredToken(address indexed tokenContract, enum IRMRKSecureTokenTransferProtocol.TokenType tokenType, uint256 indexed fromTokenId, uint256 heldTokenId, address indexed to, uint256 amount)
```

Used to notify the listeners that the ERC-20 tokens have been transferred.

*If the token type is `ERC-20`, the `heldTokenId` MUST equal `0`If the token type is `ERC-721`, the `amount` MUST equal `1`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenContract `indexed` | address | The address of the smart contract of the token being transferred |
| tokenType  | enum IRMRKSecureTokenTransferProtocol.TokenType | The type of the token being transferred |
| fromTokenId `indexed` | uint256 | The ID of the token from which the held tokens have been transferred |
| heldTokenId  | uint256 | The Id of the held token being transferred |
| to `indexed` | address | The address receiving the ERC-20 tokens |
| amount  | uint256 | The amount of held tokens transferred |



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







