# Solidity API

## RMRKTokenHasNoAssetsWithType

```solidity
error RMRKTokenHasNoAssetsWithType()
```

## RMRKTypedExternalEquippableMock

### constructor

```solidity
constructor(address nestableAddress) public
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

### addTypedAssetEntry

```solidity
function addTypedAssetEntry(uint64 id, uint64 equippableGroupId, address catalogAddress, string metadataURI, uint64[] partIds, string type_) external
```

