# Solidity API

## RMRKTokenHasNoAssetsWithType

```solidity
error RMRKTokenHasNoAssetsWithType()
```

## RMRKTypedMultiAssetMock

### constructor

```solidity
constructor(string name, string symbol) public
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

### addTypedAssetEntry

```solidity
function addTypedAssetEntry(uint64 assetId, string metadataURI, string type_) external
```

### getTopAssetMetaForTokenWithType

```solidity
function getTopAssetMetaForTokenWithType(uint256 tokenId, string type_) external view returns (string)
```

