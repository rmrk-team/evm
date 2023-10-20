# RMRKRoyaltiesSplitter

*RMRK team*

> RMRKRoyaltiesSplitter

Smart contract of the RMRK Royalties Spliter module.

*This smart contract provides a simple way to share royalties from either native or erc20 payments.*

## Methods

### distributeERC20

```solidity
function distributeERC20(address currency, uint256 amount) external nonpayable
```

Distributes an ERC20 payment to the beneficiaries.

*The payment is distributed according to the shares specified in the constructor.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| currency | address | The address of the ERC20 token. |
| amount | uint256 | The amount of tokens to distribute. |

### getBenefiariesAndShares

```solidity
function getBenefiariesAndShares() external view returns (address[] beneficiaries, uint256[] shares)
```

Returns the list of beneficiaries and their shares.




#### Returns

| Name | Type | Description |
|---|---|---|
| beneficiaries | address[] | The list of beneficiaries. |
| shares | uint256[] | The list of shares. |



## Events

### ERCPaymentDistributed

```solidity
event ERCPaymentDistributed(address indexed sender, address indexed currency, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sender `indexed` | address | undefined |
| currency `indexed` | address | undefined |
| amount  | uint256 | undefined |

### NativePaymentDistributed

```solidity
event NativePaymentDistributed(address indexed sender, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sender `indexed` | address | undefined |
| amount  | uint256 | undefined |



## Errors

### FailedToSend

```solidity
error FailedToSend()
```






### InvalidInput

```solidity
error InvalidInput()
```







