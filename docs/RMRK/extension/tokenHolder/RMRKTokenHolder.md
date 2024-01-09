# RMRKTokenHolder









## Methods

### balanceOfERC20

```solidity
function balanceOfERC20(address erc20Contract, uint256 tokenId) external view returns (uint256)
```

Used to retrieve the given token&#39;s specific ERC-20 balance



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc20Contract | address | The address of the ERC-20 smart contract |
| tokenId | uint256 | The ID of the token being checked for ERC-20 balance |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The amount of the specified ERC-20 tokens owned by a given token |

### erc20TransferOutNonce

```solidity
function erc20TransferOutNonce(uint256 tokenId) external view returns (uint256)
```

Nonce increased every time an ERC20 token is transferred out of a token



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The ID of the token to check the nonce for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The nonce of the token |

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

### transferERC20ToToken

```solidity
function transferERC20ToToken(address erc20Contract, uint256 tokenId, uint256 amount, bytes data) external nonpayable
```

Transfer ERC-20 tokens to a specific token.

*The ERC-20 smart contract must have approval for this contract to transfer the ERC-20 tokens.The balance MUST be transferred from the `msg.sender`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| erc20Contract | address | The address of the ERC-20 smart contract |
| tokenId | uint256 | The ID of the token to transfer ERC-20 tokens to |
| amount | uint256 | The number of ERC-20 tokens to transfer |
| data | bytes | Additional data with no specified format, to allow for custom logic |

### transferHeldERC20FromToken

```solidity
function transferHeldERC20FromToken(address erc20Contract, uint256 tokenId, address to, uint256 amount, bytes data) external nonpayable
```

Transfer ERC-20 tokens from a specific token.

*The balance MUST be transferred from this smart contract.MUST increase the transfer-out-nonce for the tokenIdMUST revert if the `msg.sender` is not the owner of the NFT or approved to manage it.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| erc20Contract | address | The address of the ERC-20 smart contract |
| tokenId | uint256 | The ID of the token to transfer the ERC-20 tokens from |
| to | address | undefined |
| amount | uint256 | The number of ERC-20 tokens to transfer |
| data | bytes | Additional data with no specified format, to allow for custom logic |



## Events

### ReceivedERC20

```solidity
event ReceivedERC20(address indexed erc20Contract, uint256 indexed toTokenId, address indexed from, uint256 amount)
```

Used to notify listeners that the token received ERC-20 tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc20Contract `indexed` | address | The address of the ERC-20 smart contract |
| toTokenId `indexed` | uint256 | The ID of the token receiving the ERC-20 tokens |
| from `indexed` | address | The address of the account from which the tokens are being transferred |
| amount  | uint256 | The number of ERC-20 tokens received |

### TransferredERC20

```solidity
event TransferredERC20(address indexed erc20Contract, uint256 indexed fromTokenId, address indexed to, uint256 amount)
```

Used to notify the listeners that the ERC-20 tokens have been transferred.



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc20Contract `indexed` | address | The address of the ERC-20 smart contract |
| fromTokenId `indexed` | uint256 | The ID of the token from which the ERC-20 tokens have been transferred |
| to `indexed` | address | The address receiving the ERC-20 tokens |
| amount  | uint256 | The number of ERC-20 tokens transferred |



## Errors

### InvalidAddress

```solidity
error InvalidAddress()
```






### InvalidValue

```solidity
error InvalidValue()
```







