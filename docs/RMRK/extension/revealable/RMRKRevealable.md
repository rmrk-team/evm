# RMRKRevealable

*RMRK team*

> IRMRKRevealable

Interface smart contract of the RMRK Revealable extension. This extension simplifies the process of revealing.



## Methods

### getRevealer

```solidity
function getRevealer() external view returns (address)
```

Returns the address of the revealer contract




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### reveal

```solidity
function reveal(uint256[] tokenIds) external nonpayable
```

Reveals the assets for the given tokenIds

*This method SHOULD be called by the owner or approved for assetsThis method SHOULD add the asset to the token and accept itThis method SHOULD get the `assetId` to add and replace from the revealer contractThis `assetId` to replace CAN be 0, meaning that the asset is added to the token without replacing anythingThe revealer contract MUST take care of ensuring the `assetId` exists on the contract implementating this interface*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenIds | uint256[] | The tokenIds to reveal |

### setRevealer

```solidity
function setRevealer(address revealer) external nonpayable
```

Sets the `IRMRKRevealer` associated with the contract.



#### Parameters

| Name | Type | Description |
|---|---|---|
| revealer | address | The `IRMRKRevealer` to associate with the contract |

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




