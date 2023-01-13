# Solidity API

## RMRKTokenPropertiesMock

Smart contract of the RMRK Token properties module.

### setUintProperty

```solidity
function setUintProperty(uint256 tokenId, string key, uint256 value) external
```

Used to set a number property.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | uint256 | The property value |

### setStringProperty

```solidity
function setStringProperty(uint256 tokenId, string key, string value) external
```

Used to set a string property.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | string | The property value |

### setBoolProperty

```solidity
function setBoolProperty(uint256 tokenId, string key, bool value) external
```

Used to set a boolean property.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | bool | The property value |

### setBytesProperty

```solidity
function setBytesProperty(uint256 tokenId, string key, bytes value) external
```

Used to set an bytes property.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | bytes | The property value |

### setAddressProperty

```solidity
function setAddressProperty(uint256 tokenId, string key, address value) external
```

Used to set an address property.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | address | The property value |

