# RMRKTokenProperties

*RMRK team*

> RMRKTokenProperties

Smart contract of the RMRK Token properties module.



## Methods

### getAddressTokenProperty

```solidity
function getAddressTokenProperty(uint256 tokenId, string key) external view returns (address)
```

Used to retrieve the address type token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address The value of the address property |

### getBoolTokenProperty

```solidity
function getBoolTokenProperty(uint256 tokenId, string key) external view returns (bool)
```

Used to retrieve the bool type token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool The value of the bool property |

### getBytesTokenProperty

```solidity
function getBytesTokenProperty(uint256 tokenId, string key) external view returns (bytes)
```

Used to retrieve the bytes type token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | bytes The value of the bytes property |

### getStringTokenProperty

```solidity
function getStringTokenProperty(uint256 tokenId, string key) external view returns (string)
```

Used to retrieve the string type token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string The value of the string property |

### getUintTokenProperty

```solidity
function getUintTokenProperty(uint256 tokenId, string key) external view returns (uint256)
```

Used to retrieve the uint type token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 The value of the uint property |

### setAddressProperty

```solidity
function setAddressProperty(uint256 tokenId, string key, address value) external nonpayable
```

Used to set an address property.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | address | The property value |

### setBoolProperty

```solidity
function setBoolProperty(uint256 tokenId, string key, bool value) external nonpayable
```

Used to set a boolean property.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | bool | The property value |

### setBytesProperty

```solidity
function setBytesProperty(uint256 tokenId, string key, bytes value) external nonpayable
```

Used to set an bytes property.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | bytes | The property value |

### setStringProperty

```solidity
function setStringProperty(uint256 tokenId, string key, string value) external nonpayable
```

Used to set a string property.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | string | The property value |

### setUintProperty

```solidity
function setUintProperty(uint256 tokenId, string key, uint256 value) external nonpayable
```

Used to set a number property.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| key | string | The property key |
| value | uint256 | The property value |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section] to learn more about how these ids are created. This function call must use less than 30 000 gas.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |




