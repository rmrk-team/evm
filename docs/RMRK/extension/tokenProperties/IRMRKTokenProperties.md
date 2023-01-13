# Solidity API

## IRMRKTokenProperties

Interface smart contract of the RMRK token properties extension.

### getStringTokenProperty

```solidity
function getStringTokenProperty(uint256 tokenId, string key) external view returns (string)
```

Used to retrieve the string type token properties.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | string The value of the string property |

### getUintTokenProperty

```solidity
function getUintTokenProperty(uint256 tokenId, string key) external view returns (uint256)
```

Used to retrieve the uint type token properties.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The value of the uint property |

### getBoolTokenProperty

```solidity
function getBoolTokenProperty(uint256 tokenId, string key) external view returns (bool)
```

Used to retrieve the bool type token properties.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool The value of the bool property |

### getAddressTokenProperty

```solidity
function getAddressTokenProperty(uint256 tokenId, string key) external view returns (address)
```

Used to retrieve the address type token properties.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address The value of the address property |

### getBytesTokenProperty

```solidity
function getBytesTokenProperty(uint256 tokenId, string key) external view returns (bytes)
```

Used to retrieve the bytes type token properties.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes | bytes The value of the bytes property |

