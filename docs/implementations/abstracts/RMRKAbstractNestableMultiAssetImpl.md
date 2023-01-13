# Solidity API

## RMRKMintZero

```solidity
error RMRKMintZero()
```

## RMRKAbstractNestableMultiAssetImpl

Abstract implementation of RMRK nestable multi asset module.

### _preMint

```solidity
function _preMint(uint256 numToMint) internal returns (uint256, uint256)
```

Used to calculate the token IDs of tokens to be minted.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| numToMint | uint256 | Amount of tokens to be minted |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The ID of the first token to be minted in the current minting cycle |
| [1] | uint256 | uint256 The ID of the last token to be minted in the current minting cycle |

### _charge

```solidity
function _charge(uint256 value) internal virtual
```

Used to verify and/or receive the payment for the mint.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The expected amount to be received for the mint |

### addAssetToToken

```solidity
function addAssetToToken(uint256 tokenId, uint64 assetId, uint64 replacesAssetWithId) public
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

### totalAssets

```solidity
function totalAssets() public view returns (uint256)
```

Used to retrieve the total number of assets.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The total number of assets |

### updateRoyaltyRecipient

```solidity
function updateRoyaltyRecipient(address newRoyaltyRecipient) public
```

Used to update recipient of royalties.

_Custom access control has to be implemented to ensure that only the intended actors can update the
 beneficiary._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newRoyaltyRecipient | address | Address of the new recipient of royalties |

