# IERC20Holder









## Methods

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
| data | bytes | Additional data with no specified format, to allow for custom logic |

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
| data | bytes | Additional data with no specified format, to allow for custom logic |



## Events

### ReceivedERC20

```solidity
event ReceivedERC20(address indexed erc20Contract, uint256 indexed toTokenId, address indexed from, uint256 value)
```

This emits when a token receives ERC-20 tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc20Contract `indexed` | address | The ERC-20 contract |
| toTokenId `indexed` | uint256 | The token that receives the ERC-20 tokens |
| from `indexed` | address | The prior owner of the token |
| value  | uint256 | The number of ERC-20 tokens received |

### TransferredERC20

```solidity
event TransferredERC20(address indexed erc20Contract, uint256 indexed fromTokenId, address indexed to, uint256 value)
```

This emits when a token transfers ERC-20 tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| erc20Contract `indexed` | address | The ERC-20 contract |
| fromTokenId `indexed` | uint256 | The token that owned the ERC-20 tokens |
| to `indexed` | address | The address that sends the ERC-20 tokens |
| value  | uint256 | The number of ERC-20 tokens transferred |



