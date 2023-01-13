# Solidity API

## RMRKNestableExternalEquipMock

### constructor

```solidity
constructor(string name_, string symbol_) public
```

### safeMint

```solidity
function safeMint(address to, uint256 tokenId) public
```

### safeMint

```solidity
function safeMint(address to, uint256 tokenId, bytes _data) public
```

### mint

```solidity
function mint(address to, uint256 tokenId) external
```

### nestMint

```solidity
function nestMint(address to, uint256 tokenId, uint256 destinationId) external
```

### setEquippableAddress

```solidity
function setEquippableAddress(address equippable) external
```

### transfer

```solidity
function transfer(address to, uint256 tokenId) public virtual
```

### nestTransfer

```solidity
function nestTransfer(address to, uint256 tokenId, uint256 destinationId) public virtual
```

