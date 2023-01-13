# Solidity API

## RMRKTokenProperties

Smart contract of the RMRK Token properties module.

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

### _setUintProperty

```solidity
function _setUintProperty(uint256 tokenId, string key, uint256 value) internal
```

Used to set a number property.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | uint256 | The property value |

### _setStringProperty

```solidity
function _setStringProperty(uint256 tokenId, string key, string value) internal
```

Used to set a string property.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | string | The property value |

### _setBoolProperty

```solidity
function _setBoolProperty(uint256 tokenId, string key, bool value) internal
```

Used to set a boolean property.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | bool | The property value |

### _setBytesProperty

```solidity
function _setBytesProperty(uint256 tokenId, string key, bytes value) internal
```

Used to set an bytes property.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | bytes | The property value |

### _setAddressProperty

```solidity
function _setAddressProperty(uint256 tokenId, string key, address value) internal
```

Used to set an address property.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | address | The property value |

### _getIdForKey

```solidity
function _getIdForKey(string key) internal returns (uint256)
```

Used to get the Id for a key. If the key does not exist, a new Id is created.
 Ids are shared among all tokens and types

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | string | The property key |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The id for the key |

### _getStringIdForValue

```solidity
function _getStringIdForValue(string value) internal returns (uint256)
```

Used to get the Id for a string value. If the value does not exist, a new Id is created.
 Ids are shared among all tokens and used only for strings.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | string | The property value |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The id for the value |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

