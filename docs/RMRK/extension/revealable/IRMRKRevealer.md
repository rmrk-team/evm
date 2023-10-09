# IRMRKRevealer









## Methods

### getRevealableTokens

```solidity
function getRevealableTokens(uint256[] tokenIds) external view returns (bool[] revealable)
```

For each `tokenId` in `tokenIds` returns whether it can be revealed or not



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenIds | uint256[] | The `tokenIds` to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| revealable | bool[] | The array of booleans indicating whether each `tokenId` can be revealed or not |

### reveal

```solidity
function reveal(uint256[] tokenIds) external nonpayable returns (uint64[] revealedAssetsIds, uint64[] assetsToReplaceIds)
```

Returns the revealed `assetIds` for the given `tokenIds` and marks them as revealed.

*This CAN add new assets to the original contract if necessary, in which case it SHOULD have the necessary permissionsThis method MUST only return existing `assetIds`This method MUST be called only by the contract implementing the `IRMRKRevealable` interface, during the `reveal` methodThis method MUST return the same amount of `revealedAssetsIds` and `assetsToReplaceIds`  as `tokenIds`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenIds | uint256[] | The `tokenIds` to reveal |

#### Returns

| Name | Type | Description |
|---|---|---|
| revealedAssetsIds | uint64[] | The revealed `assetIds` |
| assetsToReplaceIds | uint64[] | The `assetIds` to replace |



## Events

### Revealed

```solidity
event Revealed(uint256[] tokenIds, uint64[] revealedAssetsIds, uint64[] assetsToReplaceIds)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenIds  | uint256[] | undefined |
| revealedAssetsIds  | uint64[] | undefined |
| assetsToReplaceIds  | uint64[] | undefined |



