# Solidity API

## RMRKMultiAssetEmotableMock

### constructor

```solidity
constructor(string name, string symbol) public
```

### mint

```solidity
function mint(address to, uint256 tokenId) external
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

### emote

```solidity
function emote(uint256 tokenId, bytes4 emoji, bool on) public
```

### _beforeEmote

```solidity
function _beforeEmote(uint256 tokenId, bytes4, bool) internal view
```

