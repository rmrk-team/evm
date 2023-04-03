# IRMRKTokenPropertiesRepository

*RMRK team*

> IRMRKTokenPropertiesRepository

Interface smart contract of the RMRK token properties extension.



## Methods

### getAddressTokenProperty

```solidity
function getAddressTokenProperty(address collection, uint256 tokenId, string key) external view returns (address)
```

Used to retrieve the address type token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | The collection address |
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The value of the address property |

### getBoolTokenProperty

```solidity
function getBoolTokenProperty(address collection, uint256 tokenId, string key) external view returns (bool)
```

Used to retrieve the bool type token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | The collection address |
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | The value of the bool property |

### getBytesTokenProperty

```solidity
function getBytesTokenProperty(address collection, uint256 tokenId, string key) external view returns (bytes)
```

Used to retrieve the bytes type token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | The collection address |
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | The value of the bytes property |

### getStringTokenProperty

```solidity
function getStringTokenProperty(address collection, uint256 tokenId, string key) external view returns (string)
```

Used to retrieve the string type token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | The collection address |
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | The value of the string property |

### getUintTokenProperty

```solidity
function getUintTokenProperty(address collection, uint256 tokenId, string key) external view returns (uint256)
```

Used to retrieve the uint type token properties.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | The collection address |
| tokenId | uint256 | The token ID |
| key | string | The key of the property |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The value of the uint property |

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



## Events

### AddressPropertyUpdated

```solidity
event AddressPropertyUpdated(address indexed collection, uint256 indexed tokenId, string key, address value)
```

Used to notify listeners that an address property has been updated.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection `indexed` | address | The collection address |
| tokenId `indexed` | uint256 | The token ID |
| key  | string | The key of the property |
| value  | address | The new value of the property |

### BoolPropertyUpdated

```solidity
event BoolPropertyUpdated(address indexed collection, uint256 indexed tokenId, string key, bool value)
```

Used to notify listeners that a boolean property has been updated.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection `indexed` | address | The collection address |
| tokenId `indexed` | uint256 | The token ID |
| key  | string | The key of the property |
| value  | bool | The new value of the property |

### BytesPropertyUpdated

```solidity
event BytesPropertyUpdated(address indexed collection, uint256 indexed tokenId, string key, bytes value)
```

Used to notify listeners that a bytes property has been updated.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection `indexed` | address | The collection address |
| tokenId `indexed` | uint256 | The token ID |
| key  | string | The key of the property |
| value  | bytes | The new value of the property |

### StringPropertyUpdated

```solidity
event StringPropertyUpdated(address indexed collection, uint256 indexed tokenId, string key, string value)
```

Used to notify listeners that a string property has been updated.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection `indexed` | address | The collection address |
| tokenId `indexed` | uint256 | The token ID |
| key  | string | The key of the property |
| value  | string | The new value of the property |

### UintPropertyUpdated

```solidity
event UintPropertyUpdated(address indexed collection, uint256 indexed tokenId, string key, uint256 value)
```

Used to notify listeners that an uint property has been updated.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection `indexed` | address | The collection address |
| tokenId `indexed` | uint256 | The token ID |
| key  | string | The key of the property |
| value  | uint256 | The new value of the property |



