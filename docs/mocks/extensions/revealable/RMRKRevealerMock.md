# RMRKRevealerMock









## Methods

### getRevealableTokens

```solidity
function getRevealableTokens(uint256[] tokenIds) external view returns (bool[] revealable)
```

-



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

-

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



## Errors

### AlreadyRevealed

```solidity
error AlreadyRevealed(uint256 tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

### CallerIsNotRevealable

```solidity
error CallerIsNotRevealable()
```







