# RMRKTokenHolder

*RMRK team*

> RMRKTokenHolder

Smart contract of a token holder RMRK extension.

*The RMRKTokenHolder extension is capable of holding ERC-20, ERC-721, and ERC-1155 tokens.*

## Methods

### balanceOfToken

```solidity
function balanceOfToken(address tokenContract, enum IRMRKTokenHolder.TokenType tokenType, uint256 tokenId, uint256 heldTokenId) external view returns (uint256)
```

Used to retrieve the given token&#39;s balance of given token

*When retrieving the balance of an ERC-20 token, the `heldTokenId` parameter MUST be ignored.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenContract | address | The address of the held token&#39;s smart contract |
| tokenType | enum IRMRKTokenHolder.TokenType | The type of the token being checked for balance |
| tokenId | uint256 | The ID of the token being checked for balance |
| heldTokenId | uint256 | The ID of the held token of which the balance is being retrieved |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The amount of the specified ERC-20 tokens owned by a given token |

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

### transferHeldTokenFromToken

```solidity
function transferHeldTokenFromToken(address tokenContract, enum IRMRKTokenHolder.TokenType tokenType, uint256 tokenId, uint256 heldTokenId, uint256 amount, address to, bytes data) external nonpayable
```

Transfer held tokens from a specific token.

*The balance MUST be transferred from this smart contract.Implementers should validate that the `msg.sender` is either the token owner or approved to manage it before  calling this.If the token type is `ERC-20`, the `heldTokenId` MUST be ignored.IF the token type is `ERC-721`, the `amount` MUST be ignored.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenContract | address | The address of the held token&#39;s smart contract |
| tokenType | enum IRMRKTokenHolder.TokenType | The type of the token being transferred |
| tokenId | uint256 | The ID of the token to transfer the held token from |
| heldTokenId | uint256 | The ID of the held token to transfer |
| amount | uint256 | The number of held tokens to transfer |
| to | address | The address to transfer the held tokens to |
| data | bytes | Additional data with no specified format, to allow for custom logic |

### transferHeldTokenToToken

```solidity
function transferHeldTokenToToken(address tokenContract, enum IRMRKTokenHolder.TokenType tokenType, uint256 tokenId, uint256 heldTokenId, uint256 amount, bytes data) external nonpayable
```

Transfer tokens to a specific holder token.

*The token smart contract must have approval for this contract to transfer the tokens.The balance MUST be transferred from the `msg.sender`.If the token type is `ERC-20`, the `heldTokenId` MUST be ignored.If the token type is `ERC-721`, the `amount` MUST be ignored.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenContract | address | The address of the token smart contract |
| tokenType | enum IRMRKTokenHolder.TokenType | The type of the token being transferred |
| tokenId | uint256 | The ID of the token to transfer the tokens to |
| heldTokenId | uint256 | The ID of the held token to transfer |
| amount | uint256 | The number of ERC-20 tokens to transfer |
| data | bytes | Additional data with no specified format, to allow for custom logic |



## Events

### ReceivedToken

```solidity
event ReceivedToken(address indexed tokenContract, enum IRMRKTokenHolder.TokenType tokenType, uint256 indexed toTokenId, uint256 heldTokenId, address indexed from, uint256 amount)
```

Used to notify listeners that the token received held tokens.

*If the token type is `ERC-20`, the `heldTokenId` MUST equal `0`If the token type is `ERC-721`, the `amount` MUST equal `1`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenContract `indexed` | address | The address of the held token&#39;s smart contract |
| tokenType  | enum IRMRKTokenHolder.TokenType | The type of the held token being received |
| toTokenId `indexed` | uint256 | The ID of the token receiving the held tokens |
| heldTokenId  | uint256 | The ID of the held token being received |
| from `indexed` | address | The address of the account from which the tokens are being transferred |
| amount  | uint256 | The amount of held tokens received |

### TransferredToken

```solidity
event TransferredToken(address indexed tokenContract, enum IRMRKTokenHolder.TokenType tokenType, uint256 indexed fromTokenId, uint256 heldTokenId, address indexed to, uint256 amount)
```

Used to notify the listeners that the ERC-20 tokens have been transferred.

*If the token type is `ERC-20`, the `heldTokenId` MUST equal `0`If the token type is `ERC-721`, the `amount` MUST equal `1`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenContract `indexed` | address | The address of the smart contract of the token being transferred |
| tokenType  | enum IRMRKTokenHolder.TokenType | The type of the token being transferred |
| fromTokenId `indexed` | uint256 | The ID of the token from which the held tokens have been transferred |
| heldTokenId  | uint256 | The Id of the held token being transferred |
| to `indexed` | address | The address receiving the ERC-20 tokens |
| amount  | uint256 | The amount of held tokens transferred |



