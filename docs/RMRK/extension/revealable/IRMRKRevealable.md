# IRMRKRevealable









## Methods

### getRevealer

```solidity
function getRevealer() external view returns (address)
```

Gets the `IRMRKRevealer` associated with the contract.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | revealer The `IRMRKRevealer` associated with the contract |

### reveal

```solidity
function reveal(uint256[] tokenIds) external nonpayable
```

Reveals the asset for the given tokenIds by adding and accepting and new one.

*SHOULD ask revealer which assetId should be added to the token and which asset to replace through `IRMRKRevealer.getAssetsToReveal`SHOULD be called by the owner or approved for assetsSHOULD add the new asset to each token and accept it*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenIds | uint256[] | undefined |

### setRevealer

```solidity
function setRevealer(address revealer) external nonpayable
```

Sets the `IRMRKRevealer` associated with the contract.



#### Parameters

| Name | Type | Description |
|---|---|---|
| revealer | address | The `IRMRKRevealer` to associate with the contract |




