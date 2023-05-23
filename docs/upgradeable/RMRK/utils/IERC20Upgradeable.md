# IERC20Upgradeable



> IERC20Upgradeable

Interface smart contract of the upgradeable ERC20 smart contract implementation.



## Methods

### allowance

```solidity
function allowance(address owner, address spender) external view returns (uint256)
```

Used to grant permission to an account to spend the tokens of another



#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | Address that owns the tokens |
| spender | address | Address that is being granted the permission to spend the tokens of the `owner` |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Amount of tokens that the `spender` can manage |

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 amount) external nonpayable returns (bool)
```

Used to transfer tokens from one address to another.



#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | Address of the account from which the the tokens are being transferred |
| to | address | Address of the account to which the tokens are being transferred |
| amount | uint256 | Amount of tokens that are being transferred |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | A boolean value signifying whether the transfer was succesfull (`true`) or not (`false`) |




