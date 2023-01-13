# Solidity API

## RMRKMultiAssetMock

### constructor

```solidity
constructor(string name, string symbol) public
```

### mint

```solidity
function mint(address to, uint256 tokenId) external
```

### safeMint

```solidity
function safeMint(address to, uint256 tokenId) external
```

### safeMint

```solidity
function safeMint(address to, uint256 tokenId, bytes data) external
```

### transfer

```solidity
function transfer(address to, uint256 tokenId) external
```

### burn

```solidity
function burn(uint256 tokenId) external
```

### addAssetToToken

```solidity
function addAssetToToken(uint256 tokenId, uint64 assetId, uint64 replacesAssetWithId) external
```

### addAssetEntry

```solidity
function addAssetEntry(uint64 id, string metadataURI) external
```

