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

Used to get a list of existing token Ids in the range given by pageStart and pageSize

*It does not optimize to avoid checking Ids out of max supply nor total supply.The resulting array might be smaller than the given pageSize since not existing Ids are not included.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| target | address | Address of the smart contract of the given token |
| pageStart | uint256 | The first Id to check |
| pageSize | uint256 | The number of Ids to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| page | uint256[] | An array of existing token Ids |




