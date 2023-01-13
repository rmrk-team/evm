# Solidity API

## RMRKTypedMultiAsset

Smart contract of the RMRK Typed multi asset module.

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

### getAssetType

```solidity
function getAssetType(uint64 assetId) public view returns (string)
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

### _setAssetType

```solidity
function _setAssetType(uint64 assetId, string type_) internal
```

Used to set the type of the asset.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assetId | uint64 | ID of the asset for which the type is being set |
| type_ | string | The type of the asset |

