# Solidity API

## RMRKTokenHasNoAssetsWithType

```solidity
error RMRKTokenHasNoAssetsWithType()
```

## RMRKNestableClaimableChildMock

### constructor

```solidity
constructor(string name, string symbol) public
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

### _beforeAddChild

```solidity
function _beforeAddChild(uint256 tokenId, address childAddress, uint256 childId, bytes data) internal virtual
```

### _beforeAcceptChild

```solidity
function _beforeAcceptChild(uint256 parentId, uint256 childIndex, address childAddress, uint256 childId) internal virtual
```

### _beforeTransferChild

```solidity
function _beforeTransferChild(uint256 tokenId, uint256 childIndex, address childAddress, uint256 childId, bool isPending, bytes data) internal virtual
```

### _beforeNestedTokenTransfer

```solidity
function _beforeNestedTokenTransfer(address from, address to, uint256 fromTokenId, uint256 toTokenId, uint256 tokenId, bytes data) internal
```

### _afterNestedTokenTransfer

```solidity
function _afterNestedTokenTransfer(address from, address to, uint256 fromTokenId, uint256 toTokenId, uint256 tokenId, bytes data) internal
```

