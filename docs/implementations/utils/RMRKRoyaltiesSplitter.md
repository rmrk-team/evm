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





#### Parameters

| Name | Type | Description |
|---|---|---|
| currency | address | undefined |
| amount | uint256 | undefined |



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







