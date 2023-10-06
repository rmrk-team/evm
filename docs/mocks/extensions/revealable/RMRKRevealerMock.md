# RMRKRevealerMock









## Methods

### getRevealedAssets

```solidity
function getRevealedAssets(uint256[] tokenIds) external view returns (uint64[] revealedAssetIds, uint64[] assetToReplaceIds)
```

Returns the assetIds to reveal for the given tokenIds

*This method MUST only return existing assetIdsThis method MUST return the same amount of assetIds as tokenIds*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenIds | uint256[] | The tokenIds to reveal |

#### Returns

| Name | Type | Description |
|---|---|---|
| revealedAssetIds | uint64[] | The assetIds to reveal |
| assetToReplaceIds | uint64[] | The assetIds to replace |

### revealedAssetId

```solidity
function revealedAssetId() external view returns (uint64)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64 | undefined |

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




