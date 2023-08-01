# RMRKRenderUtils

*RMRK team*

> RMRKRenderUtils

Smart contract of the RMRK render utils module.

*Extra utility functions for RMRK contracts.*

## Methods

### getExtendedNft

```solidity
function getExtendedNft(uint256 tokenId, address targetCollection) external view returns (struct RMRKRenderUtils.ExtendedNft data)
```

Used to get extended information about a specified token.

*The full `ExtendedNft` struct looks like this:  [      tokenMetadataUri,      directOwner,      rootOwner,      activeAssetCount,      pendingAssetCount      priorities,      maxSupply,      totalSupply,      issuer,      name,      symbol,      activeChildrenNumber,      pendingChildrenNumber,      isSoulbound,      hasMultiAssetInterface,      hasNestingInterface,      hasEquippableInterface  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to retireve the `ExtendedNft` struct |
| targetCollection | address | Address of the collection to which the specified token belongs to |

#### Returns

| Name | Type | Description |
|---|---|---|
| data | RMRKRenderUtils.ExtendedNft | The `ExtendedNft` struct containing the specified token&#39;s data |




