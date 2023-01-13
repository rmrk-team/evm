# Solidity API

## RMRKEquippableMock

### constructor

```solidity
constructor(string name, string symbol) public
```

### mint

```solidity
function mint(address to, uint256 tokenId) external
```

### nestMint

```solidity
function nestMint(address to, uint256 tokenId, uint256 destinationId) external
```

### transfer

```solidity
function transfer(address to, uint256 tokenId) public virtual
```

### nestTransfer

```solidity
function nestTransfer(address to, uint256 tokenId, uint256 destinationId) public virtual
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

