# Solidity API

## RMRKExternalEquipImpl

Implementation of RMRK external equip module.

### constructor

```solidity
constructor(address nestableAddress) public
```

Used to initialize the smart contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| nestableAddress | address | Address of the Nestable module of the external equip composite |

### setNestableAddress

```solidity
function setNestableAddress(address nestableAddress) external
```

Used to set the address of the `Nestable` smart contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| nestableAddress | address | Address of the `Nestable` smart contract |

### addAssetToToken

```solidity
function addAssetToToken(uint256 tokenId, uint64 assetId, uint64 replacesAssetWithId) public virtual
```

Used to add an asset to a token.

_If the given asset is already added to the token, the execution will be reverted.
If the asset ID is invalid, the execution will be reverted.
If the token already has the maximum amount of pending assets (128), the execution will be
 reverted.
If the asset is being added by the current root owner of the token, the asset will be automatically
 accepted._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to add the asset to |
| assetId | uint64 | ID of the asset to add to the token |
| replacesAssetWithId | uint64 | ID of the asset to replace from the token's list of active assets |

### addEquippableAssetEntry

```solidity
function addEquippableAssetEntry(uint64 equippableGroupId, address catalogAddress, string metadataURI, uint64[] partIds) public virtual returns (uint256)
```

Used to add an equippable asset entry.

_The ID of the asset is automatically assigned to be the next available asset ID._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| equippableGroupId | uint64 | ID of the equippable group |
| catalogAddress | address | Address of the `Catalog` smart contract this asset belongs to |
| metadataURI | string | Metadata URI of the asset |
| partIds | uint64[] | An array of IDs of fixed and slot parts to be included in the asset |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The total number of assets after this asset has been added |

### addAssetEntry

```solidity
function addAssetEntry(string metadataURI) public virtual returns (uint256)
```

Used to add a asset entry.

_The ID of the asset is automatically assigned to be the next available asset ID._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| metadataURI | string | Metadata URI of the asset |

### setValidParentForEquippableGroup

```solidity
function setValidParentForEquippableGroup(uint64 equippableGroupId, address parentAddress, uint64 partId) public virtual
```

Used to declare that the assets belonging to a given `equippableGroupId` are equippable into the `Slot`
 associated with the `partId` of the collection at the specified `parentAddress`

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| equippableGroupId | uint64 | ID of the equippable group |
| parentAddress | address | Address of the parent into which the equippable group can be equipped into |
| partId | uint64 | ID of the `Slot` that the items belonging to the equippable group can be equipped into |

### totalAssets

```solidity
function totalAssets() public view virtual returns (uint256)
```

Used to retrieve the total number of assets.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The total number of assets |

