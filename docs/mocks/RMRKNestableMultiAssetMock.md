# Solidity API

## RMRKNestableMultiAssetMock

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
function safeMint(address to, uint256 tokenId) public
```

### safeMint

```solidity
function safeMint(address to, uint256 tokenId, bytes _data) public
```

### nestMint

```solidity
function nestMint(address to, uint256 tokenId, uint256 destinationId) external
```

### addAssetToToken

```solidity
function addAssetToToken(uint256 tokenId, uint64 assetId, uint64 replacesAssetWithId) external
```

### addAssetEntry

```solidity
function addAssetEntry(uint64 id, string metadataURI) external
```

### transfer

```solidity
function transfer(address to, uint256 tokenId) public virtual
```

### nestTransfer

```solidity
function nestTransfer(address to, uint256 tokenId, uint256 destinationId) public virtual
```

