# RMRKRenderUtils

*RMRK team*

> RMRKRenderUtils

Smart contract of the RMRK render utils module.

*Extra utility functions for RMRK contracts.*

## Methods

### getPaginatedMintedIds

```solidity
function getPaginatedMintedIds(address target, uint256 pageStart, uint256 pageSize) external view returns (uint256[] page)
```

Used to get a list of existing token IDs in the range between `pageStart` and `pageSize`.

*It is not optimized to avoid checking IDs out of max supply nor total supply, since this is not meant to be used during transaction execution; it is only meant to be used as a getter.The resulting array might be smaller than the given `pageSize` since no-existent IDs are not included.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the collection smart contract of the given token |
| pageStart | uint256 | The first ID to check |
| pageSize | uint256 | The number of IDs to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| page | uint256[] | An array of IDs of the existing tokens |




