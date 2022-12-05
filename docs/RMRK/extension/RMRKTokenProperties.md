# RMRKTokenProperties

*RMRK team*

> RMRKTokenProperties

Smart contract of the RMRK Token properties module.



## Methods

### getAddressTokenProperty

```solidity
function getAddressTokenProperty(uint256 tokenId, uint256 index) external view returns (address)
```

Used to retrieve the token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| index | uint256 | The index of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address The value of the address property |

### getBoolTokenProperty

```solidity
function getBoolTokenProperty(uint256 tokenId, uint256 index) external view returns (bool)
```

Used to retrieve the token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| index | uint256 | The index of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool The value of the bool property |

### getBytesTokenProperty

```solidity
function getBytesTokenProperty(uint256 tokenId, uint256 index) external view returns (bytes)
```

Used to retrieve the token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| index | uint256 | The index of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | bytes The value of the bytes property |

### getStringTokenProperty

```solidity
function getStringTokenProperty(uint256 tokenId, uint256 index) external view returns (string)
```

Used to retrieve the token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| index | uint256 | The index of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string The value of the string property |

### getUintTokenProperty

```solidity
function getUintTokenProperty(uint256 tokenId, uint256 index) external view returns (uint256)
```

Used to retrieve the token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| index | uint256 | The index of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 The value of the uint property |

### setAddressProperty

```solidity
function setAddressProperty(uint256 tokenId, uint256 index, address value) external nonpayable
```

Used to set an address property.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| index | uint256 | The property index |
| value | address | The property value |

### setBoolProperty

```solidity
function setBoolProperty(uint256 tokenId, uint256 index, bool value) external nonpayable
```

Used to set a boolean property.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| index | uint256 | The property index |
| value | bool | The property value |

### setBytesProperty

```solidity
function setBytesProperty(uint256 tokenId, uint256 index, bytes value) external nonpayable
```

Used to set an bytes property.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| index | uint256 | The property index |
| value | bytes | The property value |

### setIntProperty

```solidity
function setIntProperty(uint256 tokenId, uint256 index, uint256 value) external nonpayable
```

Used to set a number property.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| index | uint256 | The property index |
| value | uint256 | The property value |

### setStringProperty

```solidity
function setStringProperty(uint256 tokenId, uint256 index, string value) external nonpayable
```

Used to set a string property.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID |
| index | uint256 | The property index |
| value | string | The property value |




