# Solidity API

## RMRKExternalEquipMock

### constructor

```solidity
constructor(address nestableAddress) public
```

### setNestableAddress

```solidity
function setNestableAddress(address nestableAddress) external
```

### addAssetToToken

```solidity
function addAssetToToken(uint256 tokenId, uint64 assetId, uint64 replacesAssetWithId) external
```

### addEquippableAssetEntry

```solidity
function addEquippableAssetEntry(uint64 id, uint64 equippableGroupId, address catalogAddress, string metadataURI, uint64[] partIds) external
```

### setValidParentForEquippableGroup

```solidity
function setValidParentForEquippableGroup(uint64 equippableGroupId, address parentAddress, uint64 partId) external
```

