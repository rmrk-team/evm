# Solidity API

## IRMRKTypedMultiAsset

Interface smart contract of the RMRK typed multi asset module.

### getAssetType

```solidity
function getAssetType(uint64 assetId) external view returns (string)
```

Used to get the type of the asset.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assetId | uint64 | ID of the asset to check |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | string The type of the asset |

