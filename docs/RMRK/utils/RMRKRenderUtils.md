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

*The full `ExtendedNft` struct looks like this:  [      tokenMetadataUri,      directOwner,      rootOwner,      activeAssetCount,      pendingAssetCount      priorities,      maxSupply,      totalSupply,      issuer,      name,      symbol,      activeChildrenNumber,      isSoulbound,      hasMultiAssetInterface,      hasNestingInterface,      hasEquippableInterface  ]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which to retireve the `ExtendedNft` struct |
| targetCollection | address | Address of the collection to which the specified token belongs to |

#### Returns

| Name | Type | Description |
|---|---|---|
| data | RMRKRenderUtils.ExtendedNft | The `ExtendedNft` struct containing the specified token&#39;s data |

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




